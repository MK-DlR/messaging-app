// frontend/src/components/LeftPanel.jsx

// imports
import { useState, useEffect } from "react";
import apiFetch from "../helpers/apiFetch";
import { useNavigate } from "react-router-dom";

// display all channels that user is in
function LeftPanel( {setCurrentUser, selectedChannel, setSelectedChannel, channels, setChannels, mainPanelView, setMainPanelView, newChannelUsers, setNewChannelUsers, newChannel, setNewChannel, addUserSearch, setAddUserSearch } ) {
    const navigate = useNavigate()
    // map over and display channels
    const displayChannels = [...channels]
        .sort((a, b) => {
            if (a.isDefault) return -1;
            if (b.isDefault) return 1;
            return a.name.localeCompare(b.name);
        })
        .map(channel => 
            <div 
                key={channel.id} 
                onClick={() => {
                    setSelectedChannel(channel);
                    setMainPanelView("messages");
                }}
                className="channel"
            >
                <img className="channel-icon icon" src={channel.icon?.startsWith("http") ? channel.icon : `/icons/${channel.icon}`} /> {channel.name}
            </div>
        );

    return (
        <div>
            <h2 className="header">All Channels</h2>
            {displayChannels}
            <div className="button-panel">
                <button 
                    type="button" 
                    className="submit button"
                    onClick={() => {
                        setMainPanelView("createChannel");
                        setNewChannel({ icon: "", name: "", channelInfo: "" });
                        setNewChannelUsers([]);
                    }}
                >
                    + Channel
                </button>
                <button 
                    type="button" 
                    className="logout button"
                    onClick={() => {
                        localStorage.removeItem("token");
                        setCurrentUser(null);
                        navigate("/login");
                    }}
                    >
                        Logout
                </button>
            </div>
        </div>
    )
}

export default LeftPanel;
