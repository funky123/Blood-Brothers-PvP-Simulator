﻿declare var swal;
declare var startTest;

/**
 * Set some form items to what were last chosen
 */
function setPreviousChoices() {
    // player 1 fams
    if (localStorage.getItem("f0") && localStorage.getItem("f0") !== "null") {
        for (var i = 0; i < 10; i++) {
            (<HTMLInputElement>document.getElementById(`f${i}`)).value = localStorage.getItem(`f${i}`);
        }
    }

    // player 2 fams
    if (localStorage.getItem("f10") && localStorage.getItem("f10") !== "null") {
        for (i = 0; i < 10; i++) {
            (<HTMLInputElement>document.getElementById(`f${i + 10}`)).value = localStorage.getItem(`f${i + 10}`);
        }
    }

    // player 1 skills
    if (localStorage.getItem("s10") && localStorage.getItem("s10") !== "null") {
        for (i = 0; i < 3; i++) {
            (<HTMLInputElement>document.getElementById(`s1${i}`)).value = localStorage.getItem(`s1${i}`);
        }
    }

    // player 2 skills
    if (localStorage.getItem("s20") && localStorage.getItem("s20") !== "null") {
        for (i = 0; i < 3; i++) {
            (<HTMLInputElement>document.getElementById(`s2${i}`)).value = localStorage.getItem(`s2${i}`);
        }
    }

    // player 1 formation
    if (localStorage.getItem("1f") && localStorage.getItem("1f") !== "null") {
        (<HTMLInputElement>document.getElementById("1f")).value = localStorage.getItem("1f");
    }

    // player 2 formation
    if (localStorage.getItem("2f") && localStorage.getItem("2f") !== "null") {
        (<HTMLInputElement>document.getElementById("2f")).value = localStorage.getItem("2f");
    }

    // debug mode
    if (localStorage.getItem("debug") === "true") {
        (<HTMLInputElement>document.getElementById("debug")).checked = true;
    }

    // battle type
    var bt = localStorage.getItem("bt");
    if (bt === "1" || bt === "2") {
        (<HTMLInputElement>document.getElementById("bt")).value = bt;
    }
}

/**
 * Disable/enable form items belonging to a player based on whether random is chosen or not
 */
function toogleDisable() {
    for (var player = 1; player <= 2; player++) {
        // is the random checkbox checked?
        var isSelected = (<HTMLInputElement>document.getElementById(`r${player}`)).checked;

        // fams, skills, formation
        var elems = document.getElementsByClassName(`p${player}`);
        for (var i = 0; i < elems.length; i++) {
            if (isSelected) {
                (<HTMLInputElement>elems[i]).disabled = true;
            }
            else {
                (<HTMLInputElement>elems[i]).disabled = false;
            }
        }

        // random modes
        var randomSelect = document.getElementById(player + "r");
        if (isSelected) {
            randomSelect.disabled = false;
        }
        else {
            randomSelect.disabled = true;
        }
    }
}

/**
 * Toogle on/off the reserve depending on whether the mode is Bloodclash or not
 */
function toogleReserve() {
    for (var player = 1; player <= 2; player++) {
        var isBloodclash = (<HTMLInputElement>document.getElementById("bt")).value === "1";

        var elems = document.getElementsByClassName("reserve");
        for (var i = 0; i < elems.length; i++) {
            var elem = (<HTMLInputElement>elems[i]);
            if (!isBloodclash) {
                elem.disabled = true;
                elem.style.display = 'none';
            }
            else {
                elem.disabled = false;
                elem.style.display = 'inline';
            }
        }
    }

    // need to toogle disable at the end
    toogleDisable();
}

/**
 * Prepare the form when it is loaded
 */
function onFormLoad() {
    toogleReserve();
    toogleDisable();

    // display the last tier update time
    if (localStorage.getItem("lastTierUpdateTime")) {
        var a = new Date(+localStorage.getItem("lastTierUpdateTime"));
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var year = a.getFullYear();
        var month = months[a.getMonth()];
        var date = a.getDate();
        var hour = a.getHours();
        var min = a.getMinutes();
        var sec = a.getSeconds();
        var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
        $("#lastTierUpdate").text(`Last tier list update: ${time}`);
    }
}

