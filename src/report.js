const { getTrips, getVehicle, getDriver } = require('api');

async function driverReport() {

    let tripsByDriver = await getTrips();
    let driversID = []
       let noOfCashTrip = {}
       let noOfNonCashTrips = {}
       let totalEarnings = {}
       let cashBilled = {}
       let nonCashBilled = {}
       
    for (let eachDriverTrip of tripsByDriver) {
      //  console.log(eachDriverTrip)
        if (!driversID.includes(eachDriverTrip.driverID)) {
          driversID.push(eachDriverTrip.driverID);
        }

        if (eachDriverTrip['isCash']) {
            if (noOfCashTrip[eachDriverTrip.driverID]) {
                noOfCashTrip[eachDriverTrip.driverID]++;
            } else {
                noOfCashTrip[eachDriverTrip.driverID] = 1;
            }
        }
        if (!eachDriverTrip['isCash']) {
            if (noOfNonCashTrips[eachDriverTrip.driverID]) {
                noOfNonCashTrips[eachDriverTrip.driverID]++;
            } else {
                noOfNonCashTrips[eachDriverTrip.driverID] = 1;
            }
        }
        if (totalEarnings[eachDriverTrip.driverID]) {
            totalEarnings[eachDriverTrip.driverID] += parseFloat(String(eachDriverTrip.billedAmount).replace(/,/g, ''));
        } else {
            totalEarnings[eachDriverTrip.driverID] = parseFloat(String(eachDriverTrip.billedAmount).replace(/,/g, ''));
        }

        if (!eachDriverTrip.isCash) {
            if (nonCashBilled[eachDriverTrip.driverID]) {
                nonCashBilled[eachDriverTrip.driverID] += parseFloat(String(eachDriverTrip['billedAmount']).replace(/,/g, ''));
            } else {
                nonCashBilled[eachDriverTrip.driverID] = parseFloat(String(eachDriverTrip['billedAmount']).replace(/,/g, ''));
            }
        }

        if (eachDriverTrip.isCash) {
            if (cashBilled [eachDriverTrip.driverID]) {
                cashBilled [eachDriverTrip.driverID] += parseFloat(String(eachDriverTrip['billedAmount']).replace(/,/g, ''));
            } else {
                cashBilled [eachDriverTrip.driverID] = parseFloat(String(eachDriverTrip['billedAmount']).replace(/,/g, ''));
            }
        }
       
    }

    let cashTrips = Object.values(noOfCashTrip);
    let nonCashTrips = Object.values(noOfNonCashTrips);
    let totalEarningsInfo = Object.values(totalEarnings);
    let totalCash = Object.values(cashBilled);
    let totalNonCash = Object.values(nonCashBilled);

    let allDriverDetails = []
    for (let eachDriverID of driversID) {
        allDriverDetails.push(getDriver(eachDriverID));
    }
    let promiseDriverInfo = await Promise.allSettled(allDriverDetails);

    let driverRecord = [];

    for (let eachData of promiseDriverInfo) {
        if (eachData['status'] === 'fulfilled') {
            driverRecord.push(eachData);
        }
    }

    //console.log(driverRecord)
    const driverTrips = {};
    for (let trip of tripsByDriver) {
        if (driverTrips[trip.driverID]) {
            driverTrips[trip.driverID]++;
        } else {
            driverTrips[trip.driverID] = 1;
        }
    }
    
    let numOfTrips = Object.values(driverTrips);
    //console.log(numOfTrips)
    //console.log(driverTrips)
    let vehicle = [];
    let vehicleInformation = [];

    for (let driver of driverRecord) {
        if (!vehicle.includes(driver.value['vehicleID'])) {
            vehicle.push(driver.value.vehicleID)
        }
    }
    for (let eachVehicle of vehicle) {
        if (!vehicle.includes['vehicleID']) {
            vehicleInformation.push(getVehicle(eachVehicle))
        }
    }
    let promiseVehicleInfo = await Promise.allSettled(vehicleInformation)


    let correctVehicleInfo = [];
    for (let vehicleInfo of promiseVehicleInfo) {
        if (vehicleInfo['status'] === 'fulfilled') {
            correctVehicleInfo.push(vehicleInfo);
        }
    }
    //console.log(correctVehicleInfo)
    let vehiclesPlate = {};;
    let vehicleDetails = [];
    
    for (let index in correctVehicleInfo) {
        //vehiclesPlate = {}
        vehiclesPlate['plate'] = correctVehicleInfo[index].value.plate;
        vehiclesPlate['manufacturer'] = correctVehicleInfo[index].value.manufacturer;
        vehicleDetails.push(vehiclesPlate);
    }


    let userDetails = [];
    for (let driver in tripsByDriver) {
        let userInfo = {
            'user': tripsByDriver[driver].user.name,
            'created': tripsByDriver[driver].created,
            'pickup': tripsByDriver[driver].pickup,
            'destination': tripsByDriver[driver].destination,
            'billed': tripsByDriver[driver].billedAmount,
            'isCash': tripsByDriver[driver].isCash,
        }
        userDetails.push(userInfo)
    }


    let output = [];

    for (let driver in driverRecord) {
        let result = {};
        if (driverRecord[driver]) {
            let driverVehicle = [];
            driverVehicle.push(vehicleDetails[driver])
            result = {

                "fullName": driverRecord[driver].value.name,
                "id": driversID[driver],
                "phone": driverRecord[driver].value.phone,
                "noOfTrips": numOfTrips[driver],
                "noOfVehicles": (driverRecord[driver].value.vehicleID).length,
                "vehicles": driverVehicle,
                "noOfCashTrips": cashTrips[driver],
                "noOfNonCashTrips": nonCashTrips[driver],
                "totalAmountEarned": Number((totalEarningsInfo[driver]).toFixed(2)),
                "totalCashAmount": totalCash[driver],
                "totalNonCashAmount": Number((totalNonCash[driver].toFixed(2))),
                "trips": userDetails[driver],
            }
        }
        output.push(result);

    }
    console.log(output)
    return output;
}
driverReport()
module.exports = driverReport;