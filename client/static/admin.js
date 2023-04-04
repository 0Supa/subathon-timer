import ky from 'https://cdn.jsdelivr.net/npm/ky@0.33.3/+esm'

const logout = document.getElementById("logout")

const setTimer = document.getElementById("setTimer")
const pauseTimer = document.getElementById("pauseTimer")
const timerHours = document.getElementById("timer-h")
const timerMins = document.getElementById("timer-m")
const timerSecs = document.getElementById("timer-s")

const saveSettings = document.getElementById("saveSettings")
const seTime = document.getElementById("dono-time")
const seAmount = document.getElementById("dono-am")
const bitsTime = document.getElementById("bits-time")
const bitsAmount = document.getElementById("bits-am")
const tier1 = document.getElementById("sub1-time")
const tier2 = document.getElementById("sub2-time")
const tier3 = document.getElementById("sub3-time")

const password = localStorage.getItem('password')
if (!password) window.location.replace('index')

const buttonMessage = (elm, message) => {
    const oldValue = elm.innerHTML
    elm.disabled = true
    elm.innerHTML = message

    setTimeout(() => {
        elm.disabled = false
        elm.innerHTML = oldValue
    }, 2000);
}

const loadSettings = async () => {
    try {
        const { data } = await ky.post("api", {
            throwHttpErrors: false,
            json: { query: "get:settings" },
            headers: { authorization: password }
        }).json()

        seTime.value = data.tips.se.time
        seAmount.value = data.tips.se.amount
        bitsTime.value = data.tips.bits.time
        bitsAmount.value = data.tips.bits.amount
        tier1.value = data.subs.tier1
        tier2.value = data.subs.tier2
        tier3.value = data.subs.tier3
    } catch (e) {
        console.error(e)
    }
}
loadSettings()

logout.addEventListener("click", () => {
    localStorage.clear()
    window.location.replace('index')
});

setTimer.addEventListener("click", async () => {
    setTimer.disabled = true

    if (!timerHours.value || !timerMins.value || !timerSecs.value) return buttonMessage(setTimer, 'Please fill in all the fields')

    const data = await ky.post("api", {
        throwHttpErrors: false,
        json: {
            query: "update:timer",
            data: {
                hours: Number(timerHours.value),
                minutes: Number(timerMins.value),
                seconds: Number(timerSecs.value)
            }
        },
        headers: { authorization: password }
    }).json()

    if (data.success) buttonMessage(setTimer, 'Timer Updated')
    else buttonMessage(setTimer, 'An error occurred!')
});

pauseTimer.addEventListener("click", async () => {
    pauseTimer.disabled = true

    const data = await ky.post("api", {
        throwHttpErrors: false,
        json: {
            query: "update:timer",
            data: {
                startPause: true
            }
        },
        headers: { authorization: password }
    }).json()

    if (data.success) buttonMessage(pauseTimer, `Timer ${data.paused ? 'Paused' : 'Resumed'}`)
    else buttonMessage(pauseTimer, 'An error occurred!')
})

saveSettings.addEventListener("click", async () => {
    saveSettings.disabled = true

    if (!seTime.value || !seAmount.value || !bitsTime.value || !bitsAmount.value || !tier1.value || !tier2.value || !tier3.value)
        return buttonMessage(saveSettings, 'Please fill in all the fields')

    const data = await ky.post("api", {
        throwHttpErrors: false,
        json: {
            query: "update:settings",
            data: {
                tips: {
                    se: {
                        time: Number(seTime.value),
                        amount: Number(seAmount.value)
                    },
                    bits: {
                        time: Number(bitsTime.value),
                        amount: Number(bitsAmount.value)
                    }
                },
                subs: {
                    tier1: Number(tier1.value),
                    tier2: Number(tier2.value),
                    tier3: Number(tier3.value)
                }
            }
        },
        headers: { authorization: password }
    }).json()

    if (data.success) buttonMessage(saveSettings, 'Settings Saved')
    else buttonMessage(saveSettings, 'An error occurred!')
});
