require('dotenv').config({ path: './.env' });


module.exports = {
    PORT: process.env.PORT || 8000,
    ATLAS_DB_URL: process.env.ATLAS_DB_URL,
    LOG_DB_URL: process.env.LOG_DB_URL,
    NODE_ENV: process.env.NODE_ENV || "development",
    COSMOS_ENDPOINT: process.env.COSMOS_ENDPOINT,
    COSMOS_KEY: process.env.COSMOS_KEY,
    COSMOS_DB_ID: process.env.COSMOS_DB_ID,
    COSMOS_CONTAINER_ID: process.env.COSMOS_CONTAINER_ID,
}