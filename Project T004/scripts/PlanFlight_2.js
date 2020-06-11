/**
 * PlanFlight_2.js
 * This file contains code that runs on load for PlanFlight_2.html
 */


// GENERAL FUNCTIONS //

// Define haversineDistance to calculate distance b/w two points in meters
function haversineDistance([lng1,lat1],[lng2,lat2]) {
  const R = 6371e3; // in metres

  let phi1 = lat1 * Math.PI/180; // φ, λ in radians
  let phi2 = lat2 * Math.PI/180;
  let deltaPhi = (lat2-lat1) * Math.PI/180;
  let deltaLambda = (lng2-lng1) * Math.PI/180;

  let a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
          Math.cos(phi1) * Math.cos(phi2) *
          Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);

  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  let distance = R * c; // in metres

  return distance;
}

// Define searchAirport function to search for specific airport
function searchAirport() {
  let country = document.getElementById("countrySearch").value;
  let city = document.getElementById("citySearch").value;
  let airport = document.getElementById("airportSearch").value;

  // check if user has entered country,city and airport
  if (country === "" || city === "" || airport === "") {
    // alert user
    let output = "Please enter more information for search.";
    return alert(output);
  }

  let url = "https://eng1003.monash/api/v1/airports/";
  // define parameters for API
  let data = {
    country: country,
    city: city,
    name: airport,
    callback: "panToSearchedAirport"
  };
  // call to API
  webServiceRequest(url,data);
}

// Define finalStep function to store all user entered info in localStorage
function finalStep() {
  // Check to see if user has selected points and plane
  if (selectedPoints == null || selectedPlane == null) {
    // alert user
    return alert("Please enter more information before continuing!");
  }

  let progressRef = document.getElementById("p1");
  let stepRef = document.getElementById("step");
  // change progress bar status to loading
  progressRef.className = "mdl-progress mdl-js-progress mdl-progress__indeterminate";
  stepRef.innerHTML = "LOADING";

  // define conversion factors
  const KNOT_TO_KMH_FACTOR = 1.852;
  const M_TO_KM_FACTOR = 1/1000;

  // remove zeroeth elemnt of selectedPoints (contains airport coords)
  selectedPoints.shift();
  // convert avg to km/h for calculation
  let kmhSpeed = KNOT_TO_KMH_FACTOR*selectedPlane._avgSpeed;
  let totalDistance = JSON.parse(localStorage.getItem(TOTAL_DISTANCE_KEY));
  // convert distance from m to km
  totalDistance = M_TO_KM_FACTOR*totalDistance; // km
  let totalTime = totalDistance/kmhSpeed; // hrs

  // store user entered data in localStorage
  localStorage.setItem(TOTAL_DISTANCE_KEY,JSON.stringify(totalDistance));
  localStorage.setItem(SELECTED_POINTS_KEY,JSON.stringify(selectedPoints));
  localStorage.setItem(SELECTED_PLANE_KEY,JSON.stringify(selectedPlane));
  localStorage.setItem(TOTAL_TIME_KEY,JSON.stringify(totalTime));

  // get coordinates of destination
  let lng = selectedPoints[selectedPoints.length-1][0];
  let lat = selectedPoints[selectedPoints.length-1][1];
  // get destination weather
  getDestinationWeather(totalTime,[lng,lat]);
  // setTimeout so API can be called before redirecting user
  setTimeout(function() {
    location.assign(CONFIRM);
  }, 1500);
}


// MAPBOX API FUNCTIONS //

// define panToSearchedAirport to show searched airport
function panToSearchedAirport(data) {
  // check if airport was found
  if (data.length === 0) {
    // alert user
    let output = "Airport could not be found. Please check spelling.";
    return alert(output);
  }

  // print marker/popup for every airport found
  for (let i = 0; i < data.length; i++) {
    let airport = data[i];
    // define airport coordinate
    let coordinate = [airport.longitude,airport.latitude];
    // create new marker instance
    let marker = new mapboxgl.Marker({ "color": "#808080" }); // gray marker
    // set coordinate of marker
    marker.setLngLat(coordinate);
    // create new popup instance
    let popup = new mapboxgl.Popup({ offset: 45});
    // information to be displayed on popup (includes button to select airport)
    let output = `<h5>${airport.name}</h5><br>`
    output += `<button class="mdl-button mdl-js-button mdl-button--raised
    mdl-js-ripple-effect mdl-button--accent"
    onClick="selectAirport(${airport.longitude},${airport.latitude})"
    id="${airport.longitude},${airport.latitude}" value="${airport.name}">
    SELECT AIRPORT</button>`;
    popup.setHTML(output);
    // set popup to specific marker
    marker.setPopup(popup)
    // add marker to map (popup not added to increase
    // performance and not overwhelm usr)
    marker.addTo(map);
  }
  // show user first airport that was found (in case there are more than one)
  let coordinate = [data[0].longitude,data[0].latitude];
  map.setCenter(coordinate);
  // set appropriate zoom level
  map.setZoom(8);
}