/**
 * Put any validation for the main setting form here
 */
function validateForm() {
    return true;
}

/**
 * Submits the form. Goes into debug mode if necesary.
 */
function submitForm() {
    var form = document.forms["mainForm"];
    if (form["debug"].checked === true) {
        form.action = "debug.html";
    }
    form.submit();
}

/**
 * Populates the familiar selects options
 */
function setFamOptions() {
    var famSelects = document.getElementsByClassName("famSelect");

    // create an array of fam id and sort it based on the fam's full name
    var famIdArray = [];
    for (var key in famDatabase) {
        if (famDatabase.hasOwnProperty(key)) {
            famIdArray.push(key);
        }
    }
    famIdArray.sort((a, b) => famDatabase[a].fullName.localeCompare(famDatabase[b].fullName));

    for (var i = 0; i < famSelects.length; i++) {
        for (var index = 0; index < famIdArray.length; index++) {
            key = famIdArray[index];
            var option = document.createElement("option");
            option.value = key;
            option.text = famDatabase[key].fullName;
            (<HTMLSelectElement>famSelects[i]).add(option);
        }
    };
}

/**
 * Populates the skill selects options
 */
function setSkillOptions() {
    var skillSelects = document.getElementsByClassName("skillSelect");

    // create an array of skill id and sort it based on the skill's name
    var skillIdArray = SkillProvider.getAvailableSkillsForSelect();
    skillIdArray.sort((a, b) => SkillDatabase[a].name.localeCompare(SkillDatabase[b].name));

    for (var i = 0; i < skillSelects.length; i++) {
        for (var index = 0; index < skillIdArray.length; index++) {
            var key = skillIdArray[index];
            var option = document.createElement("option");
            option.value = key + "";
            option.text = SkillDatabase[key].name;
            (<HTMLSelectElement>skillSelects[i]).add(option);
        }
    };
}

/**
 * Get the battle data and option from the URL. Also saves the settings to localStorage for later retrieval
 */
function getBattleDataOption() {
    // fam: player 1: f0 -> f4, f5 -> f9
    //      player 2: f10 -> f14, f15 -> f19
    // skills: player 1: s10 -> s12
    //         player 2: s20 -> s22
    // formation: player 1: 1f, player 2: 2f
    // random mode: player 1: 1r, player 2: 2r
    // battle type: bt
    localStorage.setItem("debug", getURLParameter("debug"));

    var data: any = {}, option: GameOption = {};

    var battleType = getURLParameter("bt");
    localStorage.setItem("bt", battleType);
    option.battleType = +battleType;

    option.p1RandomMode = +getURLParameter("1r");
    option.p2RandomMode = +getURLParameter("2r");

    data.p1_formation = getURLParameter("1f");
    if (!option.p1RandomMode) localStorage.setItem("1f", data.p1_formation);

    data.p2_formation = getURLParameter("2f");
    if (!option.p2RandomMode) localStorage.setItem("2f", data.p2_formation);

    data.p1_cardIds = [];
    data.p2_cardIds = [];
    data.p1_warlordSkillIds = [];
    data.p2_warlordSkillIds = [];

    for (var i = 0; i < 10; i++) {
        var f1id = getURLParameter(`f${i}`);
        var f2id = getURLParameter(`f${i + 10}`);
        data.p1_cardIds.push(f1id);
        data.p2_cardIds.push(f2id);

        if (!option.p1RandomMode) localStorage.setItem(`f${i}`, f1id);
        if (!option.p2RandomMode) localStorage.setItem(`f${i + 10}`, f2id);
    }
    for (i = 0; i < 3; i++) {
        var w1s = getURLParameter(`s1${i}`);
        var w2s = getURLParameter(`s2${i}`);
        data.p1_warlordSkillIds.push(w1s);
        data.p2_warlordSkillIds.push(w2s);

        if (!option.p1RandomMode) localStorage.setItem(`s1${i}`, w1s);
        if (!option.p2RandomMode) localStorage.setItem(`s2${i}`, w2s);
    }

    return [data, option];
}

