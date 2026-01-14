'use client';

export default function CollectionsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Collections Universe</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Accounts</h2>
          <p className="text-gray-600 mb-4">Manage collection accounts</p>
          <a href="./collections/accounts" className="text-blue-600 hover:underline">View Accounts →</a>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
          <p className="text-gray-600 mb-4">Performance metrics</p>
          <a href="./collections/dashboard" className="text-blue-600 hover:underline">View Dashboard →</a>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Reports</h2>
          <p className="text-gray-600 mb-4">Client reporting</p>
          <a href="./collections/reports" className="text-blue-600 hover:underline">Generate Reports →</a>
        </div>
      </div>
    </div>
  );
}