// define global variable for array of plotted airports
let plottedAirports = [];

// define plotAirports function to plot all planes within range
function plotAirports(data) {
  for (let i = 0; i < data.length; i++) {
    let airport = data[i];
    let coordinate = [airport.longitude,airport.latitude];
    // call checkValidCoordinate function to see if coordinate
    // has already been plotted
    let coordinateCheck = checkValidCoordinate(coordinate);
    // check coordinate is valid
    if (coordinateCheck === true) {
      // check if coordinate is airport coordinate
      if (coordinate[0]!=airportCoords[0] || coordinate[1]!=airportCoords[1]) {
        // check if coordinate is plane coordinate
        if (coordinate[0]!=planeCoord[0] || coordinate[1]!=planeCoord[1]) {
          // add coordinate to array of plotted airports
          plottedAirports.push(coordinate);
          // create marker instance
          let marker = new mapboxgl.Marker({ "color": "#3cba54" }); // green marker
          // set coordinate of marker
          marker.setLngLat(coordinate);
          // create new popup instance
          let popup = new mapboxgl.Popup({ offset: 45});
          // define html code (include button to select destinatin)
          let output = `<h5>${airport.name}</h5><br>`
          output += `<button class="mdl-button mdl-js-button mdl-button--raised
          mdl-js-ripple-effect mdl-button--accent"
          onClick="selectAirport(${airport.longitude},${airport.latitude})"
          id="${airport.longitude},${airport.latitude}" value="${airport.name}">
          SELECT AIRPORT</button>`;
          popup.setHTML(output);
          // assign popup to marker
          marker.setPopup(popup)
          // add marker to map (NOTE: popup not added to prevent overcrowding)
          marker.addTo(map);
        }
      }
    }
  }
}

// Define checkValidCoordinate function to check if coordinat has been plotted
function checkValidCoordinate(coordinate) {
  for (let i = 0; i < plottedAirports.length; i++) {
    // return false if airport has been plotted
    if (coordinate[0]==plottedAirports[i][0] &&
      coordinate[1]==plottedAirports[i][1]) {
      return false;
    }
  }

  for (let i = 0; i < selectedPoints.length; i++) {
    // return false if coordinate has been selected
    if (coordinate[0]==selectedPoints[i][0] &&
      coordinate[1]==selectedPoints[i][1]) {
      return false;
    }
  }
  // return true if coordinate is valid
  return true;
}

// define selectAirport function for when user selects destination
function selectAirport(lng,lat) {
  // check if coordinate is valid
  let validCoordinate = checkValidCoordinate([lng,lat]);
  // if coordinate is valid, it means it has not been plotted
  if (validCoordinate === true) {
    // alert user that plane is not within range
    let output = `Destination is not within range.
    Please select other destinations first.`;
    return alert(output);
  }

  let buttonRef = document.getElementById(`${lng},${lat}`);
  let airportName = buttonRef.value;
  let selectedPoint = [lng,lat,airportName];
  // store selected airport in global variable
  selectedPoints.push(selectedPoint);

  // calculate distance b/w last point and current point
  let lng1 = Number(selectedPoints[selectedPoints.length-2][0]);
  let lat1 = Number(selectedPoints[selectedPoints.length-2][1]);
  let distance = haversineDistance([lng1,lat1],[lng,lat]);

  // retrieve total distance stored at "TOTAL_DISTANCE_KEY"
  let totalDistance = JSON.parse(localStorage.getItem(TOTAL_DISTANCE_KEY));
  totalDistance += distance;
  // update local storage with new distance
  localStorage.setItem(TOTAL_DISTANCE_KEY,JSON.stringify(totalDistance));

  // remove map layers
  removeLayerWithId("circle");
  removeLayerWithId("routes"); // clearly previous polyine

  // define mapbox source for feature
  let object = {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: selectedPoints
      }
    }
  };
  // add polyline as layer with id "routes"
  map.addLayer({
    id: "routes",
    type: "line",
    source: object,
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#4285F4", "line-width": 6 }
  });

  // show markers for selected points
  for (let i = 1; i < selectedPoints.length-1; i++) {
    let marker = new mapboxgl.Marker({ "color": "#ffa500" }); // orange marker
    marker.setLngLat(selectedPoints[i]);
    marker.addTo(map);
  }

  // show marker for last selected point
  let marker = new mapboxgl.Marker({ "color": "#db3236" }); // red marker
  marker.setLngLat(selectedPoints[selectedPoints.length-1]);
  marker.addTo(map);

  let url = "https://eng1003.monash/api/v1/airports/";
  // define API parameters
  let data = {
    lat: lat,
    lng: lng,
    range: selectedPlane._range,
    callback: "plotAirports"
  };
  // call to API
  webServiceRequest(url,data);
}

