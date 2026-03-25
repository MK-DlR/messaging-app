// frontend/src/components/LeftPanel.jsx

// imports
import { useNavigate } from "react-router-dom";
import Spinner from "./Spinner";
import getIconUrl from "../helpers/getIconUrl";

// display all channels that user is in
function LeftPanel({ 
    currentUser,
    setCurrentUser, 
    setSelectedChannel, 
    channels, 
    setMainPanelView, 
    setNewChannelUsers, 
    setNewChannel 
}) {
    const navigate = useNavigate();

    let displayChannels;

    // if no user, return a loading state early
    if (!currentUser) {
        displayChannels = 
            <div className="loading">
                <Spinner />
                Loading...
            </div>;

        return (
            <div className="left-panel">
                <h2 className="header">All Channels</h2>
                <div className="channel-display">{displayChannels}</div>
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

    // map over and display channels
    displayChannels = [...channels]
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
                <img className="channel-icon icon"src={getIconUrl(channel.icon)} />{channel.name}
            </div>
        );

    return (
        <div className="left-panel">
            <h2 className="header">All Channels</h2>
            <div className="channel-display">{displayChannels}</div>
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
