from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app import schemas, models, auth
from app.database import get_db
from app.blockchain_client import blockchain_client

router = APIRouter()

@router.get("/", response_model=List[schemas.FirewallRuleResponse])
def get_rules(db: Session = Depends(get_db)):
    return db.query(models.FirewallRule).all()

@router.post("/", response_model=schemas.FirewallRuleResponse)
def create_rule(rule: schemas.FirewallRuleCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_admin)):
    import uuid
    import hashlib
    rule_id = f"WAF-CUST-{str(uuid.uuid4())[:8].upper()}"
    
    # Generate Rule Hash
    rule_hash_str = f"{rule_id}|{rule.pattern}|{rule.action}|{rule.status}"
    rule_hash = hashlib.sha256(rule_hash_str.encode('utf-8')).hexdigest()
    
    # Register on blockchain
    is_active = rule.status == "ACTIVE"
    tx_hash = blockchain_client.register_rule(rule_id, rule_hash, is_active)
    
    db_rule = models.FirewallRule(
        rule_id=rule_id,
        name=rule.name,
        type=rule.type,
        pattern=rule.pattern,
        action=rule.action,
        priority=rule.priority,
        status=rule.status,
        created_by=current_user.username
    )
    db.add(db_rule)
    
    if tx_hash:
        bc_record = models.BlockchainRecord(
            record_type="RULE",
            record_id=rule_id,
            hash=rule_hash,
            transaction_hash=tx_hash
        )
        db.add(bc_record)
        
    db.commit()
    db.refresh(db_rule)
    return db_rule

@router.delete("/{rule_id}")
def delete_rule(rule_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_admin)):
    rule = db.query(models.FirewallRule).filter(models.FirewallRule.rule_id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
        
    # Mark as inactive on blockchain
    rule_hash_str = f"{rule.rule_id}|{rule.pattern}|{rule.action}|DELETED"
    rule_hash = hashlib.sha256(rule_hash_str.encode('utf-8')).hexdigest()
    blockchain_client.update_rule(rule.rule_id, rule_hash, False)
    
    db.delete(rule)
    db.commit()
    return {"status": "DELETED"}

@router.put("/{rule_id}/toggle")
def toggle_rule(rule_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_admin)):
    rule = db.query(models.FirewallRule).filter(models.FirewallRule.rule_id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found")
        
    rule.status = "DISABLED" if rule.status == "ACTIVE" else "ACTIVE"
    
    import hashlib
    rule_hash_str = f"{rule.rule_id}|{rule.pattern}|{rule.action}|{rule.status}"
    rule_hash = hashlib.sha256(rule_hash_str.encode('utf-8')).hexdigest()
    is_active = rule.status == "ACTIVE"
    blockchain_client.update_rule(rule.rule_id, rule_hash, is_active)
    
    db.commit()
    return {"status": rule.status}
