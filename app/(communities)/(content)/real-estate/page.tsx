'use client';

export default function RealEstatePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Real Estate Platform</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Listing Creator */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Listing Creator</h2>
          <p className="text-gray-600 mb-4">Create professional property listings with AI-powered descriptions</p>
          <a href="/real-estate/listing-creator" className="text-blue-600 hover:underline">Get Started →</a>
        </div>

        {/* Market Analyzer */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Market Analyzer</h2>
          <p className="text-gray-600 mb-4">Comprehensive market analysis and pricing insights</p>
          <a href="/real-estate/market-analyzer" className="text-blue-600 hover:underline">Analyze Market →</a>
        </div>

        {/* Document Generator */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Document Generator</h2>
          <p className="text-gray-600 mb-4">Generate contracts, disclosures, and legal documents</p>
          <a href="/real-estate/documents" className="text-blue-600 hover:underline">Create Documents →</a>
        </div>

        {/* Property Search */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Property Search</h2>
          <p className="text-gray-600 mb-4">Find properties with advanced search filters</p>
          <a href="/real-estate/properties/search" className="text-blue-600 hover:underline">Search Properties →</a>
        </div>

        {/* Agent Matching */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Agent Matching</h2>
          <p className="text-gray-600 mb-4">Connect with top-rated real estate agents</p>
          <a href="/real-estate/agents" className="text-blue-600 hover:underline">Find Agents →</a>
        </div>

        {/* Investment Tools */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-2">Investment Analysis</h2>
          <p className="text-gray-600 mb-4">ROI calculations and cash flow projections</p>
          <a href="/real-estate/analytics/investment" className="text-blue-600 hover:underline">Analyze Returns →</a>
        </div>
      </div>
    </div>
  );
}
