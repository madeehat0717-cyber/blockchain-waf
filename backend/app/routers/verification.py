from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app import schemas, models
from app.database import get_db
from app.blockchain_client import blockchain_client
from app.waf_engine import waf_engine

router = APIRouter()

@router.get("/event/{event_id}", response_model=schemas.IntegrityVerificationResponse)
def verify_event_integrity(event_id: int, db: Session = Depends(get_db)):
    event = db.query(models.SecurityEvent).filter(models.SecurityEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # 1. Recalculate hash from current DB data
    recalculated_hash = waf_engine.generate_hash(
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
    
    # 2. Check blockchain for the record
    log_id = db.query(models.BlockchainRecord).filter(models.BlockchainRecord.transaction_hash == event.blockchain_tx_hash).first()
    
    if not log_id:
        return {
            "status": "ERROR",
            "message": "No blockchain record found for this event",
            "local_hash": recalculated_hash
        }
        
    verification = blockchain_client.verify_security_log(log_id.record_id, recalculated_hash)
    
    if verification.get("status") == "ERROR":
        return {
            "status": "ERROR",
            "message": verification.get("message", "Blockchain error"),
            "local_hash": recalculated_hash
        }
        
    status_str = "VERIFIED" if verification["is_match"] else "INTEGRITY FAILURE"
    message = "LOG INTEGRITY CONFIRMED" if verification["is_match"] else "POSSIBLE LOG TAMPERING DETECTED"
    
    return {
        "status": status_str,
        "message": message,
        "local_hash": recalculated_hash,
        "blockchain_hash": verification["stored_hash"],
        "transaction_hash": event.blockchain_tx_hash,
        "timestamp": str(verification["timestamp"])
    }
