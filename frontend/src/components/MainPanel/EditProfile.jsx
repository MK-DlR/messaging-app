// frontend/src/components/MainPanel/EditProfile.jsx

// imports
import apiFetch from "../../helpers/apiFetch";
import pingServer from "../../helpers/pingServer";

function EditProfile ({ 
    setMainPanelView, 
    editingProfile, 
    setEditingProfile, 
    currentUser, 
    setCurrentUser, 
    selectedUser, 
    setSelectedUser, 
    userProfile, 
    setUserProfile 
}) {
    async function updateProfile() {
        await apiFetch(
            `${import.meta.env.VITE_API_URL}/users/${currentUser.username}`, 
            { 
                method: "PUT", 
                body: JSON.stringify({
                    icon: editingProfile.icon,
                    displayName: editingProfile.displayName,
                    profileInfo: editingProfile.profileInfo
                }) 
            }
        );
        setSelectedUser({ ...selectedUser, ...editingProfile });
        setCurrentUser({ ...currentUser, ...editingProfile });
        setUserProfile({ ...userProfile, ...editingProfile });
        setMainPanelView("userProfile");
    }

    return <>
        <div className="header">
            <h2>Edit Profile 
                <i 
                    className="fa-solid fa-x exit-icon ui-icon" 
                    onClick={() => {
                        setMainPanelView("userProfile");
                        pingServer();
                    }}
                />
            </h2>
        </div>

        <div className="editing-profile form">
            <form onSubmit={(e) => {
                e.preventDefault();
                updateProfile(); // initial fetch
            }}>
                <div className="form-no-users">
                    <label>Icon URL
                        <input
                            type="text"
                            placeholder="optional"
                            value={editingProfile.icon}
                            onChange={(e) => setEditingProfile({ ...editingProfile, icon: e.target.value })}
                        />
                    </label>
                    <label>Display Name
                        <input
                            type="text"
                            placeholder="optional"
                            maxLength={64}
                            value={editingProfile.displayName}
                            onChange={(e) => setEditingProfile({ ...editingProfile, displayName: e.target.value })}
                        />
                        {(64 - (editingProfile.displayName?.length || 0)) < 50 && (
                            <span>{64 - (editingProfile.displayName?.length || 0)} characters remaining</span>
                        )}
                    </label>
                    <label>Profile Info
                        <textarea
                            className="user-textarea"
                            placeholder="optional"
                            maxLength={200}
                            value={editingProfile.profileInfo}
                            onChange={(e) => setEditingProfile({ ...editingProfile, profileInfo: e.target.value })}
                        />
                        {(200 - (editingProfile.profileInfo?.length || 0)) < 50 && (
                            <span>{200 - (editingProfile.profileInfo?.length || 0)} characters remaining</span>
                        )}
                    </label>
                </div>
                <button type="submit" className="fa-solid fa-floppy-disk save-icon profile-save ui-icon" />
            </form>
        </div>
    </>
}

export default EditProfile;