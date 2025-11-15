import { useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext'; // Adjust path if needed

// --- TYPE FIXES ---
type Conversation = {
  id: number;
  job_id?: number;
  client_id?: number;
  freelancer_id?: number;
  other_user_id?: number;
};

type Message = {
  id: number;
  senderid?: number;
  sender_id?: number;
  receiverid?: number;
  content: string;
  sent_at: string;
};
// -----------------

export default function MessagesScreen() {
  const wsRef = useRef<WebSocket | null>(null);
  const { token, userId } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const { jobId, otherUserId } = useLocalSearchParams();

  useEffect(() => {
    if (!token || !userId) {
      setErrorMsg("You are not logged in. Please log in to view your inbox.");
      return;
    }
    async function fetchData() {
      try {
        const res = await fetch("http://localhost:8000/conversations", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Conversation[] = await res.json();
        setConversations(Array.isArray(data) ? data : []);
        setErrorMsg("");
        if (jobId && otherUserId && !selectedConversation) {
          const match = data.find(conv =>
            (conv.job_id?.toString() === jobId.toString()) &&
            (
              conv.client_id?.toString() === otherUserId.toString() ||
              conv.freelancer_id?.toString() === otherUserId.toString()
            )
          );
          if (match) setSelectedConversation(match);
        }
      } catch {
        setErrorMsg("Could not load your conversations.");
        setConversations([]);
      }
    }
    fetchData();
  }, [token, userId, jobId, otherUserId, selectedConversation]);

  useEffect(() => {
    async function fetchMessages() {
      if (!selectedConversation || !selectedConversation.id || !token) return;
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:8000/conversations/${selectedConversation.id}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: Message[] = await res.json();
        setMessages(Array.isArray(data) ? data : []);
      } catch {
        setErrorMsg("Could not load messages.");
        setMessages([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMessages();
  }, [selectedConversation, token]);

  useEffect(() => {
    if (selectedConversation && selectedConversation.id) {
      const ws: WebSocket = new WebSocket(`ws://localhost:8000/ws/chat/${selectedConversation.id}`);
      wsRef.current = ws;
      ws.onmessage = event => {
        const msg: Message = JSON.parse(event.data);
        setMessages(prev => [...prev, msg]);
      };
      ws.onclose = () => { wsRef.current = null; };
      return () => { ws.close(); };
    }
  }, [selectedConversation]);

  function getReceiverId() {
    if (!selectedConversation || !userId) return null;
    if (selectedConversation.client_id && selectedConversation.freelancer_id) {
      return selectedConversation.client_id === userId
        ? selectedConversation.freelancer_id
        : selectedConversation.client_id;
    }
    return selectedConversation.other_user_id || null;
  }

  async function sendMessage() {
    const cleanedText = text.trim();
    if (!cleanedText || !selectedConversation || !userId) return;
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        conversationid: selectedConversation.id,
        senderid: userId,
        receiverid: getReceiverId(),
        content: cleanedText,
        sent_at: new Date().toISOString()
      }));
      setText("");
      setErrorMsg("");
    } else {
      setErrorMsg("Real-time connection not established.");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#222" }}>
      <View style={{ flexDirection: "row", flex: 1 }}>
        <View style={{
          width: selectedConversation ? "40%" : "100%",
          padding: 20,
          borderRightWidth: selectedConversation ? 1 : 0,
          borderColor: "#666"
        }}>
          <Text style={{ fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 12 }}>Your Inbox</Text>
          {errorMsg ? (
            <Text style={{ color: "red", marginBottom: 12 }}>{errorMsg}</Text>
          ) : null}
          <ScrollView>
            {conversations.length > 0 ? conversations.map(conv => (
              <TouchableOpacity
                key={conv.id}
                style={{
                  marginBottom: 10,
                  padding: 12,
                  borderWidth: selectedConversation?.id === conv.id ? 2 : 1,
                  borderRadius: 4,
                  borderColor: selectedConversation?.id === conv.id ? "#0066cc" : "#666",
                  backgroundColor: selectedConversation?.id === conv.id ? "#333" : "#222",
                }}
                onPress={() => setSelectedConversation(conv)}
              >
                <Text style={{ color: "#fff" }}>Conversation #{conv.id}</Text>
                <Text style={{ color: "#aaa", fontSize: 12 }}>Click to open chat</Text>
              </TouchableOpacity>
            )) : (
              <Text style={{ color: "#999", padding: 20, textAlign: "center" }}>
                {!errorMsg && "No conversations found"}
              </Text>
            )}
          </ScrollView>
        </View>
        {selectedConversation && (
          <View style={{ width: "60%", padding: 20, flex: 1 }}>
            <View style={{ marginBottom: 20, borderBottomWidth: 1, borderColor: "#666", paddingBottom: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "bold" }}>Chat - Conversation #{selectedConversation.id}</Text>
              <TouchableOpacity
                onPress={() => setSelectedConversation(null)}
                style={{ backgroundColor: "#666", padding: 8, borderRadius: 4 }}
              >
                <Text style={{ color: "#fff" }}>Close Chat</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ borderWidth: 1, borderColor: "#666", height: 400, backgroundColor: "#333", marginBottom: 10, borderRadius: 4, padding: 10 }}
              contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : messages.length === 0 ? (
                <Text style={{ color: "#fff" }}>No messages yet. Start the conversation!</Text>
              ) : (
                messages.map(msg => (
                  <View
                    key={msg.id || `${msg.senderid}-${msg.sent_at}`}
                    style={{
                      padding: 8,
                      marginBottom: 8,
                      alignSelf: msg.sender_id === userId ? "flex-end" : "flex-start",
                      backgroundColor: msg.sender_id === userId ? "#0066cc" : "#555",
                      borderRadius: 8,
                      maxWidth: "70%",
                    }}
                  >
                    <Text style={{ color: "#fff" }}>
                      <Text style={{ fontWeight: "bold" }}>
                        {msg.sender_id === userId ? "You" : `User ${msg.sender_id}`}:
                      </Text> {msg.content}
                    </Text>
                    <Text style={{ fontSize: 10, color: "#ccc", marginTop: 4, opacity: 0.7 }}>
                      {new Date(msg.sent_at).toLocaleString()}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
            {errorMsg ? (
              <Text style={{ color: "#ff4f4f", marginBottom: 8 }}>{errorMsg}</Text>
            ) : null}
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TextInput
                value={text}
                onChangeText={setText}
                onSubmitEditing={sendMessage}
                placeholder="Type your message..."
                style={{
                  flex: 1, padding: 10, borderRadius: 4,
                  borderWidth: 1, borderColor: "#666",
                  backgroundColor: "#444", color: "#fff"
                }}
              />
              <TouchableOpacity
                onPress={sendMessage}
                disabled={!text.trim()}
                style={{
                  backgroundColor: text.trim() ? "#0066cc" : "#666",
                  paddingHorizontal: 16, borderRadius: 4,
                  alignItems: "center", justifyContent: "center"
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
