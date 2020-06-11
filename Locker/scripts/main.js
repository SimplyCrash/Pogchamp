/** 
 * main.js 
 * This file contains code that runs on load for index.html
 */

// TODO: Write the function displayLockers

function displayLockers() {
    let lockerDisplayRef = document.getElementById("lockerDisplay");

    let output = ""
    for(let i = 0; i < lockers.count; i++) {

        lockers.fromData(getDataLocalStorage())

        if (lockers.lockers[i].locked == true) {
            icon = "lock"
        } else {
            icon = "lock_open"
        }
        output += "<div class='mdl-cell mdl-cell--4-col'>"
        output += "<div class='mdl-card mdl-shadow--2dp locker' style='background-color:#"+ lockers.lockers[i].color +"'>" 
        output += "<div class='mdl-card__title mdl-card--expand'>"
        output += "<h2>"+ lockers.lockers[i].id +"</h2>"
        output += "<h4>&nbsp;"+ lockers.lockers[i].label +"</h4>"
        output += "</div><div class='mdl-card__actions mdl-card--border'>"
        output += "<a class='mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' onclick='view(" + i + ")'>Open Locker</a>"
        output += "<div class='mdl-layout-spacer'></div><i class='material-icons'>"+ icon +"</i></div></div></div>"
    }
    
    lockerDisplayRef.innerHTML = output

}

// TODO: Write the function addNewLocker

function addNewLocker() {
    let newId = prompt("ID:");
    lockers.addLocker(newId);
    updateLocalStorage(lockers)
    displayLockers()
}


// TODO: Write the function view

function view(index) {
    localStorage.setItem(LOCKER_INDEX_KEY, index);
    window.location = "view.html";
}

// TODO: Write the code that will run on load here

displayLockers()

