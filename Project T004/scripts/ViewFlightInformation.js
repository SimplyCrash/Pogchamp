/**
 * ViewFlightInformation.js
 * This file contains code that runs on load for ViewFlightInformation.html
 */


 // GENERAL FUNCTIONS //

// Define returnHome function to redirect user to home screen
function returnHome() {
  localStorage.removeItem(SELECTED_FLIGHT_KEY);
  location.assign(HOME);
}

// define cancelFlight function
function cancelFlight() {
  // retrive data at "FLIGHT_LIST_KEY"
  let flightListData = JSON.parse(localStorage.getItem(FLIGHT_LIST_KEY));
  // create new instance of FlightList
  let flightList = new FlightList();
  // restore dataObject to class instance
  flightList.fromData(flightListData);
  // retrieve data at "SELECTED_FLIGHT_KEY"
  let flight = JSON.parse(localStorage.getItem(SELECTED_FLIGHT_KEY));
  let flightIndex = flight._flightNumber - 1;
  // call cancelFlight method in FlightList class
  flightList.cancelFlight(flightIndex);
  // updated "FLIGHT_LIST_KEY" with updated flight list
  localStorage.setItem(FLIGHT_LIST_KEY,JSON.stringify(flightList));
  // alert user when flight has been successfully cancelled
  let output = "This flight has been cancelled. Thank you.";
  alert(output);
  // redirect user to home page
  location.assign(HOME);
}

// define checkTime function to check if flight can be cancelled
function checkTime() {
  // define conversion constant
  const HR_TO_MS_FACTOR = 3.6e6;
  // retrieve selected flight from local storage
  let flight = JSON.parse(localStorage.getItem(SELECTED_FLIGHT_KEY));
  // get unixTime of current time
  let currentTime = new Date();
  currentTime = currentTime.getTime();
  // get unixTime of departure date
  let departureTime = new Date(flight._date);
  departureTime = departureTime.getTime();
  // get unixTime of arrival time
  let tripTime = flight._totalTime * HR_TO_MS_FACTOR;
  let arrivalTime = new Date(departureTime + tripTime);
  arrivalTime = arrivalTime.getTime();

  let button;
  // check if fight is enroute, scheduled or historical to determine if
  // button should be disabled or not
  if (departureTime <= currentTime) {
    if (currentTime <= arrivalTime) {
      button = "disabled";
    }
    else {
      button = "disabled";
    }
  }
  else {
    button = "";
  }

  // output appropriate button to HTML page
  let buttonRef = document.getElementById("button");
  let output = `<button class="mdl-button
  mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent"
  onClick="cancelFlight()" ${button}>
    CANCEL FLIGHT
  </button>`;
  buttonRef.innerHTML = output;
}

// MAPBOX API FUNCTIONS //

// Define panToSelectedPoint function
function panToSelectedPoint() {
  // Define selected destination from select element
  let destinationRef = document.getElementById("destinations");
  // Split value since value of destinationRef is stored in format: lng/lat/name
  let destination = destinationRef.value.split('/');
  // Define variable for coordinate
  let coordinate = [destination[0],destination[1]];
  // Brings user to specific point
  map.setCenter(coordinate);
  // Set appropriate zoom level
  map.setZoom(13);
}

// Define resetView function
function resetView() {
  // Resets user's view to airportCoords
  map.setCenter(airportCoords);
  // Set appropriate zoom level
  map.setZoom(3);
}


// CODE RUNS ON LOAD //

// setInterval to constantly check time of flight so user cannot cancel
// if it becomes an enroute or historical flight
setInterval(checkTime,500);

// define conversion factors
const HR_TO_MS_FACTOR = 3.6e6;
const MS_TO_HR_FACTOR = 2.8e-7;

// define flight attributes
let flight = JSON.parse(localStorage.getItem(SELECTED_FLIGHT_KEY));
let selectedAirport = flight._airport;
let selectedCountry = flight._country;
let selectedPlane = flight._plane;
let originWeather = flight._originWeather;
let destinationWeather = flight._destinationWeather;
let selectedDate = flight._date;
// convert selectedDate to Date object
selectedDate = new Date(selectedDate);
let selectedTime = selectedDate.getTime();
let selectedPoints = flight._destinations;
let totalTime = flight._totalTime;
// convert totalTime from hr to ms
totalTime = totalTime*HR_TO_MS_FACTOR;
let totalDistance = flight._totalDistance; //units: km
let airportCoords = [selectedAirport[0],selectedAirport[1],selectedAirport[2]];
// format: lng,lat,name

// create allPoints variable to include airport (for polyine)
// store selectedPoints in temp variable
let temp = selectedPoints;
// remove item at zeroeth index
selectedPoints.unshift(selectedAirport);
let allPoints = selectedPoints;
// restore selectedPoints to original state
selectedPoints = temp;

