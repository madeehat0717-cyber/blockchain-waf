import re
import hashlib
import json
from datetime import datetime
from typing import Dict, Any, List
from app import models
from sqlalchemy.orm import Session
from app.blockchain_client import blockchain_client
import uuid

class WAFEngine:
    def __init__(self):
        # Basic patterns
        self.sql_injection_pattern = re.compile(
            r"(?i)(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|EXEC|SLEEP|BENCHMARK|WAITFOR)\b|--|\bOR\b\s+['\"]?\d['\"]?\s*=\s*['\"]?\d['\"]?|/\*.*\*/)"
        )
        self.xss_pattern = re.compile(
            r"(?i)(<script.*?>|javascript:|onload=|onerror=|eval\s*\(|<iframe.*?>|<img.*?>)"
        )
        self.path_traversal_pattern = re.compile(
            r"(?i)(\.\./|\.\.\\|%2e%2e%2f|%2e%2e/|/etc/passwd|c:\\windows\\system32)"
        )
        self.command_injection_pattern = re.compile(
            r"(?i)(;|&&|\|\||\||`|\$\(|system\s*\(|exec\s*\(|passthru\s*\(|cmd\.exe)"
        )
        
        # Simple memory rate limit: {ip: [timestamps]}
        self.rate_limit_map = {}

    def analyze_request(self, db: Session, ip: str, method: str, url: str, headers: Dict, query_params: Dict, body: str, source_identity: str = None) -> Dict[str, Any]:
        # 1. Rate Limiting Check
        now = datetime.now().timestamp()
        if ip not in self.rate_limit_map:
            self.rate_limit_map[ip] = []
        
        # Keep only timestamps within last 60 seconds
        self.rate_limit_map[ip] = [ts for ts in self.rate_limit_map[ip] if now - ts < 60]
        self.rate_limit_map[ip].append(now)
        
        from app.config import settings
        if len(self.rate_limit_map[ip]) > settings.WAF_RATE_LIMIT:
            return self._block(db, ip, method, url, "RATE_LIMIT", "MEDIUM", "WAF-RL-001")

        # 2. IP Blacklist Check
        blocked_ip = db.query(models.BlockedIP).filter(models.BlockedIP.ip_address == ip, models.BlockedIP.status == "BLOCKED").first()
        if blocked_ip:
            return self._block(db, ip, method, url, "IP_BLACKLISTED", "HIGH", "WAF-IP-001")

        # Prepare unified payload string for regex matching
        import urllib.parse
        raw_payload = f"{url} {json.dumps(query_params)} {json.dumps(headers)} {body}"
        payload = urllib.parse.unquote(raw_payload)

        # 3. Custom Firewall Rules Evaluation
        active_rules = db.query(models.FirewallRule).filter(models.FirewallRule.status == "ACTIVE").order_by(models.FirewallRule.priority.asc()).all()
        for rule in active_rules:
            try:
                pattern = re.compile(rule.pattern, re.IGNORECASE)
                if pattern.search(payload):
                    return self._block(db, ip, method, url, rule.type, "HIGH", rule.rule_id, source_identity)
            except Exception:
                pass # skip invalid regexes

        # 4. Standard Attack Detection
        if self.sql_injection_pattern.search(payload):
            return self._block(db, ip, method, url, "SQL_INJECTION", "HIGH", "WAF-STD-SQLI", source_identity)
        
        if self.xss_pattern.search(payload):
            return self._block(db, ip, method, url, "XSS", "HIGH", "WAF-STD-XSS", source_identity)
            
        if self.path_traversal_pattern.search(payload):
            return self._block(db, ip, method, url, "PATH_TRAVERSAL", "CRITICAL", "WAF-STD-PT", source_identity)
            
        if self.command_injection_pattern.search(payload):
            return self._block(db, ip, method, url, "COMMAND_INJECTION", "CRITICAL", "WAF-STD-CMD", source_identity)

        # Allowed
        return {
            "allowed": True,
            "action": "ALLOW"
        }

    def generate_hash(self, timestamp_str: str, source_ip: str, method: str, url: str, threat_type: str, risk_level: str, action: str, rule_id: str, source_identity: str = None) -> str:
        # Canonical string for hashing
        # format: "timestamp|source_ip|source_identity|method|url|threat_type|risk_level|action|rule_id"
        rule_id_str = rule_id if rule_id else "NONE"
        ident_str = source_identity if source_identity else "NONE"
        canonical_str = f"{timestamp_str}|{source_ip}|{ident_str}|{method}|{url}|{threat_type}|{risk_level}|{action}|{rule_id_str}"
        return hashlib.sha256(canonical_str.encode('utf-8')).hexdigest()

    def _block(self, db: Session, ip: str, method: str, url: str, threat_type: str, risk_level: str, rule_id: str, source_identity: str = None) -> Dict[str, Any]:
        
        timestamp = datetime.utcnow()
        timestamp_str = timestamp.isoformat()
        
        event_hash = self.generate_hash(
            timestamp_str=timestamp_str,
            source_ip=ip,
            method=method,
            url=url,
            threat_type=threat_type,
            risk_level=risk_level,
            action="BLOCK",
            rule_id=rule_id,
            source_identity=source_identity
        )

        log_id = str(uuid.uuid4())
        
        # Register on Blockchain
        tx_hash = blockchain_client.record_security_log(
            log_id=log_id,
            event_hash=event_hash,
            threat_type=threat_type,
            risk_level=risk_level
        )

        # Save to DB
        security_event = models.SecurityEvent(
            timestamp=timestamp,
            source_ip=ip,
            source_identity=source_identity,
            method=method,
            url=url,
            threat_type=threat_type,
            risk_level=risk_level,
            action="BLOCK",
            rule_id=rule_id,
            event_hash=event_hash,
            blockchain_tx_hash=tx_hash
        )
        db.add(security_event)
        
        if tx_hash:
            bc_record = models.BlockchainRecord(
                record_type="EVENT",
                record_id=log_id,
                hash=event_hash,
                transaction_hash=tx_hash,
                timestamp=timestamp
            )
            db.add(bc_record)
            
        db.commit()

        return {
            "allowed": False,
            "action": "BLOCK",
            "threat_type": threat_type,
            "risk_level": risk_level,
            "rule_id": rule_id
        }

waf_engine = WAFEngine()
