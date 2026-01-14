/**
 * UI Templates - Reusable Component Templates
 * Phase Ω-III: Generates React components from manifest data
 */

import type { UniverseManifestType } from '../universes/registry/universeRegistry';

/**
 * Generate Hub Page (main entry point)
 */
export function generateHubPage(manifest: UniverseManifestType): string {
  const componentName = manifest.id
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  return `'use client';

import Link from 'next/link';

export default function ${componentName}HubPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">${manifest.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">
          ${manifest.description}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <QuickActionCard
          title="Dashboard"
          description="View your portfolio and analytics"
          href="./${manifest.id}/dashboard"
          icon="📊"
        />
        <QuickActionCard
          title="Add New"
          description="Create a new item"
          href="./${manifest.id}/new"
          icon="➕"
        />
        <QuickActionCard
          title="Tools"
          description="Access AI-powered tools"
          href="./${manifest.id}/tools"
          icon="🛠️"
        />
        <QuickActionCard
          title="Workflows"
          description="Run automated workflows"
          href="./${manifest.id}/workflows"
          icon="⚡"
        />
      </div>

      {/* Features Grid */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          ${manifest.features?.map(f => `<FeatureBadge name="${f}" />`).join('\n          ')}
        </div>
      </div>

      {/* Available Workflows */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">AI Workflows</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${manifest.workflows?.map(w => `<WorkflowCard name="${w}" />`).join('\n          ')}
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
      {name.replace(/_/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase())}
    </div>
  );
}

function WorkflowCard({ name }: { name: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h4 className="font-semibold mb-1">
        {name.replace(/_/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase())}
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        AI-powered workflow
      </p>
    </div>
  );
}
`;
}

/**
 * Generate Dashboard Page
 */
export function generateDashboardPage(manifest: UniverseManifestType): string {
  const componentName = manifest.id
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  return `'use client';

import { useState, useEffect } from 'react';

export default function ${componentName}DashboardPage() {
  const [stats, setStats] = useState({
    totalItems: 0,
    totalValue: 0,
    recentActivity: 0
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">${manifest.name} Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Items"
          value={stats.totalItems}
          icon="📦"
        />
        <StatCard
          title="Total Value"
          value={\`$\${stats.totalValue.toLocaleString()}\`}
          icon="💰"
        />
        <StatCard
          title="Recent Activity"
          value={stats.recentActivity}
          icon="📈"
        />
      </div>

      {/* Recent Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Recent Items</h2>
        <div className="space-y-3">
          <p className="text-gray-500 dark:text-gray-400">No items yet</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          ${manifest.api?.map(endpoint => `<ActionButton name="${endpoint}" />`).join('\n          ')}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: {
  title: string;
  value: string | number;
  icon: string;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-600 dark:text-gray-400">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function ActionButton({ name }: { name: string }) {
  return (
    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
      {name.replace(/_/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase())}
    </button>
  );
}
`;
}

/**
 * Generate Detail Page Template
 */
export function generateDetailPage(manifest: UniverseManifestType): string {
  const componentName = manifest.id
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  return `'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function ${componentName}DetailPage() {
  const params = useParams();
  const itemId = params.itemId as string;
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch item data
    setLoading(false);
  }, [itemId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Item Details</h1>
        <p className="text-gray-600 dark:text-gray-400">ID: {itemId}</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Primary Info */}
        <div className="lg:col-span-2 space-y-6">
          <InfoSection title="Overview">
            <p className="text-gray-600 dark:text-gray-400">
              Item information will display here
            </p>
          </InfoSection>

          <InfoSection title="Details">
            <div className="space-y-2">
              {/* Dynamic fields based on manifest */}
            </div>
          </InfoSection>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <InfoSection title="Actions">
            <div className="space-y-2">
              ${manifest.workflows?.slice(0, 3).map(w => 
                `<ActionButton workflow="${w}" />`
              ).join('\n              ')}
            </div>
          </InfoSection>

          <InfoSection title="Metadata">
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Created</dt>
                <dd className="font-medium">-</dd>
              </div>
              <div>
                <dt className="text-gray-600 dark:text-gray-400">Updated</dt>
                <dd className="font-medium">-</dd>
              </div>
            </dl>
          </InfoSection>
        </div>
      </div>
    </div>
  );
}

function InfoSection({ title, children }: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function ActionButton({ workflow }: { workflow: string }) {
  return (
    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
      Run {workflow.replace(/_/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase())}
    </button>
  );
}
`;
}

/**
 * Generate Tools Page
 */