// check if all flight data has been retrieved successfully
if (selectedAirport!=null && selectedCountry!=null && selectedPlane!=null &&
  selectedTime!=null && selectedPoints!=null && totalTime!=null &&
  totalDistance!=null) {
    // Print general booking inforation
    // date is converted to date string to be printed
    // date format: DD (numeric) MMM (word) YYYY (numeric)
    let bookingOutput = `<p>Date: ${selectedDate.toLocaleDateString
      (undefined,{ year: 'numeric',
    month: 'long', day: 'numeric' })}</p>`;
    // time is converted to time string to be printed
    bookingOutput += `<p>Time: ${selectedDate.toLocaleTimeString()}</p>`;
    bookingOutput += `<p>Country of Origin: ${selectedCountry}</p>`;
    bookingOutput += `<p>Origin: ${selectedAirport[2]}</p>`;
    bookingOutput += `<p>Final Destination: ${selectedPoints
      [selectedPoints.length-1][2]}</p>`;
    bookingOutput += `<p>Total trip time: ${(totalTime*MS_TO_HR_FACTOR).
      toFixed(2)} hours</p>`;
    bookingOutput += `<p>Total distance: ${totalDistance.
      toFixed(2)} kilometers</p>`;
    let bookingInfoRef = document.getElementById("bookingInfo");
    bookingInfoRef.innerHTML = bookingOutput;

    // Print destination information as select element
    let destinationRef = document.getElementById("destinationOptions");
    let destinationOutput = `<select class="mdl-textfield__input"
    id="destinations" name="destinations"><option>select an option...</option>`;
    // for origin
    destinationOutput += `<option value="${allPoints[0][0]}/${allPoints[0][1]}/
    ${allPoints[0][2]}">ORIGIN) ${allPoints[0][2]}</option>`;
    // allPoints format: lng,lat,name
    // for loop start at 1 and end at length-1 to exclude start and end point
    for (let i = 1; i < allPoints.length-1; i++) {
      let point = allPoints[i];
      destinationOutput += `<option value="${point[0]}/${point[1]}/
      ${point[2]}">${i}) ${point[2]}</option>`;
      // point format: lng,lat,name
    }
    destinationOutput += `<option value="${allPoints[allPoints.length-1][0]}
    /${allPoints[allPoints.length-1][1]}/
    ${allPoints[allPoints.length-1][2]}">FINAL)
    ${allPoints[allPoints.length-1][2]}</option></select>`;
    // allPoints format: lng,lat,name
    destinationRef.innerHTML = destinationOutput;
    let script = document.createElement('script');
    script.innerHTML = `document.getElementById("destinations")
    .addEventListener("change",panToSelectedPoint)`;
    destinationRef.appendChild(script);

    // Print plane information
    let planeOutput = `<p align="center">Registration:
    ${selectedPlane._registration} / Location: ${selectedPlane._location} /
    Range: ${selectedPlane._range} kilometers<br>Average Speed:
    ${selectedPlane._avgSpeed} knots / Type: ${selectedPlane._type}
    / Airline: ${selectedPlane._airline}</p>`;

    let planeRef = document.getElementById("planeInfo");
    planeRef.innerHTML = planeOutput;

    // Print weather information
    // check if weather data was available in earlier steps
    if (originWeather!=null && destinationWeather!=null) {
      const NUMBER_OF_WEATHER_CARDS = 2;
      // define weather, airport amd time as lists to loop through
      let weatherList = [originWeather,destinationWeather];
      let airportList = [selectedAirport[2],
      selectedPoints[selectedPoints.length-1][2]];
      let destinationTime = selectedTime + totalTime;
      let timeList = [selectedTime,destinationTime];

      for (let i = 1; i <= NUMBER_OF_WEATHER_CARDS; i++) {
        let data = weatherList[i-1];
        // get HTML reference
        // note: HTML ID's are "sourceDate1" and "sourceDate2"
        let sourceDateRef = document.getElementById(`sourceDate${i}`);
        let sourceAirportRef = document.getElementById(`sourceAirport${i}`);
        let summaryRef = document.getElementById(`summary${i}`);
        let temperatureRef = document.getElementById(`temperature${i}`);
        let precipRef = document.getElementById(`precip${i}`);
        let humidityRef = document.getElementById(`humidity${i}`);
        let windSpeedRef = document.getElementById(`windSpeed${i}`);
        let windGustRef = document.getElementById(`windGust${i}`);
        let windBearingRef = document.getElementById(`windBearing${i}`);
        let uvRef = document.getElementById(`uv${i}`);

        // define variables for weather data
        let summary = data.currently.summary;
        let temperature = data.currently.temperature;
        let precip = data.currently.precipProbability
        let humidity = data.currently.humidity;
        let windSpeed = data.currently.windSpeed;
        let windGust = data.currently.windGust;
        let windBearing = data.currently.windBearing;
        let uvIndex = data.currently.uvIndex;
        let icon = data.currently.icon;
        // convert selected to date object
        let selectedDate = new Date(timeList[i-1]);
        // date string to print
        let date = selectedDate.toLocaleDateString(undefined,{ year: 'numeric',
        month: 'long', day: 'numeric' });
        // time string to print
        let time = selectedDate.toLocaleTimeString();
        let airport = airportList[i-1];

        // check weather condition to determine weather icon
        if (icon === "clear-night") {
          iconPic = "images/clearnight.png";
        }
        else if (icon === "rain") {
          iconPic = "images/rain.png";
        }
        else if (icon === "snow") {
          iconPic = "images/snow.png";
        }
        else if (icon === "sleet") {
          iconPic = "images/sleet.png";
        }
        else if (icon === "wind") {
          iconPic = "images/wind.png";
        }
        else if (icon === "fog") {
          iconPic = "images/fog.png";
        }
        else if (icon === "cloudy") {
          iconPic = "images/cloudy.png";
        }
        else if (icon === "partly-cloudy-day") {
          iconPic = "images/partlycloudyday.png";
        }
        else if (icon === "clear-night") {
          iconPic = "images/clearnight.png";
        }
        else {
          iconPic = "images/clearday.png";
        }
        // print weather info to weather card
        sourceDateRef.innerHTML = `<span class='textFloat'>
        ${date}---${time}</span>`;
        sourceAirportRef.innerHTML = `<b>${airport}</b>`;
        temperatureRef.innerHTML = `${Math.round(temperature)}&#176;C
        <img src='${iconPic}' style='float:right' height='15%' width='15%'>`;
        summaryRef.innerHTML = `<b>${summary}</b>`;
        precipRef.innerHTML = `Precipitation: ${Math.round(precip * 100)}%`;
        humidityRef.innerHTML = `Humidity: ${Math.round(humidity * 100)}%`;
        windSpeedRef.innerHTML = `Wind Speed:
        ${Math.round(windSpeed * 1.609344)}km/h`;
        windGustRef.innerHTML = `Wind Gust:
        ${Math.round(windGust * 1.609344)}km/h`;
        windBearingRef.innerHTML = `Wind Bearing: ${windBearing}&#176;`;
        uvRef.innerHTML = `UV Index: ${uvIndex}`;
      }
    }
    else {
      // display appropriate message if weather was not available
      let card1Ref = document.getElementById("card1");
      let card2Ref = document.getElementById("card2");
      let output = `<h4>Weather data can not be displayed right now.</h4>`;
      card1Ref.innerHTML = output;
      card2Ref.innerHTML = output;
    }
  }
  else {
    // show message if flight info could not be retrieved
    let confirmationRef = document.getElementById("confirmation");
    let output = `<h4>An unexpected error occured. Please try booking again.</h4>`;
    confirmationRef.innerHTML = output;
  }


