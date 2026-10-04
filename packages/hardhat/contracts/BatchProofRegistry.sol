// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title BatchProofRegistry
 * @notice Tamper-evident medicine batch registry supporting Hedera EVM integration.
 *         Complements Hedera Consensus Service (HCS) audit trail by anchoring canonical
 *         batch record hashes and lifecycle statuses on-chain.
 */
contract BatchProofRegistry {
    enum BatchStatus {
        VALID,
        EXPIRED,
        RECALLED
    }

    struct BatchRecord {
        string batchId;
        bytes32 recordHash;
        string manufacturer;
        uint256 expiryTimestamp;
        uint256 registeredAt;
        uint256 updatedAt;
        BatchStatus status;
        address issuer;
        bool exists;
    }

    address public owner;
    mapping(string => BatchRecord) private _batches;
    string[] private _batchIds;

    event BatchRegistered(
        string indexed batchId,
        bytes32 indexed recordHash,
        string manufacturer,
        uint256 expiryTimestamp,
        address indexed issuer
    );

    event BatchUpdated(
        string indexed batchId,
        bytes32 indexed newRecordHash,
        uint256 expiryTimestamp,
        address indexed updater
    );

    event BatchRecalled(
        string indexed batchId,
        string reason,
        uint256 timestamp,
        address indexed caller
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Register a newly manufactured medicine batch
     */
    function registerBatch(
        string calldata batchId,
        bytes32 recordHash,
        string calldata manufacturer,
        uint256 expiryTimestamp
    ) external {
        require(bytes(batchId).length > 0, "Batch ID cannot be empty");
        require(recordHash != bytes32(0), "Record hash cannot be zero");
        require(bytes(manufacturer).length > 0, "Manufacturer cannot be empty");
        require(expiryTimestamp > block.timestamp, "Expiry must be in the future");
        require(!_batches[batchId].exists, "Batch already registered");

        _batches[batchId] = BatchRecord({
            batchId: batchId,
            recordHash: recordHash,
            manufacturer: manufacturer,
            expiryTimestamp: expiryTimestamp,
            registeredAt: block.timestamp,
            updatedAt: block.timestamp,
            status: BatchStatus.VALID,
            issuer: msg.sender,
            exists: true
        });

        _batchIds.push(batchId);

        emit BatchRegistered(batchId, recordHash, manufacturer, expiryTimestamp, msg.sender);
    }

    /**
     * @notice Update an existing batch record hash or expiry date
     */
    function updateBatch(
        string calldata batchId,
        bytes32 newRecordHash,
        uint256 newExpiryTimestamp
    ) external {
        BatchRecord storage batch = _batches[batchId];
        require(batch.exists, "Batch does not exist");
        require(batch.issuer == msg.sender || msg.sender == owner, "Unauthorized");
        require(batch.status != BatchStatus.RECALLED, "Cannot update recalled batch");

        batch.recordHash = newRecordHash;
        batch.expiryTimestamp = newExpiryTimestamp;
        batch.updatedAt = block.timestamp;

        // Auto-update status if past expiry
        if (block.timestamp >= newExpiryTimestamp) {
            batch.status = BatchStatus.EXPIRED;
        } else {
            batch.status = BatchStatus.VALID;
        }

        emit BatchUpdated(batchId, newRecordHash, newExpiryTimestamp, msg.sender);
    }

    /**
     * @notice Mark a medicine batch as recalled
     */
    function recallBatch(string calldata batchId, string calldata reason) external {
        BatchRecord storage batch = _batches[batchId];
        require(batch.exists, "Batch does not exist");
        require(batch.issuer == msg.sender || msg.sender == owner, "Unauthorized");
        require(batch.status != BatchStatus.RECALLED, "Batch already recalled");

        batch.status = BatchStatus.RECALLED;
        batch.updatedAt = block.timestamp;

        emit BatchRecalled(batchId, reason, block.timestamp, msg.sender);
    }

    /**
     * @notice Retrieve batch verification record
     */
    function getBatch(string calldata batchId)
        external
        view
        returns (
            string memory id,
            bytes32 recordHash,
            string memory manufacturer,
            uint256 expiryTimestamp,
            uint256 registeredAt,
            uint256 updatedAt,
            BatchStatus currentStatus,
            address issuer,
            bool exists
        )
    {
        BatchRecord storage batch = _batches[batchId];
        if (!batch.exists) {
            return ("", bytes32(0), "", 0, 0, 0, BatchStatus.VALID, address(0), false);
        }

        BatchStatus evaluatedStatus = batch.status;
        if (evaluatedStatus != BatchStatus.RECALLED && block.timestamp >= batch.expiryTimestamp) {
            evaluatedStatus = BatchStatus.EXPIRED;
        }

        return (
            batch.batchId,
            batch.recordHash,
            batch.manufacturer,
            batch.expiryTimestamp,
            batch.registeredAt,
            batch.updatedAt,
            evaluatedStatus,
            batch.issuer,
            true
        );
    }

    /**
     * @notice Verify whether a presented record hash matches the on-chain recorded hash
     */
    function verifyBatchHash(string calldata batchId, bytes32 testHash)
        external
        view
        returns (bool matches, BatchStatus status)
    {
        BatchRecord storage batch = _batches[batchId];
        if (!batch.exists) {
            return (false, BatchStatus.VALID);
        }

        BatchStatus evaluatedStatus = batch.status;
        if (evaluatedStatus != BatchStatus.RECALLED && block.timestamp >= batch.expiryTimestamp) {
            evaluatedStatus = BatchStatus.EXPIRED;
        }

        return (batch.recordHash == testHash, evaluatedStatus);
    }

    /**
     * @notice Get total count of registered batches
     */
    function totalBatches() external view returns (uint256) {
        return _batchIds.length;
    }
}
