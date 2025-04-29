// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

contract DonorContract {

    struct Pledged {
        string fullname;
        uint age;
        string gender;
        string medical_id;
        string blood_type;
        string[] organ;
        uint weight;
        uint height;
        string status;
    }

    struct Donor {
        string fullname;
        uint age;
        string gender;
        string medical_id;
        string blood_type;
        string[] organ;
        uint weight;
        uint height;
        string status;
    }

    struct Patient {
        string fullname;
        uint age;
        string gender;
        string medical_id;
        string blood_type;
        string[] organ;
        uint weight;
        uint height;
        string status;
    }

    mapping(string => Pledged) pledgedMap;
    mapping(string => Donor) donorMap;
    mapping(string => Patient) patientMap;

    string[] PledgedArray;
    string[] DonorsArray;
    string[] PatientsArray;

    function setPledge(string memory _fullname, uint _age, string memory _gender, string memory _medical_id,
                       string memory _blood_type, string[] memory _organ, uint _weight, uint _height)
    public
    {
        require(keccak256(abi.encodePacked((pledgedMap[_medical_id].medical_id))) != keccak256(abi.encodePacked(_medical_id)));
        pledgedMap[_medical_id] = Pledged({
            fullname: _fullname,
            age: _age,
            gender: _gender,
            medical_id: _medical_id,
            blood_type: _blood_type,
            organ: _organ,
            weight: _weight,
            height: _height,
            status: "Waiting List"
        });
        PledgedArray.push(_medical_id);
    }

    function setDonors(string memory _fullname, uint _age, string memory _gender, string memory _medical_id,
                       string memory _blood_type, string[] memory _organ, uint _weight, uint _height)
    public
    {
        require(keccak256(abi.encodePacked((donorMap[_medical_id].medical_id))) != keccak256(abi.encodePacked(_medical_id)));
        donorMap[_medical_id] = Donor({
            fullname: _fullname,
            age: _age,
            gender: _gender,
            medical_id: _medical_id,
            blood_type: _blood_type,
            organ: _organ,
            weight: _weight,
            height: _height,
            status: "Waiting List"
        });
        DonorsArray.push(_medical_id);
    }

    function setPatients(string memory _fullname, uint _age, string memory _gender, string memory _medical_id,
                       string memory _blood_type, string[] memory _organ, uint _weight, uint _height)
    public
    {
        require(keccak256(abi.encodePacked((patientMap[_medical_id].medical_id))) != keccak256(abi.encodePacked(_medical_id)));
        patientMap[_medical_id] = Patient({
            fullname: _fullname,
            age: _age,
            gender: _gender,
            medical_id: _medical_id,
            blood_type: _blood_type,
            organ: _organ,
            weight: _weight,
            height: _height,
            status: "Waiting List"
        });
        PatientsArray.push(_medical_id);
    }

    function getPledge(string memory _medical_id) view public returns(string memory, uint, string memory, string memory, string[] memory, uint, uint, string memory)
    {
        Pledged memory pledge = pledgedMap[_medical_id];
        return (pledge.fullname, pledge.age, pledge.gender, pledge.blood_type, pledge.organ, pledge.weight, pledge.height, pledge.status);
    }

    function getDonor(string memory _medical_id) view public returns(string memory, uint, string memory, string memory, string[] memory, uint, uint, string memory)
    {
        Donor memory donor = donorMap[_medical_id];
        return (donor.fullname, donor.age, donor.gender, donor.blood_type, donor.organ, donor.weight, donor.height, donor.status);
    }

    function getPatient(string memory _medical_id) view public returns(string memory, uint, string memory, string memory, string[] memory, uint, uint, string memory)
    {
        Patient memory patient = patientMap[_medical_id];
        return (patient.fullname, patient.age, patient.gender, patient.blood_type, patient.organ, patient.weight, patient.height, patient.status);
    }

    function validatePledge(string memory _medical_id) view public returns(bool)
    {
        return keccak256(abi.encodePacked((pledgedMap[_medical_id].medical_id))) == keccak256(abi.encodePacked(_medical_id));
    }

    function validateDonor(string memory _medical_id) view public returns(bool)
    {
        return keccak256(abi.encodePacked((donorMap[_medical_id].medical_id))) == keccak256(abi.encodePacked(_medical_id));
    }

    function validatePatient(string memory _medical_id) view public returns(bool)
    {
        return keccak256(abi.encodePacked((patientMap[_medical_id].medical_id))) == keccak256(abi.encodePacked(_medical_id));
    }

    function getAllPledgeIDs() view public returns(string[] memory)
    {
        return PledgedArray;
    }

    function getAllDonorIDs() view public returns(string[] memory)
    {
        return DonorsArray;
    }

    function getAllPatientIDs() view public returns(string[] memory)
    {
        return PatientsArray;
    }

    function getCountOfPledges() view public returns(uint)
    {
        return PledgedArray.length;
    }

    function getCountOfDonors() view public returns(uint)
    {
        return DonorsArray.length;
    }

    function getCountOfPatients() view public returns(uint)
    {
        return PatientsArray.length;
    }

    function updatePatientStatus(string memory _medical_id, string memory _status) public
    {
        patientMap[_medical_id].status = _status;
    }

    function updateDonorStatus(string memory _medical_id, string memory _status) public
    {
        donorMap[_medical_id].status = _status;
    }
     function updatePledgeStatus(string memory _medical_id, string memory _status) public
    {
        pledgedMap[_medical_id].status = _status;
    }
}
