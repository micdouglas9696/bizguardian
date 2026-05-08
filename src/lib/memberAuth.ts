const STORAGE_KEY = 'ebook_member_token';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function getMemberToken(): string | null {
    return localStorage.getItem(STORAGE_KEY);
}

export function setMemberToken(token: string) {
    localStorage.setItem(STORAGE_KEY, token);
}

export function clearMemberToken() {
    localStorage.removeItem(STORAGE_KEY);
}

export function isMemberAuthenticated(): boolean {
    return !!getMemberToken();
}

export async function memberFetch<T = any>(
    path: string,
    init: RequestInit = {},
): Promise<T> {
    const token = getMemberToken();
    const headers = new Headers(init.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (init.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
    }
    const resp = await fetch(`${API_URL}${path}`, { ...init, headers });
    if (resp.status === 401 || resp.status === 403) {
        clearMemberToken();
    }
    if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${resp.status}`);
    }
    return resp.json();
}
