const { redisDB } = require("../db/redisDB");

const keyInPath = [
    '/building',
    '/time-booking'
]

const cache = async (req, res, next) => {
    // const isNotUseCache = !(process.env.USE_CACHE === "YES");
    // if (isNotUseCache) { return next(); }
    try {
        const path = (req.originalUrl || req.url)

        // const key = removeUrlParameter(url, 'cow').replace(fakeUrl, '')
        const key = getKeyFromPath(path)
        // const cowRule = getCOWRole(url)
        const cacheContent = await redisDB.get(key);
        if (cacheContent) {
            console.log('middleware cache ', key, cacheContent);
            res.json(cacheContent);
            return;
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                const isCache = (res.statusCode === 200) && key
                if (isCache) {
                    redisDB.set(key, JSON.parse(body))
                }
                res.sendResponse(body);
            };
            next();
        }
    } catch (error) {
        next()
        console.log(error);
    }
};

const getKeyFromPath = (path) => {
    return keyInPath.find(ele => path.includes(ele))
}

module.exports = {
    cache
}

// const clearCache = () => {
//     myCache.flushAll();
//     return myCache.getStats();
// };


// const getCOWRole = (url: string) => {
//     const cow: any = getParamFromUrl(url, 'cow')
//     let isReadCache = true
//     let isWriteCache = true
//     if (cow) {
//         const [read, write] = cow.split('')
//         isReadCache = read === '1'
//         isWriteCache = write === '1'
//     }
//     return {
//         isReadCache,
//         isWriteCache
//     }
// }

const removeUrlParameter = (url, paramKey) => {
    const urlObj = new URL(url);
    urlObj.searchParams.delete(paramKey);
    return urlObj.href;
}

const getParamFromUrl = (url, paramKey) => {
    const urlObj = new URL(url);
    return urlObj.searchParams.get(paramKey)
}
