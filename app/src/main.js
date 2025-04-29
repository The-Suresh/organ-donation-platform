// Import Web3 JS library
const Web3 = require('web3');
const web3 = new Web3("HTTP://127.0.0.1:7545");

// Import the ABI definition of the DonorContract
const artifact = require('../../build/contracts/DonorContract.json');

const deployedContract = artifact.networks[5777];
const contractAddress = deployedContract.address;

const MIN_GAS = 1000000;

function generateTableHead(table, data) {
    let thead = table.createTHead();
    let row = thead.insertRow();
    for (let key of data) {
        let th = document.createElement("th");
        let text = document.createTextNode(key);
        th.appendChild(text);
        row.appendChild(th);
    }
}

function generateTable(table, data) {
    for (let element of data) {
        let row = table.insertRow();
        for (key in element) {
            let cell = row.insertCell();
            let text = document.createTextNode(element[key]);
            cell.appendChild(text);
            if (key === "Status") {
                if (element[key] === "Organ Matched") {
                    cell.classList.add("matched");
                } else {
                    cell.classList.add("not-matched");
                }
            }
        }
    }
}

let table = document.querySelector("table");

function selectRow() {
    var table = document.getElementById('pending-table');
    var cells = table.getElementsByTagName('td');
    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        cell.onclick = function () {
            var rowId = this.parentNode.rowIndex;
            var rowsNotSelected = table.getElementsByTagName('tr');
            for (var row = 0; row < rowsNotSelected.length; row++) {
                rowsNotSelected[row].style.backgroundColor = "";
                rowsNotSelected[row].style.fontWeight = "";
                rowsNotSelected[row].classList.remove('selected');
            }
            var rowSelected = table.getElementsByTagName('tr')[rowId];
            rowSelected.style.backgroundColor = "#aad7ec";
            rowSelected.style.fontWeight = 800;
            rowSelected.className += " selected";

            var row_value = [];
            for (var i = 0; i < rowSelected.cells.length; i++) {
                row_value[i] = rowSelected.cells[i].innerHTML;
            }
            console.log("Selected row: " + row_value);
            document.getElementById("getPledgeFullName").innerHTML = row_value[1];
            document.getElementById("getPledgeAge").innerHTML = row_value[2];
            document.getElementById("getPledgeGender").innerHTML = row_value[3];
            document.getElementById("getPledgeMedicalID").innerHTML = row_value[4];
            document.getElementById("getPledgeBloodType").innerHTML = row_value[5];
            document.getElementById("getPledgeOrgan").innerHTML = row_value[6];
            document.getElementById("getPledgeWeight").innerHTML = row_value[7];
            document.getElementById("getPledgeHeight").innerHTML = row_value[8];
            document.getElementById("PledgeMessage").innerHTML = null;

            var textcontainer = document.getElementById("text-hidden");
            textcontainer.className = 'verification';
        }
    }
}

function showWarning(user, message, color) {
    let userid = user + "InputCheck";
    var warning = document.querySelector(".alert.warning");
    warning.style.background = color;
    document.getElementById(userid).innerHTML = message;
    warning.style.opacity = "100";
    warning.style.display = "block";
}

function checkInputValues(user, fullname, age, gender, medical_id, organ, weight, height, status) {
    var color = "#ff9800";
    if (fullname == "")
        showWarning(user, "Enter your name", color);
    else if (age.length == 0)
        showWarning(user, "Enter your age", color);
    else if (user == "Pledge" && age < 18)
        showWarning(user, "You must be over 18 to pledge", color);
    else if (gender == null)
        showWarning(user, "Enter your gender", color);
    else if (medical_id.length == 0)
        showWarning(user, "Enter your Medical ID", color);
    else if (organ.length == 0)
        showWarning(user, "Enter organ(s)", color);
    else if (weight.length == 0)
        showWarning(user, "Enter your weight", color);
    else if (weight < 20 || weight > 200)
        showWarning(user, "Enter proper weight", color);
    else if (height.length == 0)
        showWarning(user, "Enter your height", color);
    else if (height < 54 || height > 272)
        showWarning(user, "Enter proper height", color);
    else {
        return true;
    }
    return false;
}

