/**
 * PlanFlight_1.js
 * This file contains code that runs on load for PlanFlight_1.html
 */


// GENERAL FUNCTIONS //

// Define checkValidDate function to check that user entered date is not a date
// that is before current date
function checkValidDate() {
  let dateRef = document.getElementById("date")
  let date = dateRef.value;
  let todayDate = new Date();
  // Convert user entered date to Date object
  let selectedDate = new Date(date);

  let output = `Cannot book flight for previous dates.
  \n\nPlease enter a valid date.`;

  // Alert user if selected date is invalid
  // Compare if year of selected date is < current year
  if (selectedDate.getFullYear() < todayDate.getFullYear()) {
    alert(output);
    dateRef.value = "";
  }
  // Compare if month of selected date is < current month
  else if (selectedDate.getMonth() < todayDate.getMonth()) {
    alert(output);
    dateRef.value = "";
  }
  // Compare if date of selected date is < current date
  else if (selectedDate.getDate() < todayDate.getDate()) {
    alert(output);
    dateRef.value = "";
  }
}

// Define checkValidTime function to check if the time selected has not passed
// i.e. if user selects current date, checkValidDate will ensure that the timeout
// selected has not passed
function checkValidTime() {
  let dateRef = document.getElementById("date");
  let date = dateRef.value;
  // Convert user entered date to Date object
  let selectedDate = new Date(date);
  let todayDate = new Date();
  let timeRef = document.getElementById("time");
  let time = timeRef.value;
  // Obtain specific hour entered
  let hour = Number(time.substring(0,2));
  // Obtain specific minute entered
  let minute = Number(time.substring(3));
  // Set specific time for user entered date
  selectedDate.setHours(hour);
  selectedDate.setMinutes(minute);

  // Check to see if user has entered a date first (time cannot be validiated
  // unless a date has been specified by the user)
  if (date === "") {
    // alert user if date is not entered
    let output = `Please enter date first.`;
    alert(output);
    timeRef.value = "";
  }
  // Compare if time of selectedTime is < current time
  if (selectedDate.getTime() <= todayDate.getTime()) {
    // alert user if time has passed
    let output = `Cannot book flight for current time or time that has passed.
    \n\nPlease enter a valid time.`;
    alert(output);
  }
}

// Define nextStep function to store user entered data and
// redirect user to "PlanFlight_2.html"
function nextStep() {
  // Get user inputs from HTML page
  let dateRef = document.getElementById("date").value;
  let selectedTime = document.getElementById("time").value;
  let country = document.getElementById("country").value;
  let airport = document.getElementById("airport").value.split('/');
  let selectedDate;

  // Check that user has not left any input fields blank
  if (dateRef === "" || airport === "" || country === "" || selectedTime === "") {
    // alert usr if user has not entered enough information
    let output = "Please enter more information before proceeding.";
    return alert(output);
  }
  else {
    // define convers factors
    const HR_TO_MS_FACTOR = 3.6e6;
    const MIN_TO_MS_FACTOR = 60000;

    // get hour and minutes of selectedTime and convert to miliseconds
    let hour = Number(selectedTime.substring(0,2))*HR_TO_MS_FACTOR;
    let minute = Number(selectedTime.substring(3))*MIN_TO_MS_FACTOR;

    // Create Date object for user entered date
    dateRef = new Date(dateRef);
    // Reset time of date to 00:00
    dateRef.setHours(0);
    // calculate new time in unix
    let newTime = dateRef.getTime() + hour + minute;
    // convert selectedDate into Date object + time selected
    selectedDate = new Date();
    selectedDate.setTime(newTime);
  }
  // Store user selected country, airport and time in localStorage
  localStorage.setItem(SELECTED_COUNTRY_KEY,JSON.stringify(country));
  localStorage.setItem(SELECTED_AIRPORT_KEY,JSON.stringify(airport));
  // NOTE: selectedDate contains both the user selected date and time
  localStorage.setItem(SELECTED_TIME_KEY,JSON.stringify(selectedDate));
  // redirect user to "PlanFlight_2.html"
  location.assign(PLAN_2);
}


// AIRPORTS API FUNCTIONS //

