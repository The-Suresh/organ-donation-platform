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
}

function assignSearchValues(result, user) {
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

        let checkedValues = false;
        checkedValues = checkInputValues(user, fullname, age, gender, medical_id, organ, weight, height);
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
                    this.setPledge(fullname, age, gender, medical_id, blood_type, organ, weight, height);
                else if (user == "Donor")
                    this.setDonor(fullname, age, gender, medical_id, blood_type, organ, weight, height);
                else if (user == "Patient")
                    this.setPatient(fullname, age, gender, medical_id, blood_type, organ, weight, height);
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
        await this.contractInstance.methods.getPledge(medical_id).call().then(function (result) {
            console.log(result);
            App.setDonor(result[0], result[1], result[2], medical_id, result[3], result[4], result[5], result[6]);
        });
        document.getElementById("PledgeMessage").innerHTML = "Registration Successful!";
    },

    setPledge: async function (fullname, age, gender, medical_id, blood_type, organ, weight, height) {
        const gas = await this.contractInstance.methods.setPledge(fullname, age, gender, medical_id, blood_type, organ, weight, height).estimateGas({
            from: this.accounts[0]
        });
        await this.contractInstance.methods.setPledge(fullname, age, gender, medical_id, blood_type, organ, weight, height
        ).send({
            from: this.accounts[0], gas: Math.max(gas, MIN_GAS)
        })
    },

    setDonor: async function (fullname, age, gender, medical_id, blood_type, organ, weight, height) {
        const gas = await this.contractInstance.methods.setDonors(fullname, age, gender, medical_id, blood_type, organ, weight, height).estimateGas({
            from: this.accounts[0]
        });
        await this.contractInstance.methods.setDonors(fullname, age, gender, medical_id, blood_type, organ, weight, height
        ).send({
            from: this.accounts[0], gas: Math.max(gas, MIN_GAS)
        })
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
                    await this.contractInstance.methods.getDonor(medical_id).call().then(function (result) {
                        console.log(result);
                        document.getElementById("search" + user + "Check").innerHTML = null;
                        assignSearchValues(result, user);
                    });
                } else if (user == "Patient") {
                    await this.contractInstance.methods.getPatient(medical_id).call().then(function (result) {
                        console.log(result);
                        document.getElementById("search" + user + "Check").innerHTML = null;
                        assignSearchValues(result, user);
                    });
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
            var validate = await this.contractInstance.methods.validateDonor(PledgeIDs[i]).call();

            if (!validate) {
                tableCreated = true;
                await this.contractInstance.methods.getPledge(PledgeIDs[i]).call().then(function (result) {
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
                });
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
            await this.contractInstance.methods.getPledge(PledgeIDs[i]).call().then(async function (result) {
                console.log(result);
                const matched = await App.isOrganMatched(PledgeIDs[i]);
                Pledge = [
                    { Index: i + 1, "Full Name": result[0], Age: result[1], Gender: result[2], "Medical ID": PledgeIDs[i], "Blood Type": result[3], Organ: result[4], Weight: result[5], Height: result[6]},
                ];

                let data = Object.keys(Pledge[0]);
                if (i == 0)
                    generateTableHead(table, data);
                generateTable(table, Pledge);
            });
        }
        const spinner = document.querySelector(".spinner");
        spinner.style.display = "none";
    },

    // viewDonors: async function () {
    //     this.accounts = await web3.eth.getAccounts();
    //     this.contractInstance = new web3.eth.Contract(
    //         artifact.abi,
    //         contractAddress
    //     );
    //     const DonorCount = await this.contractInstance.methods.getCountOfDonors().call();
    //     const DonorIDs = await this.contractInstance.methods.getAllDonorIDs().call();
    //     let Donor;

    //     for (let i = 0; i < DonorCount; i++) {
    //         await this.contractInstance.methods.getDonor(DonorIDs[i]).call().then(async function (result) {
    //             console.log(result);
    //             const matched = await App.isOrganMatched(DonorIDs[i]);
    //             Donor = [
    //                 { Index: i + 1, "Full Name": result[0], Age: result[1], Gender: result[2], "Medical ID": DonorIDs[i], "Blood Type": result[3], "Organ(s)": result[4], "Weight(kg)": result[5], "Height(cm)": result[6], Status: matched ? "Organ Matched" : result[7] },
    //             ];

    //             let data = Object.keys(Donor[0]);
    //             if (i == 0)
    //                 generateTableHead(table, data);
    //             generateTable(table, Donor);
    //         });
    //     }
    //     const spinner = document.querySelector(".spinner");
    //     spinner.style.display = "none";
    // },

    // viewDonors: async function () {
    //     this.accounts = await web3.eth.getAccounts();
    //     this.contractInstance = new web3.eth.Contract(
    //         artifact.abi,
    //         contractAddress
    //     );
    //     const DonorCount = await this.contractInstance.methods.getCountOfDonors().call();
    //     const DonorIDs = await this.contractInstance.methods.getAllDonorIDs().call();
    //     const PledgeCount = await this.contractInstance.methods.getCountOfPledges().call();
    //     const PledgeIDs = await this.contractInstance.methods.getAllPledgeIDs().call();
        
    //     // Clear existing table
    //     const table = document.getElementById('donorsTable');
    //     table.innerHTML = '';
        
    //     let allDonors = [];
    //     let donorIndex = 1;
    
    //     // Process regular donors
    //     for (let i = 0; i < DonorCount; i++) {
    //         await this.contractInstance.methods.getDonor(DonorIDs[i]).call().then(async function (result) {
    //             const matched = await App.isOrganMatched(DonorIDs[i]);
    //             allDonors.push({
    //                 Index: donorIndex++,
    //                 "Full Name": result[0],
    //                 Age: result[1],
    //                 Gender: result[2],
    //                 "Medical ID": DonorIDs[i],
    //                 "Blood Type": result[3],
    //                 "Organ(s)": result[4],
    //                 "Weight(kg)": result[5],
    //                 "Height(cm)": result[6],
    //                 Status: matched ? "Organ Matched" : result[7],
    //                 "Donor Type": "Donor" // Add donor type
    //             });
    //         });
    //     }
    
    //     // Process pledge donors (those who have been converted to donors)
    //     for (let i = 0; i < PledgeCount; i++) {
    //         const isPledgeConverted = await this.contractInstance.methods.validateDonor(PledgeIDs[i]).call();
    //         if (isPledgeConverted) {
    //             await this.contractInstance.methods.getDonor(PledgeIDs[i]).call().then(async function (result) {
    //                 const matched = await App.isOrganMatched(PledgeIDs[i]);
    //                 allDonors.push({
    //                     Index: donorIndex++,
    //                     "Full Name": result[0],
    //                     Age: result[1],
    //                     Gender: result[2],
    //                     "Medical ID": PledgeIDs[i],
    //                     "Blood Type": result[3],
    //                     "Organ(s)": result[4],
    //                     "Weight(kg)": result[5],
    //                     "Height(cm)": result[6],
    //                     Status: matched ? "Organ Matched" : result[7],
    //                     "Donor Type": "Pledge Donor" // Add donor type
    //                 });
    //             });
    //         }
    //     }
    
    //     // Generate table with all donors initially
    //     if (allDonors.length > 0) {
    //         let data = Object.keys(allDonors[0]);
    //         generateTableHead(table, data);
    //         generateTable(table, allDonors);
            
    //         // Store donors data for filtering
    //         App.currentDonorsData = allDonors;
    //     } else {
    //         table.innerHTML = '<tr><td colspan="10" style="text-align:center">No donors found</td></tr>';
    //     }
        
    //     const spinner = document.querySelector(".spinner");
    //     spinner.style.display = "none";
    // },

    // viewDonors: async function () {
    //     this.accounts = await web3.eth.getAccounts();
    //     this.contractInstance = new web3.eth.Contract(
    //         artifact.abi,
    //         contractAddress
    //     );
    //     const DonorCount = await this.contractInstance.methods.getCountOfDonors().call();
    //     const DonorIDs = await this.contractInstance.methods.getAllDonorIDs().call();
    //     const PledgeCount = await this.contractInstance.methods.getCountOfPledges().call();
    //     const PledgeIDs = await this.contractInstance.methods.getAllPledgeIDs().call();
        
    //     // Clear existing table
    //     const table = document.getElementById('donorsTable');
    //     table.innerHTML = '';
        
    //     let allDonors = [];
    //     let donorIndex = 1;
    //     let processedIDs = new Set();
    
    //     // First process all converted pledges (Pledge Donors)
    //     for (let i = 0; i < PledgeCount; i++) {
    //         const isPledgeConverted = await this.contractInstance.methods.validateDonor(PledgeIDs[i]).call();
    //         if (isPledgeConverted && !processedIDs.has(PledgeIDs[i])) {
    //             await this.contractInstance.methods.getDonor(PledgeIDs[i]).call().then(async function (result) {
    //                 const matched = await App.isOrganMatched(PledgeIDs[i]);
    //                 allDonors.push({
    //                     Index: donorIndex++,
    //                     "Full Name": result[0],
    //                     Age: result[1],
    //                     Gender: result[2],
    //                     "Medical ID": PledgeIDs[i],
    //                     "Blood Type": result[3],
    //                     "Organ(s)": result[4],
    //                     "Weight(kg)": result[5],
    //                     "Height(cm)": result[6],
    //                     Status: matched ? "Organ Matched" : result[7],
    //                     "Donor Type": "Pledge Donor"
    //                 });
    //                 processedIDs.add(PledgeIDs[i]);
    //             });
    //         }
    //     }
    
    //     // Then process regular donors (excluding any already processed as Pledge Donors)
    //     for (let i = 0; i < DonorCount; i++) {
    //         if (!processedIDs.has(DonorIDs[i])) {
    //             await this.contractInstance.methods.getDonor(DonorIDs[i]).call().then(async function (result) {
    //                 const matched = await App.isOrganMatched(DonorIDs[i]);
    //                 allDonors.push({
    //                     Index: donorIndex++,
    //                     "Full Name": result[0],
    //                     Age: result[1],
    //                     Gender: result[2],
    //                     "Medical ID": DonorIDs[i],
    //                     "Blood Type": result[3],
    //                     "Organ(s)": result[4],
    //                     "Weight(kg)": result[5],
    //                     "Height(cm)": result[6],
    //                     Status: matched ? "Organ Matched" : result[7],
    //                     "Donor Type": "Donor"
    //                 });
    //                 processedIDs.add(DonorIDs[i]);
    //             });
    //         }
    //     }
    
    //     // Generate table with all donors
    //     if (allDonors.length > 0) {
    //         let data = Object.keys(allDonors[0]);
    //         generateTableHead(table, data);
    //         generateTable(table, allDonors);
            
    //         // Store donors data for filtering
    //         App.currentDonorsData = allDonors;
    //     } else {
    //         table.innerHTML = '<tr><td colspan="10" style="text-align:center">No donors found</td></tr>';
    //     }
        
    //     const spinner = document.querySelector(".spinner");
    //     spinner.style.display = "none";
    // },

    viewDonors: async function () {
        this.accounts = await web3.eth.getAccounts();
        this.contractInstance = new web3.eth.Contract(
            artifact.abi,
            contractAddress
        );
        const DonorCount = await this.contractInstance.methods.getCountOfDonors().call();
        const DonorIDs = await this.contractInstance.methods.getAllDonorIDs().call();
        const PledgeCount = await this.contractInstance.methods.getCountOfPledges().call();
        const PledgeIDs = await this.contractInstance.methods.getAllPledgeIDs().call();
        
        // Clear existing table
        const table = document.getElementById('donorsTable');
        table.innerHTML = '';
        
        let allDonors = [];
        let processedIDs = new Set();
    
        // First process all converted pledges (Pledge Donors)
        for (let i = 0; i < PledgeCount; i++) {
            const isPledgeConverted = await this.contractInstance.methods.validateDonor(PledgeIDs[i]).call();
            if (isPledgeConverted && !processedIDs.has(PledgeIDs[i])) {
                await this.contractInstance.methods.getDonor(PledgeIDs[i]).call().then(async function (result) {
                    const matched = await App.isOrganMatched(PledgeIDs[i]);
                    allDonors.push({
                        "Medical ID": PledgeIDs[i],
                        "Full Name": result[0],
                        Age: result[1],
                        Gender: result[2],
                        "Blood Type": result[3],
                        "Organ(s)": result[4],
                        "Weight(kg)": result[5],
                        "Height(cm)": result[6],
                        Status: matched ? "Organ Matched" : result[7],
                        "Donor Type": "Pledge Donor"
                    });
                    processedIDs.add(PledgeIDs[i]);
                });
            }
        }
    
        // Then process regular donors (excluding any already processed as Pledge Donors)
        for (let i = 0; i < DonorCount; i++) {
            if (!processedIDs.has(DonorIDs[i])) {
                await this.contractInstance.methods.getDonor(DonorIDs[i]).call().then(async function (result) {
                    const matched = await App.isOrganMatched(DonorIDs[i]);
                    allDonors.push({
                        "Medical ID": DonorIDs[i],
                        "Full Name": result[0],
                        Age: result[1],
                        Gender: result[2],
                        "Blood Type": result[3],
                        "Organ(s)": result[4],
                        "Weight(kg)": result[5],
                        "Height(cm)": result[6],
                        Status: matched ? "Organ Matched" : result[7],
                        "Donor Type": "Donor"
                    });
                    processedIDs.add(DonorIDs[i]);
                });
            }
        }
    
        // Sort donors by Medical ID (or any other field you prefer)
        allDonors.sort((a, b) => a["Medical ID"] - b["Medical ID"]);
    
        // Generate table with all donors
        if (allDonors.length > 0) {
            // Add Index based on sorted position
            const donorsWithIndex = allDonors.map((donor, index) => ({
                Index: index + 1,
                ...donor
            }));
    
            let data = Object.keys(donorsWithIndex[0]);
            generateTableHead(table, data);
            generateTable(table, donorsWithIndex);
            
            // Store donors data for filtering
            App.currentDonorsData = donorsWithIndex;
        } else {
            table.innerHTML = '<tr><td colspan="10" style="text-align:center">No donors found</td></tr>';
        }
        
        const spinner = document.querySelector(".spinner");
        spinner.style.display = "none";
    },
    
    filterDonors: function() {
        const filterValue = document.getElementById('donorTypeFilter').value;
        const table = document.getElementById('donorsTable');
        
        // Clear existing table data (keep headers)
        while (table.rows.length > 1) {
            table.deleteRow(1);
        }
        
        if (!App.currentDonorsData) return;
        
        const filteredDonors = filterValue === 'all' 
            ? App.currentDonorsData 
            : App.currentDonorsData.filter(donor => donor["Donor Type"] === filterValue);
        
        if (filteredDonors.length > 0) {
            generateTable(table, filteredDonors);
        } else {
            const noResultsRow = table.insertRow();
            const cell = noResultsRow.insertCell();
            cell.colSpan = Object.keys(App.currentDonorsData[0]).length;
            cell.textContent = 'No donors match the selected filter';
            cell.style.textAlign = 'center';
        }
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
        document.getElementById("transplantTable").innerHTML = null;
        var patientCount = await this.contractInstance.methods.getCountOfPatients().call();
        var donorCount = await this.contractInstance.methods.getCountOfDonors().call();
        var patientIDs = await this.contractInstance.methods.getAllPatientIDs().call();
        var donorIDs = await this.contractInstance.methods.getAllDonorIDs().call();

        let donor = [];
        for (let i = 0; i < donorCount; i++) {
            await this.contractInstance.methods.getDonor(donorIDs[i]).call().then(function (result) {
                let organsArr = [];
                let temp = result[4];
                for (let o = 0; o < temp.length; o++) {
                    organsArr[o] = temp[o];
                }
                donorObj = { ID: donorIDs[i], name: result[0], bloodtype: result[3], organs: organsArr, organcount: organsArr.length };
                donor[i] = donorObj;
            });
        }
        console.log(donor);

        let match;
        console.log("Patient Count: " + patientCount);
        console.log("Donor Count: " + donorCount);

        let initialTableGeneration = true;
        let matchedData = [];

        for (var i = 0; i < patientCount; i++) {
            var patientname;
            var patientbloodtype;
            var patientorgans;
            await this.contractInstance.methods.getPatient(patientIDs[i]).call().then(function (result) {
                patientname = result[0];
                patientbloodtype = result[3];
                patientorgans = result[4];
            });
            console.log("Checking patient: " + patientname);
            for (var poi = 0; poi < patientorgans.length; poi++) {
                console.log("Checking patient organ: " + patientorgans[poi]);
                let matchedOrgan = false;
                for (var j = 0; j < donorCount; j++) {
                    console.log("Checking donor: " + donor[j].name);
                    console.log("Organ count: " + donor[j].organcount);
                    for (let doi = 0; doi < donor[j].organcount; doi++) {
                        console.log("Checking donor organ: " + donor[j].organs[doi]);
                        if (patientbloodtype == donor[j].bloodtype && patientorgans[poi] == donor[j].organs[doi]) {
                            matchedOrgan = true;
                            console.log("Matched: " + patientname + " " + patientorgans[poi] + "<->" + donor[j].name + " " + donor[j].organs[doi]);
                            match = [
                                { "Patient Name": patientname, "Patient Organ": patientorgans[poi], "Patient Medical ID": patientIDs[i], "": "↔️", "Donor Medical ID": donorIDs[j], "Donor Organ": donor[j].organs[doi], "Donor Name": donor[j].name, Status: "Organ Matched" },
                            ];

                            matchedData.push(...match);

                            // Update the status in the smart contract
                            App.contractInstance.methods.updatePatientStatus(patientIDs[i], "Organ Matched").send({ from: App.accounts[0], gas: MIN_GAS });
                            App.contractInstance.methods.updateDonorStatus(donorIDs[j], "Organ Matched").send({ from: App.accounts[0], gas: MIN_GAS });

                            // Removing marked donor organ
                            donor[j].organs[doi] = donor[j].organs[donor[j].organcount - 1];
                            // donor[j].organs.pop();
                            donor[j].organcount--;
                            break;
                        }
                    }
                    if (donor[j].organcount == 0) {
                        // donor[j] = donor[donorCount - 1];
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
