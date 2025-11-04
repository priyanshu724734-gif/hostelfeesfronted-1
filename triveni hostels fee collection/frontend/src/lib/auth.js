 export function storeAuth(data) {
   localStorage.setItem('auth', JSON.stringify(data));
   window.dispatchEvent(new Event('storage'));
 }

 export function clearAuth() {
   localStorage.removeItem('auth');
   window.dispatchEvent(new Event('storage'));
 }

 export function getStoredAuth() {
   try {
     return JSON.parse(localStorage.getItem('auth'));
   } catch {
     return null;
   }
 }

 export function authHeader() {
   const auth = getStoredAuth();
   return auth?.token ? { Authorization: `Bearer ${auth.token}` } : {};
 }

