const minutes = document.getElementById("minutes");
const seconds = document.getElementById("seconds");
const stateText = document.getElementById("state-text");
const btnStart = document.getElementById("btn-start");
const btnMoreMinutes = document.getElementById("moreMinutes");
const btnLessMinutes = document.getElementById("lessMinutes");
const btnMoreSeconds = document.getElementById("moreSeconds");
const btnLessSeconds = document.getElementById("lessSeconds");
const quoteContainer = document.querySelector(".quote-container");
const quoteText = document.querySelector(".quote-text");
const quoteAuthor = document.querySelector(".quote-author");
const progressContainer = document.querySelector(".progress");
const progressBar = document.querySelector(".progress-bar");

//  variables globales
let minutesValue = 25;
let secondsValue = 0;
let timer;
let workCounter = 1;
let quotesData

// validators
let isTimerRunning = false;
let isWorkingTimeSet = false;
let isRestTimeSet = false;
let isWorkingTimeRunning = false;

// times
let workingMinutes = 25;
let workingSeconds = 0;
let restMinutes = 0;
let restSeconds = 2;

// 
// LISTENERS
// 
// minutos
btnMoreMinutes.addEventListener("click", function () {
    minutesValue += 1;
    setDigitsToScreen();
});

btnLessMinutes.addEventListener("click", function () {
    if (minutesValue <= 0) {
        return;
    }
    minutesValue -= 1;
    setDigitsToScreen();
});

// segundos
btnMoreSeconds.addEventListener("click", function () {
    if (secondsValue >= 59) {
        addMinutes();
        return;
    }
    secondsValue += 1;
    setDigitsToScreen();
});

btnLessSeconds.addEventListener("click", function () {
    if (secondsValue <= 0) {
        if (minutesValue > 0) {
            reduceMinutes();
            return;
        }
        return;
    }
    secondsValue -= 1;
    setDigitsToScreen();
});

// btnStart handlers
btnStart.addEventListener("click", function () {
    getQuotes();
    if (stateText.innerHTML.includes("Set")) {
        validateTimers();
        return
    }
    alterPauseContinue();
});

function alterPauseContinue() {
    if (isTimerRunning) {
        // update web
        isTimerRunning = false;
        showItems();
        btnStart.innerHTML = "Continue";
        clearInterval(timer);
    } else {
        isTimerRunning = true;
        hideItems();
        btnStart.innerHTML = "Pause";
        timer = setInterval(runTimer, 1000);
    }
}
function validateTimers() {
    if (!isWorkingTimeSet) {
        // save work timers
        workingMinutes = parseInt(minutes.innerHTML);
        workingSeconds = parseInt(seconds.innerHTML);
        //  update gui
        stateText.innerHTML = "Set rest time";
        // suggest rest time
        minutesValue = 5;
        secondsValue = 0;
        setDigitsToScreen();
        isWorkingTimeSet = true;
        btnStart.innerHTML = "Start";
        return;
    } else if (!isRestTimeSet) {
        // save rest timers
        restMinutes = parseInt(minutes.innerHTML);
        restSeconds = parseInt(seconds.innerHTML);
        // update timer to start working
        minutesValue = workingMinutes;
        secondsValue = workingSeconds;
        // update gui
        setDigitsToScreen();
        isRestTimeSet = true;
        stateText.innerHTML = `Work time #${workCounter}`;
        isWorkingTimeRunning = true;
        progressContainer.classList.toggle("hide")
        quoteText.innerHTML = quotesData.content
        quoteAuthor.innerHTML = `-${quotesData.author}`
        quoteContainer.classList.toggle("hide")
        alterPauseContinue()
    }
}

function runTimer() {
    const percentage = calculateProgressBarPercentage()
    progressBar.style.width = `${percentage}%`
    progressBar.setAttribute("aria-valuenow", percentage);
    if (secondsValue == 0 && minutesValue == 0) {
        getQuotes();
        progressContainer.classList.toggle("hide");
        if (isWorkingTimeRunning) {
            playSound()
            // cambiar valores para el tiempo de descanso
            stateText.innerHTML = `Rest time #${workCounter}`;
            minutesValue = restMinutes;
            secondsValue = restSeconds;
            isWorkingTimeRunning = false;
            if (workCounter == 4) {
                workCounter = 0;
                [minutesValue, secondsValue] = calculateLongRestTime(restMinutes, restSeconds)
            }
            setDigitsToScreen();
            workCounter += 1;
            isTimerRunning = false;
            clearInterval(timer);
            btnStart.innerHTML = "Start";
            return;
        } else {
            playSound()
            stateText.innerHTML = `Work time #${workCounter}`;
            minutesValue = workingMinutes;
            secondsValue = workingSeconds;
            isWorkingTimeRunning = true;
            setDigitsToScreen();
            isTimerRunning = false;
            clearInterval(timer);
            btnStart.innerHTML = "Start";
            return;
        }
    }

    if (secondsValue == 0) {
        reduceMinutes();
    }

    secondsValue -= 1;
    setDigitsToScreen();
}

function reduceMinutes() {
    secondsValue = 60;
    minutesValue -= 1;
    setDigitsToScreen();
}

function addMinutes() {
    secondsValue = 0;
    minutesValue += 1;
    setDigitsToScreen();
}

function setDigitsToScreen() {
    minutes.innerHTML =
        minutesValue.toString().length >= 2 ? minutesValue : `0${minutesValue}`;

    seconds.innerHTML =
        secondsValue.toString().length >= 2 ? secondsValue : `0${secondsValue}`;
}

function hideItems() {
    btnMoreMinutes.classList.add("hide");
    btnLessMinutes.classList.add("hide");
    btnMoreSeconds.classList.add("hide");
    btnLessSeconds.classList.add("hide");
}

function showItems() {
    btnMoreMinutes.classList.remove("hide");
    btnLessMinutes.classList.remove("hide");
    btnMoreSeconds.classList.remove("hide");
    btnLessSeconds.classList.remove("hide");
}

function playSound() {
    const audio = new Audio("assets/sounds/end_sound.mp3");
    audio.play()
}

function calculateProgressBarPercentage() {
    const currentTime = minutesValue * 60 + secondsValue;
    const totalTime = isWorkingTimeRunning ? workingMinutes * 60 + workingSeconds : restMinutes * 60 + restSeconds;
    return (currentTime * 100 / totalTime).toFixed(0)
}

function calculateLongRestTime(minutesVar, secondsVar) {
    const defaultTime = minutesVar * 60 + secondsVar;
    const secondsTime = defaultTime * 3;

    const totalMinutes = Math.floor(secondsTime / 60);
    const totalSeconds = secondsTime % 60;
    return [totalMinutes, totalSeconds];
}

async function getQuotes() {
    const data = await fetch("https://api.quotable.io/quotes/random?tags=motivational");
    const [jsonData] = await data.json();
    quotesData = jsonData;
}

setDigitsToScreen();
getQuotes();
