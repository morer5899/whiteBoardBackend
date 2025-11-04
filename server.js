import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

dotenv.config();

const app = express();
const server = http.createServer(app);

let elements = [];

app.use(express.json());
app.use(
  cors({
    origin: "https://whiteboard-frontend-gamma.vercel.app",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: "https://whiteboard-frontend-gamma.vercel.app",
    methods: ["GET", "POST"],
  },
});


io.on("connect", (socket) => {
  console.log("user connected ==>", socket.id);
  io.to(socket.id).emit("whiteboard-state", elements);

  socket.on("element-update", (elementData) => {
    updateElements(elementData)
    socket.broadcast.emit("element-update", elementData)
  })

  socket.on("whiteboard-clear", () => { elements=[]
    socket.broadcast.emit("whiteboard-clear")
  })

  socket.on("cursor-position",(cursorData)=>{
    socket.broadcast.emit("cursor-position",{
      ...cursorData,
      userId:socket.id
    })
  })
})

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(` Server is running on port ${PORT}`);
});

const updateElements = (elementData) => {
  const index = elements.findIndex(element => element.id === elementData.id)
  if (index === -1) elements.push(elementData)
  elements[index] = elementData;
}