async function assignSearchValues(result, user) {
    document.getElementById("get" + user + "FullName").innerHTML = "Full Name: " + result[0];
    document.getElementById("get" + user + "Age").innerHTML = "Age: " + result[1];
    document.getElementById("get" + user + "Gender").innerHTML = "Gender: " + result[2];
    document.getElementById("get" + user + "BloodType").innerHTML = "Blood Type: " + result[3];
    document.getElementById("get" + user + "Organ").innerHTML = "Organ: " + result[4];
    document.getElementById("get" + user + "Weight").innerHTML = "Weight: " + result[5];
    document.getElementById("get" + user + "Height").innerHTML = "Height: " + result[6];
    document.getElementById("get" + user + "Status").innerHTML = "Status: " + result[7];
}

function clearSearchValues(user) {
    document.getElementById("get" + user + "FullName").innerHTML = null;
    document.getElementById("get" + user + "Age").innerHTML = null;
    document.getElementById("get" + user + "Gender").innerHTML = null;
    document.getElementById("get" + user + "BloodType").innerHTML = null;
    document.getElementById("get" + user + "Organ").innerHTML = null;
    document.getElementById("get" + user + "Weight").innerHTML = null;
    document.getElementById("get" + user + "Height").innerHTML = null;
    document.getElementById("get" + user + "Status").innerHTML = null;
}

