const { getTrips, getDriver } = require('api');

async function analysis() {

        let trips = await getTrips();
        
        
        let isCashBilledAmount = 0
        let nonCashBilledAmount = 0
        let noOfisCashTrips = 0
        let noOfNonCashTrips = 0
        let uniqueDriverIDs = [];

     //  const driversTrips = trips.map(x => x);
         //   console.log(driversTrips)
    for (tripData of trips) {
      // console.log(tripData.driverID)
        if (!uniqueDriverIDs.includes(tripData.driverID)) {
            uniqueDriverIDs.push(tripData.driverID);
        }
        if (tripData.isCash) {
            isCashBilledAmount += parseFloat(String(tripData.billedAmount).replace(/,/g, ''));
            noOfisCashTrips += 1
        }

        
        if (!tripData.isCash) {
            nonCashBilledAmount += parseFloat(String(tripData.billedAmount).replace(/,/g, ''))
            noOfNonCashTrips += 1
        }
    }
    
    let driversInfo = [];
    let individualDriverTrips = [];
    let individualTripsArr = [];
    let individualTripsObj = {};

    for (drivers of uniqueDriverIDs) {
        driversInfo.push(getDriver(drivers));// get all driver information for each driver i.e names, no of trips, etc.
        
        const driverIndividualTrips = trips.filter(data => {
                if (data.driverID == drivers) {
                    return data
                }
               })
          
            //driversInfo  
        individualTripsObj.driverID = drivers;
         //console.log(individualTripsObj.driverID) 
        individualTripsObj.noOfTrips = driverIndividualTrips.length;
        individualTripsArr.push(individualTripsObj);
        individualTripsObj = {};

        
        individualDriverTrips.push(driverIndividualTrips);
    }

    
    const noOfDriversWithMoreThanOneVehicles = (await Promise.allSettled(driversInfo)).filter(data => {
         if (data.status === "fulfilled" && (data.value).vehicleID.length > 1) {return data;}}).length;
    
    const mostEarnedSort = individualDriverTrips.sort((a, b) => {
        return (b.reduce((value, cur) => {
            return value + parseFloat(String(cur.billedAmount).replace(/,/g, ''))
        }, 0) - a.reduce((value, cur) => {
            return value + parseFloat(String(cur.billedAmount).replace(/,/g, ''))
        }, 0))
    })
     // console.log(mostEarnedSort)

    let driverIndividualEarnings = {};
    let driverIndividualEarningsArr = [];
    
    for (driver of mostEarnedSort) {
          const tripEarnings = driver.reduce((acc, cur) => {
            return acc + parseFloat(String(cur.billedAmount).replace(/,/g, ''))
        }, 0)

        driverIndividualEarnings.driverID = `${driver[0].driverID}`;
        //console.log(driverIndividualEarnings)
        driverIndividualEarnings.totalEarning = `${tripEarnings}`
        driverIndividualEarningsArr.push(driverIndividualEarnings)
        driverIndividualEarnings = {}
    }
    
    individualTripsArr.sort((a, b) => {
            return b.noOfTrips - a.noOfTrips
        })
        // get drivers IDs with highest trips
    const value = individualTripsArr[0].noOfTrips;
    const driverWithMostTrips = individualTripsArr.filter((element => {
        if (element.noOfTrips === value) {
            return element
        }
    }))
    const driverWithMostTripsID = driverWithMostTrips[0].driverID;
    const driverWithMostTripsNoOfTrips = driverWithMostTrips[0].noOfTrips;
    const driverWithMostTripsTotalEarning = driverIndividualEarningsArr.filter((element) => {
        if (element.driverID === driverWithMostTripsID) {
            return element
        }
    })
    const driverWithMostTripsInitDetails = await getDriver(driverWithMostTripsID);
    const driverWithMostTripsFinalDetails = {
        "name": driverWithMostTripsInitDetails.name,
        "email": driverWithMostTripsInitDetails.email,
        "phone": driverWithMostTripsInitDetails.phone,
        "noOfTrips": driverWithMostTripsNoOfTrips,
        "totalAmountEarned": Number(driverWithMostTripsTotalEarning[0].totalEarning)
    };

    
    const driverWithMostEarningsID = driverIndividualEarningsArr[0].driverID
    const driverWithMostEarningsTotalEarning = driverIndividualEarningsArr[0].totalEarning
    const hisInitDetails = await getDriver(driverWithMostEarningsID);
    const hisTotalTrips = individualTripsArr.filter((element) => {
        if (element.driverID === driverWithMostEarningsID) {
            return element
        }
    })
    const highestEarningDriverFinalDetails = {
        "name": hisInitDetails.name,
        "email": hisInitDetails.email,
        "phone": hisInitDetails.phone,
        "noOfTrips": hisTotalTrips[0].noOfTrips,
        "totalAmountEarned": Number(driverWithMostEarningsTotalEarning)
    };


    const output = {
        "noOfCashTrips": noOfisCashTrips,
        "noOfNonCashTrips": noOfNonCashTrips,
        "billedTotal": isCashBilledAmount + nonCashBilledAmount,
        "cashBilledTotal": isCashBilledAmount,
        "nonCashBilledTotal": Number(nonCashBilledAmount.toFixed(2)),
        "noOfDriversWithMoreThanOneVehicle": noOfDriversWithMoreThanOneVehicles,
        "mostTripsByDriver": driverWithMostTripsFinalDetails,
        "highestEarningDriver": highestEarningDriverFinalDetails
    }
    //console.log(output)
    return output;

}
analysis()
module.exports = analysis
