import argparse
import random
from datetime import datetime, timedelta, timezone
from hashlib import sha256

from sqlmodel import Session, select

from app.db.session import engine
from app.models.organization import Organization
from app.models.user import User
from app.models.feature import Feature
from app.models.usage_log import UsageLog
from app.services.auth_service import hash_password


DATASET_NAME = "DukeNLPGroup/movielens-100k"


def _det_hash(value: str, modulo: int) -> int:
    return int(sha256(value.encode()).hexdigest(), 16) % modulo


def _seed_hf(session: Session, split: str, orgs: int, anomalies: bool, limit: int | None) -> None:
    try:
        from datasets import load_dataset  # type: ignore
        from datasets.exceptions import DatasetNotFoundError  # type: ignore
    except ImportError as exc:
        raise RuntimeError("Install 'datasets' to use Hugging Face seed data: pip install datasets") from exc

    try:
        ds = load_dataset(DATASET_NAME, split=split)
    except DatasetNotFoundError:
        raise RuntimeError(f"HF dataset '{DATASET_NAME}' not found or inaccessible.")

    if limit:
        ds = ds.select(range(min(limit, len(ds))))

    org_lookup = {i: Organization(name=f"Org-{i+1}") for i in range(orgs)}
    for org in org_lookup.values():
        session.add(org)
    session.commit()

    feature_cache: dict[str, Feature] = {}
    user_cache: dict[str, User] = {}

    def ensure_feature(org_id: int, feature_key: str) -> Feature:
        key = f"{org_id}-{feature_key}"
        if key in feature_cache:
            return feature_cache[key]
        feature = Feature(name=feature_key[:64], organization_id=org_id)
        session.add(feature)
        session.commit()
        session.refresh(feature)
        feature_cache[key] = feature
        return feature

    def ensure_user(org_id: int, user_key: str) -> User:
        key = f"{org_id}-{user_key}"
        if key in user_cache:
            return user_cache[key]
        email = f"{user_key}@org{org_id}.hf"
        user = User(email=email, password_hash=hash_password("password"), role="user", organization_id=org_id)
        session.add(user)
        session.commit()
        session.refresh(user)
        user_cache[key] = user
        return user

    base_time = datetime.now(timezone.utc)
    for row in ds:
        # movielens-100k fields: user_id, item_id, rating, timestamp
        event_time = row.get("timestamp") or base_time.timestamp()
        try:
            ts = datetime.fromtimestamp(float(event_time), tz=timezone.utc)
        except Exception:
            ts = base_time

        user_key = str(row.get("user_id") or "u0")
        feature_key = str(row.get("item_id") or "feature-unknown")
        rating = float(row.get("rating") or 3.0)
        event_type = "interaction"
        # Synthesize session duration from rating (higher rating → longer dwell)
        session_duration = max(30, min(600, rating * 60 + random.randint(-15, 30)))

        org_id = _det_hash(user_key, orgs) + 1
        org = org_lookup[org_id - 1]
        user = ensure_user(org.id, user_key)
        feature = ensure_feature(org.id, feature_key)

        if anomalies and random.random() < 0.02:
            session_duration *= 3

        usage = UsageLog(
            user_id=user.id,
            organization_id=org.id,
            feature_id=feature.id,
            event_type=event_type,
            session_duration=session_duration,
            metadata_json={"source": "hf", "raw_feature": feature_key, "rating": rating},
            timestamp=ts,
        )
        session.add(usage)

    session.commit()


def seed(orgs: int = 3, anomalies: bool = True, split: str = "train", limit: int | None = 2000) -> None:
    with Session(engine) as session:
        _seed_hf(session, split, orgs, anomalies, limit)


