import Sidebar from "@/components/owner/Sidebar";

export default function PostsPage() {
  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
      <Sidebar />
      <main className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">📊 My Posts</h1>
        <p className="mt-2 text-sm text-gray-600">Generated posts and campaign history will appear here.</p>
      </main>
    </div>
  );
}
