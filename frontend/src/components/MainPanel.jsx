// frontend/src/components/MainPanel.jsx

// imports
import { useState, useEffect, useRef } from "react";
import apiFetch from "../helpers/apiFetch";
import pingServer from "../helpers/pingServer";
import formatDate from "../helpers/formatDate";
import imageCheck from "../helpers/imageCheck";

import ChannelDetails from "./MainPanel/ChannelDetails";
// CreateChannel
// EditChannel
import EditMessage from "./MainPanel/EditMessage";
import EditProfile from "./MainPanel/EditProfile";
// Messages
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
    
    // set up timeout
    const clickTimer = useRef(null);

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
            {
                title =
                <div className="header">
                    <img className="channel-icon lg-icon" src={selectedChannel.icon?.startsWith("http") ? selectedChannel.icon : `/icons/${selectedChannel.icon}`} />
                    <h2>{selectedChannel.name}
                        {currentUser.id === selectedChannel.creatorId && selectedChannel.creatorId !== null && (
                            <i 
                                className="fa-solid fa-pencil edit-icon ui-icon"
                                onClick={() => {
                                    if (!channelDetails) return;
                                    setEditingChannel({ ...selectedChannel, channelInfo: channelDetails.channelInfo });
                                    setAddUserSearch("");
                                    setMainPanelView("editChannel"); 
                                    pingServer();
                                }}
                            />
                        )}

                        <i 
                            className="fa-solid fa-circle-info details-icon ui-icon"
                            onClick={() => {
                                setMainPanelView("channelDetails");
                                pingServer();
                            }}
                        />
                    </h2>
                    <div className="channel-description">
                        {selectedChannel.channelInfo}
                    </div>
                </div>

                // map over and display messages
                content = messages.map(message => {
                    // if current user is message author, display edit and delete icons
                    if (currentUser.id === message.userId) {
                        const imageTokens = message.body.split(" ").filter(token => imageCheck(token));
                        const textTokens = message.body.split(" ").filter(token => !imageCheck(token));

                        return <div
                            key={message.id}
                            className="author-message message"
                        >
                        <div
                            className="message-header"
                            // clicking on user's name and/or icon opens user's profile
                            onClick={() => {
                                clearTimeout(clickTimer.current);
                                clickTimer.current = setTimeout(() => {
                                    setSelectedUser(message.users);
                                    setMainPanelView("userProfile");
                                }, 250);
                                pingServer();
                            }}
                            // double clicking on user's name and/or icon creates DM
                            onDoubleClick={() => {
                                clearTimeout(clickTimer.current);
                                async function getData() {
                                    if (message.users.id === currentUser.id) {
                                        setEditingProfile({ ...currentUser });
                                        return setMainPanelView("editProfile");
                                    }
                                    const response = await apiFetch(`${import.meta.env.VITE_API_URL}/channels/new-channel/`, { method: "POST", body: JSON.stringify({ userIds: [message.users.id]}) });
                                    const data = await response.json();
                                    const createdChannel = data.channel || data.existingChannel;
                                    if (data.channel) setChannels([...channels, createdChannel]);
                                    setSelectedChannel(createdChannel);
                                    setMainPanelView("messages");
                                }
                                getData();
                                pingServer();
                            }}
                        >
                            <img className="message-icon icon" src={message.users.icon?.startsWith("http") ? message.users.icon : `/icons/${message.users.icon}`} />
                            {message.users.displayName || message.users.username}
                            {formatDate(message.createdAt)}
                            {Math.abs(new Date(message.updatedAt) - new Date(message.createdAt)) > 1000 && <span className="edited-message">edited</span>}
                            <div className="on-hover">
                                <i 
                                    className="fa-solid fa-pencil edit-icon ui-icon edit-hover"
                                    onClick={(e) => {
                                        // prevent triggering parent click
                                        e.stopPropagation();
                                        setEditingMessage(message);
                                        setMainPanelView("editMessage"); 
                                        pingServer();
                                    }}
                                />
                                <i 
                                    className="fa-solid fa-trash delete-icon ui-icon"
                                    onClick={(e) => {
                                        // prevent triggering parent click
                                        e.stopPropagation();
                                        // delete message
                                        if (window.confirm("Are you sure you want to delete this message?")) {
                                            async function deleteMessage() {
                                                if (!selectedChannel) {
                                                    return;
                                                }

                                                // remove message from channel
                                                await apiFetch(`${import.meta.env.VITE_API_URL}/messages/delete/${message.id}`, { method: "DELETE" });
                                                // update message list
                                                setMessages(messages.filter(msg => msg.id !== message.id));
                                            }
                                            deleteMessage();
                                            pingServer();
                                        }
                                        pingServer();
                                    }}
                                />
                            </div> 
                        </div>
                        {/* handle image/gifs and text messages */}
                        <div>{imageTokens.map((token, i) => <img key={i} src={token} className="message-image" />)}</div>
                        <div>{textTokens.join(" ")}</div>
                    </div>
                    } else {
                        const imageTokens = message.body.split(" ").filter(token => imageCheck(token));
                        const textTokens = message.body.split(" ").filter(token => !imageCheck(token));

                        return <div
                            key={message.id}
                            className="user-message message"
                        >
                            <div
                                className="message-header"
                                // clicking on user's name and/or icon opens user's profile
                                onClick={() => {
                                    clearTimeout(clickTimer.current);
                                    clickTimer.current = setTimeout(() => {
                                        setSelectedUser(message.users);
                                        setMainPanelView("userProfile");
                                    }, 250);
                                    pingServer();
                                }}
                                // double clicking on user's name and/or icon creates DM
                                onDoubleClick={() => {
                                    clearTimeout(clickTimer.current);
                                    async function getData() {
                                        const response = await apiFetch(`${import.meta.env.VITE_API_URL}/channels/new-channel/`, { method: "POST", body: JSON.stringify({ userIds: [message.users.id]}) });
                                        const data = await response.json();
                                        const createdChannel = data.channel || data.existingChannel;
                                        if (data.channel) setChannels([...channels, createdChannel]);
                                        setSelectedChannel(createdChannel);
                                        setMainPanelView("messages");
                                    }
                                    getData();
                                    pingServer();
                                }}
                            >
                                <img className="message-icon icon" src={message.users.icon?.startsWith("http") ? message.users.icon : `/icons/${message.users.icon}`} />
                                {message.users.displayName || message.users.username} 
                                {formatDate(message.createdAt)}
                                {Math.abs(new Date(message.updatedAt) - new Date(message.createdAt)) > 1000 && <span className="edited-message">edited</span>}
                            </div>
                            {/* handle image/gifs and text messages */}
                            <div>{imageTokens.map((token, i) => <img key={i} src={token} className="message-image" />)}</div>
                            <div>{textTokens.join(" ")}</div>
                        </div>
                    }
                })
            }
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
            // if channel owner, display edit button
            if (currentUser.id === selectedChannel.creatorId && selectedChannel.creatorId !== null) {
                title =
                    <div className="header">
                        <h2>
                            <img className="channel-icon lg-icon" src={selectedChannel.icon?.startsWith("http") ? selectedChannel.icon : `/icons/${selectedChannel.icon}`} /> 
                            Edit {selectedChannel.name}
                            <i 
                                className="fa-solid fa-x exit-icon ui-icon" 
                                onClick={() => {
                                    setMainPanelView("messages");
                                    pingServer();
                                }}
                            />
                        </h2>
                    </div>

                // filter for users not in channel
                const nonMembers = allUsers.filter(user => 
                    !channelDetails.users.some(member => member.username === user.username)
                );

                // filter users not in channel for search
                const filteredNonMembers = nonMembers.filter(user =>
                    (user.displayName || user.username).toLowerCase().includes(addUserSearch.toLowerCase())
                );

                // filter for users in channel (excluding owner)
                const removableUsers = channelDetails.users.filter(u => u.id !== selectedChannel.creatorId);

                // map over and display users who can be added
                const addUsers = (
                    <>
                        <h3>Add Users</h3>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={addUserSearch}
                            onChange={(e) => setAddUserSearch(e.target.value)}
                        />
                        {filteredNonMembers.length === 0 ? 
                            <p>No users to add</p> : filteredNonMembers.sort((a, b) => 
                                (a.displayName || a.username).localeCompare(b.displayName || b.username)).map(user =>
                                <div
                                    key={user.username}
                                    // clicking on user's name and/or icon opens user's profile
                                    onClick={() => {
                                        clearTimeout(clickTimer.current);
                                        clickTimer.current = setTimeout(() => {
                                            setSelectedUser(user);
                                            setPreviousView("editChannel");
                                            setMainPanelView("userProfile");
                                        }, 250);
                                        pingServer();
                                    }}
                                    // double clicking on user's name and/or icon creates DM
                                    onDoubleClick={() => {
                                        clearTimeout(clickTimer.current);
                                        async function getData() {
                                            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/channels/new-channel/`, { method: "POST", body: JSON.stringify({ userIds: [user.id]}) });
                                            const data = await response.json();
                                            const createdChannel = data.channel || data.existingChannel;
                                            if (data.channel) setChannels([...channels, createdChannel]);
                                            setSelectedChannel(createdChannel);
                                            setMainPanelView("messages");
                                        }
                                        getData();
                                        pingServer();
                                    }}
                                >
                                    <img className="user-icon icon" src={user.icon?.startsWith("http") ? user.icon : `/icons/${user.icon}`} />
                                    {user.displayName || user.username} 
                                    {/* clicking plus adds to channel, with confirmation */}
                                    <i 
                                        className="fa-solid fa-plus add-icon ui-icon"
                                        onClick={(e) => {
                                            // prevent triggering parent click
                                            e.stopPropagation();
                                            // add user to channel 
                                            if (window.confirm("Are you sure you want to add this user?")) {
                                                async function addUserToChannel() {
                                                    // add user
                                                    await apiFetch(`${import.meta.env.VITE_API_URL}/channels/manage/${selectedChannel.id}/members`, { method: "PUT", body: JSON.stringify({ action: "add", userId: user.id }) });
                                                    // update channel details to display new member
                                                    setChannelDetails({ ...channelDetails, users: [...channelDetails.users, user] });
                                                }
                                                addUserToChannel();
                                                pingServer();
                                            }
                                            pingServer();
                                        }}
                                    />
                                </div>
                            )
                        }
                    </>
                )

                // map over and display nonMembers for removable users list
                const removeUsers = (
                    <>
                        <h3>Remove Users</h3>
                        {removableUsers.length === 0 ? 
                            <p>No users to add</p> : removableUsers.sort((a, b) => 
                                (a.displayName || a.username).localeCompare(b.displayName || b.username)).map(user => 
                                <div
                                    key={user.username}
                                    // clicking on user's name and/or icon opens user's profile
                                    onClick={() => {
                                        clearTimeout(clickTimer.current);
                                        clickTimer.current = setTimeout(() => {
                                            setSelectedUser(user);
                                            setPreviousView("editChannel");
                                            setMainPanelView("userProfile");
                                        }, 250);
                                        pingServer();
                                    }}
                                    // double clicking on user's name and/or icon creates DM
                                    onDoubleClick={() => {
                                        clearTimeout(clickTimer.current);
                                        async function getData() {
                                            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/channels/new-channel/`, { method: "POST", body: JSON.stringify({ userIds: [user.id]}) });
                                            const data = await response.json();
                                            const createdChannel = data.channel || data.existingChannel;
                                            if (data.channel) setChannels([...channels, createdChannel]);
                                            setSelectedChannel(createdChannel);
                                            setMainPanelView("messages");
                                        }
                                        getData();
                                        pingServer();
                                    }}
                                >
                                    <img className="user-icon icon" src={user.icon?.startsWith("http") ? user.icon : `/icons/${user.icon}`} />
                                    {user.displayName || user.username} 
                                    {/* clicking minus removes user from channel, with confirmation */}
                                    <i 
                                        className="fa-solid fa-minus remove-icon ui-icon"
                                        onClick={(e) => {
                                            // prevent triggering parent click
                                            e.stopPropagation();
                                            // remove user from channel 
                                            if (window.confirm("Are you sure you want to remove this user?")) {
                                                async function removeUserFromChannel() {
                                                    // remove user
                                                    await apiFetch(`${import.meta.env.VITE_API_URL}/channels/manage/${selectedChannel.id}/members`, { method: "PUT", body: JSON.stringify({ action: "remove", userId: user.id }) });
                                                    // update channel details to display remaining members
                                                    setChannelDetails({ ...channelDetails, users: channelDetails.users.filter(u => u.username !== user.username) });
                                                }
                                                removeUserFromChannel();
                                                pingServer();
                                            }
                                            pingServer();
                                        }}
                                    />
                                </div>
                            )
                        }
                    </>
                )

                content = 
                <div className="editing-channel form">
                    <form onSubmit={(e) => {
                        e.preventDefault();

                        async function getData() {
                            await apiFetch(`${import.meta.env.VITE_API_URL}/channels/manage/${selectedChannel.id}/edit`, { method: "PUT", body: JSON.stringify({ 
                                icon: editingChannel.icon, 
                                name: editingChannel.name, 
                                channelInfo: editingChannel.channelInfo 
                            }) });
                            setSelectedChannel({ ...selectedChannel, ...editingChannel });
                            setChannels(channels.map(ch => ch.id === selectedChannel.id ? { ...ch, ...editingChannel } : ch))
                            setMainPanelView("messages");
                        }
                        getData(); // initial fetch
                    }}>
                        <label>Icon URL:
                            <input 
                                type="text"
                                placeholder="optional"
                                value={editingChannel.icon}
                                onChange={(e) => setEditingChannel({ ...editingChannel, icon: e.target.value })}
                            />
                        </label>
                        <label>Name:
                            <input 
                                type="text"
                                placeholder="optional"
                                maxLength={100}
                                value={editingChannel.name}
                                onChange={(e) => setEditingChannel({ ...editingChannel, name: e.target.value })}
                            />
                            {(100 - (editingChannel.name?.length || 0)) < 50 && (
                                <span>{100 - (editingChannel.name?.length || 0)} characters remaining</span>
                            )}
                        </label>
                        <label>Description:
                            <textarea 
                                placeholder="optional"
                                maxLength={200}
                                value={editingChannel.channelInfo || ""}
                                onChange={(e) => setEditingChannel({ ...editingChannel, channelInfo: e.target.value })}
                            />
                            {(200 - (editingChannel.channelInfo?.length || 0)) < 50 && (
                                <span>{200 - (editingChannel.channelInfo?.length || 0)} characters remaining</span>
                            )}
                        </label>
                        {addUsers}
                        {removeUsers}
                        <button type="submit" className="fa-solid fa-floppy-disk save-icon ui-icon" />
                    </form>
                    <i 
                        className="fa-solid fa-trash delete-channel-icon ui-icon"
                        onClick={(e) => {
                            // prevent triggering parent click
                            e.stopPropagation();
                            // delete channel
                            if (window.confirm("Are you sure you want to delete this channel?")) {
                                async function deleteChannel() {
                                    if (!selectedChannel) {
                                        return;
                                    }

                                    // remove channel
                                    await apiFetch(`${import.meta.env.VITE_API_URL}/channels/delete/${selectedChannel.id}`, { method: "DELETE" });
                                    // update channels list
                                    setChannels(channels.filter(channel => channel.id !== selectedChannel.id));
                                    // reset selectedChannel to default
                                    setSelectedChannel(channels.find(channel => channel.isDefault === true));
                                    setMainPanelView("messages");
                                }
                                deleteChannel();
                                pingServer();
                            }
                            pingServer();
                        }}
                    />
                </div>
            } else {
                title =
                    <div className="header">
                        <h2>
                            <img className="channel-icon lg-icon" src={selectedChannel.icon?.startsWith("http") ? selectedChannel.icon : `/icons/${selectedChannel.icon}`} />
                            {selectedChannel.name} Details
                            <i 
                                className="fa-solid fa-x exit-icon ui-icon" 
                                onClick={() => {
                                    setMainPanelView("messages");
                                    pingServer();
                                }}
                            />
                        </h2>
                    </div>

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
            {
                title =
                <div className="header">
                    <h2>Create New Channel
                        <i 
                            className="fa-solid fa-x exit-icon ui-icon" 
                            onClick={() => {
                                setMainPanelView("messages");
                                pingServer();
                            }}
                        />
                    </h2>
                </div>
    
                // filter for users not in channel
                const nonMembers = allUsers.filter(user => 
                    user.id !== currentUser.id &&
                    !newChannelUsers.some(member => member.id === user.id)
                );
    
                // filter users not in channel for search
                const filteredNonMembers = nonMembers.filter(user =>
                    (user.displayName || user.username).toLowerCase().includes(addUserSearch.toLowerCase())
                );
    
                // map over already selected users
                const selectedUsers = (
                    <>
                        <h3>Selected Users</h3>
                        {newChannelUsers.length === 0 ? 
                            <p>No users to add</p> : newChannelUsers.sort((a, b) => 
                                (a.displayName || a.username).localeCompare(b.displayName || b.username)).map(user =>
                                <div
                                    key={user.username}
                                    // clicking on user's name and/or icon opens user's profile
                                    onClick={() => {
                                        clearTimeout(clickTimer.current);
                                        clickTimer.current = setTimeout(() => {
                                            setSelectedUser(user);
                                            setPreviousView("createChannel");
                                            setMainPanelView("userProfile");
                                        }, 250);
                                        pingServer();
                                    }}
                                    // double clicking on user's name and/or icon creates DM
                                    onDoubleClick={() => {
                                        clearTimeout(clickTimer.current);
                                        async function getData() {
                                            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/channels/new-channel/`, { method: "POST", body: JSON.stringify({ userIds: [user.id]}) });
                                            const data = await response.json();
                                            const createdChannel = data.channel || data.existingChannel;
                                            if (data.channel) setChannels([...channels, createdChannel]);
                                            setSelectedChannel(createdChannel);
                                            setMainPanelView("messages");
                                        }
                                        getData();
                                        pingServer();
                                    }}
                                >
                                    <img className="user-icon icon" src={user.icon?.startsWith("http") ? user.icon : `/icons/${user.icon}`} />
                                        {user.displayName || user.username} 
                                        <i 
                                            className="fa-solid fa-minus remove-icon ui-icon"
                                            onClick={(e) => {
                                                // prevent triggering parent click
                                                e.stopPropagation();
                                                // remove user from channel 
                                                setNewChannelUsers(newChannelUsers.filter(u => u.id !== user.id))
                                                pingServer();
                                            }}
                                        />
                                </div>
                            )
                        }
                    </>
                )
    
                // map over and display users who can be added
                const addUsers = (
                    <>
                        <h3>Add Users</h3>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={addUserSearch}
                            onChange={(e) => setAddUserSearch(e.target.value)}
                        />
                        {filteredNonMembers.length === 0 ? 
                            <p>No users to add</p> : filteredNonMembers.sort((a, b) => 
                                (a.displayName || a.username).localeCompare(b.displayName || b.username)).map(user =>
                                <div
                                    key={user.username}
                                    // clicking on user's name and/or icon opens user's profile
                                    onClick={() => {
                                        clearTimeout(clickTimer.current);
                                        clickTimer.current = setTimeout(() => {
                                            setSelectedUser(user);
                                            setPreviousView("createChannel");
                                            setMainPanelView("userProfile");
                                        }, 250);
                                        pingServer();
                                    }}
                                    // double clicking on user's name and/or icon creates DM
                                    onDoubleClick={() => {
                                        clearTimeout(clickTimer.current);
                                        async function getData() {
                                            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/channels/new-channel/`, { method: "POST", body: JSON.stringify({ userIds: [user.id]}) });
                                            const data = await response.json();
                                            const createdChannel = data.channel || data.existingChannel;
                                            if (data.channel) setChannels([...channels, createdChannel]);
                                            setSelectedChannel(createdChannel);
                                            setMainPanelView("messages");
                                        }
                                        getData();
                                        pingServer();
                                    }}
                                >
                                    <img className="user-icon icon" src={user.icon?.startsWith("http") ? user.icon : `/icons/${user.icon}`} />
                                    {user.displayName || user.username}                                 <i 
                                        className="fa-solid fa-plus add-icon ui-icon"
                                        onClick={(e) => {
                                            // prevent triggering parent click
                                            e.stopPropagation();
                                            // add user to channel 
                                            async function addUserToChannel() {
                                                // add user
                                                setNewChannelUsers([...newChannelUsers, user]);
                                            }
                                            addUserToChannel();
                                            pingServer();
                                        }}
                                    />
                                </div>
                            )
                        }
                    </>
                )
    
                content = 
                <div className="creating-channel form">
                    <form onSubmit={(e) => {
                        e.preventDefault();
    
                        async function getData() {
                            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/channels/new-channel/`, { method: "POST", body: JSON.stringify({
                                userIds: newChannelUsers.map(u => u.id), name: newChannel.name
                            }) });
                            const data = await response.json();
                            const createdChannel = data.channel;
                            setChannels([...channels, createdChannel]);
                            setSelectedChannel(createdChannel);
                            setMainPanelView("messages");
                        }
                        getData();
                    }}>
                        <label>Icon URL:
                            <input 
                                type="text"
                                placeholder="optional"
                                value={newChannel.icon}
                                onChange={(e) => setNewChannel({ ...newChannel, icon: e.target.value })}
                            />
                        </label>
                        <label>Name:
                            <input 
                                type="text"
                                placeholder="optional"
                                maxLength={100}
                                value={newChannel.name}
                                onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                            />
                            {(100 - (newChannel.name?.length || 0)) < 50 && (
                                <span>{100 - (newChannel.name?.length || 0)} characters remaining</span>
                            )}
                        </label>
                        <label>Description:
                            <textarea 
                                placeholder="optional"
                                maxLength={200}
                                value={newChannel.channelInfo || ""}
                                onChange={(e) => setNewChannel({ ...newChannel, channelInfo: e.target.value })}
                            />
                            {(200 - (newChannel.channelInfo?.length || 0)) < 50 && (
                                <span>{200 - (newChannel.channelInfo?.length || 0)} characters remaining</span>
                            )}
                        </label>
                        {selectedUsers}
                        {addUsers}
                        <button type="submit" className="fa-solid fa-floppy-disk save-icon ui-icon" />
                    </form>
                </div>
            }
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