import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Javari AI Platform
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Unified capability-first platform consolidating 100+ applications
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
          <RouteGroupCard
            title="Identity Suite"
            description="Logo Creator, Brand Kit, Business Cards"
            href="/logo"
            icon="🎨"
          />
          
          <RouteGroupCard
            title="Business Tools"
            description="Business Plans, Pitch Decks, Financials"
            href="/planner"
            icon="📊"
          />
          
          <RouteGroupCard
            title="Content Studio"
            description="Presentations, Resumes, eBooks, Social Media"
            href="/presentation"
            icon="✍️"
          />
          
          <RouteGroupCard
            title="PDF Suite"
            description="Create, Edit, Merge, Fill Forms"
            href="/create"
            icon="📄"
          />
          
          <RouteGroupCard
            title="Collectors Platform"
            description="70+ specialized collection apps"
            href="/collectors/comic-crypt"
            icon="🦸"
          />
          
          <RouteGroupCard
            title="Vertical Apps"
            description="Health, Travel, Education, Entertainment"
            href="/health"
            icon="🏥"
          />
        </div>

        <div className="mt-12 p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 font-semibold">
            ⚠️ PHASE 1 FOUNDATION - SCAFFOLDING ONLY
          </p>
          <p className="text-sm text-yellow-700 mt-2">
            This is the foundation repository. No existing apps have been modified or migrated.
            All routes are placeholder stubs for future implementation.
          </p>
        </div>
      </div>
    </div>
  );
}

function RouteGroupCard({ 
  title, 
  description, 
  href, 
  icon 
}: { 
  title: string; 
  description: string; 
  href: string; 
  icon: string;
}) {
  return (
    <Link href={href}>
      <div className="p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer border-2 border-gray-100 hover:border-purple-200">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-lg font-bold mb-2 text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </Link>
  );
}
