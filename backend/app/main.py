from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app import models
from app.routers import auth, waf, rules, events, ips, verification, analytics, users, websocket

# Create DB tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Blockchain-Secured WAF API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(waf.router, prefix="/api/waf", tags=["WAF Engine"])
app.include_router(rules.router, prefix="/api/rules", tags=["Firewall Rules"])
app.include_router(events.router, prefix="/api/events", tags=["Security Events"])
app.include_router(ips.router, prefix="/api/ips", tags=["IP Access Control"])
app.include_router(verification.router, prefix="/api/verification", tags=["Blockchain Verification"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(websocket.router, tags=["Live Monitor"])

@app.get("/")
def root():
    return {"message": "Welcome to Blockchain-Secured WAF API"}
