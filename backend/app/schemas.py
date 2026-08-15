from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    username: str
    role: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class WafCheckRequest(BaseModel):
    ip: str
    source_identity: Optional[str] = None
    method: str
    url: str
    headers: Dict[str, str] = {}
    query_params: Dict[str, str] = {}
    body: str = ""

class WafCheckResponse(BaseModel):
    allowed: bool
    action: str
    threat_type: Optional[str] = None
    risk_level: Optional[str] = None
    rule_id: Optional[str] = None

class FirewallRuleCreate(BaseModel):
    name: str
    type: str
    pattern: str
    action: str
    priority: int
    status: str

class FirewallRuleResponse(FirewallRuleCreate):
    id: int
    rule_id: str
    created_by: str
    created_at: datetime
    class Config:
        from_attributes = True

class SecurityEventResponse(BaseModel):
    id: int
    timestamp: datetime
    source_ip: str
    source_identity: Optional[str] = None
    method: str
    url: str
    threat_type: str
    risk_level: str
    action: str
    rule_id: Optional[str]
    event_hash: str
    blockchain_tx_hash: Optional[str]
    class Config:
        from_attributes = True

class IntegrityVerificationResponse(BaseModel):
    status: str # "VERIFIED" or "INTEGRITY FAILURE"
    message: str
    local_hash: str
    blockchain_hash: Optional[str] = None
    transaction_hash: Optional[str] = None
    block_number: Optional[int] = None
    timestamp: Optional[str] = None

class BlockedIPCreate(BaseModel):
    ip_address: str
    reason: str

class BlockedIPResponse(BlockedIPCreate):
    id: int
    status: str
    created_at: datetime
    class Config:
        from_attributes = True
