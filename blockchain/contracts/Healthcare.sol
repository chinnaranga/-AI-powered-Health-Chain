// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Healthcare {
    struct Record {
        uint256 id;
        string ipfsHash;
        uint256 timestamp;
        string description;
        address uploadedBy;
    }

    struct Access {
        address patient;
        address doctor;
        bool hasAccess;
    }

    mapping(address => Record[]) public patientRecords;
    mapping(address => mapping(address => bool)) public doctorAccess;
    mapping(address => string) public userNames; // Optional: Store name on-chain or just hash

    event RecordAdded(uint256 id, address indexed patient, string ipfsHash);
    event AccessGranted(address indexed patient, address indexed doctor);
    event AccessRevoked(address indexed patient, address indexed doctor);

    function addRecord(string memory _ipfsHash, string memory _description) public {
        uint256 recordId = patientRecords[msg.sender].length;
        patientRecords[msg.sender].push(Record(
            recordId,
            _ipfsHash,
            block.timestamp,
            _description,
            msg.sender
        ));
        emit RecordAdded(recordId, msg.sender, _ipfsHash);
    }

    function grantAccess(address _doctor) public {
        doctorAccess[msg.sender][_doctor] = true;
        emit AccessGranted(msg.sender, _doctor);
    }

    function revokeAccess(address _doctor) public {
        doctorAccess[msg.sender][_doctor] = false;
        emit AccessRevoked(msg.sender, _doctor);
    }

    function getPatientRecords(address _patient) public view returns (Record[] memory) {
        if (msg.sender == _patient || doctorAccess[_patient][msg.sender]) {
            return patientRecords[_patient];
        }
        revert("Access Denied");
    }

    function isDoctor(address _patient, address _doctor) public view returns (bool) {
        return doctorAccess[_patient][_doctor];
    }
}
