// frontend/src/components/MainPanel/UserProfile.jsx

// imports
import createDirectMessage from "../../helpers/createDirectMessage";
import formatDate from "../../helpers/formatDate";
import getIconUrl from "../../helpers/getIconUrl";
import pingServer from "../../helpers/pingServer";

function UserProfile({ 
    userProfile, 
    currentUser, 
    channels, 
    setChannels, 
    setSelectedChannel, 
    setEditingProfile, 
    setMainPanelView, 
    previousView 
}) {
    if (!userProfile) return <div>Loading...</div>
    return <>
        <div className="header">
            <h2>
                <img className="profile-icon lg-icon" src={getIconUrl(userProfile.icon)} />
                {userProfile.displayName || userProfile.username} Details

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
                            createDirectMessage(
                                userProfile.id,
                                channels, 
                                setChannels, 
                                setSelectedChannel, 
                                setMainPanelView
                            );
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