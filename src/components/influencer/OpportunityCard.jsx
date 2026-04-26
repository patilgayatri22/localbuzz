export default function OpportunityCard({ business }) {
  return (
    <article className="rounded-2xl bg-white p-4 shadow-sm">
      <h3 className="font-bold">{business.business_name}</h3>
      <p className="text-sm">{business.business_type} • {business.location}</p>
      <p className="text-sm text-gray-600">Looking for local creators to promote weekend offers.</p>
      <p className="text-sm">Budget: $50-100</p>
      <button className="mt-3 rounded-xl bg-pink-500 px-3 py-2 text-sm font-semibold text-white">
        I&apos;m Interested
      </button>
    </article>
  );
}