/**
 * Hijack the Math.random() with our own random implementation if needed
 */
function prepareRandom() {
    var USE_CS_RND = false;
    if (USE_CS_RND) {
        var rnd = new CsRandom(1234);
        Math.random = () => rnd.nextDouble();
    }
}

/**
 * Callback when the battle in normal mode has ended
 */
function onBattleFinished() {
    var startButton = document.getElementById("startButton");
    startButton.disabled = false;

    if (ENUM.Setting.IS_MOBILE) {
        startButton.style.display = "block";
    }
    else {
        showStarRequest();
    }
}

/**
 * Callback when the simulation has ended
 */
function onSimulationFinished() {
    if (!ENUM.Setting.IS_MOBILE) {
        showStarRequest();
    }
}

/**
 * Show request for starring on Github
 */
function showStarRequest() {
    setTimeout(() => {
        if (!localStorage.getItem("starRequestShown")) {
            swal({
                title: "Star this!",
                text: "If you like this simulator, star the project on Github. It motivates me to improve it :)",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#5cb85c",
                confirmButtonText: "Take me there",
                closeOnConfirm: false
            }, () => {
                localStorage.setItem("starRequestShown", "true");
                window.location.href = 'https://github.com/chinhodado/Blood-Brothers-PvP-Simulator';
            });
        }
    }, 2000);
}

/**
 * Prepare the battle field
 */
function prepareField() {
    var rndBgLink = BattleBackground.getRandomBackgroundLink();
    var img = new Image();
    var svgWrapper = document.getElementById("svgWrapper");
    img.onload = () => {
        svgWrapper.style.backgroundImage = `url('${rndBgLink}')`;
    };
    img.onerror = () => {
        console.log(`Background not found: ${rndBgLink}`);
        svgWrapper.style.backgroundImage = "url(img/bg01.png)";
    };
    img.src = rndBgLink;
}

/**
 * Fetch the tier list and cache it
 */
function getTierList(whatToDoNext) {
    if (whatToDoNext === "debug") {
        var callback = "updateTierListThenDebug";
    }
    else if (whatToDoNext === "play") {
        callback = "updateTierListThenPlay";
    }
    else if (whatToDoNext === "sim") {
        callback = "updateTierListThenSim";
    }
    else if (whatToDoNext === "test") {
        callback = "updateTierListThenTest";
    }
    else {
        callback = "updateTierList";
    }

    var needUpdate = false;
    var currentTime = new Date().getTime();
    var lastUpdatedTime = localStorage.getItem("lastTierUpdateTime");
    if (!lastUpdatedTime) {
        needUpdate = true;
    }
    else {
        var elapsedTime = currentTime - lastUpdatedTime;
        needUpdate = elapsedTime >= 1000 * 60 * 60 * 24; // 1 day
    }

    if (!localStorage.getItem("tierList") || needUpdate) {
        console.log("Fetching tier list...");
        $.ajax({
            "url": "https://www.kimonolabs.com/api/e67eckbg?apikey=ddafaf08128df7d12e4e0f8e044d2372",
            "crossDomain": true,
            "dataType": "jsonp",
            "jsonpCallback": callback
        });
    }
    else {
        if (whatToDoNext === "debug") {
            playDebug();
        }
        else if (whatToDoNext === "play") {
            playGame();
        }
        else if (whatToDoNext === "sim") {
            playSim();
        }
        else if (whatToDoNext === "test") {
            startTest();
        }
    }
}

/**
 * Update the tier list
 */
function updateTierList(data) {
    localStorage.setItem("tierList", JSON.stringify(data.results));
    localStorage.setItem("lastTierUpdateTime", `${new Date().getTime()}`);
}

// kill me now...
function updateTierListThenPlay(data) {
    updateTierList(data);
    playGame();
}
function updateTierListThenDebug(data) {
    updateTierList(data);
    playDebug();
}
function updateTierListThenSim(data) {
    updateTierList(data);
    playSim();
}
function updateTierListThenTest(data) {
    updateTierList(data);
    startTest();
}

