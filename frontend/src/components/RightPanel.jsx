// frontend/src/components/RightPanel.jsx

// imports
import { useState, useEffect, useRef } from "react";
import apiFetch from "../helpers/apiFetch";
import pingServer from "../helpers/pingServer";
import isOnline from "../helpers/isOnline";
import StatusCircle from "./StatusCircle";

function RightPanel( { currentUser, setCurrentUser, mainPanelView, setMainPanelView, selectedUser, setSelectedUser, allUsers, setAllUsers } ) {
    const clickTimer = useRef(null); // set up timeout

    let displayUsers;

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
                    setMainPanelView("createChannel");
                    pingServer();
                }}
            >
                <img className="user-icon icon" src={user.icon?.startsWith("http") ? user.icon : `/icons/${user.icon}`} />
                <StatusCircle color={isOnline(user.lastSeen) ? "green" : "grey"} />
                {user.displayName || user.username} 
            </div>
        );
    }
    
    return (
        <div>
            <h2 className="header">All Users</h2>
            {displayUsers}
        </div>
    )
}

export default RightPanel;