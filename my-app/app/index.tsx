import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
// import axios from "axios";
import { io, Socket } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function HomeScreen() {
  const [providers, setProviders] = useState<any[]>([]);
  const [user, setUser] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  useEffect(() => {
    const fetchUsername = async () => {
      const storedUsername = await AsyncStorage.getItem("username");
      if (storedUsername) {
        setUser(storedUsername);
      }
    };
    fetchUsername();
  }, []);

  useEffect(() => {
    getProviders();
  }, []);

  const getProviders = async () => {
    fetch("http://localhost:3000/api/users/")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Handle the providers data
        console.log(data);
        setProviders(data);
      })
      .catch((error) => {
        console.error("Error fetching providers:", error);
        // Optionally, display a user-friendly message in the UI
      });
    // try {
    //   const response = await axios.get("http://localhost:3000/api/users/");
    //   setProviders(response.data);
    // } catch (error) {
    //   console.error("Error fetching providers:", error);
    // }
  };

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server with socket id:", newSocket.id);
    });

    newSocket.on("onlineUsers", (users: string[]) => {
      setOnlineUsers(users);
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleChatJoin = () => {
    if (!user.trim() || !socket) return;
    AsyncStorage.setItem("username", user);
    socket.emit("join", user);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.titleText}>My Providers!</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          value={user}
          onChangeText={(text) => setUser(text)}
          placeholder="Enter your name"
          style={styles.input}
        />
        <TouchableOpacity style={styles.chatButton} onPress={handleChatJoin}>
          <Text style={styles.chatButtonText}>Chat</Text>
        </TouchableOpacity>
      </View>

      {onlineUsers.map((provider) => {
        const foundProvider = providers.find(
          (item) => item.username === provider
        );
        return (
          <View style={styles.providerCard} key={provider}>
            {foundProvider?.profilePic && (
              <Image
                source={{ uri: foundProvider.profilePic }}
                style={styles.providerImage}
              />
            )}
            <Text
              style={styles.providerName}
              onPress={() => {
                window.location.href = `/video?provider=${provider}`;
              }}
            >
              {provider} 🟢
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  titleContainer: {
    marginBottom: 16,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  inputContainer: {
    flexDirection: "row",
    marginVertical: 16,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    marginRight: 8,
    paddingHorizontal: 8,
    height: 40,
    borderRadius: 4,
  },
  chatButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
  },
  chatButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  providerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  providerImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    resizeMode: "cover",
  },
  providerName: {
    fontSize: 16,
    fontWeight: "500",
  },
});
