## webSockets => full duplex connection. 
=> difference btw http and websocket connection
🌐 1️⃣ HTTP (Traditional Model)
🔹 How It Works

HTTP is a request–response protocol.
Client (browser, mobile app, etc.) must always initiate communication.
Server can only respond — it cannot send data until a client asks for it.

⚙️ Flow:

Client → sends a request (GET/POST/PUT/DELETE)
Server → processes it and sends a response
Connection → closed immediately after response


🔄 2️⃣ WebSocket (Modern Real-time Model)
🔹 How It Works

WebSocket creates a persistent TCP connection between client and server.
Both sides can send and receive messages anytime.
Once the connection is established, it remains open until closed by either side.

⚙️ Flow:

Client → initiates handshake (via HTTP upgrade)
Server → accepts and upgrades the connection
Now both → can send/receive messages freely
Connection → remains open (no repeated handshakes)