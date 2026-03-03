// frontend/src/components/LeftPanel.jsx

// imports
import { useState, useEffect } from "react";
import apiFetch from "../helpers/apiFetch";

// display all channels that user is in
function LeftPanel( {selectedChannel, setSelectedChannel, mainPanelView, setMainPanelView } ) {
    const [channels, setChannels] = useState([]);
    
    // fetch and store channels list
    useEffect(() => {
        async function getData() {
            // fetch all channels
            const response = await apiFetch(`${import.meta.env.VITE_API_URL}/channels/all-channels`)
            
            const data = await response.json();
            setChannels(data.channels);
        }
        getData();
    }, []);

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
