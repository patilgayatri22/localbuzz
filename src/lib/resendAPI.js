export const sendResendCampaign = async ({ emails, businessName, subject, body }) => {
  const response = await fetch("/api/campaign/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ emails, businessName, subject, body }),
  });
  if (!response.ok) {
    throw new Error("Email send failed.");
  }
  return response.json();
};
