// frontend/src/components/MainPanel.jsx

// imports
import { useState, useEffect } from "react";
import apiFetch from "../helpers/apiFetch";
import pingServer from "../helpers/pingServer";

import ChannelDetails from "./MainPanel/ChannelDetails";
import CreateChannel from "./MainPanel/CreateChannel";
import EditChannel from "./MainPanel/EditChannel";
import EditMessage from "./MainPanel/EditMessage";
import EditProfile from "./MainPanel/EditProfile";
import Messages from "./MainPanel/Messages";
import UserProfile from "./MainPanel/UserProfile";

// conditionally render different content based on mainPanelView
function MainPanel( { currentUser, setCurrentUser, selectedChannel, setSelectedChannel, channels, setChannels, mainPanelView, setMainPanelView, selectedUser, setSelectedUser, allUsers, editingProfile, setEditingProfile, newChannelUsers, setNewChannelUsers, newChannel, setNewChannel, addUserSearch, setAddUserSearch } ) {
    const [messages, setMessages] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [channelDetails, setChannelDetails] = useState(null);
    const [previousView, setPreviousView] = useState("messages");
    const [editingChannel, setEditingChannel] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [messageBody, setMessageBody] = useState("");
    const [showImageInput, setShowImageInput] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    // fetch all messages in selected channel
    useEffect(() => {
        async function getData() {
            if (!selectedChannel) {
                return;
            }

            // fetch channel's messages
            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/messages/all-messages/${selectedChannel.id}`);

            const data = await response.json();
            setMessages(data.messages);
        }

        getData(); // initial fetch
    }, [selectedChannel]);

    // fetch channel details
    useEffect(() => {
        async function getData() {
            if (!selectedChannel) {
                return;
            }

            // fetch channel's details
            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/channels/details/${selectedChannel.id}`);

            const data = await response.json();
            setChannelDetails(data.channelDetails);
        }
        getData(); // initial fetch
    }, [selectedChannel]);

    // fetch user profile info
    useEffect(() => {
        async function getData() {
            if (!selectedUser) {
                return;
            }

            // fetch user's info
            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/users/${selectedUser.username}`);

            const data = await response.json();
            setUserProfile(data.result);
        }
        getData(); // initial fetch
    }, [selectedUser]);

    // message submit handler
    async function submitHandler() {
        if (!messageBody.trim()) {
            return;
        }
        const newMessage = await apiFetch(`${import.meta.env.VITE_API_URL}/messages/new-message/`, { method: "POST", body: JSON.stringify({ body: messageBody, channelId: selectedChannel.id }) });
        const data = await newMessage.json();
        setMessages([...messages, data.messages]);
        setMessageBody("");
        setImageUrl("");
        setShowImageInput(false);
        pingServer();
    }

    let title;
    let content;

    // if no user, return a loading state early
    if (!currentUser) return <div>Loading...</div>;

    // determine which channel is selected
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
        <div>
            {title}
            {content}
            {mainPanelView === "messages" && (
                <div className="text-input">
                    <i 
                        className="fa-solid fa-plus add-icon ui-icon"
                        onClick={() => {
                            setShowImageInput(!showImageInput);
                            pingServer();
                        }}
                    />
                    {/* conditionally render file "upload" dropdown */}
                    {showImageInput === true && (
                        <div className="file-uploader">
                            <input
                                type="text"
                                placeholder="Image url..."
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                            <button 
                                type="submit" 
                                className="fa-solid fa-floppy-disk save-icon ui-icon send-icon ui-icon"
                                onClick={() => {
                                    setMessageBody(messageBody ? `${messageBody} ${imageUrl}` : imageUrl)
                                    setImageUrl("");
                                    setShowImageInput(false);
                                    pingServer();
                                }}
                            />
                            <i
                                className="fa-solid fa-x exit-icon ui-icon"
                                onClick={() => {
                                    setShowImageInput(false);
                                    pingServer();
                                }}
                            />
                        </div>
                    )}
                    <div className="send-message form">
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            submitHandler();
                        }}>
                            <textarea
                                value={messageBody}
                                onChange={(e) => setMessageBody(e.target.value)}
                                placeholder="Reply..."
                                maxLength={2000}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault();
                                        submitHandler();
                                    }
                                }}
                            />
                            {(2000 - (messageBody?.length || 0)) < 50 && (
                                <span>{2000 - (messageBody?.length || 0)} characters remaining</span>
                            )}
                            <button type="submit" className="fa-solid fa-share send-icon ui-icon" />
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default MainPanel;