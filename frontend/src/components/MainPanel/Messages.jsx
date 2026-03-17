// frontend/src/components/MainPanel/Messages.jsx

// imports
import { useState, useRef } from "react";
import apiFetch from "../../helpers/apiFetch";
import createDirectMessage from "../../helpers/createDirectMessage";
import formatDate from "../../helpers/formatDate";
import getIconUrl from "../../helpers/getIconUrl";
import imageCheck from "../../helpers/imageCheck";
import pingServer from "../../helpers/pingServer";

function Messages ({ 
    currentUser, 
    selectedChannel, 
    channelDetails, 
    messages, 
    setMessages, 
    channels, 
    setChannels, 
    setSelectedChannel, 
    setSelectedUser, 
    setEditingMessage, 
    setEditingProfile, 
    setEditingChannel, 
    setAddUserSearch, 
    setMainPanelView 
}) {
    const [messageBody, setMessageBody] = useState("");
    const [showImageInput, setShowImageInput] = useState(false);
    const [imageUrl, setImageUrl] = useState("");

    // set up timeout
    const clickTimer = useRef(null);

    // message submit handler
    async function submitHandler() {
        if (!messageBody.trim()) {
            return;
        }
        const newMessage = await apiFetch(
            `${import.meta.env.VITE_API_URL}/messages/new-message/`, 
            { 
                method: "POST", 
                body: JSON.stringify({ 
                    body: messageBody, 
                    channelId: selectedChannel.id 
                }) 
            }
        );
        const data = await newMessage.json();
        setMessages([...messages, data.messages]);
        setMessageBody("");
        setImageUrl("");
        setShowImageInput(false);
        pingServer();
    }

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
                    if (message.users.id === currentUser.id) {
                        setEditingProfile({ ...currentUser });
                        setMainPanelView("editProfile");
                    } else {
                        createDirectMessage(
                            message.users.id,
                            channels,
                            setChannels,
                            setSelectedChannel,
                            setMainPanelView
                        );
                    }
                    pingServer();
                }}
            >
                <img className="message-icon icon" src={getIconUrl(message.users.icon)} />
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
                        createDirectMessage(
                            message.users.id, 
                            channels, 
                            setChannels, 
                            setSelectedChannel, 
                            setMainPanelView
                        );
                        pingServer();
                    }}
                >
                    <img className="message-icon icon" src={getIconUrl(message.users.icon)} />
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
        <div className="channel-header header">
            <div className="channel-info">
                <img className="channel-icon lg-icon" src={getIconUrl(selectedChannel.icon)} />
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
            </div>
            <div className="channel-description">
                {selectedChannel.channelInfo}
            </div>
        </div>
        <div className="message-display">{messageList}</div>
        <div className="textbox">
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
    </>
}

export default Messages;