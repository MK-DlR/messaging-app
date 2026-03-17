// frontend/src/components/RightPanel.jsx

// imports
import { useRef } from "react";
import createDirectMessage from "../helpers/createDirectMessage";
import getIconUrl from "../helpers/getIconUrl";
import isOnline from "../helpers/isOnline";
import pingServer from "../helpers/pingServer";
import StatusCircle from "./StatusCircle";

function RightPanel({ 
    currentUser, 
    setSelectedChannel, 
    channels, 
    setChannels, 
    setMainPanelView, 
    setSelectedUser, 
    allUsers,  
    setEditingProfile 
}) {
    // set up timeout
    const clickTimer = useRef(null);

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
                
                    if (user.id === currentUser.id) {
                        setEditingProfile({ ...currentUser });
                        setMainPanelView("editProfile");
                    } else {
                        createDirectMessage(
                            user.id,
                            channels,
                            setChannels,
                            setSelectedChannel,
                            setMainPanelView
                        );
                    }
                
                    pingServer();
                }}
            >
                <img className="user-icon icon" src={getIconUrl(user.icon)} />
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
            <img className="user-icon icon" src={getIconUrl(currentUser.icon)} />
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