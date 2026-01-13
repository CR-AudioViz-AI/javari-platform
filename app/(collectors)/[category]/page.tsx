export default function CollectorCategoryPage({
  params,
}: {
  params: { category: string };
}) {
  const categoryName = params.category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold mb-4">{categoryName}</h1>
      <p className="text-gray-600 mb-8">Manage your {categoryName.toLowerCase()} collection</p>
      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <p className="text-sm text-yellow-700 bg-yellow-50 p-4 rounded border border-yellow-200">
          ⚠️ PLACEHOLDER STUB - Phase 1 Foundation Only
          <br />
          This dynamic route will handle all 70+ collector categories
        </p>
        <div className="mt-6 text-left">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Category:</strong> {params.category}
          </p>
          <p className="text-sm text-gray-600">
            <strong>Future features:</strong> Item cataloging, valuation tracking, insurance reports
          </p>
        </div>
      </div>
    </div>
  );
}
