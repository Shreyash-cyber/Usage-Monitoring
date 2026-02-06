from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.db.session import init_db
from app.utils.seed_data import ensure_demo_user
from app.routes import auth_routes, usage_routes, analytics_routes, ai_routes

app = FastAPI(title="Enterprise Usage Monitoring & AI Admin")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    init_db()
    ensure_demo_user()


app.include_router(auth_routes.router)
app.include_router(usage_routes.router)
app.include_router(analytics_routes.router)
app.include_router(ai_routes.router)


@app.get("/")
def health():
    return {"status": "ok"}
