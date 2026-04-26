import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#0A2540]">
      <header className="sticky top-0 z-40 border-b border-[#E3E8EE] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="text-xl font-bold">LocalBuzz 🌟</div>
          <nav className="hidden items-center gap-8 text-[15px] text-[#425466] md:flex">
            <a href="#features" className="hover:text-[#0A2540]">Features</a>
            <a href="#pricing" className="hover:text-[#0A2540]">Pricing</a>
            <a href="#influencers" className="hover:text-[#0A2540]">For Influencers</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/signin" className="px-3 py-2 text-sm text-[#425466] hover:text-[#0A2540]">
              Sign in
            </Link>
            <Link
              href="/owner/dashboard?demo=wellness"
              className="rounded-[6px] bg-[#635BFF] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#4F46E5]"
            >
              Start free
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#E3E8EE] bg-white px-6 pb-20 pt-16">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-[45%]">
          <div className="absolute -right-24 -top-20 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,#ff9f1c_0%,#ff6b6b_28%,#8e7dff_55%,#58d8ff_78%,transparent_100%)] opacity-80 blur-[10px]" />
          <div className="absolute right-8 top-10 h-[460px] w-[420px] rotate-12 rounded-[120px] bg-gradient-to-b from-white/40 to-transparent" />
        </div>
        <div className="relative mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <div className="inline-flex rounded-full border border-[#E3E8EE] bg-white px-4 py-1 text-[13px] font-medium uppercase tracking-[0.08em] text-[#425466]">
            ✦ Built for Main Street businesses
          </div>
            <h1 className="mt-8 text-5xl font-extrabold leading-[1.03] tracking-[-0.03em] text-[#0A2540] md:text-[64px]">
              <span>AI marketing for</span>
            <br />
              <span className="bg-gradient-to-r from-[#635BFF] to-[#00D4FF] bg-clip-text text-transparent">
                small businesses.
              </span>
            </h1>
            <p className="mt-6 max-w-[580px] text-xl text-[#425466]">
              Generate posts, find local influencers, and reach your customers - all through a simple chat.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/owner/dashboard?demo=wellness"
                className="rounded-[6px] bg-[#635BFF] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#4F46E5]"
              >
                Start free — Health &amp; Wellness demo
              </Link>
              <Link
                href="/signup/owner"
                className="rounded-[6px] border border-[#E3E8EE] bg-white px-6 py-3 text-sm font-semibold text-[#0A2540] hover:bg-[#F6F9FC]"
              >
                Other business types
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-[#E3E8EE] bg-white p-6 text-left shadow-[0_20px_60px_rgba(10,37,64,0.12)]">
            <div className="rounded-lg border border-[#E3E8EE] bg-[#F6F9FC] p-4">
              <p className="text-sm font-semibold text-[#0A2540]">Buzz AI Preview</p>
              <div className="mt-3 space-y-2 text-sm text-[#0A2540]">
                <div className="max-w-[80%] rounded-lg bg-white px-3 py-2">Create a weekend offer for our Berkeley wellness studio.</div>
                <div className="ml-auto max-w-[80%] rounded-lg bg-[#635BFF] px-3 py-2 text-white">
                  Great idea! I will generate Instagram, WhatsApp, email, and banner copy in one go.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F6F9FC] px-6 py-16">
        <div className="mx-auto grid max-w-6xl gap-6 rounded-xl border border-[#E3E8EE] bg-white p-8 text-center md:grid-cols-4 md:gap-0">
          {[
            ["32+", "businesses surveyed"],
            ["#1", "marketing challenge solved"],
            ["4", "platforms at once"],
            ["10 sec", "to generate content"],
          ].map(([num, label], idx) => (
            <div key={label} className={`px-4 ${idx < 3 ? "md:border-r md:border-[#E3E8EE]" : ""}`}>
              <div className="text-[32px] font-bold leading-none text-[#0A2540]">{num}</div>
              <div className="mt-2 text-sm text-[#425466]">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h2 className="text-3xl font-semibold md:text-[32px]">Everything you need to market your business</h2>
            <p className="mt-3 text-[#425466]">One platform. Zero marketing experience needed.</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-5">
            <article className="md:col-span-3 rounded-xl bg-[#0A2540] p-6 text-white shadow-[0_8px_24px_rgba(149,157,165,0.2)]">
              <p className="text-[13px] font-medium uppercase tracking-[0.08em] text-white/70">Core</p>
              <h3 className="mt-2 text-2xl font-semibold">🤖 AI Marketing Assistant</h3>
              <p className="mt-2 text-white/80">Type one sentence. Get content for every platform.</p>
              <div className="mt-4 rounded-lg bg-white/10 p-3 text-sm">Instagram + WhatsApp + Email + Website banner preview in one place.</div>
            </article>
            <article className="md:col-span-2 rounded-xl bg-[#EEEDFF] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <h3 className="text-xl font-semibold">📅 Local Event Matching</h3>
              <p className="mt-2 text-[#425466]">Never miss an opportunity near you.</p>
            </article>
            <article className="md:col-span-2 rounded-xl border border-[#E3E8EE] bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <h3 className="text-xl font-semibold">👤 Influencer Matching</h3>
              <p className="mt-2 text-[#425466]">Find local micro-influencers instantly.</p>
            </article>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <article className="rounded-lg border border-[#E3E8EE] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <h4 className="font-semibold">📧 Email Campaigns</h4>
              <p className="mt-2 text-sm text-[#425466]">Send to all your customers in one click.</p>
            </article>
            <article className="rounded-lg border border-[#E3E8EE] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <h4 className="font-semibold">📱 WhatsApp Outreach</h4>
              <p className="mt-2 text-sm text-[#425466]">Friendly conversational messages ready to copy.</p>
            </article>
            <article className="rounded-lg border border-[#E3E8EE] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <h4 className="font-semibold">📱 SMS Blasts</h4>
              <p className="mt-2 text-sm text-[#425466]">Reach customers on their phones (coming soon).</p>
            </article>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <article className="rounded-lg border border-[#E3E8EE] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <h4 className="font-semibold">🖼️ AI Image Variations</h4>
              <p className="mt-2 text-sm text-[#425466]">Generate 4 visual options for every campaign.</p>
            </article>
            <article className="rounded-lg border border-[#E3E8EE] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <h4 className="font-semibold">🌍 Multi-Language</h4>
              <p className="mt-2 text-sm text-[#425466]">English, Spanish, Chinese, Vietnamese.</p>
            </article>
            <article className="rounded-lg border border-[#E3E8EE] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <h4 className="font-semibold">✅ Stripe-style UX</h4>
              <p className="mt-2 text-sm text-[#425466]">Simple, polished workflows for non-technical teams.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-[#F6F9FC] px-6 py-20">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-[32px] font-semibold">Get started in minutes</h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              ["1", "Tell us about your business", "Nail salon in Oakland - restaurant in San Jose"],
              ["2", "Chat with Buzz AI", "Type your offer or special in plain language"],
              ["3", "Reach customers everywhere", "Posts, emails, and messages generated instantly"],
            ].map(([num, title, desc]) => (
              <div key={num} className="rounded-xl bg-white p-6 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
                <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[#635BFF] text-sm font-bold text-white">{num}</div>
                <h3 className="mt-4 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-[#425466]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="influencers" className="bg-[#0A2540] px-6 py-20 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.08em] text-white/70">For influencers</p>
            <h2 className="mt-2 text-4xl font-semibold">Find local businesses looking for collaborators</h2>
            <p className="mt-3 text-[#a8bfd6]">Get paid to post about places you already love.</p>
            <Link href="/signup/influencer" className="mt-6 inline-block rounded-[6px] bg-white px-5 py-3 text-sm font-semibold text-[#0A2540]">
              Join as Influencer →
            </Link>
          </div>
          <div className="rounded-xl border border-white/20 bg-white/10 p-5">
            <p className="text-sm font-semibold">Sofia Martinez • @sofia.oakland.beauty</p>
            <p className="mt-2 text-sm text-white/80">8.2K followers • 4.2% engagement • 96% match</p>
            <div className="mt-4 h-2 rounded-full bg-white/20">
              <div className="h-2 w-[96%] rounded-full bg-[#635BFF]" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 py-20 text-center">
        <h2 className="text-[32px] font-semibold">Ready to grow your business?</h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/signup/owner" className="rounded-[6px] bg-[#635BFF] px-5 py-3 text-sm font-semibold text-white">Get started free</Link>
          <a href="mailto:support@localbuzz.app" className="rounded-[6px] border border-[#E3E8EE] px-5 py-3 text-sm font-semibold">Contact us</a>
        </div>
        <p className="mt-3 text-sm text-[#8898AA]">Free forever for basic features</p>
      </section>

      <footer className="bg-[#0A2540] px-6 py-14 text-white">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-4">
          <div>
            <p className="text-xl font-bold">LocalBuzz 🌟</p>
            <p className="mt-2 text-sm text-white/70">AI marketing for Main Street businesses</p>
            <p className="mt-4 text-xs text-white/50">© {new Date().getFullYear()} LocalBuzz</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Product</p>
            <p className="mt-2 text-sm text-white/70">Features</p>
            <p className="text-sm text-white/70">Pricing</p>
            <p className="text-sm text-white/70">For Influencers</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Resources</p>
            <p className="mt-2 text-sm text-white/70">How it works</p>
            <p className="text-sm text-white/70">Blog</p>
            <p className="text-sm text-white/70">Support</p>
          </div>
          <div>
            <p className="text-sm font-semibold">Legal</p>
            <p className="mt-2 text-sm text-white/70">Privacy</p>
            <p className="text-sm text-white/70">Terms</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
