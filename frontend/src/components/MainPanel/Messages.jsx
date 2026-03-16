// frontend/src/components/MainPanel/Messages.jsx

// imports
import { useRef } from "react";
import apiFetch from "../../helpers/apiFetch";
import pingServer from "../../helpers/pingServer";
import formatDate from "../../helpers/formatDate";
import imageCheck from "../../helpers/imageCheck";

function Messages ({ currentUser, selectedChannel, channelDetails, messages, setMessages, channels, setChannels, setSelectedChannel, setSelectedUser, setEditingMessage, setEditingProfile, setEditingChannel, setAddUserSearch, setMainPanelView }) {
    // set up timeout
    const clickTimer = useRef(null);

    // map over and display messages
    const messageList = messages.map(message => {
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

    return <>
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
        {messageList}
    </>
}

export default Messages;