// Define getAirportList function to retrieve airports for user specified country
function getAirportList() {
 let country = document.getElementById("country").value;
 let url = "https://eng1003.monash/api/v1/airports/";
 // Define API parameters
 let data = {
   country: country,
   callback: "generateAirportOptions"
 };
 // call to API
 webServiceRequest(url,data);
}

// Define generateAirportOptions function to display API returned airports as
// select element
function generateAirportOptions(data) {
 let airportOptionsRef = document.getElementById("airportOptions");
 let output = `<select class="mdl-textfield__input" id="airport"
 name="airport"><option>select an option...</option>`;
 for (let i = 0; i < data.length; i++) {
   let airport = data[i];
   output += `<option value="${airport.longitude}/${airport.latitude}/
   ${airport.name}">${airport.name} (${airport.airportCode})</option>`;
 }
 output += `</select>`;
 airportOptionsRef.innerHTML = output;
 let script = document.createElement('script');
 // add event listener for when user changes option
 script.innerHTML = `document.getElementById("airport").
 addEventListener("change",getWeather)`;
 airportOptionsRef.appendChild(script);
}


// WEATHER API FUNCTION //

// define getWeather function to retrieve weather
// for user specified time and date
function getWeather() {
  // define conversion factors
  const MS_TO_S_FACTOR = 1/1000;
  const HR_TO_S_FACTOR = 3600;
  const MIN_TO_S_FACTOR = 60;

  let time = document.getElementById("time").value;
  // obtain specific hour and minute of time and convert to seconds
  // (NOTE: weather API time machine requires seconds)
  let hour = Number(time.substring(0,2))*HR_TO_S_FACTOR;
  let minute = Number(time.substring(3))*MIN_TO_S_FACTOR;
  let dateRef = document.getElementById("date").value;
  // convert user entered date to Date object
  let date = new Date(dateRef);
  // set date time to 00:00
  date.setHours(0);
  // calculate specified date and time as seconds
  let timeSecs = date.getTime()*MS_TO_S_FACTOR + hour + minute;

  // if date was entered incorrectly or no time was entered, alert user
  if (date === "Invalid Date" || time === "") {
    let output = `Please enter more information before proceeding.`;
    return alert(output);
  }

  // change loading bar status to loading
  let progressRef = document.getElementById("p1");
  let stepRef = document.getElementById("step");
  progressRef.className = "mdl-progress mdl-js-progress mdl-progress__indeterminate";
  // NOTE: class is defined in MDL libraries
  stepRef.innerHTML = "LOADING";

  // define lng and lat of user selected airport coordinates
  // NOTE: airportCoord format: lng/lat/name
  let airportCoord = document.getElementById("airport").value.split('/');
  let lng = airportCoord[0];
  let lat = airportCoord[1];

  let url = "https://eng1003.monash/api/v1/darksky/";
  // define parameters for API
  let data = {
    u: USERNAME,
    key: DARKSKY_KEY,
    lat: lat,
    lng: lng,
    time: timeSecs,
    units: "si",
    callback: "weatherCallback"
  }
  // call to API
  webServiceRequest(url,data);
}

