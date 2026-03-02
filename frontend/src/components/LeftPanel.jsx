// frontend/src/components/LeftPanel.jsx

// imports
import { useState, useEffect } from "react";
import apiFetch from "../helpers/apiFetch";

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
        >{channel.name}</div>
        // TO DO: display channel icon (once schema is updated for icons)
    );
    
    return (
        <div>
            left panel
            {displayChannels}
        </div>
    )
}

export default LeftPanel;
