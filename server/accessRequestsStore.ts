import fs from 'fs';
import path from 'path';

export interface StoredAccessRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  requested_username: string;
  reason: string;
  password_hash: string;
  status: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  rejection_reason?: string | null;
  reviewed_by?: string | null;
  reviewed_at?: string | null;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
}

const STORAGE_FILE = path.join(process.cwd(), '.access_requests_data.json');

// In-memory memory cache with disk fallback
let requestsCache: StoredAccessRequest[] = [];

function loadFromDisk(): void {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      requestsCache = JSON.parse(data);
    }
  } catch (e) {
    console.warn('Could not load access requests from disk cache:', e);
  }
}

function saveToDisk(): void {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(requestsCache, null, 2), 'utf-8');
  } catch (e) {
    console.warn('Could not persist access requests to disk cache:', e);
  }
}

// Initialize on module load
loadFromDisk();

export const AccessRequestsStore = {
  getAll(): StoredAccessRequest[] {
    loadFromDisk();
    return [...requestsCache].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  },

  getById(id: string): StoredAccessRequest | undefined {
    loadFromDisk();
    return requestsCache.find(r => r.id === id);
  },

  getByEmail(email: string): StoredAccessRequest | undefined {
    loadFromDisk();
    return requestsCache.find(r => r.email.toLowerCase() === email.toLowerCase());
  },

  add(request: StoredAccessRequest): StoredAccessRequest {
    loadFromDisk();
    // Remove if already exists with same id
    requestsCache = requestsCache.filter(r => r.id !== request.id);
    requestsCache.unshift(request);
    saveToDisk();
    return request;
  },

  update(id: string, updates: Partial<StoredAccessRequest>): StoredAccessRequest | null {
    loadFromDisk();
    const index = requestsCache.findIndex(r => r.id === id);
    if (index === -1) return null;

    requestsCache[index] = {
      ...requestsCache[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    saveToDisk();
    return requestsCache[index];
  }
};