// Define weatherCallback to show weather card with relevant info
function weatherCallback(data) {
  // Define conversion factors
  const HR_TO_MS_FACTOR = 3.6e6;
  const MIN_TO_MS_FACTOR = 60000;

  // Get HTML reference of weather card elements
  let infoBoxRef = document.getElementById("infoBox")
  let sourceDateRef = document.getElementById("sourceDate");
  let sourceAirportRef = document.getElementById("sourceAirport");
  let summaryRef = document.getElementById("summary");
  let temperatureRef = document.getElementById("temperature");
  let precipRef = document.getElementById("precip");
  let humidityRef = document.getElementById("humidity");
  let windSpeedRef = document.getElementById("windSpeed");
  let windGustRef = document.getElementById("windGust");
  let windBearingRef = document.getElementById("windBearing");
  let uvRef = document.getElementById("uv");
  let progressRef = document.getElementById("p1");
  let stepRef = document.getElementById("step");
  let cardRef = document.getElementById("card");

  // Get user entered time, date and airprot
  let selectedTime = document.getElementById("time").value;
  // Get specific hour and convert from hr to ms
  let hour = Number(selectedTime.substring(0,2))*HR_TO_MS_FACTOR;
  // Get specific minutes and convert from min to ms
  let minute = Number(selectedTime.substring(3))*MIN_TO_MS_FACTOR;
  let dateRef = document.getElementById("date").value;
  // Convert user entered date to Date object
  dateRef = new Date(dateRef);
  // Set time of date to 00:00
  dateRef.setHours(0);
  // Calculate unix time of selected date + selected time
  let newTime = dateRef.getTime() + hour + minute;
  let selectedDate = new Date();
  selectedDate.setTime(newTime);
  // define date string to print
  let date = selectedDate.toLocaleDateString(undefined,{ year: 'numeric',
  month: 'long', day: 'numeric' });
  // define time string to print
  let time = selectedDate.toLocaleTimeString();
  // get airport name (airportCoords format: lng/lat/name)
  let airportCoords = document.getElementById("airport").value.split('/');
  let airport = airportCoords[2];

  // Define weather info to be printed
  let summary = data.currently.summary;
  let temperature = data.currently.temperature;
  let precip = data.currently.precipProbability
  let humidity = data.currently.humidity;
  let windSpeed = data.currently.windSpeed;
  let windGust = data.currently.windGust;
  let windBearing = data.currently.windBearing;
  let uvIndex = data.currently.uvIndex;
  let icon = data.currently.icon;

  // Show appropriate text if no weather is available
  if (data === undefined || summary === undefined) {
    // Change loading bar back to progress (1/2)
    progressRef.className = "mdl-progress mdl-js-progress";
    stepRef.innerHTML = "Step 1 of 2";
    let output = `Weather data could not be retrieved right now.
    \n\nPlease try again later.`;
    // alert user
    return alert(output);
  }
  // store weater at origin in localStorage
  localStorage.setItem(ORIGIN_WEATHER_KEY,JSON.stringify(data));

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
  else if (icon === "partly-cloudy-night") {
    iconPic = "images/partlycloudynight.png";
  }
  else {
    iconPic = "images/clearday.png";
  }

  // setTimeout to delay loading of progress bar (to enrich UX)
  setTimeout(function() {
    // create new card
    cardRef.classList.add("weatherCard");
    // show weather card on mobile screens
    infoBoxRef.classList.remove("mobileHide");
    // Change loading bar back to progress (1/2)
    progressRef.className = "mdl-progress mdl-js-progress";
    stepRef.innerHTML = "Step 1 of 2";
    sourceDateRef.innerHTML = date + "<span style='float: right'>" + time + "</span>";
    sourceAirportRef.innerHTML = airport;
    let tempOutput = Math.round(temperature) + "&#176;C <img src='"+ iconPic;
    tempOutput += "' style='float:right' height='15%' width='15%'>";
    temperatureRef.innerHTML = tempOutput;
    summaryRef.innerHTML = "<b>" + summary + "</b>";
    precipRef.innerHTML = "Precipitation: " + Math.round(precip * 100) + "%";
    humidityRef.innerHTML = "Humidity: " + Math.round(humidity * 100) + "%";
    windSpeedRef.innerHTML = "Wind Speed: " + Math.round(windSpeed * 1.609344) + " km/h";
    windGustRef.innerHTML = "Wind Gust: " + Math.round(windGust * 1.609344) + " km/h";
    windBearingRef.innerHTML = "Wind Bearing: " + windBearing + "&#176;";
    uvRef.innerHTML = "UV Index: " + uvIndex;
  }, 500); // 500ms before loading bar changed back
}


// CODE RUNS ON LOAD //

// Progress bar to enrich user experience
// define progress to be 50%
const PROGRESS_1 = 50;
// define progress of progress bar
document.querySelector('#p1').addEventListener('mdl-componentupgraded', function() {
   this.MaterialProgress.setProgress(PROGRESS_1);
 });

// add event listeners to check when users input date,time or country
document.getElementById("date").addEventListener("input",checkValidDate);
document.getElementById("time").addEventListener("input",checkValidTime);
document.getElementById("country").addEventListener("input",getAirportList);
