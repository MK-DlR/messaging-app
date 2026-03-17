// frontend/src/helpers/createDirectMessage.js

// imports
import apiFetch from "./apiFetch";

async function createDirectMessage(
  userId,
  channels,
  setChannels,
  setSelectedChannel,
  setMainPanelView,
) {
  const response = await apiFetch(
    `${import.meta.env.VITE_API_URL}/channels/new-channel/`,
    {
      method: "POST",
      body: JSON.stringify({ userIds: [userId] }),
    },
  );
  const data = await response.json();
  const createdChannel = data.channel || data.existingChannel;
  if (data.channel) setChannels([...channels, createdChannel]);
  setSelectedChannel(createdChannel);
  setMainPanelView("messages");
}

export default createDirectMessage;
