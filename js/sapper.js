let rows;
let cols;
let minesPer;
let showArray;
let initArray;
let isFinished;
let steps;
let flags;
let indervalId;
let seconds;
let userName;
let winnerInfo;
let level;
let winners;

const ajaxHandlerScript = "https://fe.it-academy.by/AjaxStringStorage2.php";
let updatePassword;
const stringName = 'BABCHANOK_SAPPER_WINNERS';

function storeInfo() {
    updatePassword = Math.random();
    $.ajax({
            url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
            data: {f: 'LOCKGET', n: stringName, p: updatePassword},
            success: lockGetReady, error: errorHandler
        }
    );
}

function lockGetReady(callresult) {
    if (callresult.error != undefined) {
        alert(callresult.error);
    } else {
        try {
            winners = JSON.parse(callresult.result);
            winners.push(winnerInfo);
            winners = winners.sort((a, b) => a.seconds - b.seconds);
        } catch (e) {
            winners = [winnerInfo];
        }

        $.ajax({
                url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
                data: {
                    f: 'UPDATE', n: stringName,
                    v: JSON.stringify(winners), p: updatePassword
                },
                success: updateReady, error: errorHandler
            }
        );
    }
}

function updateReady(callresult) {
    if (callresult.error != undefined) {
        alert(callresult.error);
    } else {
        displayScores(winners);
    }
}

function restoreInfo() {
    $.ajax(
        {
            url: ajaxHandlerScript, type: 'POST', cache: false, dataType: 'json',
            data: {f: 'READ', n: stringName},
            success: readReady, error: errorHandler
        }
    );
}

function readReady(callresult) {
    if (callresult.error != undefined)
        alert(callresult.error);
    else if (callresult.result != "") {
        let winners;
        try {
            winners = JSON.parse(callresult.result);
        } catch (e) {
            winners = [];
        }

        displayScores(winners);
    }
}

function errorHandler(jqXHR, statusStr, errorStr) {
    alert(statusStr + ' ' + errorStr);
}

onPageLoad();
restart();

function onPageLoad() {
    level = window.localStorage.getItem("level") || "0";
    document.querySelector('[name="level"][value="' + level + '"]').checked = true;
    buildDesk(level);
    restoreInfo();
}

function displayScores(w) {
    let savedWinnersArray = w || [];
    let beginners = savedWinnersArray.filter(obj => obj.level === '0');
    let htmlText = "";
    for (let i = 0; i < beginners.length; i++) {
        htmlText += "<li>" + beginners[i].name + " - " + beginners[i].seconds + " seconds</li>";
    }
    document.getElementById('beginners').innerHTML = htmlText;

    let advanced = savedWinnersArray.filter(obj => obj.level === '1');
    htmlText = "";
    for (let i = 0; i < advanced.length; i++) {
        htmlText += "<li>" + advanced[i].name + " - " + advanced[i].seconds + " seconds</li>";
    }
    document.getElementById('advanced').innerHTML = htmlText;

    let experts = savedWinnersArray.filter(obj => obj.level === '2');
    htmlText = "";
    for (let i = 0; i < experts.length; i++) {
        htmlText += "<li>" + experts[i].name + " - " + experts[i].seconds + " seconds</li>";
    }
    document.getElementById('experts').innerHTML = htmlText;
}

function restart() {
    level = window.localStorage.getItem("level") || "0";
    document.getElementById('start').value = 'Restart';
    document.getElementById('gameover').classList.remove('show');
    if (indervalId > 0) {
        clearInterval(indervalId);
    }

    setCounter();
    steps = 0;
    flags = 0;
    isFinished = false;
    let ulContent = '<li tabindex="0"></li>'.repeat(rows * cols);
    document.getElementById("desk").innerHTML = ulContent;

    initArray = [];
    for (let i = 0; i < rows; i++) {
        initArray[i] = [];
        for (let j = 0; j < cols; j++) {
            initArray[i][j] = false;

        }
    }

    let count = 0;
    while (count < rows * cols * minesPer) {
        let x = Math.floor(Math.random() * rows);
        let y = Math.floor(Math.random() * cols);

        if (!initArray[x][y]) {
            initArray[x][y] = true;
            count++;
        }
    }
    console.log(initArray);
}

function expandSection(a) {
    a.parentNode.parentNode.classList.toggle('expanded');
    a.parentNode.parentNode.classList.toggle('collapsed');
}

let matches = document.querySelectorAll('[name="level"]');

for (match in matches) {
    matches[match].onchange = function () {
        window.localStorage.setItem("level", this.value);
        buildDesk(this.value);
        restart();
    }
}

function buildDesk(val) {
    if (val === "0") {
        rows = 4;
        cols = 4;
        minesPer = 0.1;
    } else if (val === "1") {
        rows = 5;
        cols = 5;
        minesPer = 0.2;
    } else if (val === "2") {
        rows = 6;
        cols = 10;
        minesPer = 0.1;
    }
    document.getElementsByClassName('wrapper')[0].style.width = 26 * cols + "px";
}

