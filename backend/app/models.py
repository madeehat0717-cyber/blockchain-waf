from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="analyst")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FirewallRule(Base):
    __tablename__ = "firewall_rules"
    id = Column(Integer, primary_key=True, index=True)
    rule_id = Column(String, unique=True, index=True)
    name = Column(String)
    type = Column(String) # SQL_INJECTION, XSS, CUSTOM
    pattern = Column(String)
    action = Column(String, default="BLOCK")
    priority = Column(Integer, default=100)
    status = Column(String, default="ACTIVE")
    created_by = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SecurityEvent(Base):
    __tablename__ = "security_events"
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    source_ip = Column(String, index=True)
    source_identity = Column(String, nullable=True)
    method = Column(String)
    url = Column(Text)
    threat_type = Column(String, index=True)
    risk_level = Column(String)
    action = Column(String)
    rule_id = Column(String, nullable=True)
    event_hash = Column(String)
    blockchain_tx_hash = Column(String, nullable=True)

class BlockedIP(Base):
    __tablename__ = "blocked_ips"
    id = Column(Integer, primary_key=True, index=True)
    ip_address = Column(String, unique=True, index=True)
    reason = Column(String)
    status = Column(String, default="BLOCKED")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class BlockchainRecord(Base):
    __tablename__ = "blockchain_records"
    id = Column(Integer, primary_key=True, index=True)
    record_type = Column(String) # RULE, EVENT
    record_id = Column(String, index=True)
    hash = Column(String)
    transaction_hash = Column(String)
    block_number = Column(Integer)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
