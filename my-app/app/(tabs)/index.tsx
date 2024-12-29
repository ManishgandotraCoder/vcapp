import React, { useEffect, useState } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";

export default function HomeScreen() {
  // State
  const [providers, setProviders] = useState<any[]>([]);
  const [user, setUser] = useState<string>(() => {
    // Initialize from Local Storage if available
    return localStorage.getItem("username") || "";
  });
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  /**
   * Fetch all providers from the server
   */
  const getProviders = async () => {
    try {
      const response = await axios.get("http://localhost:3000/api/users/");
      setProviders(response.data);
    } catch (error) {
      console.error("Error fetching providers:", error);
    }
  };

  // Fetch providers on mount
  useEffect(() => {
    getProviders();
  }, []);

  // Initialize Socket.io connection on mount
  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server with socket id:", newSocket.id);
    });

    newSocket.on("onlineUsers", (users: string[]) => {
      setOnlineUsers(users);
    });

    // Clean up socket connection on component unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  /**
   * Handle the "Chat" button click:
   *  1. Save username to Local Storage
   *  2. Emit "join" event to server
   */
  const handleChatJoin = () => {
    if (!user.trim() || !socket) return;

    // Save to localStorage
    localStorage.setItem("username", user);
    // Emit the join event
    socket.emit("join", user);
  };

  return (
    <div>
      <div style={styles.titleContainer}>
        <div style={styles.titleText}>My Providers!</div>
      </div>

      {/* Input & Button Section */}
      <div style={styles.inputContainer}>
        <input
          type="text"
          value={user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Enter your name"
          style={styles.input}
        />
        <button style={styles.chatButton} onClick={handleChatJoin}>
          Chat
        </button>
      </div>

      {/* List of Providers */}
      {providers.map((provider) => (
        <div key={provider.id} style={styles.providerCard}>
          <img
            src={provider?.profilePic}
            alt="profilePic"
            style={styles.providerImage}
          />
          <div style={styles.providerName}>
            {provider?.username}
            {onlineUsers.includes(provider.username) ? " 🟢" : " 🔴"}
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = {
  titleContainer: {
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    gap: "8px",
    marginBottom: "1rem",
  },
  titleText: {
    padding: "20px",
    fontWeight: "bold" as const,
    fontSize: "20px",
  },
  inputContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    margin: "1rem 0",
  },
  input: {
    border: "1px solid #ccc",
    borderRadius: "4px",
    padding: "0.5rem",
    fontSize: "1rem",
    outline: "none" as const,
    flex: 1,
  },
  chatButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "4px",
    padding: "0.5rem 1rem",
    cursor: "pointer",
    fontSize: "1rem",
  },
  providerCard: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "10px 0",
    padding: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    cursor: "pointer",
  },
  providerImage: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    objectFit: "cover" as const,
  },
  providerName: {
    fontSize: "1rem",
    fontWeight: 500,
    gap: "2px",
  },
};
