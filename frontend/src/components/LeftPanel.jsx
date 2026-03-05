// frontend/src/components/LeftPanel.jsx

// imports
import { useState, useEffect } from "react";
import apiFetch from "../helpers/apiFetch";

// display all channels that user is in
function LeftPanel( {selectedChannel, setSelectedChannel, channels, setChannels, mainPanelView, setMainPanelView } ) {
    // map over and display channels
    const displayChannels = channels.map(channel => 
        <div 
            key={channel.id} 
            onClick={() => {
                setSelectedChannel(channel);
                setMainPanelView("messages");
            }}
            className="channel"
        >
            <img className="channel-icon icon" src={`/icons/${channel.icon}`}></img> {channel.name}
        </div>
    );

    return (
        <div>
            <h2 className="header">All Channels</h2>
            {displayChannels}
        </div>
    )
}

export default LeftPanel;
