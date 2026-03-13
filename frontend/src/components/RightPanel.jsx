// frontend/src/components/RightPanel.jsx

// imports
import { useState, useEffect, useRef } from "react";
import apiFetch from "../helpers/apiFetch";
import pingServer from "../helpers/pingServer";
import isOnline from "../helpers/isOnline";
import StatusCircle from "./StatusCircle";

function RightPanel( { currentUser, setCurrentUser, selectedChannel, setSelectedChannel, channels, setChannels, mainPanelView, setMainPanelView, selectedUser, setSelectedUser, allUsers, setAllUsers, editingProfile, setEditingProfile } ) {
    const clickTimer = useRef(null); // set up timeout

    let displayUsers;
    let activeUser;

    if (!currentUser) return <div>Loading...</div>

    if (!allUsers) {
        displayUsers = <div>Loading...</div>
    } else {
        // map over and display users
        displayUsers = allUsers.map(user => 
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
                    async function getData() {
                        if (user.id === currentUser.id) {
                            setEditingProfile({ ...currentUser })
                            return setMainPanelView("editProfile");
                        }
                        const response = await apiFetch(`${import.meta.env.VITE_API_URL}/channels/new-channel/`, { method: "POST", body: JSON.stringify({ userIds: [user.id]}) });
                        const data = await response.json();
                        const createdChannel = data.channel || data.existingChannel;
                        if (data.channel) setChannels([...channels, createdChannel]);
                        setSelectedChannel(createdChannel);
                        setMainPanelView("messages");
                    }
                    getData();
                    pingServer();
                }}
            >
                <img className="user-icon icon" src={user.icon?.startsWith("http") ? user.icon : `/icons/${user.icon}`} />
                <StatusCircle color={isOnline(user.lastSeen) ? "green" : "grey"} />
                {user.displayName || user.username} 
            </div>
        );
    }

    // display logged in user
    activeUser = 
        <div
            key={currentUser.username}
            // clicking on user's name and/or icon opens user's profile
            onClick={() => {
                clearTimeout(clickTimer.current);
                clickTimer.current = setTimeout(() => {
                    setSelectedUser(currentUser);
                    setMainPanelView("userProfile");
                }, 250);
                pingServer();
            }}
            // double clicking on user's name and/or icon creates DM
            onDoubleClick={() => {
                clearTimeout(clickTimer.current);
                async function getData() {
                    setEditingProfile({ ...currentUser })
                    return setMainPanelView("editProfile");
                }
                getData();
                pingServer();
            }}
        >
            <img className="user-icon icon" src={currentUser.icon?.startsWith("http") ? currentUser.icon : `/icons/${currentUser.icon}`} />
            {currentUser.displayName || currentUser.username} 
        </div>
    
    return (
        <div>
            <h2 className="header">All Users</h2>
            {displayUsers}
            {activeUser}
        </div>
    )
}

export default RightPanel;