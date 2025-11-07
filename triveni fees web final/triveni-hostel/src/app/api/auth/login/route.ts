import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import { comparePassword, generateToken } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  mobile: z.string().min(10),
  password: z.string().min(4),
  role: z.enum(['admin', 'parent']),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { mobile, password, role } = loginSchema.parse(body)

    await dbConnect()
    const user = await User.findOne({ mobile, role })
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const isMatch = await comparePassword(password, user.passwordHash)
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const token = generateToken({ id: user._id.toString(), role: user.role })

    const response = NextResponse.json({ message: 'Login successful', user: { id: user._id, name: user.name, role: user.role } })
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
