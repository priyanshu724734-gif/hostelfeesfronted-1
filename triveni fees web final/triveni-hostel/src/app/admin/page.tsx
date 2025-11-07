'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'
import { Student, Fee } from '@/types'

export default function AdminDashboard() {
  const [user, setUser] = useState<{ name: string } | null>(null)
  const [summary, setSummary] = useState({ collected: 0, pending: 0 })
  const [unpaidFees, setUnpaidFees] = useState<any[]>([])
  const [paidFees, setPaidFees] = useState<any[]>([])
  const [dailyChart, setDailyChart] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(setUser)
      .catch(() => window.location.href = '/login')
  }, [])

  useEffect(() => {
    if (!user) return
    Promise.all([
      fetch('/api/fees?status=unpaid').then(r => r.json()),
      fetch('/api/fees?status=paid').then(r => r.json()),
    ]).then(([unpaid, paid]) => {
      setUnpaidFees(unpaid)
      setPaidFees(paid)
      const now = new Date()
      const collected = paid
        .filter((f: any) => new Date(f.paymentDate).getMonth() === now.getMonth() && new Date(f.paymentDate).getFullYear() === now.getFullYear())
        .reduce((sum: number, f: any) => sum + f.amount, 0)
      const pending = unpaid.reduce((sum: number, f: any) => sum + f.amount, 0)
      setSummary({ collected, pending })
    })
  }, [user])

  async function handleMarkPaid(feeId: string) {
    const res = await fetch('/api/fees/mark-paid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feeId, method: 'cash' }),
    })
    if (res.ok) {
      toast.success('Marked as paid')
      setUnpaidFees(prev => prev.filter(f => f._id !== feeId))
    } else {
      toast.error('Failed to mark as paid')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">
            Hello, {user?.name || 'Admin'}
          </h1>
          <div className="flex gap-2">
            <Link href="/admin/students">
              <Button variant="outline">Manage Students</Button>
            </Link>
            <Button asChild>
              <Link href="/api/export/csv" target="_blank">Export CSV</Link>
            </Button>
            <Button asChild>
              <Link href="/api/export/pdf" target="_blank">Export PDF</Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Fees Collected This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-emerald-600">₹{summary.collected.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Fees Amount</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-red-600">₹{summary.pending.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Daily Collections (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={100}>
                <BarChart data={dailyChart}>
                  <Bar dataKey="amount" fill="#10b981" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="unpaid" className="w-full">
          <TabsList>
            <TabsTrigger value="unpaid">Unpaid Fees</TabsTrigger>
            <TabsTrigger value="paid">Paid Fees (This Month)</TabsTrigger>
          </TabsList>

          <TabsContent value="unpaid" className="space-y-4">
            {unpaidFees.map(fee => (
              <Card key={fee._id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">{fee.studentId.name}</p>
                      <p className="text-sm text-gray-600">Parent: {fee.studentId.parentId.name}</p>
                      <p className="text-sm text-gray-600">Room: {fee.studentId.roomNo}</p>
                      <p className="text-sm text-gray-600">Contact: {fee.studentId.parentId.mobile}</p>
                      <p className="text-sm text-gray-600">Email: {fee.studentId.parentId.email}</p>
                      <p className="text-sm text-gray-600">Pending: {fee.month}/{fee.year}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleMarkPaid(fee._id)}>
                        Mark as Paid
                      </Button>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/parent?studentId=${fee.studentId._id}`}>View Details</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="paid" className="space-y-4">
            {paidFees
              .filter(f => new Date(f.paymentDate).getMonth() === new Date().getMonth() && new Date(f.paymentDate).getFullYear() === new Date().getFullYear())
              .map(fee => (
                <Card key={fee._id} className="border-green-200 bg-green-50">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{fee.studentId.name}</p>
                        <p className="text-sm text-gray-600">Parent: {fee.studentId.parentId.name}</p>
                        <p className="text-sm text-gray-600">Room: {fee.studentId.roomNo}</p>
                        <p className="text-sm text-gray-600">Paid on: {new Date(fee.paymentDate).toLocaleDateString()}</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-200 text-green-800">
                        Paid
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  )
}
