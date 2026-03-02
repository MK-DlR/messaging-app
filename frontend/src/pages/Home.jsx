// frontend/src/pages/Home.jsx

// imports
import { useState, useEffect } from "react";
import apiFetch from "../helpers/apiFetch";
import LeftPanel from "../components/LeftPanel";
import MainPanel from "../components/MainPanel";
import RightPanel from "../components/RightPanel";

function Home() {
    const [currentUser, setCurrentUser] = useState(null);
    const [selectedChannel, setSelectedChannel] = useState("");
    const [mainPanelView, setMainPanelView] = useState("");
    const [selectedUser, setSelectedUser] = useState("");

    // fetch and store current user's data
    useEffect(() => {
        async function getData() {
        // fetch current user's data
        const response = await apiFetch(`${import.meta.env.VITE_API_URL}/users/me`)
        
        const data = await response.json();
        setCurrentUser(data.userData);
        }
        getData();
    }, []);

    return (
        <div className="panel-container">
            <LeftPanel 
                selectedChannel={selectedChannel}
                setSelectedChannel={setSelectedChannel}
                mainPanelView={mainPanelView}
                setMainPanelView={setMainPanelView}
            />
            <MainPanel
                currentUser={currentUser} 
                setCurrentUser={setCurrentUser} 
                selectedChannel={selectedChannel}
                setSelectedChannel={setSelectedChannel}
                mainPanelView={mainPanelView}
                setMainPanelView={setMainPanelView}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
            />
            <RightPanel 
                currentUser={currentUser} 
                setCurrentUser={setCurrentUser}
                mainPanelView={mainPanelView}
                setMainPanelView={setMainPanelView}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
            />
        </div>
    )
}

// selectedChannel
// which channel is open in the main panel
// mainPanelView
// what the main panel is showing (messages, channel details, user profile)
// selectedUser
// what user was double clicked (for profile view and/or editing)

export default Home;