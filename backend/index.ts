// src/index.ts
import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./src/config/db";
import userRoutes from "./src/routes/user.routes";

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Create HTTP server and Socket.IO server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*", // or specify your client URL, e.g., "http://localhost:3001"
  },
});

// Middleware
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);

// Root route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from the Node-TS-Mongo + Socket app!");
});

// ------------------------------------------
// In-memory store of online users (basic)
// Key: userId, Value: socket.id
// ------------------------------------------
const onlineUsers = new Map<string, string>();

// Socket.IO connection logic
io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  // Optionally, listen for an event that passes userId
  // (Requires your frontend to emit something like 'join' with userId)
  socket.on("join", (userId: string) => {
    console.log(`User ${userId} connected with socketId: ${socket.id}`);
    onlineUsers.set(userId, socket.id);

    // Broadcast the new online user to everyone (or just to friends, if needed)
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  // Socket disconnection
  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);

    // Remove user from online users
    // We need to find which userId was tied to this socket.id
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }

    // Broadcast updated online users
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

(async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