function playGame() {
    prepareField();
    BattleGraphic.PLAY_MODE = 'AUTO';
    BattleDebugger.IS_DEBUG_MODE = false;
    document.getElementById('startButton').onclick = function () {
        this.disabled = true;

        if (ENUM.Setting.IS_MOBILE) {
            this.style.display = "none";
        }

        BattleGraphic.getInstance().resetInitialField();
        BattleGraphic.getInstance().displayMajorEventAnimation(0);
    }
    var dataOption = getBattleDataOption();
    var data = dataOption[0], option = dataOption[1];
    var newGame = new BattleModel(data, option);
    newGame.startBattle();
}

function playSim() {
    if (!ENUM.Setting.IS_MOBILE) {
        prepareField();
    }
    var dataOption = getBattleDataOption();
    var data = dataOption[0], option = dataOption[1];

    var NUM_BATTLE = 10000;
    document.getElementById("numBattle").innerHTML = numberWithCommas(NUM_BATTLE);
    (<HTMLProgressElement>document.getElementById("progressBar")).max = NUM_BATTLE;

    // create a new game just to display the fam and formation
    if (option.p1RandomMode) {
        BattleGraphic.HIDE_PLAYER1 = true;
    }

    if (option.p2RandomMode) {
        BattleGraphic.HIDE_PLAYER2 = true;
    }
    BattleDebugger.IS_DEBUG_MODE = false;
    BattleModel.IS_MASS_SIMULATION = true;
    if (!ENUM.Setting.IS_MOBILE) {
        var newGame = new BattleModel(data, option);
    }

    // hide/show some elements on the page
    document.getElementById("gameDiv").setAttribute("style", "display: none;");
    document.getElementById("startButton").setAttribute("style", "display: none;");
    document.getElementById("simDiv").setAttribute("style", "display: block;");

    if (ENUM.Setting.IS_MOBILE) {
        startSynchronousSim(data, option, NUM_BATTLE);
    }
    else {
        startWorkerSim(data, option, NUM_BATTLE);
    }
}

function playDebug() {
    prepareField();
    var dataOption = getBattleDataOption();
    var data = dataOption[0], option = dataOption[1];

    var newGame = new BattleModel(data, option);
    newGame.startBattle();
}

/**
 * Basically worker.js. Used when worker not available.
 */
function startSynchronousSim(data, option, NUM_BATTLE) {
    prepareRandom();
    var p1WinCount = 0;
    var p2WinCount = 0;
    var winCountTable = {};
    BattleModel.IS_MASS_SIMULATION = true;
    BattleGraphic.GRAPHIC_DISABLED = true;
    var tierList = localStorage.getItem("tierList");
    var startTime = new Date().getTime(); // if worker is not supported, chance is high that neither is performance.now()

    var intervalCount = 0;
    var NUM_CHUNK = 100;
    var CHUNK_SIZE = NUM_BATTLE / NUM_CHUNK;
    var interval = setInterval(() => {
        for (var i = 0; i < CHUNK_SIZE; i++) {
            var newGame = new BattleModel(data, option, tierList);
            var resultBattle = newGame.startBattle();
            BattleModel.resetAll();
            if (resultBattle.playerWon.id === 1) {
                p1WinCount++;
            } else if (resultBattle.playerWon.id === 2) {
                p2WinCount++;
            }

            var winTeam = resultBattle.cardManager.getPlayerOriginalMainCards(resultBattle.playerWon);
            if (resultBattle.isBloodClash) {
                winTeam = winTeam.concat(resultBattle.cardManager.getPlayerOriginalReserveCards(resultBattle.playerWon));
            }
            for (var j = 0; j < winTeam.length; j++) {
                if (winCountTable[winTeam[j].dbId]) {
                    winCountTable[winTeam[j].dbId]++;
                } else {
                    winCountTable[winTeam[j].dbId] = 1;
                }
            }

            document.getElementById("progressPercent").innerHTML = intervalCount + 1 + "%";
            document.getElementById("progressBar").setAttribute("value", (intervalCount * CHUNK_SIZE + i + 1) + "");
        }

        intervalCount++;
        if(intervalCount >= NUM_CHUNK) {
            clearInterval(interval);
        }

        if (intervalCount * CHUNK_SIZE >= NUM_BATTLE) {
            var endTime = new Date().getTime();
            var finalData = {
                p1WinCount: p1WinCount,
                p2WinCount: p2WinCount,
                winCountTable: winCountTable
            };
            onSimulationResultObtained(finalData, startTime, endTime);
        }
    }, 0);
}

