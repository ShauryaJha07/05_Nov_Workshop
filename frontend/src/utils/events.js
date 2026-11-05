import { previewEvents } from '../data/events';
export const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');
export const getAccessToken = () => localStorage.getItem('quadly-access-token') || '';
export async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getAccessToken();
  if (token) headers.set('Authorization', `Bearer ${token}`);
  return fetch(`${apiBase}${path}`, { ...options, headers });
}
export const imageUrl = (id, width=1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=85`;
export const formatDate = value => { if (!value) return 'Date to be announced'; const date = new Date(value); return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en', { weekday:'short', month:'short', day:'numeric' }).format(date); };
export const formatTime = value => { const date = new Date(value); return Number.isNaN(date.getTime()) ? 'Time to be announced' : new Intl.DateTimeFormat('en', { hour:'numeric', minute:'2-digit' }).format(date); };
export function normalizeEvent(raw, index=0) {
  const get = (...keys) => keys.map(key => raw?.[key]).find(value => value !== undefined && value !== null && value !== '');
  const fallback = previewEvents.find(event => String(event.id) === String(get('id','event_id')))
    || previewEvents.find(event => event.title.toLowerCase() === String(get('title','name') || '').toLowerCase())
    || previewEvents[index % previewEvents.length];
  const remaining = get('seats_left','remaining_seats','available_seats');
  const title = get('title','name') || fallback.title;
  const knownPreview = previewEvents.some(event => event.title === title);
  return {
    ...fallback,
    ...raw,
    id:String(get('id','event_id') ?? fallback.id),
    title,
    category:get('category','event_type','type') || (knownPreview ? fallback.category : 'Campus'),
    format:get('format','mode') || (knownPreview ? fallback.format : 'Details soon'),
    date:get('date','event_date','starts_at','start_time') || (knownPreview ? fallback.date : null),
    venue:get('venue','location','place') || 'Venue to be announced',
    campus:get('campus') || 'Campus',
    seats:remaining === undefined ? (knownPreview ? fallback.seats : null) : Number(remaining),
    description:get('description','details','about') || (knownPreview ? fallback.description : 'More event details will be announced soon.'),
    host:get('organizer_name','host','organizer') || 'Campus community',
  };
}
export const demoEvent = eventId => previewEvents.find(event => String(event.id) === String(eventId));
