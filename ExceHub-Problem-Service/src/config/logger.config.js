const winston = require("winston");
require("winston-mongodb");
const { LOG_DB_URL } = require("./server.config");
const { logToCosmos } = require("../clientapis/cosmosClient");
const { Writable } = require('stream');


const allowedTransports = [];


// With the help of stream anything you want to connect with winston.
const customStream = new Writable({
    write(chunk, encoding, callback) {
        const message = chunk.toString();
        console.log("Log intercepted in custom transport: ", message);
        logToCosmos("error", message);
        callback();
    }
})


const customStreamTransport = new winston.transports.Stream({
    stream: customStream,
    level: 'error',
});


allowedTransports.push(customStreamTransport);


// The below transport configuration enable logging on the console
allowedTransports.push(
    new winston.transports.Console({
        // OverRide the default formate
        format: winston.format.combine(
            winston.format.colorize(), // only colorizes the log level (not timestamp/message)
            winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
            winston.format.printf((log) => `${log.timestamp} [${log.level}] : ${log.message} `)
        )
    }));


// The below transport configuration enable logging in mongoDB
allowedTransports.push(
    new winston.transports.MongoDB({
        level: 'error',
        db: LOG_DB_URL,
        collection: 'logs',
    }))


// The below transport configuration enable logging in mongoDB
allowedTransports.push(
    new winston.transports.File({
        filename: 'app.log',
        level: 'error',
    }))


// create logger object
const logger = winston.createLogger({
    // this is Default formatting
    format: winston.format.combine(
        // First argument to the combine method is defining how we want the timestamp to come up
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        // Second argument to the combine method, which defines what is exactly going to be print log
        winston.format.printf((log) => `${log.timestamp} [${log.level.toUpperCase()}] : ${log.message} `)
    ),
    transports: allowedTransports,
})


module.exports = logger;