// Define removeLayerWithId to remove mapbox layer with specific ID
function removeLayerWithId(idToRemove) {
  let hasPoly = map.getLayer(idToRemove)

  if (hasPoly !== undefined) {
    map.removeLayer(idToRemove)
    map.removeSource(idToRemove)
  }
}

// define panToCurrent to show user's current location
function panToCurrent() {
  // check if browser supports geolocaiton
  if('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(positionCallback); // callback
  }
  else {
    alert("Geolocation is not supported by the browser.");
  }
}

// define positionCallback function to display user current location as
// marker on map
function positionCallback(position) {
  let lat = position.coords.latitude;
  let lng = position.coords.longitude;

  // create new marker instance
  let marker = new mapboxgl.Marker({ "color": "#B64FFA" }); // purple marker
  // set marker coordinate
  marker.setLngLat([lng,lat]);
  // create new popup instance
  let popup = new mapboxgl.Popup({ offset: 45});
  popup.setHTML("<h5>Current location</h5>");
  marker.setPopup(popup)
  // add marker and popup to map
  marker.addTo(map);
  popup.addTo(map);

  map.setCenter([lng,lat]);
  // set appropriate zoom level
  map.setZoom(12);
}

// define panToAirport function to show airport on map
function panToAirport() {
  map.setCenter(airportCoords);
  // show appropriate zoom level
  map.setZoom(12);
}

// define showPath function to show polyine layer
function showPath() {
  // remove map layer
  removeLayerWithId("circle");

  // define source for Feature (selectedPoints)
  let object = {
    type: "geojson",
    data: {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: selectedPoints
      }
    }
  };
  // add map layer for polyine
  map.addLayer({
    id: "routes",
    type: "line",
    source: object,
    layout: { "line-join": "round", "line-cap": "round" },
    paint: { "line-color": "#4285F4", "line-width": 6 }
  });

  // if selected plane is not at airport display polyline
  if (airportCoords[0] != planeCoord[0] || airportCoords[1] != planeCoord[1]) {
    // remove previous defined polyine for plane to airport polyline
    removeLayerWithId("planeRoute");
    // define source for feature
    let object = {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [airportCoords,planeCoord]
        }
      }
    };
    // add polyine as map layer
    map.addLayer({
      id: "planeRoute",
      type: "line",
      source: object,
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "#4285F4", "line-width": 6 }
    });
  }
}

// define showCircle function to display circle at last selected point
function showCircle() {
  // remove map layers
  removeLayerWithId("routes");
  removeLayerWithId("planeRoute");

  // add source for circle feature
  map.addSource('circle', {
    "type": "geojson",
    "data": {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        // centered at last selected point
        "coordinates": [selectedPoints[selectedPoints.length-1][0],
        selectedPoints[selectedPoints.length-1][1]]
      },
      "properties": {}
    }
  });
  // add circle as map layer
  map.addLayer({
    id: 'circle',
    type: 'circle',
    source: 'circle',
    paint: {
      'circle-color': '#00b7bf',
      'circle-radius': 500,
      'circle-opacity': 0.2,
      'circle-stroke-width': 1,
      'circle-stroke-color': '#333',
    },
  });
}


// WEATHER API FUNCTIONS //

// define getDestinationWeather function
function getDestinationWeather(tripTime,[lng,lat]) {
  // define conversion factors
  const HR_TO_S_FACTOR = 3600;
  const MS_TO_S_FACTOR = 1/1000;

  // retrieve user entered date
  let dateRef = JSON.parse(localStorage.getItem(SELECTED_TIME_KEY));
  // convert date to date object
  let unixTime = new Date(dateRef);
  // convert user entered date to seconds (API requires seconds)
  unixTime = unixTime.getTime()*MS_TO_S_FACTOR;
  // add on trip time to calculate final time
  // time is rounded since API doesnt support decimals
  unixTime += Math.round(tripTime*HR_TO_S_FACTOR);

  let url = "https://eng1003.monash/api/v1/darksky/";
  // define API parameters
  let data = {
    u: USERNAME,
    key: DARKSKY_KEY,
    lat: lat,
    lng: lng,
    time: unixTime,
    units: "si",
    callback: "storeWeather"
  }
  // call to API
  webServiceRequest(url,data);
}

