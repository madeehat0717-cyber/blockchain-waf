from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app import schemas, models, auth
from app.database import get_db

router = APIRouter()

@router.get("/", response_model=List[schemas.BlockedIPResponse])
def get_ips(db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.BlockedIP).all()

@router.post("/", response_model=schemas.BlockedIPResponse)
def block_ip(ip: schemas.BlockedIPCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_admin)):
    db_ip = models.BlockedIP(ip_address=ip.ip_address, reason=ip.reason, status="BLOCKED")
    db.add(db_ip)
    db.commit()
    db.refresh(db_ip)
    return db_ip

@router.delete("/{ip_address}")
def unblock_ip(ip_address: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth.get_current_active_admin)):
    ip = db.query(models.BlockedIP).filter(models.BlockedIP.ip_address == ip_address).first()
    if ip:
        db.delete(ip)
        db.commit()
    return {"status": "UNBLOCKED"}
