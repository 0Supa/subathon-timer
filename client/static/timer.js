const socket = io('', {
    path: `/${window.location.pathname.split('/')[1]}/socket.io`,
    transports: ["websocket"]
});

const timer = document.getElementById('timer')
const widehardo = document.getElementById('widehardo')
const addedTimeEl = document.getElementById('addedTime')

let timeEnd;
let timeDelta;

function msToTime(duration) {
    var seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)));

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
}

let wTimeout
const hideWideHardo = () => {
    clearTimeout(wTimeout);
    wTimeout = setTimeout(() => {
        widehardo.style.opacity = ""
    }, 4000);
}

socket.on('disconnect', () => {
    console.log('Socket Disconnected')
})

socket.on('connect', () => {
    console.log(`Socket Connected`)
})

socket.on('update time', (data) => {
    if (data.addedTime) {
        if (!widehardo.style.opacity) {
            addedTimeEl.innerHTML = data.addedTime
            widehardo.style.opacity = "100"
            hideWideHardo()
        } else {
            addedTimeEl.innerHTML = Number(addedTimeEl.innerHTML) + data.addedTime
            hideWideHardo()
        }
    }

    timeEnd = data.endTime
    timeDelta = data.delta || null
})

setInterval(() => {
    if (timeEnd === undefined) return

    let curr = Date.now()
    if (timeDelta) {
        timer.style.color = '#ff675c'
        curr = timeDelta
    } else
        timer.style.color = '#ffffff'

    const ms = timeEnd - curr
    if (ms < 1000) return timer.innerHTML = '00:00:00<img src="static/fizzySleep.png">'
    timer.innerHTML = msToTime(ms)
}, 1000);
