/**
 * shared.js
 * This file contains code that runs on load for all HTML pages
 */


// DEFINE CONSTANTS //

 // STORAGE KEYS
 const SELECTED_TIME_KEY = "selected-time-data";
 const SELECTED_COUNTRY_KEY = "selected-country-data";
 const SELECTED_AIRPORT_KEY = "selected-airport-data";
 const SELECTED_PLANE_KEY = "selected-plane-data";
 const SELECTED_POINTS_KEY = "selected-points-data";
 const ORIGIN_WEATHER_KEY = "origin-weather-data";
 const DESTINATION_WEATHER_KEY = "destination-weather-data";
 const TOTAL_TIME_KEY = "total-time-data";
 const TOTAL_DISTANCE_KEY = "total-distance-data";
 const PLANE_COORD_KEY = "plane-coord-data";
 const FLEET_KEY = "fleet-data";
 const FLIGHT_LIST_KEY = "flight-list-data";
 const SELECTED_FLIGHT_KEY = "selected-flight-data";

 // API KEYS
 const MAPBOX_TOKEN = "pk.eyJ1IjoiZW5nMTAwMy10ZWFtLTAwNCIsImEiOiJja2FkN29tdTcyMXdyMnFwbWN6MjVmYnZwIn0.Pu6qnDs5PQ7C0ZtXdZkxvQ";
 const DARKSKY_KEY = "c82f634073100cb03b816dcd53ea4fd2";
 const USERNAME = "lpha0024";

 // HTML PATHWAYS
 const PLAN_1 = "PlanFlight_1.html";
 const PLAN_2 = "PlanFlight_2.html";
 const HOME = "HomePage.html";
 const CONFIRM = "ConfirmationPage.html";
 const CONTACT_US = "ContactUs.html";
 const FLEET_INFO = "FleetInformation.html";
 const FLIGHT_INFO = "ViewFlightInformation.html";


// DEFINE CLASSES //

class FlightList {
  constructor() {
    this._flightList = [];
  }

  get flightList() {
    return this._flightList;
  }

  // NO MUTATORS SINCE BOOKFLIGHT AND CANCELFLIGHT METHODS ARE USED

  // creates new Flight instance and stores in flightList private attribute
  bookFlight(flightNum,date,country,airport,plane,originWeather,
    destinationWeather,totalDistance,totalTime,destinations) {
    let flight = new Flight(flightNum,date,country,airport,plane,originWeather,
      destinationWeather,totalDistance,totalTime,destinations);
    this._flightList.push(flight);
  }

  // removes flight at specified index
  cancelFlight(index) {
    this._flightList.splice(index,1);
  }

  // restores data object into class instance
  fromData(dataObject) {
    let data = dataObject._flightList;
    this._flightList = [];
    for (let i = 0; i < data.length; i++) {
      let flight = new Flight();
      flight.fromData(data[i]);
      this._flightList.push(flight);
    }
  }
}

class Flight {
  constructor(flightNum="",date="",country="",airport="",plane="",originWeather="",
    destinationWeather="",totalDistance="",totalTime="",destinations = []) {
    this._flightNumber = flightNum;
    this._date = date;
    this._country = country;
    this._airport = airport;
    // store plane as Plane instance
    let planeInstance = new Plane();
    planeInstance.fromData(plane);
    this._plane = planeInstance;
    // weather data is raw data from API
    this._originWeather = originWeather;
    this._destinationWeather = destinationWeather;
    this._totalDistance = totalDistance;
    this._totalTime = totalTime;
    this._destinations = destinations;
  }

  get fightNumber() {
    return this._flightNumber;
  }
  get date() {
    return this._date;
  }
  get country() {
    return this._country;
  }
  get airport() {
    return this._airport;
  }
  get plane() {
    return this._plane;
  }
  get originWeather() {
    return this._originWeather;
  }
  get destinationWeather() {
    return this._destinationWeather;
  }
  get totalDistance() {
    return this._totalDistance;
  }
  get totalTime() {
    return this._totalTime;
  }
  get destinations() {
    return this._destinations;
  }

  // NOTE: no mutators are allowed. Users are not able to modify booked flights.
  // Users should cancel or book a new flight.

  // restores data object into class instance
  fromData(dataObject) {
    // store plane as Plane class instance
    let plane = new Plane();
    plane.fromData(dataObject._plane);
    this._flightNumber = dataObject._flightNumber;
    // store date as Date object instance
    this._date = new Date(dataObject._date);
    this._country = dataObject._country;
    this._airport = dataObject._airport;
    this._plane = plane;
    this._originWeather = dataObject._originWeather;
    this._destinationWeather = dataObject._destinationWeather;
    this._totalDistance = dataObject._totalDistance;
    this._totalTime = dataObject._totalTime;
    this._destinations = dataObject._destinations;
  }
}

