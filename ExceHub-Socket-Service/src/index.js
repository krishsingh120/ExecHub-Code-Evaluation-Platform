const bodyParser = require("body-parser");
const { createServer } = require("http");
const { Server } = require("socket.io");
const express = require("express");
const Redis = require("ioredis");

const { PORT } = require("./config/server.config");

const app = express();
const redisCache = new Redis(); // Create redis client

const httpServer = createServer(app);
app.use(bodyParser.json());

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5500",
    methods: ["GET", "POST"],
  },
});

app.get("/", (req, res) => {
  res.send("hello");
});

io.on("connection", (socket) => {
  console.log("A user connected " + socket.id);
  socket.on("setUserId", async (userId) => {
    console.log("Setting user id to connection id", userId, socket.id);
    await redisCache.set(userId, socket.id);
  });

  socket.on("getConnectionId", async (userId) => {
    const connId = await redisCache.get(userId);
    console.log("Getting connection id for user id", userId, connId);
    socket.emit("connectionId", connId);
    const everything = await redisCache.keys("*");

    console.log(everything);
  });
});

app.post("/sendPayload", async (req, res) => {
  console.log(req.body);
  const { userId, payload } = req.body;
  if (!userId || !payload) {
    return res.status(400).send("Invalid request");
  }
  const socketId = await redisCache.get(userId);


  if (socketId) {
    io.to(socketId).emit("submissionPayloadResponse", payload);
    return res.send("Payload sent successfully");
  } else {
    return res.status(404).send("User not connected");
  }
});

httpServer.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
