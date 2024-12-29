// src/index.ts
import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { connectDB } from "./src/config/db";
import userRoutes from "./src/routes/user.routes";
import cors from "cors";
import User, { statusType } from "./src/models/User";

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
const corsOptions = {
  origin: "*", // or an array of domains
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // if you need to allow cookies/auth headers
};
app.use(cors(corsOptions));

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

  socket.on("join", (userId: string) => {
    console.log(`User ${userId} connected with socketId: ${socket.id}`);

    // 1. Store in-memory tracking
    onlineUsers.set(userId, socket.id);

    // 2. Update user status in DB
    User.findOneAndUpdate(
      { username: userId }, // <--- This looks for a user document by 'username'
      { status: statusType.online },
      { new: true } // returns the updated document
    )
      .then((updatedUser) => {
        console.log("User status updated:", updatedUser);
      })
      .catch((err) => console.error("Error updating user status:", err));

    // 3. Broadcast updated online user list
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);

    // 4. Remove user from online users Map
    for (const [userId, sockId] of onlineUsers.entries()) {
      if (sockId === socket.id) {
        onlineUsers.delete(userId);

        // 5. Update user status to 'offline'
        //    Note here you use `findByIdAndUpdate` whereas above you used `findOneAndUpdate`.
        //    Make sure `userId` is the actual `_id` if you want to use findByIdAndUpdate.
        User.findByIdAndUpdate(
          userId,
          { status: statusType.offline },
          { new: true }
        ).catch((err) => console.error("Error setting user offline:", err));

        break;
      }
    }

    // 6. Broadcast updated online user list again
    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

(async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
