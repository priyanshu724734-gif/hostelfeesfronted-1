 import React, { useState } from 'react';
 import { api } from '../lib/api.js';
 import { storeAuth } from '../lib/auth.js';

 export function Login({ onLogin }) {
   const [mobile, setMobile] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');

   async function submit(e) {
     e.preventDefault();
     setError('');
     try {
       const res = await api.post('/api/auth/login', { mobile, password });
       storeAuth(res.data);
       onLogin(res.data);
     } catch (err) {
       setError(err?.response?.data?.error || 'Login failed');
     }
   }

   return (
     <div className="min-h-screen flex items-center justify-center">
       <form onSubmit={submit} className="bg-white p-8 rounded shadow w-full max-w-sm space-y-4">
         <h1 className="text-xl font-semibold text-center">Triveni Hostels Login</h1>
         {error && <p className="text-red-600 text-sm">{error}</p>}
         <div>
           <label className="block text-sm mb-1">Mobile</label>
           <input value={mobile} onChange={(e) => setMobile(e.target.value)} className="border w-full p-2 rounded" />
         </div>
         <div>
           <label className="block text-sm mb-1">Password</label>
           <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="border w-full p-2 rounded" />
         </div>
         <button className="bg-blue-600 hover:bg-blue-700 text-white w-full py-2 rounded">Login</button>
       </form>
     </div>
   );
 }