def ensure_demo_user() -> None:
    """Ensure demo org, users, features, usage logs, and aggregated data exist."""
    from app.models.aggregated_usage import AggregatedUsage

    with Session(engine) as session:
        # --- Org ---
        org = session.exec(select(Organization).where(Organization.name == "Demo Org")).first()
        if not org:
            org = Organization(name="Demo Org")
            session.add(org)
            session.commit()
            session.refresh(org)

        # --- Users ---
        def _ensure_user(email: str, role: str, password: str) -> User:
            existing = session.exec(select(User).where(User.email == email)).first()
            if existing:
                return existing
            user = User(
                email=email,
                password_hash=hash_password(password),
                role=role,
                organization_id=org.id,
            )
            session.add(user)
            session.commit()
            session.refresh(user)
            return user

        admin = _ensure_user("admin@example.com", "admin", "password")
        demo = _ensure_user("demo@example.com", "user", "demo123")

        # --- Features ---
        feature_names = [
            "Dashboard Analytics", "Report Builder", "User Management",
            "Data Export", "Real-time Alerts", "API Gateway",
            "Search Engine", "Notification Hub",
        ]
        features: list[Feature] = []
        for fname in feature_names:
            f = session.exec(
                select(Feature).where(Feature.name == fname, Feature.organization_id == org.id)
            ).first()
            if not f:
                f = Feature(name=fname, organization_id=org.id)
                session.add(f)
                session.commit()
                session.refresh(f)
            features.append(f)

        # --- Skip if usage data already exists ---
        has_logs = session.exec(
            select(UsageLog).where(UsageLog.organization_id == org.id)
        ).first()
        if has_logs:
            return

        # --- Generate UsageLogs across the last 30 days ---
        import math
        base = datetime.now(timezone.utc)
        all_users = [admin, demo]
        for day_offset in range(30, 0, -1):
            day_ts = base - timedelta(days=day_offset)
            for feat in features:
                # vary events per feature per day
                n_events = random.randint(3, 20)
                for _ in range(n_events):
                    user = random.choice(all_users)
                    ts = day_ts.replace(
                        hour=random.randint(6, 23),
                        minute=random.randint(0, 59),
                        second=random.randint(0, 59),
                    )
                    duration = random.uniform(10, 600)
                    # inject ~5 % anomalies with extreme durations
                    if random.random() < 0.05:
                        duration *= random.uniform(3, 6)
                    log = UsageLog(
                        user_id=user.id,
                        organization_id=org.id,
                        feature_id=feat.id,
                        event_type=random.choice(["interaction", "api_call", "export", "view"]),
                        session_duration=round(duration, 2),
                        metadata_json={"source": "demo_seed"},
                        timestamp=ts,
                    )
                    session.add(log)
            session.commit()  # commit each day batch

        # --- Build AggregatedUsage from UsageLogs ---
        from collections import defaultdict as _defaultdict
        from datetime import date as _date

        all_logs = session.exec(
            select(UsageLog).where(UsageLog.organization_id == org.id)
        ).all()
        bucket: dict[tuple[int, _date], list[UsageLog]] = _defaultdict(list)
        for lg in all_logs:
            d = lg.timestamp.date() if hasattr(lg.timestamp, "date") else lg.timestamp
            bucket[(lg.feature_id, d)].append(lg)

        for (fid, agg_date), logs in bucket.items():
            existing = session.exec(
                select(AggregatedUsage)
                .where(AggregatedUsage.organization_id == org.id)
                .where(AggregatedUsage.feature_id == fid)
                .where(AggregatedUsage.aggregation_date == agg_date)
            ).first()
            if existing:
                continue
            dau = len({lg.user_id for lg in logs if lg.user_id})
            ec = len(logs)
            avg_dur = sum(lg.session_duration for lg in logs) / max(ec, 1)
            agg = AggregatedUsage(
                organization_id=org.id,
                feature_id=fid,
                aggregation_date=agg_date,
                daily_active_users=dau,
                event_count=ec,
                avg_session_duration=round(avg_dur, 2),
            )
            session.add(agg)
        session.commit()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed database using a fixed Hugging Face dataset")
    parser.add_argument("--orgs", type=int, default=3, help="Number of orgs")
    parser.add_argument("--no-anomalies", action="store_true", help="Disable anomaly injection")
    parser.add_argument("--split", default="train", help="HF dataset split")
    parser.add_argument("--limit", type=int, default=2000, help="Max rows to ingest from HF dataset")
    args = parser.parse_args()

    seed(orgs=args.orgs, anomalies=not args.no_anomalies, split=args.split, limit=args.limit)
    print(f"Seeded data from {DATASET_NAME} ({args.split}, limit={args.limit}).")
