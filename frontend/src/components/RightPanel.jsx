// frontend/src/components/RightPanel.jsx

// imports
import { useState, useEffect, useRef } from "react";
import apiFetch from "../helpers/apiFetch";
import pingServer from "../helpers/pingServer";
import isOnline from "../helpers/isOnline";
import StatusCircle from "./StatusCircle";

function RightPanel( { currentUser, setCurrentUser, mainPanelView, setMainPanelView, selectedUser, setSelectedUser } ) {
    const [allUsers, setAllUsers] = useState([]);
    const clickTimer = useRef(null); // set up timeout

    // fetch all users
    useEffect(() => {
        async function getData() {
            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/users/all-users`);
            const data = await response.json();
            setAllUsers(data.users);
        }

        getData(); // initial fetch
        const intervalId = setInterval(getData, 5000);
        return () => clearInterval(intervalId);
    }, []);

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
                <img className="user-icon icon" src={`/icons/${user.icon}`}></img> 
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