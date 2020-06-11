/** 
 * view.js 
 * This file contains code that runs on load for view.html
 */

// TODO: Write the function displayLockerInfo




function displayLockerInfo() {
    let idRef = document.getElementById("lockerId");
    let contentsRef = document.getElementById("lockerContents");
    let labelRef = document.getElementById("lockerLabel");
    let colorRef = document.getElementById("lockerColor");
    let deleteRef = document.getElementById("deleteLocker");

    idRef.innerHTML = locker.id;
    contentsRef.innerHTML = locker.contents;
    labelRef.setAttribute("value", locker.label); 
    colorRef.setAttribute("value", locker.color);
    deleteRef.addEventListener("click", deleteThisLocker)
}

// TODO: Write the function unlock

function unlock() {
    console.log("1")
    if (prompt("PIN") == locker.pin) {
        locker.locked = false
        locker.pin = ""
        updateLocalStorage(lockers)
        displayLockerInfo()
    } else {
        alert("Incorrent PIN")
        window.location = "index.html";
    }
}

// TODO: Write the function deleteThisLocker

function deleteThisLocker() {
    if (confirm("Are you sure you want to delete this locker?")) {
        lockers.removeLocker(locker.id)
        updateLocalStorage(lockers)
        alert("Locker has been deleted.")
        window.location = "index.html"
    } 
}

// TODO: Write the function lockLocker

function lockLocker() {
    if (confirm("Are you sure you want to lock this locker?")) {
        pin = prompt("Enter PIN:")
        if (pin == prompt("Confirm PIN:")) {
            locker.pin = pin
            locker.locked = true
            locker.contents = document.getElementById("lockerContents").value
            locker.label = document.getElementById("lockerLabel").value
            locker.color = document.getElementById("lockerColor").value

            updateLocalStorage(lockers)

            alert("Locker has been closed and locked.")

            window.location = "index.html"
        }
    }

}

// TODO: Write the function closeLocker

function closeLocker() {
    if (confirm("Are you sure you want to leave this locker unlocked?")) {
        locker.contents = document.getElementById("lockerContents").value
        locker.label = document.getElementById("lockerLabel").value
        locker.color = document.getElementById("lockerColor").value

        alert("Locker has been closed but not locked.")

            window.location = "index.html"
    }
}


// TODO: Write the code that will run on load here
let index = localStorage.getItem(LOCKER_INDEX_KEY);
let locker = lockers.getLocker(index);


if (locker.locked == true && locker.pin !== "") {
    unlock()
} else {
    displayLockerInfo()
}




