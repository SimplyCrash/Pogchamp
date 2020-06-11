/**
 * HomePage.js
 * This file contains code that runs on load for HomePage.html
 */


// GENERAL FUNCTIONS //

// Define scheduleFlight function to redirect user to "PlanFlight_1.html"
function scheduleFlight() {
  location.assign(PLAN_1);
}

// Define sortFlights function to sort flights based on if the flight is:
// scheduled, enroute or historical
function sortFlights() {
  // Restore data to class instance
  flightList.fromData(flightData);
  allFlights = flightList.flightList;
  enrouteFlights = [], historicalFlights = [], scheduledFlights = [];

  for (let i = 0; i < allFlights.length; i++) {
    // define conversion factor
    const HR_TO_MS_FACTOR = 3.6e6;
    let flight = allFlights[i];
    // get current time in unix
    let currentTime = new Date();
    currentTime = currentTime.getTime();
    // get departure time in unix
    let departureTime = new Date(flight.date);
    departureTime = departureTime.getTime();
    // get arrival time in unix
    let tripTime = flight._totalTime * HR_TO_MS_FACTOR;
    let arrivalTime = new Date(departureTime + tripTime);
    arrivalTime = arrivalTime.getTime();

    // determine appropriate to push specific flight using if statements
    if (departureTime <= currentTime) {
      if (currentTime <= arrivalTime) {
        enrouteFlights.push(flight);
      }
      else {
        historicalFlights.push(flight);
      }
    }
    else {
      scheduledFlights.push(flight);
    }
  }
  displaySortedFlight();
}

// Define displaySortedFleet function to display sorted fleet information on
// table
function displaySortedFlight() {
  let tableContentRef = document.getElementById("tableContent");
  let viewOption = document.getElementById("viewBy").value;
  let output = "", list;

  // Check to see which option to sort by
  if (viewOption === "viewEnroute") {
    list = enrouteFlights;
  }
  else if (viewOption === "viewScheduled") {
    list = scheduledFlights;
  }
  else if (viewOption === "viewHistorical") {
    list = historicalFlights;
  }
  else {
    list = allFlights;
  }

  // Print flight information to table based on user selected category
  for (let i = 0; i < list.length; i++) {
    let flight = list[i];
    // Create Date object for flight date
    let selectedDate = new Date(flight.date);
    // define date string to print
    let date = selectedDate.toLocaleDateString(undefined,{ year: 'numeric',
    month: 'long', day: 'numeric' });
    // define time string to print
    let time = selectedDate.toLocaleTimeString();

    output += `<tr>
      <td style="color:blue;text-decoration: underline;"
      onClick="viewFlightInfo(${flight._flightNumber-1})">
      ${flight._flightNumber}</td>
      <td class="mdl-data-table__cell--non-numeric">${date}</td>
      <td>${time}</td>
      <td class="mdl-data-table__cell--non-numeric">${flight.country}</td>
      <td>${flight._destinations[flight._destinations.length-1][2]}</td>
    </tr>`;
  }
  tableContentRef.innerHTML = output;
}

// Define viewFLightInfo function to store flight index in flightList
// to localStorage and redirect user to "ViewFlightInformation.html"
function viewFlightInfo(index) {
  let flight = allFlights[index];
  localStorage.setItem(SELECTED_FLIGHT_KEY,JSON.stringify(flight));
  location.assign(FLIGHT_INFO);
}


// CODE RUNS ON LOAD //

// Initialise global variables
let allFlights = [], enrouteFlights = [];
let historicalFlights = [], scheduledFlights = [];
let flightList = new FlightList();

// Retrieve data at "FLIGHT_LIST_KEY"
let flightData = JSON.parse(localStorage.getItem(FLIGHT_LIST_KEY));

// Display appropriate message if there are no booked flights
if (flightData === null || flightData._flightList.length == 0) {
  let flightSummaryRef = document.getElementById("flightSummary");
  let output = `<h4>There are currently no scheduled flights. Please click the
  "SCHEDULE NEW FLIGHT" button down below to book a new flight.</h4>
  <img src="images/airplane.jpg" width="450px" height="400px">`;
  flightSummaryRef.innerHTML = output;
}
else {
  // Continually run sortFlights function to ensure that the table is showing
  // accurate information
  setInterval(sortFlights,500);
}

// Define event listener for when view by option is changed
let viewByRef = document.getElementById("viewBy");
viewByRef.addEventListener("change",displaySortedFlight);
