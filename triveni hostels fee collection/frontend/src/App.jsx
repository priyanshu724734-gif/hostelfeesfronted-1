 import React, { useEffect, useState } from 'react';
 import { Login } from './pages/Login.jsx';
 import { AdminDashboard } from './pages/AdminDashboard.jsx';
 import { ParentDashboard } from './pages/ParentDashboard.jsx';
 import { getStoredAuth } from './lib/auth.js';

 export default function App() {
   const [auth, setAuth] = useState(getStoredAuth());

   useEffect(() => {
     const onStorage = () => setAuth(getStoredAuth());
     window.addEventListener('storage', onStorage);
     return () => window.removeEventListener('storage', onStorage);
   }, []);

   if (!auth?.token) return <Login onLogin={setAuth} />;
   if (auth.user?.role === 'admin') return <AdminDashboard onLogout={() => setAuth(null)} />;
   return <ParentDashboard onLogout={() => setAuth(null)} />;
 }

