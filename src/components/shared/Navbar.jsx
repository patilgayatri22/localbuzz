export default function Navbar({ title }) {
  return (
    <header className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
      <h1 className="text-xl font-bold">{title}</h1>
    </header>
  );
}
