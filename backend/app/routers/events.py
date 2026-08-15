from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas, models
from app.database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.SecurityEventResponse])
def get_events(limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.SecurityEvent).order_by(models.SecurityEvent.timestamp.desc()).limit(limit).all()

@router.post("/{event_id}/simulate-tamper")
def simulate_log_tampering(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.SecurityEvent).filter(models.SecurityEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Simulate DB modification WITHOUT updating blockchain
    event.url = event.url + "?tampered=true"
    
    # We update the db's local hash to match the new tampered data, 
    # to show that an attacker recalculating the hash locally won't fool the blockchain
    from app.waf_engine import waf_engine
    new_hash = waf_engine.generate_hash(
        timestamp_str=event.timestamp.isoformat(),
        source_ip=event.source_ip,
        method=event.method,
        url=event.url,
        threat_type=event.threat_type,
        risk_level=event.risk_level,
        action=event.action,
        rule_id=event.rule_id,
        source_identity=event.source_identity
    )
    event.event_hash = new_hash
    db.commit()
    
    return {"status": "TAMPERED", "message": "Log tampered locally. Verification will now fail."}
