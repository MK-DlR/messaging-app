// frontend/src/components/MainPanel/EditMessage.jsx

// imports
import { useState } from "react";
import apiFetch from "../../helpers/apiFetch";
import pingServer from "../../helpers/pingServer";

function EditMessage({ 
    editingMessage, 
    setEditingMessage, 
    messages, 
    setMessages, 
    setMainPanelView 
}) {
    const [error, setError] = useState("");

    async function updateMessage() {
        if (editingMessage.body.length === 0) {
            setError("Messages cannot be empty.");
            return;
        } else {
            const response = await apiFetch(
                `${import.meta.env.VITE_API_URL}/messages/edit/${editingMessage.id}`, 
                { 
                    method: "PUT", 
                    body: JSON.stringify({ 
                        body: editingMessage.body 
                    }) 
                }
            );
            const data = await response.json();
            setMessages(messages.map(msg =>
                msg.id === editingMessage.id
                ? { ...msg, body: data.messages.body, updatedAt: data.messages.updatedAt }
                : msg
            ));
            setMainPanelView("messages");
        }
    }

    return <>
        <div className="header">
            <h2>
                Edit Message
                <i 
                    className="fa-solid fa-x exit-icon ui-icon" 
                    onClick={() => {
                        setMainPanelView("messages");
                        pingServer();
                    }}
                />
            </h2>
        </div>

        <div className="editing-message form">
            <form onSubmit={(e) => {
                e.preventDefault();
                updateMessage(); // initial fetch
            }}>
                <div className="error-display">{error && <p className="errors">{error}</p>}</div>
                <textarea 
                    className="edit-textarea"
                    value={editingMessage.body}
                    onChange={(e) => setEditingMessage({ ...editingMessage, body: e.target.value })}
                    maxLength={2000}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            updateMessage();
                        }
                    }}
                />
                {(2000 - (editingMessage.body?.length || 0)) < 50 && (
                    <span>{2000 - (editingMessage.body?.length || 0)} characters remaining</span>
                )}
                <button type="submit" className="fa-solid fa-floppy-disk save-icon message-save ui-icon" />
            </form>
        </div>
    </>
}

export default EditMessage;