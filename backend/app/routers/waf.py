from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app import schemas
from app.database import get_db
from app.waf_engine import waf_engine
from app.routers.websocket import notify_clients

router = APIRouter()

@router.post("/check", response_model=schemas.WafCheckResponse)
async def check_request(request_data: schemas.WafCheckRequest, db: Session = Depends(get_db)):
    result = waf_engine.analyze_request(
        db=db,
        ip=request_data.ip,
        method=request_data.method,
        url=request_data.url,
        headers=request_data.headers,
        query_params=request_data.query_params,
        body=request_data.body,
        source_identity=request_data.source_identity
    )
    
    # Broadcast to live monitor
    await notify_clients({
        "type": "WAF_EVENT",
        "ip": request_data.ip,
        "source_identity": request_data.source_identity,
        "method": request_data.method,
        "url": request_data.url,
        "allowed": result["allowed"],
        "threat_type": result.get("threat_type", "NONE")
    })
    
    return result
