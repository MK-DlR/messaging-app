// frontend/src/components/MainPanel.jsx

// imports
import { useState, useEffect, useRef } from "react";
import apiFetch from "../helpers/apiFetch";
import formatDate from "../helpers/formatDate";

// conditionally render different content based on mainPanelView
function MainPanel( { currentUser, setCurrentUser, selectedChannel, setSelectedChannel, mainPanelView, setMainPanelView, selectedUser, setSelectedUser } ) {
    const [messages, setMessages] = useState([]);
    const [userProfile, setUserProfile] = useState(null);

    // set up timeout
    const clickTimer = useRef(null);
    
    // fetch all messages in selected channel
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

    // fetch user profile info
    useEffect(() => {
        async function getData() {
            if (!selectedUser) {
                return;
            }

            // fetch user's info
            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/users/${selectedUser.username}`)
            
            const data = await response.json();
            setUserProfile(data.result);
        }
        getData();
    }, [selectedUser]);
    
    let title;
    let content;

    // determine if a channel is selected
    switch (mainPanelView) {
        case "messages":
            // display channel name and details button
            title =
                <div className="channel-header header">
                    <h2>{selectedChannel.name}</h2>
                    <i 
                        className="fa-solid fa-circle-info details-icon"
                        onClick={() => {setMainPanelView("channelDetails")}}
                    />
                </div>
    
            // map over and display messages
            content = messages.map(message =>
                <div
                    key={message.id}
                    className="message"
                    // TO DO: if message author
                    // hovering shows edit and delete button
                >
                    <div
                        // clicking on user's name and/or icon opens user's profile
                        onClick={() => {
                            clearTimeout(clickTimer.current);
                            clickTimer.current = setTimeout(() => {
                                setSelectedUser(message.users);
                                setMainPanelView("userProfile");
                                console.log(message.users.username);
                            }, 250)
                        }}
                        // double clicking on user's name and/or icon creates DM
                        onDoubleClick={() => {
                            clearTimeout(clickTimer.current);
                            setMainPanelView("createChannel");
                            console.log("TO DO: create new dm with user");
                        }}
                    >
                        <img className="message-icon icon" src={`/icons/${message.users.icon}`}></img> 
                        {message.users.displayName || message.users.username} 
                    </div>
                    {formatDate(message.createdAt)}<br />
                    {message.body}
                </div>
            )
            break;
        case "channelDetails":
            // thing
            break;
        case "userProfile":
            if (!userProfile) {
                content = <div>Loading...</div>
            } else {
                content = 
                <div className="user-profile">
                    <img className="profile-icon icon" src={`/icons/${userProfile.icon}`}></img>
                    {userProfile.displayName}
                    {userProfile.username}
                    {userProfile.profileInfo}
                    Last seen: {formatDate(userProfile.lastSeen)}
                    <i 
                        className="fa-regular fa-envelope message-icon"
                        onClick={() => {setMainPanelView("createChannel")}}
                    />
                    <i 
                        className="fa-solid fa-x exit-icon" 
                        onClick={() => setMainPanelView("messages")}
                    />
                </div>
            }
            break;
        case "createChannel":
            content = <div>New DM...</div>
            break;
        default:
            content = <div>Select a channel...</div>;
    }
    
    return (
        <div>
            (main panel)
            {title}
            {content}
        </div>
    )
}

export default MainPanel;