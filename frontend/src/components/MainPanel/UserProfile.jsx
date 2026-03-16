// frontend/src/components/MainPanel/UserProfile.jsx

// imports
import apiFetch from "../../helpers/apiFetch";
import pingServer from "../../helpers/pingServer";
import formatDate from "../../helpers/formatDate";

function UserProfile({ userProfile, currentUser, channels, setChannels, setSelectedChannel, setEditingProfile, setMainPanelView, previousView }) {
    if (!userProfile) return <div>Loading...</div>
    return <>
        <div className="header">
            <h2>
                <img className="profile-icon lg-icon" src={userProfile.icon?.startsWith("http") ? userProfile.icon : `/icons/${userProfile.icon}`} />
                {userProfile.displayName} Details

                {currentUser.id === userProfile.id && (
                <i 
                    className="fa-solid fa-pencil edit-icon ui-icon"
                    onClick={() => {
                        if (!userProfile) return;
                        setEditingProfile({ ...userProfile, profileInfo: userProfile.profileInfo });
                        setMainPanelView("editProfile"); 
                        pingServer();
                    }}
                />
                )}

                {currentUser.id !== userProfile.id && (
                    <i 
                        className="fa-regular fa-envelope message-icon"
                        onClick={() => {
                            async function getData() {
                                const response = await apiFetch(`${import.meta.env.VITE_API_URL}/channels/new-channel/`, { method: "POST", body: JSON.stringify({ userIds: [userProfile.id]}) });
                                const data = await response.json();
                                const createdChannel = data.channel || data.existingChannel;
                                if (data.channel) setChannels([...channels, createdChannel]);
                                setSelectedChannel(createdChannel);
                                setMainPanelView("messages");
                            }
                            getData();
                            pingServer();
                        }}
                    />
                )}
                <i 
                    className="fa-solid fa-x exit-icon ui-icon" 
                    onClick={() => {
                        setMainPanelView(previousView);
                        pingServer();
                    }}
                />
            </h2>
        </div>

        <div className="user-profile">
            {userProfile.displayName}
            {userProfile.username}
            {userProfile.profileInfo}
            Last seen: {formatDate(userProfile.lastSeen)}
        </div>
    </>
}

export default UserProfile;