class Plane {
  constructor(id="",registration="",location="",range="",avgSpeed="",type="",
  status="",airline="") {
    this._id = id;
    this._registration = registration;
    this._location = location;
    this._range = range;
    this._avgSpeed = avgSpeed;
    this._type = type;
    this._status = status;
    this._airline = airline;
  }

  get id() {
    return this._id;
  }
  get registration() {
    return this._registration;
  }
  get location() {
    return this._location;
  }
  get range() {
    return this._range;
  }
  get avgSpeed() {
    return this._avgSpeed;
  }
  get type() {
    return this._type;
  }
  get status() {
    return this._status;
  }
  get airline() {
    return this._airline;
  }

  set id(newID) {
    this._id = newID;
  }
  set registration(newRegistration) {
    this._registration = newRegistration;
  }
  set location(newLocation) {
    this._location = newLocation;
  }
  set range(newRange) {
    this._range = newRange;
  }
  set avgSpeed(newSpeed) {
    this._avgSpeed = newSpeed;
  }
  set type(newType) {
    this._type = newType;
  }
  set status(newStatus) {
    this._status = newStatus;
  }
  set airline(newAirline) {
    this._airline = newAirline;
  }

  // restores data object into class instance
  fromData(dataObject) {
    this._id = dataObject._id;
    this._registration = dataObject._registration;
    this._location = dataObject._location;
    this._range = dataObject._range;
    this._avgSpeed = dataObject._avgSpeed;
    this._type = dataObject._type;
    this._status = dataObject._status;
    this._airline = dataObject._airline;
    this._coordinate = dataObject._coordinate;
  }
}

class Fleet {
  constructor() {
    this._listOfPlanes = [];
  }

  get listOfPlanes() {
    return this._listOfPlanes;
  }

  set listOfPlanes(newList) {
    this._listOfPlanes = newList;
  }

  // adds plane to listOfPlanes private attribute
  addPlane(newPlane) {
    if (newPlane instanceof Plane) {
      this._listOfPlanes.push(newPlane);
    }
  }

  // NO METHOD TO DELETE PLANE SINCE USER WOULD OBTAIN NEW INFO FROM API

  // restores data object into class instance
  fromData(dataObject) {
    let data = dataObject._listOfPlanes;
    this._listOfPlanes = [];
    for (let i = 0; i < data.length; i++) {
      let plane = new Plane();
      plane.fromData(data[i]);
      this._listOfPlanes.push(plane);
    }
  }
}



// GENERAL FUNCTIONS //

// CANCELLATION OUTPUT
const CANCEL = `Are you sure you want to cancel/leave?
\n\nAny unsaved data will be deleted.`;

// define getFileName function to retrieve users current page
function getFileName() {
  // gets current URL and splits where there is a "/" and store as array
  let currentURL = window.location.pathname.split('/');
  // last item of currentURL array is file name
  let fileName = currentURL[currentURL.length-1];
  return fileName;
}

// define openHomePage function to redirect user to home page
function openHomePage() {
  let fileName = getFileName();
  // checks if current page is "PlanFlight_1.html", "PlanFlight_2.html"
  // or "ConfirmationPage.html"
  if (fileName === PLAN_1 || fileName === PLAN_2 || fileName === CONFIRM) {
    // confirms with user if they want to leave
    let confirmation = confirm(CANCEL);
    if (confirmation === false) {
      return;
    }
  }
  // redirects user to "HomePage.html"
  location.assign(HOME);
}

// define openPlaneFlight function to redirect user to plan flight page 1
function openPlanFlight() {
  let fileName = getFileName();
  // checks if current page is "PlanFlight_1.html", "PlanFlight_2.html"
  // or "ConfirmationPage.html"
  if (fileName === PLAN_1 || fileName === PLAN_2 || fileName === CONFIRM) {
    // confirms with user if they want to leave
    let confirmation = confirm(CANCEL);
    if (confirmation === false) {
      return;
    }
  }
  // redirects user to "PlanFlight_1.html"
  location.assign(PLAN_1);
}

// define openFleetInfo function to redirect user to fleet information page
function openFleetInfo() {
  let fileName = getFileName();
  // checks if current page is "PlanFlight_1.html", "PlanFlight_2.html"
  // or "ConfirmationPage.html"
  if (fileName === PLAN_1 || fileName === PLAN_2 || fileName === CONFIRM) {
    // confirms with user if they want to leave
    let confirmation = confirm(CANCEL);
    if (confirmation === false) {
      return;
    }
  }
  // redirects user to "FleetInformation.html"
  location.assign(FLEET_INFO);
}

