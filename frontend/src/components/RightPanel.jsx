// frontend/src/components/RightPanel.jsx

// imports
import { useState, useEffect, useRef } from "react";
import apiFetch from "../helpers/apiFetch";


function RightPanel( { currentUser, setCurrentUser, mainPanelView, setMainPanelView, selectedUser, setSelectedUser } ) {
    const [allUsers, setAllUsers] = useState([]);

    // set up timeout
    const clickTimer = useRef(null);

    // fetch all users
    useEffect(() => {
        async function getData() {
            // fetch users
            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/users/all-users`)
            
            const data = await response.json();
            setAllUsers(data.users);
        }
        getData();
    }, []);

    // map over and display users
    const displayUsers = allUsers.map(user => 
        <div
            key={user.username}
            // clicking on user's name and/or icon opens user's profile
            onClick={() => {
                clearTimeout(clickTimer.current);
                clickTimer.current = setTimeout(() => {
                    setSelectedUser(user);
                    setMainPanelView("userProfile");
                }, 250)
            }}
            // double clicking on user's name and/or icon creates DM
            onDoubleClick={() => {
                clearTimeout(clickTimer.current);
                setMainPanelView("createChannel");
            }}
        >
            <img className="user-icon icon" src={`/icons/${user.icon}`}></img> 
                {user.displayName || user.username} 
            </div>
    );
    
    return (
        <div>
            <h2 className="header">All Users</h2>
            {displayUsers}
        </div>
    )
}

export default RightPanel;