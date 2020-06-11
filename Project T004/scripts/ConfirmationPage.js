/**
 * ConfirmationPage.js
 * This file contains code that runs on load for ConfirmationPage.html
 */


 // FUNCTIONS //

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

 // Define confirmBooking function
 function confirmBooking() {
   // Final check to ensure user has entered all required information
   if (selectedAirport!=null && selectedCountry!=null && selectedPlane!=null
   && selectedTime!=null && selectedPoints!=null && totalTime!=null &&
   totalDistance!=null) {
     // Removes user entered information that was temporarily stored in
     // local storage
     localStorage.removeItem(SELECTED_AIRPORT_KEY);
     localStorage.removeItem(SELECTED_COUNTRY_KEY);
     localStorage.removeItem(SELECTED_PLANE_KEY);
     localStorage.removeItem(SELECTED_TIME_KEY);
     localStorage.removeItem(SELECTED_POINTS_KEY);
     localStorage.removeItem(ORIGIN_WEATHER_KEY);
     localStorage.removeItem(DESTINATION_WEATHER_KEY);
     localStorage.removeItem(TOTAL_TIME_KEY);
     localStorage.removeItem(TOTAL_DISTANCE_KEY);
     // Convert selectedTime to a Date object
     let date = new Date(selectedTime);
     // Retrieve data stored at "FLIGHT_LIST_KEY"
     let flightListData = JSON.parse(localStorage.getItem(FLIGHT_LIST_KEY));
     // Removes first element of selectedPoints (since selectedAirport was
     // stored in it)
     selectedPoints.shift();
     // Define conversion factor
     const MS_TO_HR_FACTOR = 2.8e-7;
     // Convert totalTime from ms to hr
     totalTime = totalTime*MS_TO_HR_FACTOR;
     // Check to see if there is any data has been stored at "FLIGHT_LIST_KEY"
     if (flightListData === null || flightListData === undefined) {
       // Define first flight number
       const FIRST_FLIGHT_NUM = 1;
       // Create new instance of FlightList class
       let flightList = new FlightList();
       // Call bookFlight method from FlightList class to book new flight
       flightList.bookFlight(FIRST_FLIGHT_NUM,date,selectedCountry,
         selectedAirport,selectedPlane,originWeather,destinationWeather,
         totalDistance,totalTime,selectedPoints);
       // Store flightList at "FLIGHT_LIST_KEY"
       localStorage.setItem(FLIGHT_LIST_KEY,JSON.stringify(flightList));
     }
     else {
       // Create new instance of FlightList class
       let flightList = new FlightList();
       // Call fromData method of FlightList class
       flightList.fromData(flightListData);
       // Determine new flight number
       let flightNum = flightList.flightList.length + 1;
       // Call bookFlight method from FlightList class to book new flight
       flightList.bookFlight(flightNum,date,selectedCountry,selectedAirport,
         selectedPlane,originWeather,destinationWeather,totalDistance,
         totalTime,selectedPoints);
       // Store flightList at "FLIGHT_LIST_KEY"
       localStorage.setItem(FLIGHT_LIST_KEY,JSON.stringify(flightList));
     }
     // Show user alert when flight has been successfully booked
     let output = `Your flight has been successfully booked!\n
     Thank you for booking with Doctor Destination`;
     alert(output);
     // Redirect user to "HomePage.html"
     location.assign(HOME);
   }
   else {
     // Alert user if user has not entered all of the required information
     let output = `An unexpected error occured. Please try booking again.`;
     alert(output);
     // Redirect user to "HomePage.html" to start again
     location.assign(HOME);
   }
 }


 // CODE RUNS ON LOAD //

 // Define conversion factors
 const M_TO_KM_FACTOR = 1/1000;
 const HR_TO_MS_FACTOR = 3.6e6;
 const MS_TO_HR_FACTOR = 2.8e-7;

 // Retrieve user inputs from localStorage
 let selectedAirport = JSON.parse(localStorage.getItem(SELECTED_AIRPORT_KEY));
 let selectedCountry = JSON.parse(localStorage.getItem(SELECTED_COUNTRY_KEY));
 let selectedPlane = JSON.parse(localStorage.getItem(SELECTED_PLANE_KEY));
 let originWeather = JSON.parse(localStorage.getItem(ORIGIN_WEATHER_KEY));
 let destinationWeather = JSON.parse(localStorage.getItem(DESTINATION_WEATHER_KEY));
 let selectedDate = JSON.parse(localStorage.getItem(SELECTED_TIME_KEY));
 selectedDate = new Date(selectedDate); // Convert selectedDate to Date object
 let selectedTime = selectedDate.getTime(); // Get unix time of Date object
 let selectedPoints = JSON.parse(localStorage.getItem(SELECTED_POINTS_KEY));
 let totalTime = JSON.parse(localStorage.getItem(TOTAL_TIME_KEY));
 totalTime = totalTime*HR_TO_MS_FACTOR; // Convert totalTime from hr to ms
 let totalDistance = JSON.parse(localStorage.getItem(TOTAL_DISTANCE_KEY)); //units: km

 // Check if user has entered all required information to show summary
 if (selectedAirport!=null && selectedCountry!=null && selectedPlane!=null &&
   selectedTime!=null && selectedPoints!=null && totalTime!=null &&
   totalDistance!=null) {
     // Printing general booking information
     let bookingOutput = `<p><b>Date</b>: ${selectedDate.toLocaleDateString
     (undefined,{ year: 'numeric',
     month: 'long', day: 'numeric' })}</p>`;
     bookingOutput += `<p><b>Time</b>: ${selectedDate.toLocaleTimeString()}</p>`;
     bookingOutput += `<p><b>Country of Origin</b>: ${selectedCountry}</p>`;
     bookingOutput += `<p><b>Origin</b>: ${selectedAirport[2]}</p>`;
     bookingOutput += `<p><b>Final Destination</b>: ${selectedPoints
     [selectedPoints.length-1][2]}</p>`;
     bookingOutput += `<p><b>Total trip time</b>:
     ${(totalTime*MS_TO_HR_FACTOR).toFixed(2)} hours</p>`;
     bookingOutput += `<p><b>Total distance</b>:
     ${totalDistance.toFixed(2)} km</p>`;
     let bookingInfoRef = document.getElementById("bookingInfo");
     bookingInfoRef.innerHTML = bookingOutput;

     // Printing destinations as select element
     let destinationRef = document.getElementById("destinationOptions");
     let destinationOutput = `<select class="mdl-textfield__input"
     id="destinations" name="destinations"><option>select an option...</option>`;
     // selectedAirport is in the format of lng/lat/name
     destinationOutput += `<option value="${selectedAirport[0]}/${selectedAirport[1]}/
     ${selectedAirport[2]}">ORIGIN) ${selectedAirport[2]}</option>`;
     // Loop through all selectedPoints except last one
     for (let i = 0; i < selectedPoints.length-1; i++) {
       let point = selectedPoints[i];
       // Point format: lng/lat/name
       destinationOutput += `<option value="${point[0]}/${point[1]}/
       ${point[2]}">${i+1}) ${point[2]}</option>`;
     }
     destinationOutput += `<option value="${selectedPoints
     [selectedPoints.length-1][0]}/${selectedPoints[selectedPoints.length-1]
     [1]}/${selectedPoints[selectedPoints.length-1][2]}">FINAL) ${selectedPoints
     [selectedPoints.length-1][2]}</option></select>`;
     destinationRef.innerHTML = destinationOutput;
     // Add event listener for when an option is selected
     let script = document.createElement('script');
     script.innerHTML = `document.getElementById("destinations").
     addEventListener("change",panToSelectedPoint)`;
     destinationRef.appendChild(script);

     // Print plane information
     let planeOutput = `<p align="center"><b>Registration</b>:
     ${selectedPlane._registration} / <b>Location</b>: ${selectedPlane._location} /
     <b>Range</b>: ${selectedPlane._range} kilometers<br><b>Average Speed</b>:
     ${selectedPlane._avgSpeed} knots / <b>Type</b>: ${selectedPlane._type}
     / <b>Airline</b>: ${selectedPlane._airline}</p>`;
     let planeRef = document.getElementById("planeInfo");
     planeRef.innerHTML = planeOutput;

     // Print weather information
     // Check if weather retrieval was successful in the prior steps
     if (originWeather!=null && destinationWeather!=null) {
       const NUMBER_OF_WEATHER_CARDS = 2;
       // Define weather, airport, destination and time as arrays that will
       // be loop through in for loop
       let weatherList = [originWeather,destinationWeather];
       let airportList = [selectedAirport[2],selectedPoints
       [selectedPoints.length-1][2]];
       let destinationTime = selectedTime + totalTime;
       let timeList = [selectedTime,destinationTime];
       // Print weather card information
       for (let i = 1; i <= NUMBER_OF_WEATHER_CARDS; i++) {
         // Retrieve HTML references
         let data = weatherList[i-1];
         // NOTE: HTML IDs are defined as "sourceDate1" and "sourceDate2" for
         // their respective weather cards
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
         // Define weather information to be printed
         let summary = data.currently.summary;
         let temperature = data.currently.temperature;
         let precip = data.currently.precipProbability
         let humidity = data.currently.humidity;
         let windSpeed = data.currently.windSpeed;
         let windGust = data.currently.windGust;
         let windBearing = data.currently.windBearing;
         let uvIndex = data.currently.uvIndex;
         let icon = data.currently.icon;
         // Convert selectedDate to Date object
         let selectedDate = new Date(timeList[i-1]);
         // Define date string to print
         let date = selectedDate.toLocaleDateString(undefined,{ year: 'numeric',
         month: 'long', day: 'numeric' });
         // Define time string to print
         let time = selectedDate.toLocaleTimeString();
         let airport = airportList[i-1];

         // Check weather condition to determine weather icon
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

         // Print to HTML page
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
       // If no weather data was retrieved in prior steps, display appropriate
       // text
       let card1Ref = document.getElementById("card1");
       let card2Ref = document.getElementById("card2");
       let output = `<h4>Weather data can not be displayed right now.</h4>`;
       card1Ref.innerHTML = output;
       card2Ref.innerHTML = output;
     }
   }
   else {
     // Display error on page if user did not enter all required information
     let confirmationRef = document.getElementById("confirmation");
     let output = `<h4>An unexpected error occured. Please try booking again.</h4>`;
     confirmationRef.innerHTML = output;
   }


// MAPBOX API //

// Define airportCoords (NOTE: selectedAirport format: lng/lat/name)
let airportCoords = [selectedAirport[0],selectedAirport[1]];
// Define access token for MapBox API
mapboxgl.accessToken = MAPBOX_TOKEN;
// Initialise map
let map = new mapboxgl.Map({
    container: 'miniMap', // DIV ID
    center: airportCoords, // [lng,lat]
    zoom: 3,
    minZoom: 2.5,
    maxZoom: 14,
    style: 'mapbox://styles/mapbox/streets-v9'
  });

// Display airport marker and popup
// Create new marker
let airportMarker = new mapboxgl.Marker({ "color": "#176BEF" }); // blue marker
// set coordinate of marker
airportMarker.setLngLat(airportCoords);
// Create new popup
let airportPopup = new mapboxgl.Popup({ offset: 45});
// set HTML of popup for greater customisation of popup text
airportPopup.setHTML(`<h5>${selectedAirport[2]}</h5><h6
  style="color:#176BEF">(ORIGIN)</h6>`); // h6, color: blue
// set popup to marker instance
airportMarker.setPopup(airportPopup)
// Add marker and popup to map (displays on load)
airportMarker.addTo(map);
airportPopup.addTo(map);

// Display markers/popups for selected points
// NOTE: length - 1 since last point will be displayed differently
for (let i = 0; i < selectedPoints.length-1; i++) {
  let point = selectedPoints[i];
  // Create marker instance
  let marker = new mapboxgl.Marker({ "color": "#ffa500" }); // orange marker
  // set coordinate of marker
  marker.setLngLat(point);
  // Create popup instance
  let popup = new mapboxgl.Popup({ offset: 45});
  // set HTML of popup for greater customisation of popup text
  popup.setHTML(`<h5>${i+1}) ${point[2]}</h5>`);
  // set popup to marker instance
  marker.setPopup(popup)
  // Add marker to map (displays on load)
  marker.addTo(map);
}

// Display marker/popup for final destination
// Define lastPoint from selectedPoints
let lastPoint = selectedPoints[selectedPoints.length-1];
// Create new marker instance
let marker = new mapboxgl.Marker({ "color": "#db3236" }); // red marker
// set coordinate of marker
marker.setLngLat(selectedPoints[selectedPoints.length-1]);
// Create new popup instance
let popup = new mapboxgl.Popup({ offset: 45});
// set HTML of popup for greater customisation of popup text
popup.setHTML(`<h5>${selectedPoints.length}) ${lastPoint[2]}</h5><h6
style="color:#db3236">(FINAL DESTINATION)</h6>`); // h6, color: blue
// set popup to marker instance
marker.setPopup(popup)
// add marker and popup to map (displays on load)
marker.addTo(map);
popup.addTo(map);

// Create allPoints variable that includes airport at start of arrays
// Create temp variable to hold selectedPoints
let temp = selectedPoints;
// Add airportCoords to index 0 of selectedPoints
selectedPoints.unshift(airportCoords);
let allPoints = selectedPoints;
// Restore selectedPoints to original state
selectedPoints = temp;

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
    'id': 'route',
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
