
// Formats a date string or Date object into a 24-hour time string (HH:MM)
// Used for displaying message timestamps in the chat UI
export function formatMessageTime(date) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
