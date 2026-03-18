// frontend/src/components/MainPanel/CreateChannel.jsx

// imports
import { useRef } from "react";
import apiFetch from "../../helpers/apiFetch";
import createDirectMessage from "../../helpers/createDirectMessage";
import getIconUrl from "../../helpers/getIconUrl";
import pingServer from "../../helpers/pingServer";

function CreateChannel ({ 
    allUsers, 
    currentUser, 
    newChannelUsers, 
    setNewChannelUsers, 
    addUserSearch, 
    setSelectedUser, 
    setPreviousView, 
    channels, 
    setChannels, 
    setSelectedChannel, 
    setAddUserSearch, 
    newChannel, 
    setNewChannel, 
    setMainPanelView 
}) {
    // set up timeout
    const clickTimer = useRef(null);

    async function createGroupChannel() {
        const response = await apiFetch(
            `${import.meta.env.VITE_API_URL}/channels/new-channel/`, 
            { 
                method: "POST", 
                body: JSON.stringify({
                    userIds: newChannelUsers.map(u => u.id), 
                    name: newChannel.name,
                    icon: newChannel.icon,
                    channelInfo: newChannel.channelInfo
                }) 
            }
        );
        const data = await response.json();
        const createdChannel = data.channel || data.existingChannel;
        if (data.channel) setChannels([...channels, createdChannel]);
        setSelectedChannel(createdChannel);
        setMainPanelView("messages");
    }

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
                            className="user user-select"
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
                                createDirectMessage(
                                    user.id, 
                                    channels, 
                                    setChannels, 
                                    setSelectedChannel, 
                                    setMainPanelView
                                );
                                pingServer();
                            }}
                        >
                            {/* clicking minus removes user from channel */}
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
                            <img className="user-icon icon" src={getIconUrl(user.icon)} />
                                {user.displayName || user.username} 
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
                            className="user user-select"
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
                                createDirectMessage(
                                    user.id, 
                                    channels, 
                                    setChannels, 
                                    setSelectedChannel, 
                                    setMainPanelView
                                );
                                pingServer();
                            }}
                        >
                            {/* clicking plus adds to channel */}
                            <i 
                                className="fa-solid fa-plus add-icon ui-icon"
                                onClick={(e) => {
                                    // prevent triggering parent click
                                    e.stopPropagation();
                                    setNewChannelUsers([...newChannelUsers, user]);
                                    pingServer();
                                }}
                            />
                            <img className="user-icon icon" src={getIconUrl(user.icon)} />
                            {user.displayName || user.username}                                 
                        </div>
                    )
                }
            </>
        )

    return <>
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

        <div className="creating-channel form">
            <form onSubmit={(e) => {
                e.preventDefault();
                createGroupChannel();
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
    </>
}

export default CreateChannel;