// frontend/src/components/MainPanel.jsx

// imports
import { useState, useEffect } from "react";
import apiFetch from "../helpers/apiFetch";
import formatDate from "../helpers/formatDate";

// conditionally render different content based on mainPanelView
function MainPanel( { currentUser, setCurrentUser, selectedChannel, setSelectedChannel, mainPanelView, setMainPanelView, selectedUser, setSelectedUser } ) {
    const [messages, setMessages] = useState([]);
    
    useEffect(() => {
        async function getData() {
            if (!selectedChannel) {
                return;
            }

            // fetch channel's messages
            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/messages/all-messages/${selectedChannel.id}`)
            
            const data = await response.json();
            setMessages(data.messages);
        }
        getData();
    }, [selectedChannel]);
    
    // determine if a channel is selected
    let content;
    if (mainPanelView === "messages") {
        // map over and display messages
        content = messages.map(message =>
            <div
                key={message.id}
                className="message"
                // TO DO: if message author
                // hovering shows edit and delete button
            >
                {message.userId} {/* TO DO: format userId to display name */}
                {formatDate(message.createdAt)} {/* TO DO: format into H:MM AM/PM */}<br />
                {message.body}
            </div>
        )
    } else {
        content = <div>Select a channel...</div>;
    }
    
    return (
        <div>(main panel)
            {content}
        </div>
    )
}

export default MainPanel;