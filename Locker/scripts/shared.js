/** 
 * shared.js 
 * This file contains shared code that runs on both view.html and index.html
 */

// Constants used as KEYS for LocalStorage
const LOCKER_INDEX_KEY = "lockerIndex";
const LOCKER_DATA_KEY = "lockerData";

// TODO: Write code to implement the Locker class

class Locker {
    constructor(id = "") {
        this._id = id;
        this._label = "";
        this._locked = false;
        this._pin = "";
        this._color = "3399ff";
        this._contents = "";
    }

    get id() {return this._id;}
    get label() {return this._label;}
    get locked() {return this._locked;}
    get pin() {return this._pin;}
    get color() {return this._color;}
    get contents() {return this._contents;}

    set label(text) {this._label = text;}
    set locked(state) {this._locked = state;}
    set pin(pin) {this._pin = pin;}
    set color(color) {this._color = color;}
    set contents(text) {this._contents = text;}

    fromData(dataObject) {
        this._id = dataObject._id;
        this._label = dataObject._label;
        this._locked = dataObject._locked;
        this._pin = dataObject._pin;
        this._color = dataObject._color;
        this._contents = dataObject._contents;
    }

}

 
// TODO: Write code to implement the LockerList class

class LockerList {
    constructor() {
        this._lockers = [];
        this._currentId = "A1";
    }
    
    get lockers() {return this._lockers;}
    get count() {return this._lockers.length;}

    addLocker(id) {
        let newLocker = new Locker(id);
        this._lockers.push(newLocker);
    }

    getLocker(index) {
        return this._lockers[index];
    }

    removeLocker(id) {
        index = this._lockers.findIndex(x => x.id === id);
        this._lockers.splice(index, 1);
    }

    fromData(dataObject) {
        let data = dataObject._lockers;
		this._lockers = [];
		for(let i = 0; i < data.length; i++)
		{
			let locker = new Locker();
			locker.fromData(data[i]);
			this._lockers.push(locker);
		}
    }
}


// TODO: Write the function checkIfDataExistsLocalStorage

function checkIfDataExistsLocalStorage() {
    let data = JSON.parse(localStorage.getItem(LOCKER_DATA_KEY));

    let doesExists = false;

    if (typeof data !== "undefined" && data !== "" && data !== null) {
        doesExists = true;
    }

    return doesExists
}

// TODO: Write the function updateLocalStorage

function updateLocalStorage(data) {
    localStorage.setItem(LOCKER_DATA_KEY, JSON.stringify(data));
}

// TODO: Write the function getDataLocalStorage

function getDataLocalStorage() {
    return JSON.parse(localStorage.getItem(LOCKER_DATA_KEY));
}

// TODO: Write the code that will run on load here

let lockers = new LockerList()

if (checkIfDataExistsLocalStorage() == true) {
    let data = getDataLocalStorage();

    lockers.fromData(data);
} 
else if (checkIfDataExistsLocalStorage() == false) {
    
    lockers.addLocker("A1");

    updateLocalStorage(lockers);
}

