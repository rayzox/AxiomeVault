// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TrustDoc {
    struct DocumentLog {
        string documentHash;
        string action;
        uint256 timestamp;
        address owner;
    }

    mapping(address => DocumentLog[]) private logs;

    event DocumentProcessed(
        address indexed owner,
        string documentHash,
        string action,
        uint256 timestamp
    );

    function logDocument(
        string memory _hash,
        string memory _action
    ) public {
        logs[msg.sender].push(DocumentLog({
            documentHash: _hash,
            action: _action,
            timestamp: block.timestamp,
            owner: msg.sender
        }));
        emit DocumentProcessed(
            msg.sender, _hash,
            _action, block.timestamp
        );
    }

    function getLogs() public view
    returns (DocumentLog[] memory) {
        return logs[msg.sender];
    }
}