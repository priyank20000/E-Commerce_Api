const { createClient } = require('@redis/client');

const redisHost = process.env.REDIS_HOST || 'localhost';
const redisPort = process.env.REDIS_PORT || 6379;
const redisPassword = process.env.REDIS_PASSWORD || ''; // Optional if required

const client = createClient({
    url: `redis://${redisHost}:${redisPort}`,
    password: redisPassword
});

client.on('error', (err) => {
    console.error('Redis error:', err);
});

client.connect()
    .then(() => console.log('Redis client connected'))
    .catch((err) => console.error('Failed to connect to Redis:', err));

const getAsync = async (key) => {
    try {
        return await client.get(key);
    } catch (error) {
        console.error('Redis get error:', error);
        return null;
    }
};

const setAsync = async (key, value, ttl) => {
    try {
        await client.set(key, value, { EX: ttl });
    } catch (error) {
        console.error('Redis set error:', error);
    }
};

module.exports = {
    client,
    getAsync,
    setAsync
};
