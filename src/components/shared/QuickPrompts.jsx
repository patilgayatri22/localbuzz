export default function QuickPrompts({ onPick }) {
  const prompts = [
    "🎉 Create a weekend special",
    "📸 Generate a post with image",
    "👤 Find me local influencers",
    "📅 There's a local event",
    "📧 Send offer to all customers",
    "🌍 Write post in Spanish",
    "🌏 Write post in Chinese",
    "💰 I have a promotion to share",
  ];

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {prompts.map((prompt) => (
        <button
          key={prompt}
          onClick={() => onPick(prompt)}
          className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs hover:bg-indigo-100"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
}