const App = {
    web3: null,
    contractInstance: null,
    accounts: null,

    start: async function () {
        const { web3 } = this;
        this.accounts = await web3.eth.getAccounts();
        console.log(this.accounts);
        this.contractInstance = new web3.eth.Contract(
            artifact.abi,
            contractAddress
        );
    },

    closeAlert: async function () {
        var alert = document.querySelector(".alert.warning");
        alert.style.opacity = "0";
        setTimeout(function () { alert.style.display = "none"; }, 600);
    },

    register: async function (user) {
        console.log(user);
        const fullname = document.getElementById(user + 'FullName').value;
        const age = document.getElementById(user + 'Age').value;
        const selectedGender = document.querySelector("input[name='gender']:checked");
        const gender = (selectedGender) ? selectedGender.value : null;
        const medical_id = document.getElementById(user + 'MedicalID').value;
        const blood_type = document.getElementById(user + 'BloodType').value;
        let checkboxes = document.querySelectorAll("input[name='Organ']:checked");
        let organ = [];
        checkboxes.forEach((checkbox) => {
            organ.push(checkbox.value);
        });
        const weight = document.getElementById(user + 'Weight').value;
        const height = document.getElementById(user + 'Height').value;

        let checkedValues = checkInputValues(user, fullname, age, gender, medical_id, organ, weight, height);
        console.log("Values Checked");
        var warning = document.querySelector(".alert.warning");
        if (checkedValues) {
            let validate;
            if (user == "Pledge") {
                validate = await this.contractInstance.methods.validatePledge(medical_id).call();
                console.log(validate);
            } else if (user == "Donor") {
                validate = await this.contractInstance.methods.validateDonor(medical_id).call();
                console.log(validate);
            } else if (user == "Patient") {
                validate = await this.contractInstance.methods.validatePatient(medical_id).call();
                console.log(validate);
            }

            if (!validate) {
                console.log(fullname, age, gender, medical_id, blood_type, organ, weight, height);
                if (user == "Pledge")
                    await this.setPledge(fullname, age, gender, medical_id, blood_type, organ, weight, height);
                else if (user == "Donor")
                    await this.setDonor(fullname, age, gender, medical_id, blood_type, organ, weight, height);
                else if (user == "Patient")
                    await this.setPatient(fullname, age, gender, medical_id, blood_type, organ, weight, height);
                showWarning(user, "Registration Successful!", "#04AA6D");
                setTimeout(function () {
                    warning.style.opacity = "0";
                    setTimeout(function () { warning.style.display = "none"; }, 1200);
                }, 5000);
            } else {
                showWarning(user, "Medical ID already exists!", "#f44336");
            }
        }
    },

    forwardPledge: async function () {
        const medical_id = document.getElementById('getPledgeMedicalID').innerHTML;
        console.log(medical_id);
        const result = await this.contractInstance.methods.getPledge(medical_id).call();
        console.log(result);
        await this.setDonor(result[0], result[1], result[2], medical_id, result[3], result[4], result[5], result[6]);
        document.getElementById("PledgeMessage").innerHTML = "Registration Successful!";
    },

    setPledge: async function (fullname, age, gender, medical_id, blood_type, organ, weight, height) {
        const gas = await this.contractInstance.methods.setPledge(fullname, age, gender, medical_id, blood_type, organ, weight, height).estimateGas({
            from: this.accounts[0]
        });
        await this.contractInstance.methods.setPledge(fullname, age, gender, medical_id, blood_type, organ, weight, height).send({
            from: this.accounts[0], gas: Math.max(gas, MIN_GAS)
        });
    },

    setDonor: async function (fullname, age, gender, medical_id, blood_type, organ, weight, height) {
        const gas = await this.contractInstance.methods.setDonors(fullname, age, gender, medical_id, blood_type, organ, weight, height).estimateGas({
            from: this.accounts[0]
        });
        await this.contractInstance.methods.setDonors(fullname, age, gender, medical_id, blood_type, organ, weight, height).send({
            from: this.accounts[0], gas: Math.max(gas, MIN_GAS)
        });
    },

    setPatient: async function (fullname, age, gender, medical_id, blood_type, organ, weight, height) {
        const gas = await this.contractInstance.methods.setPatients(fullname, age, gender, medical_id, blood_type, organ, weight, height).estimateGas({
            from: this.accounts[0]
        });
        await this.contractInstance.methods.setPatients(fullname, age, gender, medical_id, blood_type, organ, weight, height).send({
            from: this.accounts[0], gas: Math.max(gas, MIN_GAS)
        });
    },

    search: async function (user) {
        console.log(user);
        const medical_id = document.getElementById("input" + user + "MedicalID").value;
        if (medical_id.length == 0) {
            document.getElementById("search" + user + "Check").innerHTML = "Enter Medical ID";
            clearSearchValues(user);
        } else {
            let validate = false;
            if (user == "Donor") {
                validate = await this.contractInstance.methods.validateDonor(medical_id).call();
            } else if (user == "Patient") {
                validate = await this.contractInstance.methods.validatePatient(medical_id).call();
            }
            console.log("Inside getDonor: " + validate);

            if (validate) {
                if (user == "Donor") {
                    const result = await this.contractInstance.methods.getDonor(medical_id).call();
                    console.log(result);
                    document.getElementById("search" + user + "Check").innerHTML = null;
                    assignSearchValues(result, user);
                } else if (user == "Patient") {
                    const result = await this.contractInstance.methods.getPatient(medical_id).call();
                    console.log(result);
                    document.getElementById("search" + user + "Check").innerHTML = null;
                    assignSearchValues(result, user);
                }
            } else {
                document.getElementById("search" + user + "Check").innerHTML = "Medical ID does not exist!";
                clearSearchValues(user);
            }
        }
    },

    verifyPledges: async function () {
        this.accounts = await web3.eth.getAccounts();
        this.contractInstance = new web3.eth.Contract(
            artifact.abi,
            contractAddress
        );
        const PledgeCount = await this.contractInstance.methods.getCountOfPledges().call();
        const PledgeIDs = await this.contractInstance.methods.getAllPledgeIDs().call();
        let Pledge;
        let tableCreated = false;
        let initialTableGeneration = true;

        for (let i = 0; i < PledgeCount; i++) {
            const validate = await this.contractInstance.methods.validateDonor(PledgeIDs[i]).call();

            if (!validate) {
                tableCreated = true;
                const result = await this.contractInstance.methods.getPledge(PledgeIDs[i]).call();
                console.log(result);
                Pledge = [
                    { Index: i + 1, "Full Name": result[0], Age: result[1], Gender: result[2], "Medical ID": PledgeIDs[i], "Blood-Type": result[3], Organ: result[4], Weight: result[5], Height: result[6]},
                ];

                let data = Object.keys(Pledge[0]);
                if (initialTableGeneration) {
                    generateTableHead(table, data);
                    initialTableGeneration = false;
                }
                generateTable(table, Pledge);
            }
        }
        if (tableCreated) {
            selectRow();
        } else {
            document.getElementById("pending-table-message").innerHTML = "No pending pledges found!";
        }
        const spinner = document.querySelector(".spinner");
        spinner.style.display = "none";
    },

    viewPledges: async function () {
        this.accounts = await web3.eth.getAccounts();
        this.contractInstance = new web3.eth.Contract(
            artifact.abi,
            contractAddress
        );
        const PledgeCount = await this.contractInstance.methods.getCountOfPledges().call();
        const PledgeIDs = await this.contractInstance.methods.getAllPledgeIDs().call();
        let Pledge;

        for (let i = 0; i < PledgeCount; i++) {
            const result = await this.contractInstance.methods.getPledge(PledgeIDs[i]).call();
            console.log(result);
            const matched = await App.isOrganMatched(PledgeIDs[i]);
            Pledge = [
                { Index: i + 1, "Full Name": result[0], Age: result[1], Gender: result[2], "Medical ID": PledgeIDs[i], "Blood Type": result[3], Organ: result[4], Weight: result[5], Height: result[6]},
            ];

            let data = Object.keys(Pledge[0]);
            if (i == 0)
                generateTableHead(table, data);
            generateTable(table, Pledge);
        }
        const spinner = document.querySelector(".spinner");
        spinner.style.display = "none";
    },

    viewDonors: async function () {
        this.accounts = await web3.eth.getAccounts();
        this.contractInstance = new web3.eth.Contract(
            artifact.abi,
            contractAddress
        );
        const DonorCount = await this.contractInstance.methods.getCountOfDonors().call();
        const DonorIDs = await this.contractInstance.methods.getAllDonorIDs().call();
        let Donor;

        for (let i = 0; i < DonorCount; i++) {
            await this.contractInstance.methods.getDonor(DonorIDs[i]).call().then(async function (result) {
                console.log(result);
                const matched = await App.isOrganMatched(DonorIDs[i]);
                Donor = [
                    { Index: i + 1, "Full Name": result[0], Age: result[1], Gender: result[2], "Medical ID": DonorIDs[i], "Blood Type": result[3], "Organ(s)": result[4], "Weight(kg)": result[5], "Height(cm)": result[6], Status: matched ? "Organ Matched" : result[7] },
                ];

                let data = Object.keys(Donor[0]);
                if (i == 0)
                    generateTableHead(table, data);
                generateTable(table, Donor);
            });
        }
        const spinner = document.querySelector(".spinner");
        spinner.style.display = "none";
    },

    viewPatients: async function () {
        this.accounts = await web3.eth.getAccounts();
        this.contractInstance = new web3.eth.Contract(
            artifact.abi,
            contractAddress
        );
        const patientCount = await this.contractInstance.methods.getCountOfPatients().call();
        const patientIDs = await this.contractInstance.methods.getAllPatientIDs().call();
        let patient;

        for (let i = 0; i < patientCount; i++) {
            await this.contractInstance.methods.getPatient(patientIDs[i]).call().then(async function (result) {
                console.log(result);
                const matched = await App.isOrganMatched(patientIDs[i]);
                patient = [
                    { Index: i + 1, "Full Name": result[0], Age: result[1], Gender: result[2], "Medical ID": patientIDs[i], "Blood Type": result[3], "Organ(s)": result[4], "Weight(kg)": result[5], "Height(cm)": result[6], Status: matched ? "Organ Matched" : result[7] },
                ];

                let data = Object.keys(patient[0]);
                if (i == 0)
                    generateTableHead(table, data);
                generateTable(table, patient);
            });
        }
        const spinner = document.querySelector(".spinner");
        spinner.style.display = "none";
    },


    isOrganMatched: async function (medicalID) {
        const patientCount = await this.contractInstance.methods.getCountOfPatients().call();
        const patientIDs = await this.contractInstance.methods.getAllPatientIDs().call();
        const donorCount = await this.contractInstance.methods.getCountOfDonors().call();
        const donorIDs = await this.contractInstance.methods.getAllDonorIDs().call();

        for (let i = 0; i < patientCount; i++) {
            const patient = await this.contractInstance.methods.getPatient(patientIDs[i]).call();
            for (let j = 0; j < donorCount; j++) {
                const donor = await this.contractInstance.methods.getDonor(donorIDs[j]).call();
                if (patient[3] === donor[3] && patient[4].includes(medicalID) && donor[4].includes(medicalID)) {
                    return true;
                }
            }
        }
        return false;
    },

    transplantMatch: async function () {
        this.accounts = await web3.eth.getAccounts();
        this.contractInstance = new web3.eth.Contract(
            artifact.abi,
            contractAddress
        );
        document.getElementById("transplantTable").innerHTML = "";
        const patientCount = await this.contractInstance.methods.getCountOfPatients().call();
        let donorCount = await this.contractInstance.methods.getCountOfDonors().call();
        const patientIDs = await this.contractInstance.methods.getAllPatientIDs().call();
        const donorIDs = await this.contractInstance.methods.getAllDonorIDs().call();

        let donors = [];
        for (let i = 0; i < donorCount; i++) {
            const result = await this.contractInstance.methods.getDonor(donorIDs[i]).call();
            let organsArr = [];
            let temp = result[4];
            for (let o = 0; o < temp.length; o++) {
                organsArr[o] = temp[o];
            }
            const donorObj = { ID: donorIDs[i], name: result[0], bloodtype: result[3], organs: organsArr, organcount: organsArr.length };
            donors.push(donorObj);
        }
        console.log(donors);

        let match;
        console.log("Patient Count: " + patientCount);
        console.log("Donor Count: " + donorCount);

        let initialTableGeneration = true;
        let matchedData = [];

        for (let i = 0; i < patientCount; i++) {
            const patientResult = await this.contractInstance.methods.getPatient(patientIDs[i]).call();
            const patientname = patientResult[0];
            const patientbloodtype = patientResult[3];
            const patientorgans = patientResult[4];

            console.log("Checking patient: " + patientname);
            for (let poi = 0; poi < patientorgans.length; poi++) {
                console.log("Checking patient organ: " + patientorgans[poi]);
                let matchedOrgan = false;
                for (let j = 0; j < donorCount; j++) {
                    console.log("Checking donor: " + donors[j].name);
                    console.log("Organ count: " + donors[j].organcount);
                    for (let doi = 0; doi < donors[j].organcount; doi++) {
                        console.log("Checking donor organ: " + donors[j].organs[doi]);
                        if (patientbloodtype === donors[j].bloodtype && patientorgans[poi] === donors[j].organs[doi]) {
                            matchedOrgan = true;
                            console.log("Matched: " + patientname + " " + patientorgans[poi] + "<->" + donors[j].name + " " + donors[j].organs[doi]);
                            match = [
                                { "Patient Name": patientname, "Patient Organ": patientorgans[poi], "Patient Medical ID": patientIDs[i], "": "↔️", "Donor Medical ID": donorIDs[j], "Donor Organ": donors[j].organs[doi], "Donor Name": donors[j].name, Status: "Organ Matched" },
                            ];

                            matchedData.push(...match);

                            // Update the status in the smart contract
                            await this.contractInstance.methods.updatePatientStatus(patientIDs[i], "Organ Matched").send({ from: this.accounts[0], gas: MIN_GAS });
                            await this.contractInstance.methods.updateDonorStatus(donorIDs[j], "Organ Matched").send({ from: this.accounts[0], gas: MIN_GAS });

                            // Removing marked donor organ
                            donors[j].organs[doi] = donors[j].organs[donors[j].organcount - 1];
                            donors[j].organs.pop();
                            // donors[j].organcount--;
                            break;
                        }
                    }
                    if (donors[j].organcount === 0) {
                        donors[j] = donors[donorCount - 1];
                        // donorCount--;
                    }
                    if (matchedOrgan) {
                        break;
                    }
                }
            }
        }

        if (matchedData.length > 0) {
            let data = Object.keys(matchedData[0]);
            if (initialTableGeneration) {
                generateTableHead(table, data);
                initialTableGeneration = false;
            }
            generateTable(table, matchedData);
        } else {
            document.getElementById("transplantTableMessage").innerHTML = "No matched data found!";
        }

        const spinner = document.querySelector(".spinner");
        spinner.style.display = "none";
    }
}

window.App = App;

window.addEventListener("load", function () {
    App.web3 = new Web3(
        new Web3.providers.HttpProvider("http://127.0.0.1:7545"),
    );

    App.start();
});
