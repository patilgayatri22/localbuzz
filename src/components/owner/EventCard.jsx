export default function EventCard({ event }) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="text-lg font-bold">{event.name}</h3>
      <p className="text-sm">📅 {event.date}</p>
      <p className="text-sm">
        📍 {event.location}
        {typeof event.distance === "number" ? ` • ${event.distance} miles away` : ""}
      </p>
      <p className="text-sm">👥 {event.attendance} attendees</p>
      <p className="text-sm">🎯 {event.score}</p>
      <p className="my-2 text-sm text-gray-600">{event.description}</p>
    </article>
  );
}
