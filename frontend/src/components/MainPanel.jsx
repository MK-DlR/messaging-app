// frontend/src/components/MainPanel.jsx

// imports
import { useState, useEffect, useRef } from "react";
import apiFetch from "../helpers/apiFetch";
import pingServer from "../helpers/pingServer";
import isOnline from "../helpers/isOnline";
import StatusCircle from "./StatusCircle";
import formatDate from "../helpers/formatDate";

// conditionally render different content based on mainPanelView
function MainPanel( { currentUser, setCurrentUser, selectedChannel, setSelectedChannel, channels, setChannels, mainPanelView, setMainPanelView, selectedUser, setSelectedUser, allUsers, setAllUsers } ) {
    const [messages, setMessages] = useState([]);
    const [userProfile, setUserProfile] = useState(null);
    const [channelDetails, setChannelDetails] = useState(null);
    const [previousView, setPreviousView] = useState("messages");
    const [editingChannel, setEditingChannel] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editingProfile, setEditingProfile] = useState(null);

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

    let title;
    let content;

    // if no user, return a loading state early
    if (!currentUser) return <div>Loading...</div>;

    // determine which channel is selected
    switch (mainPanelView) {
        case "messages": // display channel's messages
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
                </div>

            // map over and display messages
            content = messages.map(message => {
                // if current user is message author, display edit and delete icons
                if (currentUser.id === message.userId) {
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
                            setMainPanelView("createChannel");
                            pingServer();
                        }}
                    >
                        <img className="message-icon icon" src={message.users.icon?.startsWith("http") ? message.users.icon : `/icons/${message.users.icon}`} />
                        {message.users.displayName || message.users.username}
                        {formatDate(message.createdAt)}
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
                    {message.body}
                </div>
                } else {
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
                                setMainPanelView("createChannel");
                                pingServer();
                            }}
                        >
                            <img className="message-icon icon" src={message.users.icon?.startsWith("http") ? message.users.icon : `/icons/${message.users.icon}`} />
                            {message.users.displayName || message.users.username} 
                            {formatDate(message.createdAt)}
                        </div>
                        {message.body}
                    </div>
                }
            })

            break;
        case "channelDetails": // display channel's details
            {
                title =
                    <div className="header">
                        <h2>
                            <img className="channel-icon lg-icon" src={selectedChannel.icon?.startsWith("http") ? selectedChannel.icon : `/icons/${selectedChannel.icon}`} />
                            {selectedChannel.name} Details

                            {/* if current user is not channel owner, display leave icon */}
                            {!selectedChannel.isDefault && currentUser.id !== selectedChannel.creatorId && (
                                <i
                                className="fa-solid fa-door-open leave-icon ui-icon"
                                onClick={() => {
                                    // leave channel
                                    if (window.confirm("Are you sure you want to leave this channel?")) {
                                        async function leaveChannel() {
                                            if (!selectedChannel) {
                                                return;
                                            }

                                            // remove user from channel
                                            await apiFetch(`${import.meta.env.VITE_API_URL}/channels/leave/${selectedChannel.id}`, { method: "DELETE" });
                                            // update channels list
                                            setChannels(channels.filter(channel => channel.id !== selectedChannel.id));
                                            // reset selectedChannel to default
                                            setSelectedChannel(channels.find(channel => channel.isDefault === true));
                                            setMainPanelView("messages");
                                        }
                                        leaveChannel();
                                        pingServer();
                                    }
                                }}
                                />
                            )}

                            <i
                                className="fa-solid fa-x exit-icon ui-icon"
                                onClick={() => {
                                    setMainPanelView("messages");
                                    pingServer();
                                }}
                            />
                        </h2>
                    </div>

                // map over and display users
                const displayUsers = channelDetails.users.map(user => 
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
                        <img className="user-icon icon" src={user.icon?.startsWith("http") ? user.icon : `/icons/${user.icon}`} />
                        {user.displayName || user.username} 
                    </div>
                );

                content = 
                    <div className="channel-details">
                        {channelDetails.channelInfo}
                        {displayUsers}
                    </div>
            }
            break;
        case "editChannel": // channel owner can edit and/or delete channel
            // TO DO: finish edit channel form (add/remove users, channel deletion)

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

                // TO DO: add search bar for addUsers list
                // map over and display nonMembers for addable users list
                const addUsers = nonMembers.map(user =>
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
                            setMainPanelView("createChannel");
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
                );

                // TO DO: map over and display channelDetails.users for removable users list
                // (minus creator)

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
                                value={editingChannel.icon}
                                onChange={(e) => setEditingChannel({ ...editingChannel, icon: e.target.value })}
                            />
                        </label>
                        <label>Name:
                            <input 
                                type="text"
                                value={editingChannel.name}
                                onChange={(e) => setEditingChannel({ ...editingChannel, name: e.target.value })}
                            />
                        </label>
                        <label>Description:
                            <input 
                                type="text"
                                value={editingChannel.channelInfo || ""}
                                onChange={(e) => setEditingChannel({ ...editingChannel, channelInfo: e.target.value })}
                            />
                        </label>
                        {addUsers}
                        <li>remove users (w confirmation)</li>
                        <button type="submit" className="save-icon ui-icon">
                            <i className="fa-solid fa-floppy-disk" />
                        </button>
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
            title =
                    <div className="header">
                        <h2>
                            Edit Message
                            <i 
                                className="fa-solid fa-x exit-icon ui-icon" 
                                onClick={() => {
                                    setMainPanelView("messages");
                                    pingServer();
                                }}
                            />
                        </h2>
                    </div>

                content = 
                    <div className="editing-message form">
                        <form onSubmit={(e) => {
                            e.preventDefault();

                            async function getData() {
                                await apiFetch(`${import.meta.env.VITE_API_URL}/messages/edit/${editingMessage.id}`, { method: "PUT", body: JSON.stringify({ 
                                    body: editingMessage.body 
                                }) });
                                setMessages(messages.map(msg =>
                                    msg.id === editingMessage.id
                                    ? { ...msg, body: editingMessage.body }
                                    : msg
                                ));
                                setMainPanelView("messages");
                            }
                            getData(); // initial fetch
                        }}>
                            <input 
                                type="text"
                                value={editingMessage.body}
                                onChange={(e) => setEditingMessage({ ...editingMessage, body: e.target.value })}
                            />
                            <button type="submit" className="save-icon ui-icon">
                                <i className="fa-solid fa-floppy-disk" />
                            </button>
                        </form>
                    </div>
            break;
        case "userProfile": // display user profile details
            if (!userProfile) {
                content = <div>Loading...</div>
            } else {
                title =
                    <div className="header">
                        <h2>
                        <img className="profile-icon lg-icon" src={userProfile.icon?.startsWith("http") ? userProfile.icon : `/icons/${userProfile.icon}`} />
                            {userProfile.displayName} Details

                            {currentUser.id === userProfile.id && (
                            <i 
                                className="fa-solid fa-pencil edit-icon ui-icon"
                                onClick={() => {
                                    if (!userProfile) return;
                                    setEditingProfile({ ...userProfile, profileInfo: userProfile.profileInfo });
                                    setMainPanelView("editProfile"); 
                                    pingServer();
                                }}
                            />
                            )}

                            {currentUser.id !== userProfile.id && (
                                <i 
                                    className="fa-regular fa-envelope message-icon"
                                    onClick={() => {
                                        setMainPanelView("createChannel");
                                        pingServer();
                                    }}
                                />
                            )}
                            <i 
                                className="fa-solid fa-x exit-icon ui-icon" 
                                onClick={() => {
                                    setMainPanelView(previousView);
                                    pingServer();
                                }}
                            />
                        </h2>
                    </div>

                content = 
                    <div className="user-profile">
                        {userProfile.displayName}
                        {userProfile.username}
                        {userProfile.profileInfo}
                        Last seen: {formatDate(userProfile.lastSeen)}
                    </div>
            }
            break;
        case "editProfile": // user can edit own profile
            title =
            <div className="header">
                <h2>Edit Profile 
                    <i 
                        className="fa-solid fa-x exit-icon ui-icon" 
                        onClick={() => {
                            setMainPanelView("userProfile");
                            pingServer();
                        }}
                    />
                </h2>
            </div>
            content = 
            <div className="editing-profile form">
                <form onSubmit={(e) => {
                    e.preventDefault();

                    async function getData() {
                        await apiFetch(`${import.meta.env.VITE_API_URL}/users/${currentUser.username}`, { method: "PUT", body: JSON.stringify({
                            icon: editingProfile.icon,
                            displayName: editingProfile.displayName,
                            profileInfo: editingProfile.profileInfo
                        }) });
                        setSelectedUser({ ...selectedUser, ...editingProfile });
                        setCurrentUser({ ...currentUser, ...editingProfile });
                        setUserProfile({ ...userProfile, ...editingProfile });
                        setMainPanelView("userProfile");
                    }
                    getData(); // initial fetch
                }}>
                    <label>Icon URL:
                        <input
                            type="text"
                            value={editingProfile.icon}
                            onChange={(e) => setEditingProfile({ ...editingProfile, icon: e.target.value })}
                        />
                    </label>
                    <label>Display Name:
                        <input
                            type="text"
                            value={editingProfile.displayName}
                            onChange={(e) => setEditingProfile({ ...editingProfile, displayName: e.target.value })}
                        />
                    </label>
                    <label>Profile Info:
                        <input
                            type="textarea"
                            value={editingProfile.profileInfo}
                            onChange={(e) => setEditingProfile({ ...editingProfile, profileInfo: e.target.value })}
                        />
                    </label>
                    <button type="submit" className="save-icon ui-icon ui-icon">
                        <i className="fa-solid fa-floppy-disk" />
                    </button>
                </form>
            </div>
            break;
        case "createChannel": // display create new channel
            title =
                <div className="header">
                    <h2>Create New Channel</h2>
                </div>

            content = 
                <div>Create new DM/channel...
                    <i 
                        className="fa-solid fa-x exit-icon ui-icon" 
                        onClick={() => {
                            setMainPanelView("messages");
                            pingServer();
                        }}
                    />
                </div>
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
        </div>
    )
}

export default MainPanel;