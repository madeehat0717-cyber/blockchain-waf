import os
import json
import logging
from web3 import Web3
from app.config import settings

logger = logging.getLogger(__name__)

class BlockchainClient:
    def __init__(self):
        self.w3 = Web3(Web3.HTTPProvider(settings.BLOCKCHAIN_RPC_URL))
        self.contract = None
        self.account = None
        
        if not self.w3.is_connected():
            logger.warning(f"Could not connect to blockchain at {settings.BLOCKCHAIN_RPC_URL}")
            return
            
        # For local Hardhat node, use the first account
        self.account = self.w3.eth.accounts[0]
        
        contract_path = os.path.join(os.path.dirname(__file__), "blockchain_data", "contract.json")
        if os.path.exists(contract_path):
            with open(contract_path, "r") as f:
                data = json.load(f)
                self.contract = self.w3.eth.contract(
                    address=data["address"],
                    abi=data["abi"]
                )
        else:
            logger.warning("Contract data not found. Please deploy smart contract first.")

    def is_ready(self):
        return self.w3.is_connected() and self.contract is not None

    def register_rule(self, rule_id: str, rule_hash: str, active: bool):
        if not self.is_ready():
            return None
            
        try:
            bytes32_hash = Web3.to_bytes(hexstr=rule_hash)
            tx_hash = self.contract.functions.registerRule(rule_id, bytes32_hash, active).transact({'from': self.account})
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            return receipt.transactionHash.hex()
        except Exception as e:
            logger.error(f"Error registering rule on blockchain: {e}")
            return None

    def update_rule(self, rule_id: str, new_rule_hash: str, active: bool):
        if not self.is_ready():
            return None
            
        try:
            bytes32_hash = Web3.to_bytes(hexstr=new_rule_hash)
            tx_hash = self.contract.functions.updateRule(rule_id, bytes32_hash, active).transact({'from': self.account})
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            return receipt.transactionHash.hex()
        except Exception as e:
            logger.error(f"Error updating rule on blockchain: {e}")
            return None

    def record_security_log(self, log_id: str, event_hash: str, threat_type: str, risk_level: str):
        if not self.is_ready():
            return None
            
        try:
            bytes32_hash = Web3.to_bytes(hexstr=event_hash)
            tx_hash = self.contract.functions.recordSecurityLog(
                log_id, bytes32_hash, threat_type, risk_level
            ).transact({'from': self.account})
            
            receipt = self.w3.eth.wait_for_transaction_receipt(tx_hash)
            return receipt.transactionHash.hex()
        except Exception as e:
            logger.error(f"Error recording security log on blockchain: {e}")
            return None

    def verify_security_log(self, log_id: str, local_hash: str):
        if not self.is_ready():
            return {"status": "ERROR", "message": "Blockchain unavailable"}
            
        try:
            bytes32_local_hash = Web3.to_bytes(hexstr=local_hash)
            is_match, stored_hash, timestamp = self.contract.functions.verifySecurityLog(log_id, bytes32_local_hash).call()
            
            return {
                "status": "VERIFIED" if is_match else "INTEGRITY FAILURE",
                "is_match": is_match,
                "stored_hash": stored_hash.hex(),
                "timestamp": timestamp
            }
        except Exception as e:
            logger.error(f"Error verifying security log on blockchain: {e}")
            return {"status": "ERROR", "message": str(e)}

blockchain_client = BlockchainClient()
