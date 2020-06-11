/**
 * FleetInformation.js
 * This file contains code that runs on load for FleetInformation.html
 */


// GENERAL FUNCTIONS //

// Define comparison function to provide as a paramter for JS's find method
function compareID(a,b) {
  if (a._id < b._id) {
    return -1;
  }
  if (a._id > b._id) {
    return 1;
  }
  return 0;
}

// Define comparison function to provide as a paramter for JS's find method
function compareAirline(a,b) {
  if (a._airline < b._airline) {
    return -1;
  }
  if (a._airline > b._airline) {
    return 1;
  }
  return 0;
}

// Define comparison function to provide as a paramter for JS's find method
function compareLocation(a,b) {
  if (a._location < b._location) {
    return -1;
  }
  if (a._location > b._location) {
    return 1;
  }
  return 0;
}

// Define comparison function to provide as a paramter for JS's find method
function compareType(a,b) {
  if (a._type < b._type) {
    return -1;
  }
  if (a._type > b._type) {
    return 1;
  }
  return 0;
}

// Define comparison function to provide as a paramter for JS's find method
function compareStatus(a,b) {
  if (a._status < b._status) {
    return -1;
  }
  if (a._status > b._status) {
    return 1;
  }
  return 0;
}

// Define sortRange function with sorting algorithm to sort plane range
function sortRange(fleetData) {
  for (let i = 0; i < fleetData._listOfPlanes.length; i++) {
    // Assume min value is current value by defining minIndex as curret index
    let minIndex = i;
    // Loop through all elements after index i
    for (let j = i + 1; j < fleetData._listOfPlanes.length; j++) {
      // If next item is larger than item being checked, define new minIndex
      if (fleetData._listOfPlanes[j]._range <
        fleetData._listOfPlanes[minIndex]._range) {
        minIndex = j;
      }
    }
    // If minIndex has been changed location of values in array
    if (minIndex !== i ) {
      let temp = fleetData._listOfPlanes[i];
      fleetData._listOfPlanes[i] = fleetData._listOfPlanes[minIndex];
      fleetData._listOfPlanes[minIndex] = temp;
    }
  }
  return fleetData._listOfPlanes;
}

// Define sortSpeed function with sorting algorithm to sort plane range
function sortSpeed(fleetData) {
  for (let i = 0; i < fleetData._listOfPlanes.length; i++) {
    // Assume min value is current value by defining minIndex as curret index
    let minIndex = i;
    // Loop through all elements after index i
    for (let j = i + 1; j < fleetData._listOfPlanes.length; j++) {
      // If next item is larger than item being checked, define new minIndex
      if (fleetData._listOfPlanes[j]._avgSpeed <
        fleetData._listOfPlanes[minIndex]._avgSpeed) {
        minIndex = j;
      }
    }
    // If minIndex has been changed location of values in array
    if (minIndex !== i ) {
      let temp = fleetData._listOfPlanes[i];
      fleetData._listOfPlanes[i] = fleetData._listOfPlanes[minIndex];
      fleetData._listOfPlanes[minIndex] = temp;
    }
  }
  return fleetData._listOfPlanes;
}

// Define displaySortedFleet function displays the fleet information depending
// on what the user wants to sort it by
function displaySortedFleet() {
  // Obtain user chosen category to sort by
  let sortOption = document.getElementById("sortBy").value;
  // Retrieve fleet list from "FLEET_KEY"
  let list = JSON.parse(localStorage.getItem(FLEET_KEY))._listOfPlanes;
  let output = "";

  // Check which selection option has been selected by user
  // NOTE: selection options are defined in HTML page
  if (sortOption === "sortByAirline") {
    list.sort(compareAirline);
  }
  else if (sortOption === "sortByLocation") {
    list.sort(compareLocation);
  }
  else if (sortOption === "sortByType") {
    list.sort(compareType);
  }
  else if (sortOption === "sortByStatus") {
    list.sort(compareStatus);
  }
  else if (sortOption === "sortByRange") {
    list = sortRange(fleetData);
  }
  else if (sortOption === "sortBySpeed") {
    list = sortSpeed(fleetData);
  }
  // displays sorted list by ID for default (no else if required)
  else {
    list.sort(compareID);
  }

  // Print plane information to table
  for (let i = 0; i < list.length; i++) {
    let plane = list[i];
    output += `<tr>
      <td>${plane._id}</td>
      <td class="mdl-data-table__cell--non-numeric">${plane._registration}</td>
      <td class="mdl-data-table__cell--non-numeric">${plane._location}</td>
      <td>${plane._range}</td>
      <td>${plane._avgSpeed}</td>
      <td class="mdl-data-table__cell--non-numeric">${plane._type}</td>
      <td class="mdl-data-table__cell--non-numeric">${plane._status}</td>
      <td class="mdl-data-table__cell--non-numeric">${plane._airline}</td>
    </tr>`;
  }
  tableContentRef.innerHTML = output;
}


// CODE RUNS ON LOAD //

// Retrieve data stored at "FLEET_KEY"
fleetData = JSON.parse(localStorage.getItem(FLEET_KEY));
let tableContentRef = document.getElementById("tableContent");
// Display appropriate message if there is no fleet data available
if (fleetData === null || fleetData === undefined) {
  let fleetListRef = document.getElementById("fleetList");
  let output = "<h4>Fleet information could not be retrieved at this moment. "
  output += "Please try again later</h4>";
  fleetListRef.innerHTML = output;
}
else {
  displaySortedFleet();
}
// Add event listener for when user changes sort by option
let sortByRef = document.getElementById("sortBy");
sortByRef.addEventListener("change",displaySortedFleet);
