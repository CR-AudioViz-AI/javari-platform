/**
 * Real Estate Search Engine
 * Phase I: Multi-criteria property search
 */

import { db, isSupabaseConfigured } from '../db/client';

export interface PropertySearchCriteria {
  listingType?: 'buy' | 'sell' | 'rent';
  propertyType?: string;
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  minBathrooms?: number;
  minSqft?: number;
  maxSqft?: number;
  geoRadius?: { lat: number; lng: number; radiusMiles: number };
  limit?: number;
}

export interface PropertySearchResult {
  id: string;
  listingType: string;
  propertyType: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  images: any[];
  distance?: number;
}

export async function searchProperties(criteria: PropertySearchCriteria): Promise<PropertySearchResult[]> {
  if (!isSupabaseConfigured()) {
    console.log('[Search] Dev mode - returning sample results');
    return [];
  }

  try {
    const client = db['supabase'];
    if (!client) return [];

    let query = client
      .from('properties')
      .select('*')
      .eq('status', 'active');

    // Apply filters
    if (criteria.listingType) {
      query = query.eq('listing_type', criteria.listingType);
    }
    if (criteria.propertyType) {
      query = query.eq('property_type', criteria.propertyType);
    }
    if (criteria.city) {
      query = query.ilike('address_city', criteria.city);
    }
    if (criteria.state) {
      query = query.eq('address_state', criteria.state);
    }
    if (criteria.minPrice) {
      query = query.gte('price', criteria.minPrice);
    }
    if (criteria.maxPrice) {
      query = query.lte('price', criteria.maxPrice);
    }
    if (criteria.minBedrooms) {
      query = query.gte('bedrooms', criteria.minBedrooms);
    }
    if (criteria.minBathrooms) {
      query = query.gte('bathrooms', criteria.minBathrooms);
    }

    query = query.order('created_at', { ascending: false });
    query = query.limit(criteria.limit || 20);

    const { data, error } = await query;

    if (error) throw error;

    return (data || []).map(p => ({
      id: p.id,
      listingType: p.listing_type,
      propertyType: p.property_type,
      address: `${p.address_street}, ${p.address_city}, ${p.address_state}`,
      price: parseFloat(p.price),
      bedrooms: p.bedrooms,
      bathrooms: parseFloat(p.bathrooms),
      sqft: parseFloat(p.sqft),
      images: p.images || [],
    }));
  } catch (error) {
    console.error('[Search] Failed:', error);
    return [];
  }
}
