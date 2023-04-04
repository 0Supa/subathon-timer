import { redis, updateTimer } from "./index.js"

export default {
    "ping": () => {
        return { success: true }
    },
    "update:timer": async (data) => {
        if (data.startPause === true) {
            let paused
            let ms = Number(await redis.get('timer') || 0)
            const delta = await redis.get('timer-delta')

            if (!delta) {
                await redis.set('timer-delta', Date.now())
                paused = true
            } else {
                await redis.del('timer-delta')
                ms += Date.now() - delta
                paused = false
                await redis.set('timer', ms)
            }

            updateTimer(ms)
            return { success: true, paused }
        }

        const msToAdd = (data.hours * 3_600_000) +
            (data.minutes * 60_000) +
            (data.seconds * 1_000)

        if (isNaN(msToAdd)) return { success: false }
        const ms = msToAdd + Date.now()

        await redis.set('timer', ms)
        updateTimer(ms)

        return { success: true }
    },
    "update:settings": async (data) => {
        await redis.set('settings', JSON.stringify(data))
        return { success: true }
    },
    "get:settings": async () => {
        const settings = JSON.parse(await redis.get('settings'))
        return { success: true, data: { settings } }
    }
}
