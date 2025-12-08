/**
 * API route to fetch and process Berlin bicycle accident data from uMap API
 * 
 * This endpoint:
 * 1. Fetches data from uMap Berlin Unfallkarte API
 * 2. Filters for bicycle accidents
 * 3. Maps data structure to match Unfallatlas format
 * 4. Returns processed GeoJSON
 * 
 * API Endpoint: https://umap.openstreetmap.de/de/datalayer/88227/0e6d58dc-3ea1-4bc4-a051-87189a393ce6/
 */

import { NextResponse } from 'next/server'

// uMap API endpoint for Berlin Unfallkarte
const UMAP_API_URL = 'https://umap.openstreetmap.de/de/datalayer/88227/0e6d58dc-3ea1-4bc4-a051-87189a393ce6/'

interface UMapFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: {
    UJAHR: string
    Wochentag?: string
    Unfallbeteiligte: string
    VERLETZUNGSGRAD: string
    Unfallart?: string
    Unfalltyp?: string
    Uhrzeit?: string
    NAME_1?: string
    [key: string]: any
  }
  id?: string
}

interface ProcessedFeature {
  type: 'Feature'
  geometry: {
    type: 'Point'
    coordinates: [number, number]
  }
  properties: {
    UJAHR: number
    Unfallkate: string // Map VERLETZUNGSGRAD to Unfallkate
    Unfallbeteiligte: string
    Unfallart?: string
    Unfalltyp?: string
    Uhrzeit?: string
    Wochentag?: string
    unfall_id?: string
    // Additional fields for compatibility
    VERLETZUNGSGRAD?: string
    NAME_1?: string
    [key: string]: any
  }
}

// Map VERLETZUNGSGRAD to Unfallkate (accident category)
// Unfallkate: 1 = Getötet, 2 = Schwer, 3 = Leicht
function mapVerletzungsgradToUnfallkate(verletzungsgrad: string): string {
  const normalized = verletzungsgrad.toLowerCase().trim()
  if (normalized.includes('getötet')) return '1'
  if (normalized.includes('schwer')) return '2'
  if (normalized.includes('leicht')) return '3'
  return '3' // Default to Leicht if unknown
}

// Check if accident involves bicycle
function isBicycleAccident(unfallbeteiligte: string): boolean {
  return unfallbeteiligte.includes('Fahrrad')
}

export async function GET() {
  try {
    // Fetch data from uMap API
    const response = await fetch(UMAP_API_URL, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch data from uMap API: ${response.status} ${response.statusText}` },
        { status: response.status }
      )
    }

    const data = await response.json()

    if (!data.features || !Array.isArray(data.features)) {
      return NextResponse.json(
        { error: 'Invalid data format from uMap API' },
        { status: 500 }
      )
    }

    // Filter for bicycle accidents
    const totalAccidents = data.features.length
    const bicycleAccidents = (data.features as UMapFeature[]).filter((feature) => {
      return isBicycleAccident(feature.properties.Unfallbeteiligte || '')
    })
    
    // Log filtering statistics (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Bicycle Accidents API] Filtered ${bicycleAccidents.length} bicycle accidents from ${totalAccidents} total accidents`)
    }

    // Process features
    const processedFeatures: ProcessedFeature[] = bicycleAccidents.map((feature) => {
      const props = feature.properties
      const unfallkate = mapVerletzungsgradToUnfallkate(props.VERLETZUNGSGRAD || '')

      return {
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          UJAHR: parseInt(props.UJAHR || '0', 10),
          Unfallkate: unfallkate,
          Unfallbeteiligte: props.Unfallbeteiligte || '',
          Unfallart: props.Unfallart,
          Unfalltyp: props.Unfalltyp,
          Uhrzeit: props.Uhrzeit,
          Wochentag: props.Wochentag,
          unfall_id: feature.id || `berlin-${Date.now()}-${Math.random()}`,
          // Keep original fields for reference
          VERLETZUNGSGRAD: props.VERLETZUNGSGRAD,
          NAME_1: props.NAME_1,
        },
      }
    })

    // Create GeoJSON FeatureCollection
    const output = {
      type: 'FeatureCollection',
      features: processedFeatures,
    }

    // Log final statistics (only in development)
    if (process.env.NODE_ENV === 'development') {
      const yearRange = processedFeatures.length > 0
        ? {
            min: Math.min(...processedFeatures.map(f => f.properties.UJAHR).filter(y => y > 0)),
            max: Math.max(...processedFeatures.map(f => f.properties.UJAHR).filter(y => y > 0)),
          }
        : null
      console.log(`[Bicycle Accidents API] Returning ${processedFeatures.length} bicycle accidents${yearRange ? ` (years: ${yearRange.min}-${yearRange.max})` : ''}`)
    }

    // Return GeoJSON with appropriate headers
    return NextResponse.json(output, {
      headers: {
        'Content-Type': 'application/geo+json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    })
  } catch (error) {
    console.error('Error fetching bicycle accident data:', error)
    return NextResponse.json(
      { error: 'Internal server error while fetching bicycle accident data' },
      { status: 500 }
    )
  }
}

