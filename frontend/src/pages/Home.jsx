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
    const [channels, setChannels] = useState([]);
    const [mainPanelView, setMainPanelView] = useState("");
    const [selectedUser, setSelectedUser] = useState("");
    const [allUsers, setAllUsers] = useState([]);
    const [editingProfile, setEditingProfile] = useState(null);

    // fetch and store channels list
    useEffect(() => {
        async function getData() {
            // fetch all channels
            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/channels/all-channels`)

            const data = await response.json();
            setChannels(data.channels);

            // set default channel
            const defaultChannel = data.channels.find(channel => channel.isDefault === true);
            setSelectedChannel(defaultChannel);
            setMainPanelView("messages");
        }
        getData();
    }, []);

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

    return (
        <div className="panel-container">
            <LeftPanel 
                selectedChannel={selectedChannel}
                setSelectedChannel={setSelectedChannel}
                channels={channels}
                setChannels={setChannels}
                mainPanelView={mainPanelView}
                setMainPanelView={setMainPanelView}
            />
            <MainPanel
                currentUser={currentUser} 
                setCurrentUser={setCurrentUser} 
                selectedChannel={selectedChannel}
                setSelectedChannel={setSelectedChannel}
                channels={channels}
                setChannels={setChannels}
                mainPanelView={mainPanelView}
                setMainPanelView={setMainPanelView}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                allUsers={allUsers}
                setAllUsers={setAllUsers}
                editingProfile={editingProfile}
                setEditingProfile={setEditingProfile}
            />
            <RightPanel 
                currentUser={currentUser} 
                setCurrentUser={setCurrentUser}
                selectedChannel={selectedChannel}
                setSelectedChannel={setSelectedChannel}
                channels={channels}
                setChannels={setChannels}
                mainPanelView={mainPanelView}
                setMainPanelView={setMainPanelView}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                allUsers={allUsers}
                setAllUsers={setAllUsers}
                editingProfile={editingProfile}
                setEditingProfile={setEditingProfile}
            />
        </div>
    )
}

export default Home;