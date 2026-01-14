import { NextResponse } from 'next/server';
import { categoryRegistry } from '@/orchestrator/collectibles/categoryRegistry';

export async function GET() {
  try {
    const categories = categoryRegistry.getAllCategories();
    
    return NextResponse.json({
      success: true,
      categories: categories.map(c => ({
        id: c.id,
        name: c.name,
        attributeCount: c.attributes.length,
        supportedTools: c.supportedTools,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
