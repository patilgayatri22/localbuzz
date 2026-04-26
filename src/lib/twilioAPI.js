export const sendTwilioCampaign = async ({ phones, message }) => {
  const response = await fetch("/api/campaign/sms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phones, message }),
  });
  if (!response.ok) {
    throw new Error("SMS send failed.");
  }
  return response.json();
};
