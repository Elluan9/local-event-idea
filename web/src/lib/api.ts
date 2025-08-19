// src/lib/api.ts
// Base URL for your Worker API (set this in Bolt envs or .env.local)
export const API_BASE = import.meta.env.VITE_API_BASE || ''

// ---- Types that mirror the Worker responses ----
export interface WeatherSnapshot {
  tempF: number
  precipChance: number // 0..1
  summary: string
  sunriseIso?: string
  sunsetIso?: string
}

export interface Place {
  id: string
  name: string
  categories: string[]
  priceTier?: number
  rating?: number
  reviewCount?: number
  openNow?: boolean
  distanceMeters?: number
  address?: string
  mapsUrl?: string
  source: 'google'
}

export type BudgetTier = 'free' | '<20' | '20-50' | '50+'
export type GroupVibe   = 'solo' | 'date' | 'friends' | 'family'
export type TimeWindow  = 'now' | 'tonight' | 'weekend'

export interface GenerateRequest {
  lat: number
  lng: number
  budget: BudgetTier
  vibe: GroupVibe
  window: TimeWindow
  distanceKm: number
  indoorOutdoor?: 'indoor' | 'outdoor' | 'any'
}

export interface IdeaLink { type: string; url: string }
export interface Idea {
  title: string
  category: string
  costTier: string
  duration: string
  whyToday: string
  placeId?: string | null
  links?: IdeaLink[]
}

// ---- Small helper for consistent error handling ----
export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

async function handleJSON<T>(res: Response): Promise<T> {
  const text = await res.text()
  if (!res.ok) {
    try {
      const j = JSON.parse(text)
      throw new ApiError(j.error || JSON.stringify(j), res.status)
    } catch {
      throw new ApiError(text || `${res.status} ${res.statusText}`, res.status)
    }
  }
  try {
    return JSON.parse(text) as T
  } catch {
    throw new ApiError('Invalid JSON from server')
  }
}

// ---- API calls (match your Worker) ----
export async function getWeather(lat: number, lng: number): Promise<WeatherSnapshot> {
  const url = `${API_BASE}/api/weather?lat=${lat}&lng=${lng}`
  const res = await fetch(url)
  return handleJSON<WeatherSnapshot>(res)
}

export async function searchPlaces(
  params: { lat: number; lng: number; radiusMeters: number; types?: string[] }
): Promise<{ places: Place[] }> {
  const res = await fetch(`${API_BASE}/api/places/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  return handleJSON<{ places: Place[] }>(res)
}

export async function generateIdeas(params: GenerateIdeasParams): Promise<EventIdea[]> {
  const r = await fetch(`${API_BASE}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const text = await r.text();
  if (!r.ok) throw new ApiError(text || `${r.status} ${r.statusText}`, r.status);

  let data: any;
  try { data = JSON.parse(text); } catch { throw new ApiError('Failed to parse response'); }

  const rawIdeas = Array.isArray(data) ? data : data?.ideas;
  if (!Array.isArray(rawIdeas)) throw new ApiError('Bad response format from /api/generate');

  return rawIdeas.map((i: any, idx: number) => ({
    id: i.id ?? i.placeId ?? `${i.title || 'idea'}-${idx}`,
    title: i.title ?? '',
    category: i.category ?? '',
    cost: i.cost ?? i.costTier ?? '',
    whyToday: i.whyToday ?? '',
    links: Array.isArray(i.links)
      ? i.links.map((l: any) => ({ name: l.name ?? l.type ?? 'link', url: l.url }))
      : [],
  }));
}


// (Optional) Geocode helper for manual city entry
export async function geocode(q: string): Promise<{ results: { name: string; lat: number; lng: number }[] }> {
  const res = await fetch(`${API_BASE}/api/geocode?q=${encodeURIComponent(q)}`)
  return handleJSON<{ results: { name: string; lat: number; lng: number }[] }>(res)
}

console.log('API_BASE =', API_BASE)
