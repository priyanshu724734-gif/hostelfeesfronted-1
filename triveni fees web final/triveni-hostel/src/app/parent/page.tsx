'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Student, Fee, User } from '@/types'

export default function ParentDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [students, setStudents] = useState<(Student & { fees: Fee[] })[]>([])
  const [upcoming, setUpcoming] = useState<(Student & { fee: Fee }) | null>(null)
  const searchParams = useSearchParams()
  const studentId = searchParams.get('studentId')

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(setUser)
      .catch(() => (window.location.href = '/login'))
  }, [])

  useEffect(() => {
    if (!user) return
    fetch(`/api/parents/students?parentId=${user._id}`)
      .then(r => r.json())
      .then(setStudents)
  }, [user])

  useEffect(() => {
    if (!students.length) return
    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear

    const upcomingFee = students
      .map(s => {
        const fee = s.fees.find((f: Fee) => f.month === nextMonth && f.year === nextYear && f.status === 'unpaid')
        return { ...s, fee }
      })
      .find((s): s is (Student & { fees: Fee[] }) & { fee: Fee } => !!s.fee)

    setUpcoming(upcomingFee || null)
  }, [students])

  function generateUpiLink(student: Student, fee: Fee) {
    const vpa = process.env.NEXT_PUBLIC_UPI_VPA || 'hostel@upi'
    const note = `Fees_${student.name}_${fee.month}_${fee.year}`
    return `upi://pay?pa=${vpa}&pn=TriveniHostel&am=${fee.amount}&tn=${note}`
  }

  async function handlePayNow(student: Student, fee: Fee) {
    const upiLink = generateUpiLink(student, fee)
    window.location.href = upiLink
    toast.info('Opening UPI app...')
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">
            Hello, {user.name}
          </h1>
        </div>

        {students.map(student => {
          const totalDue = student.fees.filter(f => f.status === 'unpaid').reduce((sum, f) => sum + f.amount, 0)
          const dueFees = student.fees.filter(f => f.status === 'unpaid')
          const paidFees = student.fees.filter(f => f.status === 'paid')

          return (
            <Card key={student._id} className="mb-6">
              <CardHeader>
                <CardTitle className="flex justify-between">
                  <span>{student.name}</span>
                  <Badge variant="outline">Room {student.roomNo}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Monthly Fee</p>
                    <p className="text-xl font-bold">₹{student.monthlyFee}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Fees Due Till Today</p>
                    <p className="text-xl font-bold text-red-600">₹{totalDue}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Mobile</p>
                    <p className="text-xl font-bold">{user.mobile}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Period Reminder</p>
                    <p className="text-sm font-semibold text-emerald-700">Please pay between 1–5 of every month</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Due Fees (Unpaid months)</h3>
                    {dueFees.map(fee => (
                      <Card key={fee._id} className="border-red-200 bg-red-50 mb-2">
                        <CardContent className="p-3 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{fee.month}/{fee.year} – ₹{fee.amount}</p>
                          </div>
                          <Button size="sm" onClick={() => handlePayNow(student, fee)}>
                            Pay Now
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                    {dueFees.length === 0 && <p className="text-gray-500">No due fees. Thank you!</p>}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Upcoming Fee</h3>
                    {upcoming && upcoming._id === student._id && upcoming.fee ? (
                      <Card className="border-emerald-200 bg-emerald-50">
                        <CardContent className="p-3">
                          <p className="font-medium">{upcoming.fee.month}/{upcoming.fee.year} – ₹{upcoming.fee.amount}</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <p className="text-gray-500">No upcoming fee records.</p>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Payment History</h3>
                    {paidFees.slice(0, 5).map(fee => (
                      <Card key={fee._id} className="border-green-200 bg-green-50 mb-2">
                        <CardContent className="p-3">
                          <p className="font-medium">{fee.month}/{fee.year} – ₹{fee.amount} – Paid on {fee.paymentDate ? new Date(fee.paymentDate).toLocaleDateString() : ''}</p>
                        </CardContent>
                      </Card>
                    ))}
                    {paidFees.length === 0 && <p className="text-gray-500">No payment history.</p>}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </motion.div>
    </div>
  )
}
