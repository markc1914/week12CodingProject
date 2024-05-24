/**
 * Week 12 Assignment Javascript file
 * Written by Mark Cornelius
 */
const btnAddName = 'add';
const datePlayed = 'date-played';
const mapName = 'map-name';
const gameModeName = 'game-mode';
const numKillsName = 'num-kills'
const numDeathsName = 'num-deaths';
const tableName = 'list';
const globalKD = 'globalKD';
const green = '#07541d';
const red = '#820505';
const baseurl = 'http://localhost:3000'
const guidBaseURL = 'https://www.uuidtools.com/api/generate/v1';


class TrackerService {
  constructor(url) {
    this.url = url || baseurl;
  }

  /**
   * populates our map dropdown
   * @returns a list of maps
   */
  allMapNames() {
    let url = `${this.url}/maps`;
    return $.ajax(url, {
      success: (data) => {
        return data;
      }
    })
  }

  allModeNames() {
    let url = `${this.url}/modes`;
    return $.ajax(url, {
      success: (data) => {
        return data;
      }
    })
  }
  /**
   * 
   * @returns {[Result]} - game results   
   */
  getAllResults() {
    let url = `${this.url}/results`;
    return $.ajax(url, {
      success: (data) => {
        return data;
      }
    })
  }

  /**
   * Adds the game result to the Database
   * @param {Result} gameResult 
   */
  addResult(gameResult) {
    let url = `${this.url}/results`;
    let json = JSON.stringify(gameResult);
    return $.ajax(url, {
      method: 'POST',
      data: json,
      success: (data) => {
        return data;
      }
    })
  }

  /**
   * 
   * @param {String} gameId 
   * @returns 
   */
  deleteResult(gameId) {
    let url =`${this.url}/results/${gameId}`;
    console.log(`Executing DELETE to ${url}`);
    return $.ajax({
      type: 'DELETE',
      url: `${url}`,
      error: (err) => {
        console.log(`Error is ${err}`)
      },
      success : (data) => {
        return data;
      }
    })
  }
}

const service = new TrackerService();



let allgamesPlayed = [];

class Result {

  /**
   *  creates a new instance of game played for our table
   * @param {date} datePlayed - date and time of the game
   * @param {String} map - the map name
   * @param {String} mode - the game mode played
   * @param {BigInt} kills - number of enemy players killed
   * @param {BigInt} deaths - number of times killed by enemy player
   */
  constructor(datePlayed, map, mode, kills, deaths) {
    this.datePlayed = datePlayed;
    this.map = map;
    this.mode = mode;
    this.kills = kills;
    this.deaths = deaths;
    this.id = "id" + Math.random().toString(16).slice(2);
    this.calculateKillDeathRatio();
  }

  
   /**
   * properly calculate the KD ratio - we can't divide by 0
   */
  calculateKillDeathRatio() {
    this.killDeathRatio = 0;
    if (this.deaths > 0) {
      this.killDeathRatio = parseFloat(this.kills / this.deaths).toFixed(2);
    } else {
      this.killDeathRatio = this.kills;
    }
  }

}