// define openContactUs function to redirect user to contact us page
function openContactUs() {
  let fileName = getFileName();
  // checks if current page is "PlanFlight_1.html", "PlanFlight_2.html"
  // or "ConfirmationPage.html"
  if (fileName === PLAN_1 || fileName === PLAN_2 || fileName === CONFIRM) {
    // confirms with user if they want to leave
    let confirmation = confirm(CANCEL);
    if (confirmation === false) {
      return;
    }
  }
  // redirects user to "ContactUs.html"
  location.assign(CONTACT_US);
}

// define cancelBooking function to redirect user to home page
function cancelBooking() {
  // confirms with user if they want to leave
  let confirmation = confirm(CANCEL);

  if (confirmation === true) {
    // remove all the user inputed information
    localStorage.removeItem(SELECTED_TIME_KEY);
    localStorage.removeItem(SELECTED_COUNTRY_KEY);
    localStorage.removeItem(SELECTED_AIRPORT_KEY);
    localStorage.removeItem(SELECTED_PLANE_KEY);
    localStorage.removeItem(ORIGIN_WEATHER_KEY);
    localStorage.removeItem(DESTINATION_WEATHER_KEY);
    // redirects user to "HomePage.html"
    location.assign(HOME);
  }
}

// define webServiceRequest function to call API
function webServiceRequest(url,data) {
// Build URL parameters from data object.
   let params = "";
   // For each key in data object...
   for (let key in data) {
     // check if "data" has a property defined by "key"
       if (data.hasOwnProperty(key)) {
           if (params.length == 0) {
               // First parameter starts with '?'
               params += "?";
           }
           else {
               // Subsequent parameter separated by '&'
               params += "&";
           }
           // encode string
           let encodedKey = encodeURIComponent(key);
           let encodedValue = encodeURIComponent(data[key]);

           params += encodedKey + "=" + encodedValue;
        }
   }
   let script = document.createElement('script');
   script.src = url + params;
   document.body.appendChild(script);
}


// PLANES API //

// define storePlanes function to store fleet info in localStorage
function storePlanes(data) {
  // create new instance of Fleet class
  let newFleet = new Fleet();
  for (let i = 0; i < data.airplanes.length; i++) {
    // create variable for plane properties
    let plane = data.airplanes[i];
    let id = plane.id;
    let registration = plane.registration;
    let location = plane.location;
    let range = plane.range;
    let avgSpeed = plane.avgSpeed;
    let type = plane.type;
    let status = plane.status;
    let airline = plane.airline;
    // create new Plane instance
    let newPlane = new Plane(id,registration,location,range,
      avgSpeed,type,status,airline);
    // call addPlane method to add plane to Fleet class
    newFleet.addPlane(newPlane);
  }
  // store newFleet at "FLEET_KEY"
  localStorage.setItem(FLEET_KEY,JSON.stringify(newFleet));
  searchAirportCode();
}


// AIRPORT API

// define searchAirportCode function to call airport API and find plane coords
function searchAirportCode() {
  // retrieve fleet data from localStorage at "FLEET_KEY"
  let fleetData = JSON.parse(localStorage.getItem(FLEET_KEY));
  let url = "https://eng1003.monash/api/v1/airports/";
  for (let i = 0; i < fleetData._listOfPlanes.length; i++) {
    // define API parameters
    let data = {
      callback: `airportCodeToCoord(${i})`,
      code: fleetData._listOfPlanes[i]._location
    };
    // call to API
    webServiceRequest(url,data);
  }
}

// setTimeot to avoid overloading API
setTimeout(airportCodeToCoord,3000);

// define airportCodeToCoord function to store plane coords in localStorage
function airportCodeToCoord(index) {
  // API callback functions need separate function to push to global variables
  return function (data) {
    // retrieve data stored at "PLANE_COORD_KEY"
    let planeCoordData = JSON.parse(localStorage.getItem(PLANE_COORD_KEY));
    // define API coordinates
    let coordinate = {
         longitude: data.longitude,
         latitude: data.latitude
       };
    // add plane coordinate at specified index
    planeCoordData[index] = coordinate;
    // store plane coords in localStorage
    localStorage.setItem(PLANE_COORD_KEY,JSON.stringify(planeCoordData));
  }
}


// CODE RUNS ON LOAD //

// Checks that localStorage is supported by browser
if (typeof(Storage) === "undefined") {
	alert("localStorage is not supported by current browser.");
}

// Planes API

// retrieve fleet data at "FLEET_KEY"
let fleetData = JSON.parse(localStorage.getItem(FLEET_KEY));
let planeCoordList = [];

// checks if fleet data has already been retrieved
if (fleetData === null) {
  let url = "https://eng1003.monash/api/v1/planes/";
  // define API parameters
  let data = {
    callback: "storePlanes"
  };
  // intialise empty array at "PLANE_COORD_KEY"
  localStorage.setItem(PLANE_COORD_KEY,JSON.stringify([]));
  // call to API
  webServiceRequest(url,data);
}
