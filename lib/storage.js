import { MOCK_FLIGHTS, MOCK_TRAVELERS } from './mockData';
import { DEFAULT_HOTEL_RATINGS } from './constants';

const FLIGHTS_KEY = 'flightmanager_flights';
const TRAVELERS_KEY = 'flightmanager_travelers';
const HOTEL_RATINGS_KEY = 'flightmanager_hotel_ratings';

function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// ── FLIGHTS ──────────────────────────────────────────────────────────────────

export function getFlights() {
  if (typeof window === 'undefined') return MOCK_FLIGHTS;
  try {
    const data = localStorage.getItem(FLIGHTS_KEY);
    return data ? JSON.parse(data) : MOCK_FLIGHTS;
  } catch { return MOCK_FLIGHTS; }
}

export function saveFlights(flights) {
  localStorage.setItem(FLIGHTS_KEY, JSON.stringify(flights));
}

export function addFlight(flight) {
  const flights = getFlights();
  const newFlight = { ...flight, id: generateId() };
  saveFlights([...flights, newFlight]);
  return newFlight;
}

export function getFlightById(id) {
  return getFlights().find(f => f.id === id) || null;
}

export function deleteFlight(id) {
  const flights = getFlights();
  saveFlights(flights.filter(f => f.id !== id));
  // Archive all travelers on this flight
  const travelers = getTravelers();
  const updated = travelers.map(t =>
    t.flightId === id ? { ...t, isArchived: true } : t
  );
  saveTravelers(updated);
}

// ── TRAVELERS ────────────────────────────────────────────────────────────────

export function getTravelers() {
  if (typeof window === 'undefined') return MOCK_TRAVELERS;
  try {
    const data = localStorage.getItem(TRAVELERS_KEY);
    return data ? JSON.parse(data) : MOCK_TRAVELERS;
  } catch { return MOCK_TRAVELERS; }
}

export function getAllTravelers() {
  return getTravelers();
}

export function saveTravelers(travelers) {
  localStorage.setItem(TRAVELERS_KEY, JSON.stringify(travelers));
}

export function addTraveler(traveler) {
  const travelers = getTravelers();
  const flightTravelers = travelers.filter(t => t.flightId === traveler.flightId && !t.isArchived);
  const serial = flightTravelers.length + 1;
  const newTraveler = {
    ...traveler,
    id: generateId(),
    serial,
    isArchived: false,
    createdAt: new Date().toISOString()
  };
  saveTravelers([...travelers, newTraveler]);
  return newTraveler;
}

export function updateTraveler(id, updates) {
  const travelers = getTravelers();
  const updated = travelers.map(t => t.id === id ? { ...t, ...updates } : t);
  saveTravelers(updated);
  return updated.find(t => t.id === id);
}

export function deleteTraveler(id) {
  const travelers = getTravelers();
  const updated = travelers.map(t => t.id === id ? { ...t, isArchived: true } : t);
  saveTravelers(updated);
}

export function restoreTraveler(id) {
  const travelers = getTravelers();
  const updated = travelers.map(t => t.id === id ? { ...t, isArchived: false } : t);
  saveTravelers(updated);
}

export function permanentDelete(id) {
  const travelers = getTravelers();
  saveTravelers(travelers.filter(t => t.id !== id));
}

export function permanentDeleteTraveler(id) {
  permanentDelete(id);
}

// ── HOTEL RATINGS ────────────────────────────────────────────────────────────

export function getHotelRatings() {
  if (typeof window === 'undefined') return DEFAULT_HOTEL_RATINGS;
  try {
    const data = localStorage.getItem(HOTEL_RATINGS_KEY);
    return data ? { ...DEFAULT_HOTEL_RATINGS, ...JSON.parse(data) } : { ...DEFAULT_HOTEL_RATINGS };
  } catch { return { ...DEFAULT_HOTEL_RATINGS }; }
}

export function setHotelRating(hotelName, rating) {
  const ratings = getHotelRatings();
  ratings[hotelName] = Math.min(5, Math.max(1, rating));
  localStorage.setItem(HOTEL_RATINGS_KEY, JSON.stringify(ratings));
}

// ── QUERIES ──────────────────────────────────────────────────────────────────

/** Get all flights scheduled for today */
export function getTodaysFlights() {
  const flights = getFlights();
  const today = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"

  return flights
    .filter(f => f.date === today)
    .sort((a, b) => {
      const dtA = new Date(`${a.date}T${a.time}`);
      const dtB = new Date(`${b.date}T${b.time}`);
      return dtA - dtB;
    });
}

/** Legacy: Get two nearest upcoming flights */
export function getTwoNearestFlights() {
  const flights = getFlights();
  const now = new Date();

  const upcoming = flights
    .filter(f => {
      const flightDateTime = new Date(`${f.date}T${f.time}`);
      return flightDateTime >= now;
    })
    .sort((a, b) => {
      const dtA = new Date(`${a.date}T${a.time}`);
      const dtB = new Date(`${b.date}T${b.time}`);
      return dtA - dtB;
    });

  return upcoming.slice(0, 2);
}

export function getTravelersForFlight(flightId) {
  const travelers = getTravelers();
  return travelers.filter(t => t.flightId === flightId && !t.isArchived);
}

export function getArchivedTravelers() {
  const travelers = getTravelers();
  return travelers.filter(t => t.isArchived);
}
