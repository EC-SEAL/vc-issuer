
const NodeCache = require("node-cache");
const claimsCache = new NodeCache();

function getCache() {
    return claimsCache;
}

export { getCache };