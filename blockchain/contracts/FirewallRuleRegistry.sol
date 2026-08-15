// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title FirewallRuleRegistry
 * @dev Registry for WAF firewall rules and security events to guarantee integrity.
 */
contract FirewallRuleRegistry {
    
    struct FirewallRule {
        string ruleId;
        bytes32 ruleHash;
        address createdBy;
        uint256 timestamp;
        bool active;
    }

    struct SecurityEventLog {
        string logId;
        bytes32 eventHash;
        string threatType;
        string riskLevel;
        address reportedBy;
        uint256 timestamp;
    }

    mapping(string => FirewallRule) public rules;
    mapping(string => SecurityEventLog) public securityLogs;
    
    event RuleRegistered(string indexed ruleId, bytes32 ruleHash, address createdBy, uint256 timestamp);
    event RuleUpdated(string indexed ruleId, bytes32 ruleHash, bool active, uint256 timestamp);
    event SecurityLogRecorded(string indexed logId, bytes32 eventHash, string threatType, string riskLevel, uint256 timestamp);

    // Modifier to ensure rule exists
    modifier ruleExists(string memory ruleId) {
        require(rules[ruleId].timestamp != 0, "Rule does not exist");
        _;
    }

    /**
     * @dev Register a new firewall rule
     */
    function registerRule(string memory ruleId, bytes32 ruleHash, bool active) external {
        require(rules[ruleId].timestamp == 0, "Rule already exists");
        
        rules[ruleId] = FirewallRule({
            ruleId: ruleId,
            ruleHash: ruleHash,
            createdBy: msg.sender,
            timestamp: block.timestamp,
            active: active
        });

        emit RuleRegistered(ruleId, ruleHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Update an existing firewall rule
     */
    function updateRule(string memory ruleId, bytes32 newRuleHash, bool active) external ruleExists(ruleId) {
        rules[ruleId].ruleHash = newRuleHash;
        rules[ruleId].active = active;
        rules[ruleId].timestamp = block.timestamp;

        emit RuleUpdated(ruleId, newRuleHash, active, block.timestamp);
    }

    /**
     * @dev Record a security event log hash for integrity verification
     */
    function recordSecurityLog(string memory logId, bytes32 eventHash, string memory threatType, string memory riskLevel) external {
        require(securityLogs[logId].timestamp == 0, "Log already recorded");

        securityLogs[logId] = SecurityEventLog({
            logId: logId,
            eventHash: eventHash,
            threatType: threatType,
            riskLevel: riskLevel,
            reportedBy: msg.sender,
            timestamp: block.timestamp
        });

        emit SecurityLogRecorded(logId, eventHash, threatType, riskLevel, block.timestamp);
    }

    /**
     * @dev Verify if a local hash matches the stored security log hash
     */
    function verifySecurityLog(string memory logId, bytes32 localHash) external view returns (bool isMatch, bytes32 storedHash, uint256 timestamp) {
        require(securityLogs[logId].timestamp != 0, "Log not found on blockchain");
        storedHash = securityLogs[logId].eventHash;
        isMatch = (storedHash == localHash);
        timestamp = securityLogs[logId].timestamp;
        return (isMatch, storedHash, timestamp);
    }

    /**
     * @dev Verify if a local hash matches the stored rule hash
     */
    function verifyRule(string memory ruleId, bytes32 localHash) external view returns (bool isMatch, bytes32 storedHash, uint256 timestamp) {
        require(rules[ruleId].timestamp != 0, "Rule not found on blockchain");
        storedHash = rules[ruleId].ruleHash;
        isMatch = (storedHash == localHash);
        timestamp = rules[ruleId].timestamp;
        return (isMatch, storedHash, timestamp);
    }
}
