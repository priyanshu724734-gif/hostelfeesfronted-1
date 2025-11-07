'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Student, User } from '@/types'

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<(Student & { parentId: User })[]>([])
  const [parents, setParents] = useState<User[]>([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', roomNo: '', parentId: '', monthlyFee: 5000, totalFee: 60000 })
  const [editing, setEditing] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/students').then(r => r.json()),
      fetch('/api/users?role=parent').then(r => r.json()),
    ]).then(([students, parents]) => {
      setStudents(students)
      setParents(parents)
    })
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const method = editing ? 'PUT' : 'POST'
    const url = editing ? `/api/students/${editing}` : '/api/students'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    if (res.ok) {
      toast.success(editing ? 'Student updated' : 'Student added')
      setOpen(false)
      setEditing(null)
      setForm({ name: '', roomNo: '', parentId: '', monthlyFee: 5000, totalFee: 60000 })
      const updated = await fetch('/api/students').then(r => r.json())
      setStudents(updated)
    } else {
      toast.error('Failed')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this student?')) return
    const res = await fetch(`/api/students/${id}`, { method: 'DELETE' })
    if (res.ok) {
      toast.success('Student deleted')
      setStudents(prev => prev.filter(s => s._id !== id))
    } else {
      toast.error('Failed')
    }
  }

  function editStudent(s: Student & { parentId: User }) {
    setForm({
      name: s.name,
      roomNo: s.roomNo,
      parentId: s.parentId._id,
      monthlyFee: s.monthlyFee,
      totalFee: s.totalFee,
    })
    setEditing(s._id)
    setOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-emerald-800 dark:text-emerald-200">Manage Students</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setEditing(null)}>Add Student</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? 'Edit Student' : 'Add Student'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Name</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div>
                  <Label>Room No</Label>
                  <Input value={form.roomNo} onChange={e => setForm({ ...form, roomNo: e.target.value })} required />
                </div>
                <div>
                  <Label>Parent</Label>
                  <select value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value })} className="w-full p-2 border rounded" required>
                    <option value="">Select Parent</option>
                    {parents.map(p => (
                      <option key={p._id} value={p._id}>{p.name} ({p.mobile})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Monthly Fee</Label>
                  <Input type="number" value={form.monthlyFee} onChange={e => setForm({ ...form, monthlyFee: Number(e.target.value) })} required />
                </div>
                <div>
                  <Label>Total Fee</Label>
                  <Input type="number" value={form.totalFee} onChange={e => setForm({ ...form, totalFee: Number(e.target.value) })} required />
                </div>
                <Button type="submit" className="w-full">{editing ? 'Update' : 'Add'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4">
          {students.map(s => (
            <Card key={s._id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-sm text-gray-600">Room: {s.roomNo}</p>
                    <p className="text-sm text-gray-600">Parent: {s.parentId.name} ({s.parentId.mobile})</p>
                    <p className="text-sm text-gray-600">Monthly: ₹{s.monthlyFee} | Total: ₹{s.totalFee}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => editStudent(s)}>Edit</Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(s._id)}>Delete</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
