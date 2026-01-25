import Redis from "ioredis";

import ServerConfig from "./server.config";

const redisConfig = {
    port: ServerConfig.REDIS_PORT,
    host: ServerConfig.REDIS_HOST,
    maxRetriesPerRequest: null, // This is the crucial part
};

const redisConnection = new Redis(redisConfig);

export default redisConnection;
