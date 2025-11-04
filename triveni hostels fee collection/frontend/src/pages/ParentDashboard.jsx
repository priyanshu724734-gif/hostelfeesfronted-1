 import React, { useEffect, useState } from 'react';
 import { api } from '../lib/api.js';
 import { clearAuth } from '../lib/auth.js';

 export function ParentDashboard({ onLogout }) {
   const [dues, setDues] = useState([]);

   async function fetchData() {
     const dRes = await api.get('/api/fees');
     setDues(dRes.data);
   }

   useEffect(() => { fetchData(); }, []);

   function logout() {
     clearAuth();
     onLogout();
   }

   return (
     <div className="p-6 space-y-6">
       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-semibold">Parent Dashboard</h1>
         <button onClick={logout} className="px-3 py-1.5 rounded bg-gray-800 text-white">Logout</button>
       </div>

       <div className="bg-white rounded shadow">
         <div className="p-4 border-b font-medium">Your Dues</div>
         <div className="p-4 space-y-3">
           {dues.map((d) => (
             <div key={d._id} className="p-3 border rounded flex items-center justify-between">
               <div>
                 <div className="font-medium">{d.student_id?.name} — Room {d.student_id?.room_no}</div>
                 <div className="text-sm text-gray-600">Month: {d.month} | Amount: ₹ {d.amount}</div>
               </div>
               <a
                 href={`upi://pay?pa=trivenihostels@upi&pn=Triveni%20Hostels&am=${d.amount}&tn=Fees%20${d.month}%20${d.student_id?.name}`}
                 className="px-3 py-1.5 rounded bg-blue-600 text-white"
               >
                 Pay Now
               </a>
             </div>
           ))}
         </div>
       </div>
     </div>
   );
 }


