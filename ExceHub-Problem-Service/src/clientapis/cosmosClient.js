const { CosmosClient } = require("@azure/cosmos");
const {
    COSMOS_ENDPOINT,
    COSMOS_CONTAINER_ID,
    COSMOS_DB_ID,
    COSMOS_KEY,
} = require("../config/server.config");


// connecting your code to cosmos DB
const endpoint = COSMOS_ENDPOINT;
const key = COSMOS_KEY;
const databaseId = COSMOS_DB_ID;
const containerId = COSMOS_CONTAINER_ID;


const client = new CosmosClient({ endpoint, key });
const database = client.database(databaseId);
const container = database.container(containerId);


// add function
async function logToCosmos(level, message) {
    try {
        // structure of the document we will store in cosmos db
        await container.items.create({
            timeStamp: new Date().toISOString(),
            level: level,
            message: message,
        });

        console.log("Log entry created in cosmos db.");
    } catch (error) {
        console.log("Error logging to cosmos DB : ", error);
    }
}

module.exports = {
    logToCosmos
}