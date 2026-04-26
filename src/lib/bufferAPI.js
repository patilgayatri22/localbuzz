export const postToBufferInstagram = async ({ bufferToken, profileId, caption, imageUrl }) => {
  const response = await fetch("/api/buffer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ bufferToken, profileId, caption, imageUrl }),
  });

  if (!response.ok) {
    throw new Error("Buffer post failed.");
  }
  return response.json();
};
