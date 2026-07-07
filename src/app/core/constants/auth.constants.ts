export const AUTH_USER_STORAGE_KEY = 'meridian:auth-user';
export const LOGIN_SIMULATED_DELAY_MS = 500;

export const DEFAULT_LOGIN_REDIRECT = '/accounts';

// Not an auth concern itself, but auth.logout() needs to know this key exists
// so it can clear it directly — this account-scoped filter has no owning
// singleton service to react to a "logged out" event the way WatchlistStore does.
export const TX_FILTER_STORAGE_KEY = 'meridian:tx-filter';
