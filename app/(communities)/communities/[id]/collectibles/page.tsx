'use client';

export default function CollectiblesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Collectibles Universe</h1>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
        <CategoryCard title="Spirits" href="./collectibles/spirits" />
        <CategoryCard title="Comics" href="./collectibles/comics" />
        <CategoryCard title="Vinyl" href="./collectibles/vinyl" />
        <CategoryCard title="Trading Cards" href="./collectibles/cards" />
        <CategoryCard title="Stamps" href="./collectibles/stamps" />
        <CategoryCard title="Sneakers" href="./collectibles/sneakers" />
        <CategoryCard title="Watches" href="./collectibles/watches" />
        <CategoryCard title="Toys" href="./collectibles/toys" />
        <CategoryCard title="Retro Games" href="./collectibles/retro_games" />
        <CategoryCard title="Art" href="./collectibles/art" />
        <CategoryCard title="Shot Glasses" href="./collectibles/shot_glasses" />
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border rounded hover:bg-gray-50">
            Add Item
          </button>
          <button className="p-4 border rounded hover:bg-gray-50">
            View Portfolio
          </button>
          <button className="p-4 border rounded hover:bg-gray-50">
            AI Valuation
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryCard({ title, href }: { title: string; href: string }) {
  return (
    <a
      href={href}
      className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
    >
      <h3 className="font-semibold">{title}</h3>
    </a>
  );
}
