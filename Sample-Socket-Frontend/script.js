const socket = io("http://localhost:4000");

const userId = "1";

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded");

  socket.on("connect", () => {
    console.log("Connected to server", socket.id);
  });

  document.getElementById("btn").addEventListener("click", () => {
    console.log("Emitting set user id");
    socket.emit("setUserId", userId);
  });

  document.getElementById("connectionBtn").addEventListener("click", () => {
    console.log("Emitting get connection id");
    socket.emit("getConnectionId", userId);
  });

  socket.on("connectionId", (data) => {
    document.getElementById("connectionResponse").textContent = data;
  });

  socket.on("submissionPayloadResponse", (data) => {
    console.log(data);

    document.getElementById("submissionResponse").textContent =
      JSON.stringify(data);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected to server");
  });
});
