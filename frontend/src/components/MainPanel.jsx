// frontend/src/components/MainPanel.jsx

// imports
import { useState, useEffect, useRef } from "react";
import apiFetch from "../helpers/apiFetch";
import pingServer from "../helpers/pingServer";
import isOnline from "../helpers/isOnline";
import StatusCircle from "./StatusCircle";
import formatDate from "../helpers/formatDate";

// conditionally render different content based on mainPanelView
function MainPanel( { currentUser, setCurrentUser, selectedChannel, setSelectedChannel, mainPanelView, setMainPanelView, selectedUser, setSelectedUser } ) {
    const [messages, setMessages] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [channelDetails, setChannelDetails] = useState([]);

    // set up timeout
    const clickTimer = useRef(null);
    
    // fetch all messages in selected channel
    useEffect(() => {
        async function getData() {
            if (!selectedChannel) {
                return;
            }

            // fetch channel's messages
            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/messages/all-messages/${selectedChannel.id}`);
            
            const data = await response.json();
            setMessages(data.messages);
        }

        getData(); // initial fetch
    }, [selectedChannel]);

    // fetch channel details
    useEffect(() => {
        async function getData() {
            if (!selectedChannel) {
                return;
            }

            // fetch channel's details
            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/channels/details/${selectedChannel.id}`);

            const data = await response.json();
            setChannelDetails(data.channelDetails);
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
            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/users/${selectedUser.username}`);
            
            const data = await response.json();
            setUserProfile(data.result);
        }
        getData(); // initial fetch
    }, [selectedUser]);
    
    let title;
    let content;

    // determine which channel is selected
    switch (mainPanelView) {
        case "messages": // display channel's messages
            title =
                <div className="header">
                    <h2>
                        {selectedChannel.name}
                        <i 
                            className="fa-solid fa-pencil edit-icon"
                            onClick={() => {
                                setMainPanelView("editChannel"); 
                                pingServer();
                            }}
                        />
                        <i 
                            className="fa-solid fa-circle-info details-icon"
                            onClick={() => {
                                setMainPanelView("channelDetails");
                                pingServer();
                            }}
                        />
                    </h2>
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
            {
                title =
                    <div className="header">
                        <h2>
                            <img className="channel-icon lg-icon" src={`/icons/${selectedChannel.icon}`} />
                            {selectedChannel.name} Details

                            {!selectedChannel.isDefault && currentUser.id !== selectedChannel.creatorId && (
                                <i
                                className="fa-solid fa-door-open leave-icon"
                                onClick={() => {
                                    if (window.confirm("Are you sure you want to leave this channel?")) {
                                        // TO DO:
                                        // API call
                                        // remove user from channel
                                        // remove channel from list in Home.jsx
                                        // reset selectedChannel back to default
                                        setMainPanelView("default");
                                        pingServer();
                                    }
                                }}
                                />
                            )}

                            <i
                                className="fa-solid fa-x exit-icon"
                                onClick={() => {
                                    setMainPanelView("messages");
                                    pingServer();
                                }}
                            />
                        </h2>
                    </div>

                // map over and display users
                const displayUsers = channelDetails.users.map(user => 
                    <div
                        key={user.username}
                        // clicking on user's name and/or icon opens user's profile
                        onClick={() => {
                            clearTimeout(clickTimer.current);
                            clickTimer.current = setTimeout(() => {
                                setSelectedUser(user);
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
                        <img className="user-icon icon" src={`/icons/${user.icon}`}></img> 
                        <StatusCircle color={isOnline(user.lastSeen) ? "green" : "grey"} />
                        {user.displayName || user.username} 
                    </div>
                );
                    
                content = 
                <div className="channel-details">
                    {channelDetails.channelInfo}
                    {displayUsers}
                </div>
            }
            break;
        case "editChannel": // channel owner can edit and/or delete channel
            if (currentUser.id != selectedChannel.creatorId) {
                title =
                    <div className="header">
                        <h2>
                            <img className="channel-icon lg-icon" src={`/icons/${selectedChannel.icon}`}></img> 
                            {selectedChannel.name} Details
                            <i 
                                className="fa-solid fa-x exit-icon" 
                                onClick={() => {
                                    setMainPanelView("messages");
                                    pingServer();
                                }}
                            />
                        </h2>
                    </div>

                content = <div>
                    {/* TO DO: list below */}
                    <li>channel icon edit</li>
                    <li>channel name edit</li>
                    <li>channel description edit</li>
                    <li>adding users</li>
                    <li>removing users (with confirmation)</li>
                    <li>channel deletion (with confirmation)</li>
                </div>
            } else {
                title =
                    <div className="header">
                        <h2>
                            <img className="channel-icon lg-icon" src={`/icons/${selectedChannel.icon}`}></img> 
                            {selectedChannel.name} Details
                            <i 
                                className="fa-solid fa-x exit-icon" 
                                onClick={() => {
                                    setMainPanelView("messages");
                                    pingServer();
                                }}
                            />
                        </h2>
                    </div>

                content = <div>Permissions unavailable</div>
            }
            break;
        case "userProfile": // display user profile details
            if (!userProfile) {
                content = <div>Loading...</div>
            } else {
                title =
                <div className="header">
                    <h2>
                    <img className="profile-icon lg-icon" src={`/icons/${userProfile.icon}`}></img>
                        {userProfile.displayName} Details
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
                    </h2>
                </div>
                
                content = 
                <div className="user-profile">
                    {userProfile.displayName}
                    {userProfile.username}
                    {userProfile.profileInfo}
                    Last seen: {formatDate(userProfile.lastSeen)}
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