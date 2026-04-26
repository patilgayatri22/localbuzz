import Sidebar from "@/components/owner/Sidebar";
import { demoBusiness } from "@/lib/demoData";

export default function SettingsPage() {
  return (
    <div className="grid gap-4 p-4 lg:grid-cols-[260px_1fr]">
      <Sidebar />
      <main className="rounded-2xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">⚙️ Settings</h1>
        <p className="mt-2 text-sm text-gray-600">Business: {demoBusiness.business_name}</p>
        <p className="text-sm text-gray-600">Language: {demoBusiness.language}</p>
      </main>
    </div>
  );
}
