import { redis, updateTimer } from "./index.js"

export default {
    "ping": () => {
        return { success: true }
    },
    "update:timer": async (data) => {
        const msToAdd = (data.hours * 3_600_000) +
            (data.minutes * 60_000) +
            (data.seconds * 1_000)

        if (isNaN(msToAdd)) return { success: false }
        const ms = msToAdd + Date.now()

        await redis.set('fsb:timer', ms)
        updateTimer(ms)

        return { success: true }
    },
    "update:settings": async (data) => {
        await redis.set('fsb:settings', JSON.stringify(data))
        return { success: true }
    },
    "get:settings": async () => {
        const settings = JSON.parse(await redis.get('fsb:settings'))
        return { success: true, data: settings }
    }
}
