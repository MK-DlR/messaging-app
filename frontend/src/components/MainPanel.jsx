// frontend/src/components/MainPanel.jsx

// imports
import { useState, useEffect, useRef } from "react";
import apiFetch from "../helpers/apiFetch";
import pingServer from "../helpers/pingServer";
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

        getData(); // initial fetch
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

    // determine which channel is selected
    switch (mainPanelView) {
        case "messages": // display channel's messages
            title =
                <div className="header">
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
                            }, 250);
                            pingServer();
                        }}
                        // double clicking on user's name and/or icon creates DM
                        onDoubleClick={() => {
                            clearTimeout(clickTimer.current);
                            setMainPanelView("createChannel");
                            pingServer();
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
        case "channelDetails": // display channel's details
            title =
                <div className="header">
                    <h2>{selectedChannel.name} Details</h2>
                </div>
                
            content = <div>Channel details...
                <i 
                    className="fa-solid fa-x exit-icon" 
                    onClick={() => {
                        setMainPanelView("messages");
                        pingServer();
                    }}
                />
            </div>
            break;
        case "userProfile": // display user profile details
            if (!userProfile) {
                content = <div>Loading...</div>
            } else {
                title =
                <div className="header">
                    <h2>{userProfile.displayName} Details</h2>
                </div>
                
                content = 
                <div className="user-profile">
                    <img className="profile-icon icon" src={`/icons/${userProfile.icon}`}></img>
                    {userProfile.displayName}
                    {userProfile.username}
                    {userProfile.profileInfo}
                    Last seen: {formatDate(userProfile.lastSeen)}
                    <i 
                        className="fa-regular fa-envelope message-icon"
                        onClick={() => {
                            setMainPanelView("createChannel");
                            pingServer();
                        }}
                    />
                    <i 
                        className="fa-solid fa-x exit-icon" 
                        onClick={() => {
                            setMainPanelView("messages");
                            pingServer();
                        }}
                    />
                </div>
            }
            break;
        case "createChannel": // display create new channel
            title =
                <div className="header">
                    <h2>Create New Channel</h2>
                </div>

            content = <div>Create new DM/channel...
                        <i 
                            className="fa-solid fa-x exit-icon" 
                            onClick={() => {
                                setMainPanelView("messages");
                                pingServer();
                            }}
                        />
            </div>
            break;
        default:
            title =
                <div className="header">
                    <h2>Select A Channel</h2>
                </div>

            content = <div>Select a channel...</div>;
    }
    
    return (
        <div>
            {title}
            {content}
        </div>
    )
}

export default MainPanel;