// MAPBOX API

// define mapbox access token
mapboxgl.accessToken = MAPBOX_TOKEN;
// initialise map
let map = new mapboxgl.Map({
   container: 'miniMap', // DIV ID
   center: airportCoords, // [lng,lat]
   zoom: 3,
   minZoom: 2.5,
   maxZoom: 14,
   style: 'mapbox://styles/mapbox/streets-v9'
 });

// Display airport marker/popup
let airportMarker = new mapboxgl.Marker({ "color": "#176BEF" }); // blue marker
// set coordinate of marker
airportMarker.setLngLat(airportCoords);
let airportPopup = new mapboxgl.Popup({ offset: 45});
airportPopup.setHTML(`<h5>${selectedAirport[2]}</h5><h6
 style="color:#176BEF">(ORIGIN)</h6>`);
airportMarker.setPopup(airportPopup)
// add marker and popup to map
airportMarker.addTo(map);
airportPopup.addTo(map);

// Display all selected points
for (let i = 0; i < selectedPoints.length-1; i++) {
 let point = selectedPoints[i];
 // create marker instance
 let marker = new mapboxgl.Marker({ "color": "#ffa500" }); // orange marker
 // set coordinate of marker
 marker.setLngLat(point);
 // create marker instance
 let popup = new mapboxgl.Popup({ offset: 45});
 popup.setHTML(`<h5>${i+1}) ${point[2]}</h5>`);
 // add popup and marker to map
 marker.setPopup(popup)
 marker.addTo(map);
}

// Display last marker with different color to easily differentiate
let lastPoint = selectedPoints[selectedPoints.length-1];
let marker = new mapboxgl.Marker({ "color": "#db3236" }); // red
marker.setLngLat(selectedPoints[selectedPoints.length-1]);
let popup = new mapboxgl.Popup({ offset: 45});
popup.setHTML(`<h5>${selectedPoints.length}) ${lastPoint[2]}</h5><h6
style="color:#db3236">(FINAL DESTINATION)</h6>`); // red text
marker.setPopup(popup)
marker.addTo(map);
popup.addTo(map);

// Show polyline on map load
map.on('load', function() {
  // call mapbox addSource method
  // first parameter: source name
  // second paramer: geojson data for Feature
  map.addSource('route', {
    'type': 'geojson',
    'data': {
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'LineString',
        'coordinates': allPoints
      }
    }
  });
  // add map layer
  // "layout" and "paint" for styling
  map.addLayer({
    'id': 'routes',
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
