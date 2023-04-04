import config from "./config.js";
import { ChatClient } from "dank-twitch-irc";
import io from "socket.io-client";
import { redis, updateTimer } from "./index.js";

const client = new ChatClient({ ignoreUnhandledPromiseRejections: true });

const se = io('https://realtime.streamelements.com', {
    transports: ['websocket']
});

client.on("ready", () => {
    console.log("[TMI] Connected")
    client.join(config.channelName);
});

client.on("close", (error) => {
    if (error) return console.error("Client closed due to error", error);
    console.error('Client closed without an error')
});

client.on("JOIN", ({ channelName }) => {
    console.log(`[TMI] Joined ${channelName}`)
});

const subTypes = new Set(["sub", "resub", "subgift", "anonsubgift", "anongiftpaidupgrade", "giftpaidupgrade"])
client.on("USERNOTICE", async (msg) => {
    try {
        if (!subTypes.has(msg.messageTypeID)) return

        const settings = JSON.parse(await redis.get("settings"))
        if (!settings) return

        const addedSeconds = settings.subs[`tier${msg.eventParams.subPlan / 1000 || '1'}`]
        const ms = await redis.incrby("timer", addedSeconds * 1000)
        updateTimer(ms, addedSeconds)
    } catch (e) {
        console.error(e)
    }
});

client.on("PRIVMSG", async (msg) => {
    try {
        if (!msg.isCheer()) return

        const settings = JSON.parse(await redis.get("settings"))
        if (!settings || settings.tips.bits.amount > msg.bits) return

        const addedSeconds = Math.floor(settings.tips.bits.time * (msg.bits / settings.tips.bits.amount))
        const ms = await redis.incrby("timer", addedSeconds * 1000)
        updateTimer(ms, addedSeconds)
    } catch (e) {
        console.error(e)
    }
});

client.connect();

se.on("connect_error", (err) => {
    console.log(`[SE] Connect error due to ${err.message}`);
});

se.on('connect', () => {
    console.log("[SE] Connected")
    se.emit('authenticate', { method: 'apikey', token: config.seKey })
})

se.on('disconnect', () => console.log('[SE] Disconnected'))

se.on('authenticated', (data) => {
    console.log(`[SE] Channel ${data.channelId} connected`)
})

se.on('unauthorized', console.error)

const handleEvent = async (event) => {
    try {
        if (event.type !== 'tip' || event.data.currency !== 'EUR') return

        const settings = JSON.parse(await redis.get("settings"))
        if (!settings || settings.tips.se.amount > event.data.amount) return

        const addedSeconds = Math.floor(settings.tips.se.time * (event.data.amount / settings.tips.se.amount))
        const ms = await redis.incrby("timer", addedSeconds * 1000)
        updateTimer(ms, addedSeconds)
    } catch (e) {
        console.error(e)
    }
}

se.on('event', handleEvent);
