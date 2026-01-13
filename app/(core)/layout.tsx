export default function CoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <nav className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-purple-600">Javari AI</h1>
          <div className="text-sm text-gray-600">Core Platform</div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
