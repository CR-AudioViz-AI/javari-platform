export default function BusinessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-blue-50">
      <nav className="bg-blue-600 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">📊 Business Tools</h1>
          <div className="text-sm">Planner | Pitch Deck | Financials</div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-8">{children}</main>
    </div>
  );
}
