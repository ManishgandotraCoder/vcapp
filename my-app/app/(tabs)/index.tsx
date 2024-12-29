import { Image, StyleSheet, Platform } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";

export default function HomeScreen() {
  const [providers, setProviders] = useState([]);
  const [user, setUser] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const getProviders = async () => {
    const response = await axios.get("http://localhost:3000/api/users/");
    setProviders(response.data);
  };
  useEffect(() => {
    getProviders();
  }, []);
  useEffect(() => {
    // Connect to your server. Update the URL/port as needed:
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    // On successful connection
    newSocket.on("connect", () => {
      console.log("Connected to server with socket id:", newSocket.id);
    });

    // Whenever the server emits a list of online users
    newSocket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);
  return (
    <div>
      <div style={styles.titleContainer}>
        <div style={{ padding: "20px", fontWeight: "bold", fontSize: "20px" }}>
          My Providers!
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          margin: "1rem 0",
        }}
      >
        <input
          type="text"
          value={localStorage.getItem("username") || user}
          onChange={(e) => setUser(e.target.value)}
          placeholder="Enter your name"
          style={{
            border: "1px solid #ccc",
            borderRadius: "4px",
            padding: "0.5rem",
            fontSize: "1rem",
            outline: "none",
            flex: "1",
          }}
        />
        <button
          style={{
            backgroundColor: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            padding: "0.5rem 1rem",
            cursor: "pointer",
            fontSize: "1rem",
          }}
          onClick={() => {
            localStorage.setItem(
              "username",
              localStorage.getItem("username") || user
            );

            socket?.emit("join", localStorage.getItem("username") || user);
          }}
        >
          Chat
        </button>
      </div>

      {providers.map((provider: any) => (
        <div
          key={provider.id} // or another unique field
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            margin: "10px 0",
            padding: "10px",
            backgroundColor: "#f9f9f9",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            cursor: "pointer", // optional, if it's clickable
          }}
        >
          <img
            src={provider?.profilePic}
            alt="profilePic"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
          <div style={{ fontSize: "1rem", fontWeight: 500, gap: 2 }}>
            {provider?.username}
            {onlineUsers.includes(provider.username) ? " 🟢" : " 🔴"} &nbsp;
          </div>
        </div>
      ))}
    </div>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: "absolute",
  },
});
