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

                // TO DO: clicking on user info
                // (username/display name and/or icon)
                // opens user's profile
            >
                <img className="user-icon icon" src={`/icons/${message.users.icon}`}></img> 
                {message.users.displayName || message.users.username} 
                {formatDate(message.createdAt)}<br />
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