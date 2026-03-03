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
                console.log(channel.name);
            }}
            className="channel"
        >
            <img className="channel-icon icon" src={`/icons/${channel.icon}`}></img> {channel.name}
        </div>
    );
    
    return (
        <div>
            (left panel)
            {displayChannels}
        </div>
    )
}

export default LeftPanel;
