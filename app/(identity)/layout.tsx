export default function IdentityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-purple-50">
      <nav className="bg-purple-600 text-white px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">🎨 Identity Suite</h1>
          <div className="text-sm">Logo Creator | Brand Kit | Business Cards</div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto p-8">{children}</main>
    </div>
  );
}