// define storeWeather function to store destination weather in localStorage
function storeWeather(data) {
  let summary = data.currently.summary;
  // check if weather data available
  if (data === undefined || summary === undefined) {
    let output = `Weather data could not be retrieved right now.
    \n\nPlease try again later.`;
    // alert user if no weather
    return alert(output);
  }
  // store destination weather in localStorage
  localStorage.setItem(DESTINATION_WEATHER_KEY,JSON.stringify(data));
}


// CODE RUNS ON LOAD //

// Progress bar to enrich user experience
// define progress to be 100%
const PROGRESS_2 = 100;
// define progress of progress bar
document.querySelector('#p1').addEventListener('mdl-componentupgraded', function() {
  this.MaterialProgress.setProgress(PROGRESS_2);
});

// Determine 5 closest planes
// Retrieve user entered time, country, airport + fleet
let selectedTime = JSON.parse(localStorage.getItem(SELECTED_TIME_KEY));
let selectedCountry = JSON.parse(localStorage.getItem(SELECTED_COUNTRY_KEY));
let selectedAirport = JSON.parse(localStorage.getItem(SELECTED_AIRPORT_KEY));
fleetData = JSON.parse(localStorage.getItem(FLEET_KEY));

// check that user entered data and fleet is available
if (selectedTime !== null && selectedCountry !== null
  && selectedAirport !== null && fleetData !== null) {
    // retrieve plane coordinates of fleet
    let planeCoordinates = JSON.parse(localStorage.getItem(PLANE_COORD_KEY));
    let distances = [], nearestPlanes = [];
    const NUM_OF_PLANES = 5;

    // calculates distance between selected airport and fleet
    for (let i = 0; i < fleetData._listOfPlanes.length; i++) {
      let lng1 = Number(selectedAirport[0]);
      let lat1 = Number(selectedAirport[1]);
      let lng2 = Number(planeCoordinates[i].longitude);
      let lat2 = Number(planeCoordinates[i].latitude);
      // call haversineDistance function
      let distance = haversineDistance([lng1,lat1],[lng2,lat2]);
      distances.push(distance);
    }

    // implement sort algorithm to sort from nearest to furthest planes
    for (let i = 0; i < distances.length; i++) {
      // assume current index is min value
      let minIndex = i;
      // loop through all values after index
      for (let j = i + 1; j < distances.length; j++) {
        // if item after current value is smaller, define new minIndex
        if (distances[j] < distances[minIndex]) {
          minIndex = j;
        }
      }

      // if minIndex changed, swap items
      if (minIndex !== i ) {
        let temp = fleetData._listOfPlanes[i];
        fleetData._listOfPlanes[i] = fleetData._listOfPlanes[minIndex];
        fleetData._listOfPlanes[minIndex] = temp;
      }
    }
    // push nearest planes to array
    for (let i = 0; i < fleetData._listOfPlanes.length; i++) {
      // check that plane is available
      if (fleetData._listOfPlanes[i]._status === "available") {
        // limit to five planes
        if (nearestPlanes.length < NUM_OF_PLANES) {
          nearestPlanes.push(fleetData._listOfPlanes[i]);
        }
        // break if 5 planes have been found
        else {
          break;
        }
      }
    }

    // Display nearest planes on HTML page
    let planeRef = document.getElementById("planeList");
    let output = "";

    for (let i = 0; i < nearestPlanes.length; i++) {
      // define plane attributes to be printed
      let plane = fleetData._listOfPlanes[i];
      let id = plane._id;
      let registration = plane._registration;
      let location = plane._location;
      let range = plane._range;
      let avgSpeed = plane._avgSpeed;
      let type = plane._type;
      let airline = plane._airline;
      // define plane as radio buttons for users to selected
      // includes onClick for showNearestAirports function
      output += `<label class="mdl-radio mdl-js-radio mdl-js-ripple-effect"
      for="plane${i+1}"><input type="radio" id="plane${i+1}"
      class="mdl-radio__button" name="planes" value="${id-1}"
      onClick="showNearestAirports()"><span class="mdl-radio__label
      optionHeading">PLANE ${i+1}</span><br><span align="left">Registration:
      ${registration} / Location: ${location} / Range: ${range} kilometers /
      Average Speed: ${avgSpeed} knots / Type: ${type} / Airline: ${airline}
      </span></label><br><br><br><br><br>`;
    }
    planeRef.innerHTML = output;
}
else {
  // alert user if there is insufficient info provided
  let output = `An unexpected error occured. Please try booking again.`;
  alert(output);
}


