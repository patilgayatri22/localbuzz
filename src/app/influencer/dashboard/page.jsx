import InfluencerSidebar from "@/components/influencer/InfluencerSidebar";

export default function InfluencerDashboardPage() {
  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
      <InfluencerSidebar />
      <main className="space-y-4">
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold">Influencer Profile</h1>
          <p className="text-sm text-gray-600">Name, handle, niche, location, followers, engagement, and rate per post.</p>
          <button className="mt-3 rounded-xl bg-pink-500 px-3 py-2 text-sm font-semibold text-white">Edit Profile</button>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-4 shadow-sm">Opportunities: 4</div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">Collaborations: 0 active</div>
          <div className="rounded-2xl bg-white p-4 shadow-sm">Earnings: $0</div>
        </section>
      </main>
    </div>
  );
}
