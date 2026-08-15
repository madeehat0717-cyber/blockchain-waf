from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app import models
from app.database import get_db

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_events = db.query(models.SecurityEvent).count()
    blocked_events = db.query(models.SecurityEvent).filter(models.SecurityEvent.action == "BLOCK").count()
    allowed_events = total_events - blocked_events # Simplified
    
    active_rules = db.query(models.FirewallRule).filter(models.FirewallRule.status == "ACTIVE").count()
    blocked_ips = db.query(models.BlockedIP).filter(models.BlockedIP.status == "BLOCKED").count()
    blockchain_records = db.query(models.BlockchainRecord).count()
    
    # Top threat types
    threat_types = db.query(
        models.SecurityEvent.threat_type, 
        func.count(models.SecurityEvent.id).label('count')
    ).group_by(models.SecurityEvent.threat_type).all()
    
    return {
        "total_requests": 15420 + total_events, # Mock base + real
        "allowed_requests": 15420 + allowed_events,
        "blocked_requests": blocked_events,
        "threats_detected": blocked_events,
        "active_rules": active_rules,
        "blocked_ips": blocked_ips,
        "blockchain_records": blockchain_records,
        "threat_distribution": [{"name": t[0], "value": t[1]} for t in threat_types if t[0]]
    }