$(document).ready(() => {
  const $mapName = $(`#map-name`);
  const $modeName = $(`#game-mode`);

  //populate dropdown from the DB
  service.allMapNames().then(maps => {
    for (let map of maps) {
      let option = `<option value="${map.map_name}">${map.map_name}</option>`;
      $mapName.append(option);
    }
  })

  //populate dropdown for modes from DB
  service.allModeNames().then(modes => {
    for (let mode of modes) {
      let option = `<option value="${mode.mode_name}">${mode.mode_name}</option>`;
      $modeName.append(option);
    }
  })

  service.getAllResults().then(results => {
    for (let result of results) {
      appendGameToTable(result);
    }
    recalculateGlobalKDRatio(results);

  })

});

  let rowId = 0; //track the rows we add using this

  /**
   *
   * @param {Date} gamePlayedDate
   * @param {String} gameMap
   * @param {String} gameMode
   * @returns true if no errors, false if errors exist
   */
  function validateForm(gamePlayedDate, gameMap, gameMode) {
    if (gamePlayedDate == '') {
      alert("Date must be filled out");
      return false;
    }
    //don't allow future games either
    let gamePlayedDateAsDate = new Date(gamePlayedDate);
    if (gamePlayedDateAsDate > new Date()) {
      alert("Date must not be in the future");
      return false;
    }

    if (gameMap == '') {
      alert("Map must be chosen");
      return false;
    }
    if (gameMode == '') {
      alert("Mode must be selected");
      return false;
    }
    return true;
  }


  //add event listener to our button so it adds to the row
  let addbutton = document.getElementById(btnAddName);
  if (addbutton != null) {
    document.getElementById(btnAddName).addEventListener('click', () => {
      let gamePlayedDate = document.getElementById(datePlayed).value;
      let gameMap = document.getElementById(mapName).value;
      let gameMode = document.getElementById(gameModeName).value;
        
      if (validateForm(gamePlayedDate, gameMap, gameMode)) {
        let numKills = document.getElementById(numKillsName).value;
        let numDeaths = document.getElementById(numDeathsName).value;
        let gamePlayed = new Result(gamePlayedDate, gameMap, gameMode, numKills, numDeaths);
        appendGameToTable(gamePlayed);
        allgamesPlayed.push(gamePlayed);
        document.getElementById(datePlayed).value = '';
        document.getElementById(mapName).value = '';
        document.getElementById(gameModeName).value = '';
        document.getElementById(numKillsName).value = 0;
        document.getElementById(numDeathsName).value = 0;
        recalculateGlobalKDRatio(allgamesPlayed);
        service.addResult(gamePlayed);
      }
    });
  }


  function appendGameToTable(gamePlayed) {
    let table = document.getElementById(tableName);
    let row = table.insertRow(rowId + 1);
    row.setAttribute('id', `${gamePlayed.id}`);
    row.insertCell(0).innerHTML = gamePlayed.datePlayed;
    row.insertCell(1).innerHTML = gamePlayed.map;
    row.insertCell(2).innerHTML = gamePlayed.mode;
    row.insertCell(3).innerHTML = gamePlayed.kills;
    row.insertCell(4).innerHTML = gamePlayed.deaths;
    let kdCell = row.insertCell(5);
    kdCell.innerHTML = gamePlayed.killDeathRatio;
    if (parseFloat(gamePlayed.killDeathRatio) >= 1) {
      kdCell.style.color = green; //Green
    } else {
      kdCell.style.color = red; //Red
    }
    let actions = row.insertCell(6);
    actions.appendChild(createDeleteButton(gamePlayed.id));
    rowId++;
  }

  const newLocal = 'button';
  /**
   * creates delete button for a row in a table based on that id
   * @param {BigInt} currentRow - which row needs a button
   * @returns the delete button for that row
   */
  function createDeleteButton(currentRow) {
    if (currentRow != null && currentRow != 'undefined') {
      let button = document.createElement(newLocal);
      button.className = 'btn btn-primary'; //add styling
      button.id = currentRow;
      button.innerHTML = 'Delete';
      button.onclick = () => {
        let rowToDelete = document.getElementById(`${currentRow}`);
        rowToDelete.parentNode.removeChild(rowToDelete);
        allgamesPlayed.splice(currentRow, 1);
        recalculateGlobalKDRatio(allgamesPlayed);
        service.deleteResult(currentRow).then(result =>
          {console.log(`Row ${gamePlayed.id} deleted`);}
        );
        rowId--;
      };
      return button;
    }
    return null;
  }
  /**
   * Calculates the global K/D Ratio
   * @param {[Result]} allgamesPlayed
   */
  function recalculateGlobalKDRatio(gamesPlayed) {
    let kdElement = document.getElementById(globalKD);
    if (gamesPlayed != null && gamesPlayed.length > 0) {
      let totalKills = 0;
      let totalDeaths = 0;
      for (const gamePlayed of gamesPlayed) {
        totalKills += parseInt(gamePlayed.kills);
        totalDeaths += parseInt(gamePlayed.deaths);
      }
      let averageKD = totalKills / totalDeaths;
      document.getElementById(globalKD).value = parseFloat(averageKD).toFixed(2);
    } else {
      document.getElementById(globalKD).value = 0;
    }
    //add styling to the average K/D ratio
    if (parseFloat(kdElement.value) >= 1) {
      kdElement.style.color = green;
    } else {
      kdElement.style.color = red;
    }
  }

