// frontend/src/components/MainPanel/EditChannel.jsx

// imports
import apiFetch from "../../helpers/apiFetch";
import getIconUrl from "../../helpers/getIconUrl";
import pingServer from "../../helpers/pingServer";

function EditChannel ({ 
    selectedChannel, 
    channels, 
    setChannels, 
    setSelectedChannel, 
    channelDetails, 
    setChannelDetails, 
    allUsers, 
    addUserSearch, 
    setAddUserSearch, 
    editingChannel, 
    setEditingChannel, 
    setMainPanelView 
}) {
    async function updateChannelDetails() {
        await apiFetch(
            `${import.meta.env.VITE_API_URL}/channels/manage/${selectedChannel.id}/edit`, 
            { 
                method: "PUT", body: JSON.stringify({ 
                    icon: editingChannel.icon, 
                    name: editingChannel.name, 
                    channelInfo: editingChannel.channelInfo 
                }) 
            }
        );
        setSelectedChannel({ ...selectedChannel, ...editingChannel });
        setChannels(channels.map(ch => ch.id === selectedChannel.id ? { ...ch, ...editingChannel } : ch))
        setMainPanelView("messages");
    }

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
                className="user-search"
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
                        onClick={() => {
                            // clicking adds users to channel, with confirmation
                            if (window.confirm("Are you sure you want to add this user?")) {
                                async function addUserToChannel() {
                                    // add user
                                    await apiFetch(
                                        `${import.meta.env.VITE_API_URL}/channels/manage/${selectedChannel.id}/members`, 
                                        { 
                                            method: "PUT", 
                                            body: JSON.stringify({ action: "add", userId: user.id }) 
                                        }
                                    );
                                    // update channel details to display new member
                                    setChannelDetails({ ...channelDetails, users: [...channelDetails.users, user] });
                                }
                                addUserToChannel();
                                pingServer();
                            }
                            pingServer();
                        }}
                    >
                        <i className="fa-solid fa-plus add-icon ui-icon" />
                        <img className="user-icon icon" src={getIconUrl(user.icon)} />
                        {user.displayName || user.username} 
                    </div>
                )
            }
        </>
    )

    // map over and display nonMembers for removable users list
    const selectedUsers = (
        <>
            <h3>Remove Users</h3>
            {removableUsers.length === 0 ? 
                <p>No users to add</p> : removableUsers.sort((a, b) => 
                    (a.displayName || a.username).localeCompare(b.displayName || b.username)).map(user => 
                    <div
                        className="user user-select"
                        key={user.username}
                        onClick={() => {
                            // clicking removes user from channel, with confirmation
                            if (window.confirm("Are you sure you want to remove this user?")) {
                                async function removeUserFromChannel() {
                                    // remove user
                                    await apiFetch(
                                        `${import.meta.env.VITE_API_URL}/channels/manage/${selectedChannel.id}/members`, 
                                        { 
                                            method: "PUT", 
                                            body: JSON.stringify({ action: "remove", userId: user.id }) 
                                        }
                                    );
                                    // update channel details to display remaining members
                                    setChannelDetails({ ...channelDetails, users: channelDetails.users.filter(u => u.username !== user.username) });
                                }
                                removeUserFromChannel();
                                pingServer();
                            }
                            pingServer();
                        }}
                    >
                        <i className="fa-solid fa-minus remove-icon ui-icon" />
                        <img className="user-icon icon" src={getIconUrl(user.icon)} />
                        {user.displayName || user.username} 
                    </div>
                )
            }
        </>
    )

    return <>
        <div className="header">
            <h2>
                <img className="channel-icon lg-icon" src={getIconUrl(selectedChannel.icon)} />
                <div className="channel-details-name">{selectedChannel.name} - Edit</div>
                <i 
                    className="fa-solid fa-x exit-icon ui-icon" 
                    onClick={() => {
                        setMainPanelView("messages");
                        pingServer();
                    }}
                />
            </h2>
        </div>

        <form 
            className="editing-channel form"
            onSubmit={(e) => {
                e.preventDefault();
                updateChannelDetails(); // initial fetch
                }}
        >
            <div className="form-no-users">
                <label>Icon URL
                    <input 
                        type="text"
                        placeholder="optional"
                        value={editingChannel.icon}
                        onChange={(e) => setEditingChannel({ ...editingChannel, icon: e.target.value })}
                    />
                </label>
                <label>Name
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
                <label>Description
                    <textarea 
                        className="description-textarea"
                        placeholder="optional"
                        maxLength={200}
                        value={editingChannel.channelInfo || ""}
                        onChange={(e) => setEditingChannel({ ...editingChannel, channelInfo: e.target.value })}
                    />
                    {(200 - (editingChannel.channelInfo?.length || 0)) < 50 && (
                        <span>{200 - (editingChannel.channelInfo?.length || 0)} characters remaining</span>
                    )}
                </label>
            </div>
            <div className="form-bottom">
                <div className="all-users">
                    <div className="selected-users">{selectedUsers}</div>
                    <div className="add-users">{addUsers}</div>
                </div>
                <div className="save-delete">
                    <button type="submit" className="fa-solid fa-floppy-disk save-icon channel-save ui-icon" />
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
                                    await apiFetch(
                                        `${import.meta.env.VITE_API_URL}/channels/delete/${selectedChannel.id}`, 
                                        { method: "DELETE" }
                                    );
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
            </div>
        </form>

    </>
}

export default EditChannel;