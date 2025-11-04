 import React, { useEffect, useState } from 'react';
 import { api } from '../lib/api.js';
 import { clearAuth } from '../lib/auth.js';

export function AdminDashboard({ onLogout }) {
  const [students, setStudents] = useState([]);
  const [dues, setDues] = useState([]);
  const [paid, setPaid] = useState([]);
  const [stats, setStats] = useState({ collected: 0, pendingAmount: 0, pendingCount: 0 });

  async function fetchData() {
    const [sRes, dRes, pRes] = await Promise.all([
      api.get('/api/students'),
      api.get('/api/fees'),
      api.get('/api/fees/paid'),
    ]);
    setStudents(sRes.data);
    setDues(dRes.data);
    setPaid(pRes.data);
    const collected = pRes.data.reduce((sum, f) => sum + (f.amount || 0), 0);
    const pendingAmount = dRes.data.reduce((sum, f) => sum + (f.amount || 0), 0);
    setStats({ collected, pendingAmount, pendingCount: dRes.data.length });
  }

  useEffect(() => { fetchData(); }, []);

   async function markPaid(id) {
     await api.patch(`/api/fees/markPaid/${id}`);
     fetchData();
   }

   function logout() {
     clearAuth();
     onLogout();
   }

   return (
     <div className="p-6 space-y-6">
       <div className="flex items-center justify-between">
         <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
         <button onClick={logout} className="px-3 py-1.5 rounded bg-gray-800 text-white">Logout</button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
         <div className="bg-white p-4 rounded shadow">
           <div className="text-sm text-gray-500">Total Collected (This Month)</div>
           <div className="text-2xl font-bold">₹ {stats.collected}</div>
         </div>
         <div className="bg-white p-4 rounded shadow">
           <div className="text-sm text-gray-500">Pending Amount</div>
           <div className="text-2xl font-bold">₹ {stats.pendingAmount}</div>
         </div>
         <div className="bg-white p-4 rounded shadow">
           <div className="text-sm text-gray-500">Pending Count</div>
           <div className="text-2xl font-bold">{stats.pendingCount}</div>
         </div>
       </div>

      <div className="bg-white rounded shadow">
        <div className="p-4 border-b font-medium">Students with Pending Fees</div>
        <div className="p-4 overflow-x-auto">
          {dues.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No pending fees</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">Name</th>
                  <th className="py-2">Parent</th>
                  <th className="py-2">Room</th>
                  <th className="py-2">Month</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {dues.map((d) => (
                  <tr key={d._id} className="border-t">
                    <td className="py-2">{d.student_id?.name}</td>
                    <td className="py-2">{d.student_id?.parentName}</td>
                    <td className="py-2">{d.student_id?.room_no}</td>
                    <td className="py-2">{d.month}</td>
                    <td className="py-2">₹ {d.amount}</td>
                    <td className="py-2">
                      <button onClick={() => markPaid(d._id)} className="px-2 py-1 rounded bg-green-600 text-white text-xs">Mark Paid</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {paid.length > 0 && (
        <div className="bg-white rounded shadow">
          <div className="p-4 border-b font-medium text-green-700">Recently Paid Fees</div>
          <div className="p-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-600">
                  <th className="py-2">Name</th>
                  <th className="py-2">Room</th>
                  <th className="py-2">Month</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Paid Date</th>
                  <th className="py-2">UTR</th>
                </tr>
              </thead>
              <tbody>
                {paid.slice(0, 10).map((p) => (
                  <tr key={p._id} className="border-t">
                    <td className="py-2">{p.student_id?.name}</td>
                    <td className="py-2">{p.student_id?.room_no}</td>
                    <td className="py-2">{p.month}</td>
                    <td className="py-2 font-medium text-green-700">₹ {p.amount}</td>
                    <td className="py-2 text-xs">{p.payment_date ? new Date(p.payment_date).toLocaleDateString() : '-'}</td>
                    <td className="py-2 font-mono text-xs">{p.utr || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


