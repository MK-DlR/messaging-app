// frontend/src/pages/Home.jsx

// imports
import { useState, useEffect, useRef } from "react";
import apiFetch from "../helpers/apiFetch";
import useApi from "../helpers/useApi";
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
    const [newChannelUsers, setNewChannelUsers] = useState([]);
    const [newChannel, setNewChannel] = useState({ icon: "", name: "", channelInfo: "" });
    const [addUserSearch, setAddUserSearch] = useState("");

    const isInitialLoad = useRef(true);
    const previousIsApiReady = useRef(null);

    const { isApiReady } = useApi();

    // fetch all channels
    async function getChannels() {
        const response = await apiFetch(
            `${import.meta.env.VITE_API_URL}/channels/all-channels`
        )

        const data = await response.json();
        setChannels(data.channels);

        // only set default channel on initial load
        if (isInitialLoad.current) {
            const defaultChannel = data.channels.find(channel => channel.isDefault === true);
            setSelectedChannel(defaultChannel);
            setMainPanelView("messages");
            isInitialLoad.current = false;
        } else {
            // after updating channels
            // also update selectedChannel if it's one of them
            setSelectedChannel(prevChannel => {
                if (prevChannel) {
                    const updatedChannel = data.channels.find(ch => ch.id === prevChannel.id);
                    return updatedChannel || prevChannel;
                }
                return prevChannel;
            });
        }
    }

    // fetch current user's data
    async function getCurrentUser() {
        const response = await apiFetch(
            `${import.meta.env.VITE_API_URL}/users/me`
        )

        const data = await response.json();
        setCurrentUser(data.userData);
    }

    // fetch all users
    async function getAllUsers() {
        const response = await apiFetch(
            `${import.meta.env.VITE_API_URL}/users/all-users`
        );
        const data = await response.json();
        setAllUsers(data.users);
    }

    // fetch and store channels list
    useEffect(() => {
        getChannels();
        const intervalId = setInterval(getChannels, 5000);
        return () => clearInterval(intervalId);
    }, []);

    // fetch and store current user's data
    useEffect(() => {
        getCurrentUser();
    }, []);

    // fetch all users
    useEffect(() => {
        getAllUsers(); // initial fetch
        const intervalId = setInterval(getAllUsers, 5000);
        return () => clearInterval(intervalId);
    }, []);

    // check if backend is back online
    useEffect(() => {
        if (previousIsApiReady.current === false && isApiReady === true) {
            getChannels();
            getCurrentUser();
            getAllUsers();
        }
        previousIsApiReady.current = isApiReady;
    }, [isApiReady])

    return (
        <div className="panel-container">
            <LeftPanel 
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                setSelectedChannel={setSelectedChannel}
                channels={channels}
                setMainPanelView={setMainPanelView}
                setNewChannelUsers={setNewChannelUsers}
                setNewChannel={setNewChannel}
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
                editingProfile={editingProfile}
                setEditingProfile={setEditingProfile}
                newChannelUsers={newChannelUsers}
                setNewChannelUsers={setNewChannelUsers}
                newChannel={newChannel}
                setNewChannel={setNewChannel}
                addUserSearch={addUserSearch}
                setAddUserSearch ={setAddUserSearch}
            />
            <RightPanel 
                currentUser={currentUser} 
                setSelectedChannel={setSelectedChannel}
                channels={channels}
                setChannels={setChannels}
                setMainPanelView={setMainPanelView}
                setSelectedUser={setSelectedUser}
                allUsers={allUsers}
                setEditingProfile={setEditingProfile}
            />
        </div>
    )
}

export default Home;