'use client';

import { useState, useEffect } from 'react';

interface ProofResult {
  universeId: string;
  universeName: string;
  manifestValid: boolean;
  workflowsValid: boolean;
  apiValid: boolean;
  uiValid: boolean;
  assetsValid: boolean;
  featureFlagsValid: boolean;
  loadTimeMs: number;
  errors: string[];
  warnings: string[];
}

interface ProofReport {
  timestamp: string;
  totalUniverses: number;
  passedUniverses: number;
  failedUniverses: number;
  results: ProofResult[];
  summary: {
    manifestValidation: number;
    workflowValidation: number;
    apiValidation: number;
    uiValidation: number;
    assetsValidation: number;
    featureFlagsValidation: number;
  };
}

export default function VerificationDashboard() {
  const [report, setReport] = useState<ProofReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In production, this would fetch from API
    // For now, we'll use mock data
    const mockReport: ProofReport = {
      timestamp: new Date().toISOString(),
      totalUniverses: 3,
      passedUniverses: 3,
      failedUniverses: 0,
      results: [
        {
          universeId: 'real_estate',
          universeName: 'Real Estate Universe',
          manifestValid: true,
          workflowsValid: true,
          apiValid: true,
          uiValid: true,
          assetsValid: true,
          featureFlagsValid: true,
          loadTimeMs: 45.2,
          errors: [],
          warnings: [],
        },
        {
          universeId: 'collections',
          universeName: 'Collections Universe',
          manifestValid: true,
          workflowsValid: true,
          apiValid: true,
          uiValid: true,
          assetsValid: true,
          featureFlagsValid: true,
          loadTimeMs: 52.8,
          errors: [],
          warnings: [],
        },
        {
          universeId: 'collectibles',
          universeName: 'Collectibles Universe',
          manifestValid: true,
          workflowsValid: true,
          apiValid: true,
          uiValid: true,
          assetsValid: true,
          featureFlagsValid: true,
          loadTimeMs: 61.3,
          errors: [],
          warnings: [],
        },
      ],
      summary: {
        manifestValidation: 3,
        workflowValidation: 3,
        apiValidation: 3,
        uiValidation: 3,
        assetsValidation: 3,
        featureFlagsValidation: 3,
      },
    };

    setReport(mockReport);
    setLoading(false);
  }, []);

  if (loading || !report) {
    return (
      <div className="p-8">
        <p>Loading verification results...</p>
      </div>
    );
  }

  const passRate = (report.passedUniverses / report.totalUniverses) * 100;

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Universe Verification Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Automated verification of all universes (Phase Ω-IV)
        </p>
        <p className="text-sm text-gray-500">
          Last Updated: {new Date(report.timestamp).toLocaleString()}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Universes"
          value={report.totalUniverses}
          icon="🌍"
        />
        <StatCard
          title="Passed"
          value={report.passedUniverses}
          icon="✅"
          color="green"
        />
        <StatCard
          title="Failed"
          value={report.failedUniverses}
          icon="❌"
          color={report.failedUniverses > 0 ? 'red' : 'gray'}
        />
        <StatCard
          title="Pass Rate"
          value={`${passRate.toFixed(0)}%`}
          icon="📊"
          color={passRate === 100 ? 'green' : 'yellow'}
        />
      </div>

      {/* Validation Categories */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Validation Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <ValidationItem
            label="Manifest"
            passed={report.summary.manifestValidation}
            total={report.totalUniverses}
          />
          <ValidationItem
            label="Workflows"
            passed={report.summary.workflowValidation}
            total={report.totalUniverses}
          />
          <ValidationItem
            label="API Routes"
            passed={report.summary.apiValidation}
            total={report.totalUniverses}
          />
          <ValidationItem
            label="UI Pages"
            passed={report.summary.uiValidation}
            total={report.totalUniverses}
          />
          <ValidationItem
            label="Assets"
            passed={report.summary.assetsValidation}
            total={report.totalUniverses}
          />
          <ValidationItem
            label="Feature Flags"
            passed={report.summary.featureFlagsValidation}
            total={report.totalUniverses}
          />
        </div>
      </div>

      {/* Individual Universe Results */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Universe Details</h2>
        {report.results.map((result) => (
          <UniverseCard key={result.universeId} result={result} />
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color = 'blue' }: {
  title: string;
  value: string | number;
  icon: string;
  color?: string;
}) {
  const colorClasses = {
    blue: 'bg-blue-50 dark:bg-blue-900',
    green: 'bg-green-50 dark:bg-green-900',
    red: 'bg-red-50 dark:bg-red-900',
    yellow: 'bg-yellow-50 dark:bg-yellow-900',
    gray: 'bg-gray-50 dark:bg-gray-700',
  };

  return (
    <div className={`${colorClasses[color as keyof typeof colorClasses]} rounded-lg shadow p-6`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-gray-600 dark:text-gray-300 text-sm">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}

function ValidationItem({ label, passed, total }: {
  label: string;
  passed: number;
  total: number;
}) {
  const isValid = passed === total;
  
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {passed}/{total}
        </span>
        <span className="text-xl">{isValid ? '✅' : '⚠️'}</span>
      </div>
    </div>
  );
}

function UniverseCard({ result }: { result: ProofResult }) {
  const allValid = 
    result.manifestValid &&
    result.workflowsValid &&
    result.apiValid &&
    result.uiValid &&
    result.assetsValid &&
    result.featureFlagsValid;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-semibold">{result.universeName}</h3>
          <p className="text-sm text-gray-500">ID: {result.universeId}</p>
        </div>
        <div className="text-4xl">{allValid ? '✅' : '⚠️'}</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <CheckItem label="Manifest" valid={result.manifestValid} />
        <CheckItem label="Workflows" valid={result.workflowsValid} />
        <CheckItem label="API Routes" valid={result.apiValid} />
        <CheckItem label="UI Pages" valid={result.uiValid} />
        <CheckItem label="Assets" valid={result.assetsValid} />
        <CheckItem label="Feature Flags" valid={result.featureFlagsValid} />
      </div>

      {result.errors.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-red-600 dark:text-red-400 mb-2">Errors:</h4>
          <ul className="list-disc list-inside text-sm text-red-600 dark:text-red-400">
            {result.errors.map((error, idx) => (
              <li key={idx}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {result.warnings.length > 0 && (
        <div className="mb-4">
          <h4 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">Warnings:</h4>
          <ul className="list-disc list-inside text-sm text-yellow-600 dark:text-yellow-400">
            {result.warnings.map((warning, idx) => (
              <li key={idx}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Verification completed in {result.loadTimeMs.toFixed(1)}ms
      </div>
    </div>
  );
}

function CheckItem({ label, valid }: { label: string; valid: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span className={valid ? 'text-green-600' : 'text-red-600'}>
        {valid ? '🟢' : '🔴'}
      </span>
      <span className="text-sm">{label}</span>
    </div>
  );
}
