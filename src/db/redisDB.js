const redis = require('redis');

const TIME_ONE_DAY = 86400
const EXPIRE_TIME_DAY = 5 * TIME_ONE_DAY

const client = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PWD,
});

client.on('connect', function () {
    console.log('Redis Database connected' + '\n')
});

client.on('reconnecting', function () {
    console.log('Redis client reconnecting');
});

client.on('ready', function () {
    console.log('Redis client is ready');
});

client.on('error', function (err) {
    console.log('Something went wrong ' + err);
});

client.on('end', function () {
    console.log('\nRedis client disconnected');
    console.log('Server is going down now...');
    process.exit();
});

const set = (key, value) => {
    client.set(key, JSON.stringify(value), 'EX', EXPIRE_TIME_DAY);
    return 'done';
}

const get = (key) => {
    return new Promise((resolve, reject) => {
        client.get(key, function (error, result = {}) {
            if (error) {
                console.log(error);
                reject(error);
            }
            try {
                resolve(JSON.parse(result));

            } catch {
                resolve(result);

            }
        });
    });
}

const del = async (key) => {
    console.log("🚀 ~ file: redisDB.js ~ line 55 ~ del ~ key", key)
    return (await client.del(key))
}

const close = async () => {
    return await client.quit();
}

const delAllKey = () => {
    client.flushall((err, success) => {
        if (err) {
            throw new Error(err);
        }
        console.log('remove all key success'); // will be true if successfull
    });
}

const getAllKey = () => {
    return new Promise((resolve, reject) => {
        client.keys('*', (err, keys) => {
            if (err) {
                reject(err)
            }
            resolve(keys)
        })
    })
}

// getAllKey()
// delAllKey()

module.exports.redisDB = {
    set,
    get,
    del,
    delAllKey,
    getAllKey,
    close
}