// MAPBOX API //

let airportCoords = [Number(selectedAirport[0]),Number(selectedAirport[1])];
let selectedPoints, selectedPlane, planeCoord;

// initialise map

mapboxgl.accessToken = MAPBOX_TOKEN;
let map = new mapboxgl.Map({
    container: 'map', // DIV ID
    center: airportCoords, // [lng,lat]
    zoom: 3,
    minZoom: 2.5,
    maxZoom: 13,
    style: 'mapbox://styles/mapbox/streets-v9'
  });

// Display airport marker/popup
// create marker instance
let marker = new mapboxgl.Marker({ "color": "#176BEF" }); // blue marker
// set marker coordinate
marker.setLngLat(airportCoords);
// create popup instance
let popup = new mapboxgl.Popup({ offset: 45});
popup.setHTML(`<h5>${selectedAirport[2]}</h5>`);
marker.setPopup(popup)
// add marker and popup to map
marker.addTo(map);
popup.addTo(map);

// define showNearestAirports function
function showNearestAirports() {
  // reset total distance to 0 and store in localStorage
  localStorage.setItem(TOTAL_DISTANCE_KEY,JSON.stringify(0));

  // initialise map again
  map = new mapboxgl.Map({
      container: 'map', // DIV ID
      center: airportCoords, // [lng,lat]
      zoom: 3,
      minZoom: 2.5,
      maxZoom: 13,
      style: 'mapbox://styles/mapbox/streets-v9'
    });

  // Display airport marker/popup
  let marker = new mapboxgl.Marker({ "color": "#176BEF" }); // blue marker
  // set marker coordinate
  marker.setLngLat(airportCoords);
  // create new popup instance
  let popup = new mapboxgl.Popup({ offset: 45});
  popup.setHTML(`<h5>${selectedAirport[2]}</h5>`);
  marker.setPopup(popup)
  // add marker and popup to map
  marker.addTo(map);
  popup.addTo(map);

  // retrieve fleet and plane coordinates
  let planesRef = document.getElementsByName("planes");
  let listOfPlanes = JSON.parse(localStorage.getItem(FLEET_KEY))._listOfPlanes;
  let planeCoordList = JSON.parse(localStorage.getItem(PLANE_COORD_KEY));

  let planeVal;
  // checks to see which option has been selected for the radio button
  for (let i = 0; i < planesRef.length; i++) {
    if (planesRef[i].checked) {
      planeVal = planesRef[i].value;
    }
  }

  // define selected plane, plane coordinates as variables
  selectedPlane = listOfPlanes[planeVal];
  let planeRange = selectedPlane._range;
  planeCoord = [planeCoordList[planeVal].longitude,
  planeCoordList[planeVal].latitude];
  selectedPoints = [];
  // store airport coordinates in selectedPoints to display on map later
  selectedPoints.push(airportCoords);
  // create new marker instance
  let planeMarker = new mapboxgl.Marker({ "color": "#ffa500"}); // orange marker
  // set marker coordinate
  planeMarker.setLngLat(planeCoord);
  // create popup instance
  let planePopup = new mapboxgl.Popup({ offset: 45});
  planePopup.setHTML("<h5>Selected Plane</h5>");
  planeMarker.setPopup(planePopup)
  // add marker and popup to map
  planeMarker.addTo(map);
  planePopup.addTo(map);

  // show polyline between map and selected plane if not same location
  if (airportCoords[0] != planeCoord[0] || airportCoords[1] != planeCoord[1]) {
    // map runs specific function on load
    map.on('load', function() {
      map.addSource('route', {
        'type': 'geojson',
        'data': {
          'type': 'Feature',
          'properties': {},
          'geometry': {
            'type': 'LineString',
            // define coordinates
            'coordinates': [airportCoords,planeCoord]
          }
        }
      });
      // add polyline as map layer with id "planeRoute"
      map.addLayer({
        'id': 'planeRoute',
        'type': 'line',
        'source': 'route',
        'layout': {
          'line-join': 'round',
          'line-cap': 'round'
        },
        'paint': {
          'line-color': '#4285F4',
          'line-width': 6
        }
      });
    });
  }
  let url = "https://eng1003.monash/api/v1/airports/";
  // define API parameters
  let data = {
    lat: planeCoord[1],
    lng: planeCoord[0],
    range: planeRange,
    callback: "plotAirports"
  };
  // call to API to plot airports
  webServiceRequest(url,data);
}
