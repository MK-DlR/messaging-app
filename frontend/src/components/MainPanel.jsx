// frontend/src/components/MainPanel.jsx

// imports
import { useState, useEffect } from "react";
import apiFetch from "../helpers/apiFetch";

import ChannelDetails from "./MainPanel/ChannelDetails";
import CreateChannel from "./MainPanel/CreateChannel";
import EditChannel from "./MainPanel/EditChannel";
import EditMessage from "./MainPanel/EditMessage";
import EditProfile from "./MainPanel/EditProfile";
import Messages from "./MainPanel/Messages";
import UserProfile from "./MainPanel/UserProfile";

// conditionally render different content based on mainPanelView
function MainPanel({ 
    currentUser, 
    setCurrentUser, 
    selectedChannel, 
    setSelectedChannel, 
    channels, 
    setChannels, 
    mainPanelView, 
    setMainPanelView, 
    selectedUser, 
    setSelectedUser, 
    allUsers, 
    editingProfile, 
    setEditingProfile, 
    newChannelUsers, 
    setNewChannelUsers, 
    newChannel, 
    setNewChannel, 
    addUserSearch, 
    setAddUserSearch 
}) {
    const [messages, setMessages] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [channelDetails, setChannelDetails] = useState(null);
    const [previousView, setPreviousView] = useState("messages");
    const [editingChannel, setEditingChannel] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);

    // fetch all messages in selected channel
    useEffect(() => {
        async function getMessages() {
            if (!selectedChannel) {
                return;
            }

            // fetch channel's messages
            const response = await apiFetch(
                `${import.meta.env.VITE_API_URL}/messages/all-messages/${selectedChannel.id}`
            );

            const data = await response.json();
            setMessages(data.messages);
        }

        getMessages(); // initial fetch
    }, [selectedChannel]);

    // fetch channel details
    useEffect(() => {
        async function getChannelDetails() {
            if (!selectedChannel) {
                return;
            }

            // fetch channel's details
            const response = await apiFetch(
                `${import.meta.env.VITE_API_URL}/channels/details/${selectedChannel.id}`
            );

            const data = await response.json();
            setChannelDetails(data.channelDetails);
        }
        getChannelDetails(); // initial fetch
    }, [selectedChannel]);

    // fetch user profile info
    useEffect(() => {
        async function getProfileDetails() {
            if (!selectedUser) {
                return;
            }

            // fetch user's info
            const response = await apiFetch(
                `${import.meta.env.VITE_API_URL}/users/${selectedUser.username}`
            );

            const data = await response.json();
            setUserProfile(data.result);
        }
        getProfileDetails(); // initial fetch
    }, [selectedUser]);

    let title;
    let content;

    // if no user, return a loading state early
    if (!currentUser) return <div>Loading...</div>;

    // determine which view is selected
    switch (mainPanelView) {
        case "messages": // display channel's messages
            content = <Messages 
                currentUser={currentUser}
                selectedChannel={selectedChannel}
                channelDetails={channelDetails}
                messages={messages}
                setMessages={setMessages}
                channels={channels}
                setChannels={setChannels}
                setSelectedChannel={setSelectedChannel}
                setSelectedUser={setSelectedUser}
                setEditingMessage={setEditingMessage}
                setEditingProfile={setEditingProfile}
                setEditingChannel={setEditingChannel}
                setAddUserSearch={setAddUserSearch}
                setMainPanelView={setMainPanelView}
            />
            break;
        case "channelDetails": // display channel's details
            content = <ChannelDetails
                currentUser={currentUser}
                channels={channels}
                setChannels={setChannels}
                selectedChannel={selectedChannel}
                setSelectedChannel={setSelectedChannel}
                channelDetails={channelDetails}
                setSelectedUser={setSelectedUser}
                setMainPanelView={setMainPanelView}
            />
            break;
        case "editChannel": // channel owner can edit and/or delete channel
            if (currentUser.id === selectedChannel.creatorId && selectedChannel.creatorId !== null) {
                content = <EditChannel 
                    currentUser={currentUser}
                    selectedChannel={selectedChannel}
                    channels={channels}
                    setChannels={setChannels}
                    setSelectedChannel={setSelectedChannel}
                    channelDetails={channelDetails}
                    setChannelDetails={setChannelDetails}
                    allUsers={allUsers}
                    addUserSearch={addUserSearch}
                    setAddUserSearch={setAddUserSearch}
                    editingChannel={editingChannel}
                    setEditingChannel={setEditingChannel}
                    setSelectedUser={setSelectedUser}
                    setPreviousView={setPreviousView}
                    setMainPanelView={setMainPanelView}
                />
            } else {
                content = <div>Permissions unavailable</div>
            }
            break;
        case "editMessage": // user can edit own message
            content = <EditMessage 
                editingMessage={editingMessage}
                setEditingMessage={setEditingMessage}
                messages={messages}
                setMessages={setMessages}
                setMainPanelView={setMainPanelView}
            />
            break;
        case "userProfile": // display user profile details
            content = <UserProfile 
                userProfile={userProfile}
                currentUser={currentUser}
                channels={channels}
                setChannels={setChannels}
                setSelectedChannel={setSelectedChannel}
                setEditingProfile={setEditingProfile}
                setMainPanelView={setMainPanelView}
                previousView={previousView}
            />
            break;
        case "editProfile": // user can edit own profile
            content = <EditProfile
                setMainPanelView={setMainPanelView}
                editingProfile={editingProfile}
                setEditingProfile={setEditingProfile}
                currentUser={currentUser}
                setCurrentUser={setCurrentUser}
                selectedUser={selectedUser}
                setSelectedUser={setSelectedUser}
                userProfile={userProfile}
                setUserProfile={setUserProfile}
            />
            break;
        case "createChannel": // display create new channel
            content = <CreateChannel
                allUsers={allUsers}
                currentUser={currentUser}
                newChannelUsers={newChannelUsers}
                setNewChannelUsers={setNewChannelUsers}
                addUserSearch={addUserSearch}
                setSelectedUser={setSelectedUser}
                setPreviousView={setPreviousView}
                channels={channels}
                setChannels={setChannels}
                setSelectedChannel={setSelectedChannel}
                setAddUserSearch={setAddUserSearch}
                newChannel={newChannel}
                setNewChannel={setNewChannel}
                setMainPanelView={setMainPanelView}
            />
            break;
        default:
            title =
                <div className="header">
                    <h2>Select A Channel</h2>
                </div>

            content = <div>Select a channel...</div>;
    }

    return (
        <div className="main-panel">
            {title}
            {content}
        </div>
    )
}

export default MainPanel;