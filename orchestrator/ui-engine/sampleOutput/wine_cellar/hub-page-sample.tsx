'use client';

import Link from 'next/link';

export default function WineCellarHubPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Wine Cellar Universe</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Auto-generated Wine Cellar universe. Manage your wine collection with AI-powered tools.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickActionCard
          title="Dashboard"
          description="View your portfolio and analytics"
          href="./wine_cellar/dashboard"
          icon="📊"
        />
        <QuickActionCard
          title="Add New"
          description="Create a new item"
          href="./wine_cellar/new"
          icon="➕"
        />
        <QuickActionCard
          title="Tools"
          description="Access AI-powered tools"
          href="./wine_cellar/tools"
          icon="🛠️"
        />
        <QuickActionCard
          title="Workflows"
          description="Run automated workflows"
          href="./wine_cellar/workflows"
          icon="⚡"
        />
      </div>

      {/* Features Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <FeatureBadge name="ai_generation" />
          <FeatureBadge name="portfolio_tracking" />
          <FeatureBadge name="analytics" />
        </div>
      </div>

      {/* Available Workflows */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">AI Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WorkflowCard name="wine_cellar_summary" />
          <WorkflowCard name="wine_cellar_insights" />
          <WorkflowCard name="wine_cellar_analysis" />
        </div>
      </div>
    </div>
  );
}

function QuickActionCard({ title, description, href, icon }: {
  title: string;
  description: string;
  href: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow p-6"
    >
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </Link>
  );
}

function FeatureBadge({ name }: { name: string }) {
  return (
    <div className="bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-3 py-2 rounded-md text-sm">
      {name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
    </div>
  );
}

function WorkflowCard({ name }: { name: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h4 className="font-semibold mb-1">
        {name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        AI-powered workflow
      </p>
    </div>
  );
}
