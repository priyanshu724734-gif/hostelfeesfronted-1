'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogin(mobile: string, password: string, role: 'admin' | 'parent') {
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, password, role }),
    })
    const json = await res.json()
    setLoading(false)

    if (res.ok) {
      toast.success('Logged in successfully')
      router.push(role === 'admin' ? '/admin' : '/parent')
    } else {
      toast.error(json.error || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-emerald-200 dark:border-emerald-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">
              Triveni Hostel
            </CardTitle>
            <CardDescription>Fee Collection System</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin">Admin</TabsTrigger>
                <TabsTrigger value="parent">Parent</TabsTrigger>
              </TabsList>
              <TabsContent value="admin">
                <LoginForm role="admin" onSubmit={handleLogin} loading={loading} />
              </TabsContent>
              <TabsContent value="parent">
                <LoginForm role="parent" onSubmit={handleLogin} loading={loading} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function LoginForm({
  role,
  onSubmit,
  loading,
}: {
  role: 'admin' | 'parent'
  onSubmit: (mobile: string, password: string, role: 'admin' | 'parent') => void
  loading: boolean
}) {
  const [mobile, setMobile] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit(mobile, password, role)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="tel"
        placeholder="Mobile number"
        value={mobile}
        onChange={e => setMobile(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
        {loading ? 'Logging in...' : `Login as ${role}`}
      </Button>
    </form>
  )
}
