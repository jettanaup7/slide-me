import axios from "axios";
import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";

import "./Chat.css";

function Chat({ setIsChatOpen, orderID, token }) {
  const [chats, setChats] = useState([]);

  const fetchChats = async () => {
    try {
      const res = await axios.get(`http://localhost:3000/chats/${orderID}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.result) {
        setChats(res.data.result);
        console.log("Chats fetched successfully:", res.data.result);
      } else {
        console.error("Invalid data format", res.data);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  useEffect(() => {
    fetchChats(); // Initial fetch when the component mounts
  }, []);

  const getSenderType = (chat) => {
    if (chat.userID) return "user";  // User message
    if (chat.driverID) return "driver";  // Driver message
    return "unknown";
  };

  return (
    <div className="chat-container">
      <div className="top-bar">
        <div style={{ display: 'flex', alignItems: 'left', justifyContent: 'left', gap: '10px', marginBottom: '10px', marginLeft: '1.5rem' }}>
          <Button variant="success" className='back-button d-flex' onClick={() => setIsChatOpen(false)}>
            <span className='bi bi-caret-left-fill d-flex'></span>
          </Button>
          <h2 className='d-flex' style={{ textAlign: 'center', fontWeight: 'bold', marginLeft: '1.5rem' }}>แชท</h2>
        </div>
      </div>

      <div className="chat-main-container">
        {chats.map((chat, index) => {
          const senderType = getSenderType(chat);
          return (
            <div
              key={index}
              className={senderType === "user" ? "outgoing-message" : "incoming-message"}
            >
              {senderType !== "user" && (
                <div className="avatar">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    alt="User Avatar"
                    className="avatar-image"
                  />
                </div>
              )}
              <div className={`bubble ${senderType === "user" ? "outgoing" : "incoming"}`}>
                {chat.isPicture ? (
                  <img
                    src={chat.message}
                    alt="Image message"
                    style={{ width: "150px", height: "150px" }}
                    onClick={() => window.open(chat.message, "_blank")}
                  />
                ) : (
                  chat.message
                )}
              </div>
            </div>
          );
        })}
        <p></p>
      </div>
    </div>
  );
}

export default Chat;
