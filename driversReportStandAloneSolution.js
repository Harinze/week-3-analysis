const { getTrips, getDriver } = require("api");
/**
 * This function should return the trip data analysis
 *
 * Question 3
 * @returns {any} Trip data analysis
 */
async function analysis() {
  const trips = await getTrips();
  let cash;
  let driverSet = new Set();
  let driver;
  let driverTrips = {};
  let maxTrip = 0;
  let maxEarning = 0;
  let driverIDs = [];
  let driverPromises = [];
  let driverDetails = {};
  let result = {
    noOfCashTrips: 0,
    noOfNonCashTrips: 0,
    billedTotal: 0,
    cashBilledTotal: 0,
    nonCashBilledTotal: 0,
    noOfDriversWithMoreThanOneVehicle: 0,
    mostTripsByDriver: {
      name: "",
      email: "",
      phone: "",
      noOfTrips: 0,
      totalAmountEarned: 0,
    },
    highestEarningDriver: {
      name: "",
      email: "",
      phone: "",
      noOfTrips: 0,
      totalAmountEarned: 0,
    },
  };
  trips.forEach((trip) => {
    if (!driverSet.has(trip.driverID)) {
      driverSet.add(trip.driverID);
    }
  });
  driverIDs = [...driverSet];
  driverIDs.forEach((driverID) => {
    driverPromises.push(getDriver(driverID));
  });
  try {
    driver = await Promise.allSettled(driverPromises);
    driver.forEach((driverDetail, index) => {
      if (driverDetail.status == "fulfilled") {
        driverDetails[driverIDs[index]] = driverDetail.value;
      }
      if (
        driverDetail.status == "fulfilled" &&
        driverDetail.value.vehicleID.length > 1
      ) {
        result.noOfDriversWithMoreThanOneVehicle++;
      }
    });
  } catch (error) {}
  for (let val of trips) {
    if (val.isCash === true) {
      result.noOfCashTrips++;
      cash = parseFloat(String(val.billedAmount).split(",").join(""));
      result.cashBilledTotal = result.cashBilledTotal += cash;
    } else {
      result.noOfNonCashTrips++;
    }
    let bill = parseFloat(String(val.billedAmount).split(",").join(""));
    result.billedTotal += bill;
    result.billedTotal = Number(result.billedTotal.toFixed(2));
    result.nonCashBilledTotal = result.billedTotal - result.cashBilledTotal;
    if (!driverTrips[val.driverID] && driverDetails[val.driverID]) {
      driverTrips[val.driverID] = {};
      driverTrips[val.driverID].count = 1;
      driverTrips[val.driverID].name = driverDetails[val.driverID].name;
      driverTrips[val.driverID].email = driverDetails[val.driverID].email;
      driverTrips[val.driverID].phone = driverDetails[val.driverID].phone;
      driverTrips[val.driverID].earning = parseFloat(
        String(val.billedAmount).split(",").join("")
      );
    } else if (driverTrips[val.driverID]) {
      driverTrips[val.driverID].count++;
      driverTrips[val.driverID].earning += parseFloat(
        String(val.billedAmount).split(",").join("")
      );
      if (driverTrips[val.driverID].count >= maxTrip) {
        maxTrip = driverTrips[val.driverID].count;
        result.mostTripsByDriver.name = driverTrips[val.driverID].name;
        result.mostTripsByDriver.email = driverTrips[val.driverID].email;
        result.mostTripsByDriver.phone = driverTrips[val.driverID].phone;
        result.mostTripsByDriver.noOfTrips = driverTrips[val.driverID].count;
        result.mostTripsByDriver.totalAmountEarned = Number(
          Number(driverTrips[val.driverID].earning).toFixed(2)
        );
      }
      if (driverTrips[val.driverID].earning >= maxEarning) {
        maxEarning = driverTrips[val.driverID].earning;
        result.highestEarningDriver.name = driverTrips[val.driverID].name;
        result.highestEarningDriver.email = driverTrips[val.driverID].email;
        result.highestEarningDriver.phone = driverTrips[val.driverID].phone;
        result.highestEarningDriver.noOfTrips = driverTrips[val.driverID].count;
        result.highestEarningDriver.totalAmountEarned = maxEarning;
      }
    }
  }
  return result;
}
analysis();
module.exports = analysis;