function setCounter() {
    let startTime = new Date().getTime();
    indervalId = setInterval(function () {
        let now = new Date().getTime();
        seconds = Math.floor((now - startTime) / 1000);

        document.getElementById("timer").innerHTML = seconds;
        if (seconds < 0 || isFinished === true) {
            clearInterval(indervalId);
        }
    }, 100);
}

const checkbox = document.getElementById('sound');
if (window.localStorage.getItem('sound') === 'true' || window.localStorage.getItem('sound') === null) {
    checkbox.checked = true;
}
checkbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        window.localStorage.setItem("sound", true);

    } else {
        window.localStorage.setItem("sound", false);
    }
});

function setFlag(e) {
    if (e.target.tagName === 'LI' && isFinished === false) {
        const el = e.target;
        if (el.classList.length === 0) {
            el.className += "flagged";
            steps++;
            flags++;
            checkIfWon();
        } else if (el.classList.contains('flagged')) {
            el.classList.remove('flagged');
            steps--;
            flags--;
            checkIfWon();
        }
    }
}

function checkIfWon() {
    if (steps === rows * cols && flags < rows * cols * minesPer + 1) {
        if (window.localStorage.getItem("sound") !== "false") {
            const audio = new Audio("sounds/congratulations.mp3");
            audio.play();
        }

        setTimeout(function () {
            do {
                userName = prompt("Winner, what is your name?\n(Please letters and numbers only)");
            }
            while (userName && !/^([a-zA-Z0-9]+)$/.test(userName));


            if (userName) {
                winnerInfo = {name: userName, seconds: seconds, level: level};
                storeInfo();

            }
        }, 500);
        document.getElementById('start').value = 'Start';
        isFinished = true;
    }
}

function openCell(e) {
    if (e.target.tagName === 'LI' && isFinished === false && e.target.classList.length === 0) {
        steps++;
        checkIfWon();

        const child = e.target;
        const parent = child.parentNode;
        const index = Array.prototype.indexOf.call(parent.children, child);

        const x = Math.floor(index / cols);
        const y = index % cols;
        if (initArray[x][y] === true) {
            child.classList.add("gameover");
            if (window.localStorage.getItem("sound") !== "false") {
                const audio = new Audio("sounds/gameover.mp3");
                audio.play();
            }
            document.getElementById('gameover').classList.add('show');
            document.getElementById('start').value = 'Start';

            isFinished = true;

            for (let i = 0; i < (rows * cols); i++) {
                if (document.getElementById('desk').getElementsByTagName('li')[i].className === '') {
                    const x1 = Math.floor(i / cols);
                    const y1 = i % cols;
                    if (initArray[x1][y1] === true) {
                        document.getElementById('desk').getElementsByTagName('li')[i].className += "mine";

                    }
                }
            }
        } else {
            if (window.localStorage.getItem("sound") !== "false") {
                const audio = new Audio("sounds/tick.mp3");
                audio.play();
            }
            const mines = countMines(index);
            const classMines = "neighbor-" + mines;
            child.classList.add(classMines);
        }
    }
}

function onContextMenu(e) {
    e.preventDefault();
    if (document.getElementById('leftOrRight').classList.contains('checked') === false) {
        setFlag(e);
    } else {
        openCell(e);
    }
}

function onLeftClick(e) {
    if (document.getElementById('leftOrRight').classList.contains('checked') === false) {
        openCell(e);
    } else {
        setFlag(e);
    }
}

document.getElementById('desk').addEventListener('contextmenu', onContextMenu);
document.getElementById('desk').addEventListener('click', onLeftClick);
document.getElementById('desk').addEventListener('keyup', onKeyboard);

function onKeyboard(e) {
    if (e.key === 'Enter') {
        openCell(e);
    }
    if (e.key === 'm') {
        setFlag(e);
    }
}

function countMines(num) {
    const x = Math.floor(num / cols);
    const y = num % cols;

    let amtMines = 0;
    if (x > 0 && initArray[x - 1][y] === true) {
        amtMines++;
    }
    if (y > 0 && initArray[x][y - 1] === true) {
        amtMines++;
    }
    if (x < (rows - 1) && initArray[x + 1][y] === true) {
        amtMines++;
    }
    if (y < (cols - 1) && initArray[x][y + 1] === true) {
        amtMines++;
    }

    if (x > 0 && y > 0 && initArray[x - 1][y - 1] === true) {
        amtMines++;
    }
    if (y < (cols - 1) && x > 0 && initArray[x - 1][y + 1] === true) {
        amtMines++;
    }
    if (x < (rows - 1) && y > 0 && initArray[x + 1][y - 1] === true) {
        amtMines++;
    }
    if (x < (rows - 1) && y < (cols - 1) && initArray[x + 1][y + 1] === true) {
        amtMines++;
    }
    return amtMines;
}

function toggleLeftOrRight() {
    document.getElementById('leftOrRight').classList.toggle('checked');
}