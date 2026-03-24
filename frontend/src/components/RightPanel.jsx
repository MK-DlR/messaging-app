// frontend/src/components/RightPanel.jsx

// imports
import { useRef } from "react";
import Spinner from "./Spinner";
import StatusCircle from "./StatusCircle";
import createDirectMessage from "../helpers/createDirectMessage";
import getIconUrl from "../helpers/getIconUrl";
import isOnline from "../helpers/isOnline";
import pingServer from "../helpers/pingServer";

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

    // if no user, return a loading state early
    if (!currentUser) {
        displayUsers = 
            <div className="loading">
                <Spinner />
                Loading...
            </div>;
        activeUser = 
            <div className="loading">
                <Spinner />
                Loading...
            </div>;

        return (
            <div className="right-panel">
                <h2 className="header">All Users</h2>
                <div className="users-display loading">{displayUsers}</div>
                <div className="user active-user-display loading">{activeUser}</div>
            </div>
        )  
    }

    if (!allUsers) {
        displayUsers = <div>Loading...</div>
    } else {
        // map over and display users
        displayUsers = allUsers.map(user => 
            <div
                key={user.username}
                className="user"
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
            className="user"
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
        <div className="right-panel">
            <h2 className="header">All Users</h2>
            <div className="users-display">{displayUsers}</div>
            <div className="user active-user-display">{activeUser}</div>
        </div>
    )
}

export default RightPanel;