import config from './config.js';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import Redis from 'ioredis';
import rateLimit from 'express-rate-limit'
import queries from './queries.js';
import './events.js';

export const redis = new Redis();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { path: `${config.urlPath}/socket.io` });

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
})

const dirname = path.resolve();

app.set('trust proxy', true)

app.use(express.json());

app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) return res.sendStatus(400);
    next();
});

app.use(config.urlPath, express.static(dirname + '/client', { extensions: ['html'] }));

app.use(`${config.urlPath}/api`, apiLimiter)

app.post(`${config.urlPath}/api`, async (req, res) => {
    if (req.headers?.authorization !== config.password) return res.sendStatus(401)

    const json = req.body
    const execute = await queries[json.query]
    if (!execute) return res.sendStatus(400)

    try {
        const queryResult = await execute(json.data, req.ip)
        res.send(queryResult)
    } catch (e) {
        console.error(e)
        res.send({ success: false })
    }
});

io.on('connection', async (socket) => {
    const ms = await redis.get('fsb:timer')
    socket.emit('update time', { endTime: ms })
});

export const updateTimer = (endTime, addedTime) => {
    io.emit('update time', { endTime, addedTime })
}

httpServer.listen(config.port, () => console.log(`listening on port ${config.port}`));