export function generateToolsPage(manifest: UniverseManifestType): string {
  const componentName = manifest.id
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  return `'use client';

export default function ${componentName}ToolsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">AI Tools</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${manifest.workflows?.map(workflow => {
          const credits = manifest.credits?.[workflow.toUpperCase().replace(/_/g, '')] || 50;
          return `<ToolCard
          name="${workflow}"
          description="AI-powered ${workflow.replace(/_/g, ' ')}"
          credits={${credits}}
        />`;
        }).join('\n        ')}
      </div>
    </div>
  );
}

function ToolCard({ name, description, credits }: {
  name: string;
  description: string;
  credits: number;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="font-semibold mb-2">
        {name.replace(/_/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase())}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        {description}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{credits} credits</span>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
          Use Tool
        </button>
      </div>
    </div>
  );
}
`;
}

/**
 * Generate Workflows Page
 */
export function generateWorkflowsPage(manifest: UniverseManifestType): string {
  const componentName = manifest.id
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  return `'use client';

import { useState } from 'react';

export default function ${componentName}WorkflowsPage() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Automated Workflows</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow List */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <h2 className="font-semibold mb-4">Available Workflows</h2>
            <div className="space-y-2">
              ${manifest.workflows?.map(w => `<WorkflowItem
                name="${w}"
                selected={selectedWorkflow === "${w}"}
                onClick={() => setSelectedWorkflow("${w}")}
              />`).join('\n              ')}
            </div>
          </div>
        </div>

        {/* Workflow Details */}
        <div className="lg:col-span-2">
          {selectedWorkflow ? (
            <WorkflowDetails workflow={selectedWorkflow} />
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <p className="text-gray-500 dark:text-gray-400">
                Select a workflow to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function WorkflowItem({ name, selected, onClick }: {
  name: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={\`w-full text-left px-4 py-3 rounded-md transition-colors \${
        selected
          ? 'bg-blue-600 text-white'
          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
      }\`}
    >
      {name.replace(/_/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase())}
    </button>
  );
}

function WorkflowDetails({ workflow }: { workflow: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">
        {workflow.replace(/_/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase())}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Workflow description and configuration will appear here
      </p>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-md transition-colors">
        Run Workflow
      </button>
    </div>
  );
}
`;
}

/**
 * Generate Category Browser
 */
export function generateCategoryBrowser(manifest: UniverseManifestType): string {
  const componentName = manifest.id
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('');

  return `'use client';

import { useState } from 'react';

export default function ${componentName}CategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Categories</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Categories will be loaded dynamically */}
        <CategoryCard name="Category 1" count={0} />
        <CategoryCard name="Category 2" count={0} />
        <CategoryCard name="Category 3" count={0} />
      </div>
    </div>
  );
}

function CategoryCard({ name, count }: { name: string; count: number }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-lg transition-shadow cursor-pointer">
      <h3 className="font-semibold mb-1">{name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        {count} items
      </p>
    </div>
  );
}
`;
}

/**
 * Generate Common Components
 */
export function generateCommonComponents(manifest: UniverseManifestType): Record<string, string> {
  return {
    'ItemCard': generateItemCard(),
    'ItemList': generateItemList(),
    'ItemTable': generateItemTable(),
    'FilterBar': generateFilterBar()
  };
}

function generateItemCard(): string {
  return `'use client';

interface ItemCardProps {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
}

export function ItemCard({ id, title, description, imageUrl, metadata }: ItemCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {imageUrl && (
        <img src={imageUrl} alt={title} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <h3 className="font-semibold mb-1">{title}</h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {description}
          </p>
        )}
        {metadata && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(metadata).slice(0, 3).map(([key, value]) => (
              <span
                key={key}
                className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded"
              >
                {String(value)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
`;
}

function generateItemList(): string {
  return `'use client';

interface ItemListProps {
  items: Array<{
    id: string;
    title: string;
    subtitle?: string;
  }>;
}

export function ItemList({ items }: ItemListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow divide-y divide-gray-200 dark:divide-gray-700">
      {items.map(item => (
        <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          <h4 className="font-medium">{item.title}</h4>
          {item.subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {item.subtitle}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
`;
}

function generateItemTable(): string {
  return `'use client';

interface Column {
  key: string;
  label: string;
}

interface ItemTableProps {
  columns: Column[];
  data: Array<Record<string, any>>;
}

export function ItemTable({ columns, data }: ItemTableProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              {columns.map(col => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-sm">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
`;
}

function generateFilterBar(): string {
  return `'use client';

import { useState } from 'react';

interface FilterBarProps {
  onFilterChange: (filters: Record<string, any>) => void;
}

export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md transition-colors">
          Apply Filters
        </button>
      </div>
    </div>
  );
}
`;
}
