const { getTrips, getDriver, getVehicle} = require('api');
/**
 * This function should return the data for drivers in the specified format
 *
 * Question 4
 *
 * @returns {any} Driver report data
 */
async function driverReport() {
  let trips;
  const tripID = [];
  const driverID = [];
  const bill = [];
  const cashBool = [];
  //Obtain necessary information from trips API
  try {
    trips = await getTrips();
    for (let i = 0; i < trips.length; i++) {
      driverID.push(trips[i].driverID);
      tripID.push(trips[i].tripID);
      let moneyStr = trips[i].billedAmount;
      let money = moneyStr.toString().replace(/[,]+/g, ''); //Remove comma from string
      bill.push(parseFloat(money));
      cashBool.push(trips[i].isCash);
    }
  } catch (error) {
    console.log('error');
  }
  //Declare empty arrays of unique driver length for each property needed
  let uniqueID = [...new Set(driverID)];
  let countUniqueID = Array(uniqueID.length).fill(0);
  let amountOfDrivers = Array(uniqueID.length).fill(0);
  let cashAmount = Array(uniqueID.length).fill(0);
  let nonCashAmount = Array(uniqueID.length).fill(0);
  let cashTrip = Array(uniqueID.length).fill(0);
  let nonCashTrip = Array(uniqueID.length).fill(0);
  for (let index = 0; index < uniqueID.length; index++) {
    for (let indexDrive = 0; indexDrive < driverID.length; indexDrive++) {
      if (uniqueID[index] == driverID[indexDrive]) {
        countUniqueID[index]++;
        amountOfDrivers[index] += bill[indexDrive];
        if (cashBool[indexDrive]) {
          cashTrip[index]++;
          cashAmount[index] += bill[indexDrive];
        } else {
          nonCashTrip[index]++;
          nonCashAmount[index] += bill[indexDrive];
        }
      }
    }
  }
  //Create an array for the promises of each driver
  let driverPromises = [];
  for (let index = 0; index < uniqueID.length; index++) {
    driverPromises.push(getDriver(driverID[index]));
  }
  const allDrivers = await Promise.all(driverPromises);
  //Empty arrays to obtain information from getDriver API
  let driverNames = Array(uniqueID.length).fill('');
  let driverEmails = Array(uniqueID.length).fill('');
  let driverPhones = Array(uniqueID.length).fill('');
  let noOfVehicles = Array(uniqueID.length).fill(0);
  let motorID = Array(uniqueID.length).fill();
  for (let index = 0; index < allDrivers.length; index++) {
    driverNames[index] = allDrivers[index].name;
    driverEmails[index] = allDrivers[index].email;
    driverPhones[index] = allDrivers[index].phone;
    noOfVehicles[index] = allDrivers[index].vehicleID.length;
    motorID[index] = allDrivers[index].vehicleID;
  }
  //Empty arrays to obtain information from getVehicle API
  let vehiclePlate = [];
  let vehicleDetail;
  for (let index = 0; index < motorID.length; index++) {
    let eachPlate = [];
    if (motorID[index] === undefined) continue;
    for (let step = 0; step < motorID[index].length; step++) {
      try {
        vehicleDetail = await getVehicle(motorID[index][step]);
        const plate = vehicleDetail.plate;
        const manufacture = vehicleDetail.manufacturer;
        const combined = `{plate: ${plate}, manufacturer: ${manufacture}}`;
        eachPlate.push(combined);
      } catch (error) {
        console.log('error');
      }
    }
    vehiclePlate.push(eachPlate);
  }
  //Get each driver required information and populate the tripOfDrivers array
  let tripsOfDrivers = [];
  for (let index = 0; index < uniqueID.length; index++) {
    tripOfEachDriver = [];
    for (let step = 0; step < trips.length; step++) {
      if (uniqueID[index] === trips[step].driverID) {
        const user = trips[step].user.name;
        const created = trips[step].created;
        const pickup = trips[step].pickup.address;
        const destination = trips[index].destination.address;
        const isCash = trips[index].isCash;
        const transportFee = trips[index].billedAmount;
        const money = transportFee.toString().replace(/[^0-9.-]+/g, '');
        const billed = parseFloat(money);
        const thisTrip = `{
          user: ${user},
          created: ${created},
          pickup: ${pickup},
          destination: ${destination},
          billed: ${billed},
          isCash: ${isCash}
        }`;
        tripOfEachDriver.push(thisTrip);
      }
    }
    tripsOfDrivers.push(tripOfEachDriver);
  }
  //Populate the output array
  let output = [];
  for (let index = 0; index < uniqueID.length; index++) {
    let fullName = `{
      fullName: ${driverNames[index]},
      id: ${uniqueID[index]},
      phone: ${driverPhones[index]},
      noOfTrips: ${countUniqueID[index]},
      noOfVehicles: ${noOfVehicles[index]},
      vehicles: ${vehiclePlate[index]},
      noOfCashTrip: ${cashTrip[index]},
      noOfNonCashTrip: ${nonCashTrip[index]},
      totalAmountEarned: ${amountOfDrivers[index]},
      totalCashAmount: ${cashAmount[index]},
      totalNonCashAmount: ${nonCashAmount[index]},
      trips: ${tripsOfDrivers[index]};
    }`;
    output.push(fullName);
  }
  return output;
}
driverReport()
module.exports = driverReport;
