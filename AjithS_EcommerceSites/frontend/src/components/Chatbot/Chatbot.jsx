import React, { useState } from "react";
import "./Chatbot.css";
import chatbotIcon from "../Assets/chatbot.png";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! I can help you with products, services, and enterprise units on this site. What would you like to know?" }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    const newMessages = [...messages, { sender: "user", text: userMessage }];
    setMessages(newMessages);
    setInputValue("");

    try {
      const res = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();
      if (data.reply) {
        newMessages.push({ sender: "bot", text: data.reply });
        setMessages([...newMessages]);
      } else {
        throw new Error("No reply from server");
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      newMessages.push({ sender: "bot", text: "Sorry, I'm having trouble responding right now. " + error.message });
      setMessages([...newMessages]);
    }
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen && (
        <div className="chat-window">
          <div className="chat-header">
            <img src={chatbotIcon} alt="Bot" className="chat-logo" />
            <span>TalkTribe</span>
            <button className="close-btn" onClick={() => setIsOpen(false)}>✕</button>
          </div>

          <div className="chat-body">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={msg.sender === "bot" ? "bot-message" : "user-message"}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-footer">
            <input
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button onClick={handleSend}>Send</button>
          </div>
        </div>
      )}

      <img
        src={chatbotIcon}
        alt="Chatbot"
        className="chatbot-icon"
        onClick={() => setIsOpen(!isOpen)}
      />
    </div>
  );
}
