import { NextRequest, NextResponse } from 'next/server';
import { db, isSupabaseConfigured } from '@/orchestrator/db/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      owner_user_id,
      listing_type,
      property_type,
      address,
      price,
      bedrooms,
      bathrooms,
      sqft,
      description,
      features,
    } = body;

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const client = db['supabase'];
    const { data, error } = await client
      .from('properties')
      .insert({
        owner_user_id,
        listing_type,
        property_type,
        address_street: address.street,
        address_city: address.city,
        address_state: address.state,
        address_zip: address.zip,
        price,
        bedrooms,
        bathrooms,
        sqft,
        description,
        features: features || [],
        status: 'draft',
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, property: data });
  } catch (error) {
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
