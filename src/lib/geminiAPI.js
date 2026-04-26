export const askBuzz = async ({ message, business }) => {
  const response = await fetch("/api/gemini", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, business }),
  });

  if (!response.ok) {
    throw new Error("Buzz could not respond right now.");
  }
  return response.json();
};