function startWorkerSim(data, option, NUM_BATTLE) {
    // now make the workers do the simulation in background
    var totalProgress = 0;        // update every time a worker posts back
    var workerDone = 0;           // the number of workers that have done their jobs
    var NUM_WORKER = 4;           // the number of workers
    var workerPool = [];          // the worker pool
    var workerDataReturned = [];  // list of data returned by each worker

    for (var w = 0; w < NUM_WORKER; w++) {
        var worker = new Worker("js/worker.js");
        worker.onmessage = event => {
            if (event.data.status === "ongoing") {
                totalProgress += 100;
                document.getElementById("progressBar").setAttribute("value", totalProgress.toString());
            }
            else if (event.data.status === "done") {
                totalProgress += 100;
                document.getElementById("progressBar").setAttribute("value", totalProgress.toString());
                workerDataReturned[workerDone] = event.data;
                workerDone++;
                console.log(workerDone + " workers done.");
                if (workerDone === NUM_WORKER) { // <- all workers have finished their jobs
                    var endTime = performance.now();

                    // aggregate all workers' data to form the final data
                    var finalData = {
                        p1WinCount: 0,
                        p2WinCount: 0,
                        winCountTable: []
                    };
                    for (var i = 0; i < NUM_WORKER; i++) {
                        finalData.p1WinCount += workerDataReturned[i].p1WinCount;
                        finalData.p2WinCount += workerDataReturned[i].p2WinCount;

                        var workerTable = workerDataReturned[i].winCountTable;
                        for (var key in workerTable) {
                            if (workerTable.hasOwnProperty(key)) {
                                if (finalData.winCountTable[key]) {
                                    finalData.winCountTable[key] += workerTable[key];
                                } else {
                                    finalData.winCountTable[key] = workerTable[key];
                                }
                            }
                        }
                    }

                    onSimulationResultObtained(finalData, startTime, endTime);

                    // terminate all workers
                    workerPool.forEach(entry => {
                        entry.terminate();
                    });
                }
            }
        };

        workerPool[w] = worker;
    }

    worker = null; // <- just leave this here

    // start the workers. Need to pass the tierList information in since the worker
    // can't access sessionStorage
    var startTime = performance.now();

    for (w = 0; w < workerPool.length; w++) {
        workerPool[w].postMessage({
            data: data,
            option: option,
            tierList: localStorage.getItem("tierList"),
            numBattle: NUM_BATTLE / NUM_WORKER
        });
    }
}

function onSimulationResultObtained(finalData, startTime, endTime) {
    var famIdArray = [];
    for (var key in finalData.winCountTable) {
        if (finalData.winCountTable.hasOwnProperty(key)) {
            famIdArray.push(key);
        }
    }
    famIdArray.sort((a, b) => finalData.winCountTable[b] - finalData.winCountTable[a]);

    // now print out the details
    var simResultDiv = document.getElementById("simResultDiv");
    simResultDiv.innerHTML += (`Player 2 won: ${finalData.p2WinCount}<br> Player 1 won: ${finalData.p1WinCount}<br><br> Time: ${((endTime - startTime) / 1000).toFixed(2)}s<br><a href=setting.html>Go back to main page </a>`);

    var detail1 = "<br><br><details><summary> Most frequent appearances in win team: </summary><br>";
    for (var i = 0; i < famIdArray.length; i++) {
        var id = famIdArray[i];
        detail1 += (famDatabase[id].fullName + ": " + finalData.winCountTable[id] + "<br>");
    }
    detail1 += "</details>";
    simResultDiv.innerHTML += detail1;

    // call the callback when simulation finished
    onSimulationFinished();
}
