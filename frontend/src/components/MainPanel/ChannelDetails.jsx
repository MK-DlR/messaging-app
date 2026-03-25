// frontend/src/components/MainPanel/ChannelDetails.jsx

// imports
import { useRef } from "react";
import apiFetch from "../../helpers/apiFetch";
import createDirectMessage from "../../helpers/createDirectMessage";
import getIconUrl from "../../helpers/getIconUrl";
import pingServer from "../../helpers/pingServer";

function ChannelDetails ({ 
    currentUser, 
    channels, 
    setChannels, 
    selectedChannel, 
    setSelectedChannel, 
    channelDetails, 
    setSelectedUser, 
    setMainPanelView 
}) {
    // set up timeout
    const clickTimer = useRef(null);

    // map over and display users
    const displayUsers = channelDetails.users.sort((a, b) => 
        (a.displayName || a.username).localeCompare(b.displayName || b.username)).map(user =>
        <div
        className="user user-select"
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
            <img className="user-icon icon" src={getIconUrl(user.icon)} />
            {user.displayName || user.username} 
        </div>
    );

    return <>
        <div className="header">
            <h2>
                <img className="channel-icon lg-icon" src={getIconUrl(selectedChannel.icon)} />
                <div className="channel-details-name">{selectedChannel.name} - Details</div>

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
                                await apiFetch(
                                    `${import.meta.env.VITE_API_URL}/channels/leave/${selectedChannel.id}`, 
                                    { method: "DELETE" }
                                );
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

        <div className="channel-details">
            <div className="channel-details-info">
                {channelDetails.channelInfo || "No channel description given."}
                <h3 className="channel-members">Channel Members</h3>
                <div className="all-users display-users">{displayUsers}</div>
            </div>
        </div>
    </>
}

export default ChannelDetails;