import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Student from '@/models/Student'
import User from '@/models/User'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const createStudentSchema = z.object({
  name: z.string().min(2),
  roomNo: z.string().min(1),
  parentId: z.string(),
  monthlyFee: z.number().positive(),
  totalFee: z.number().positive(),
})

export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    const students = await Student.find({}).populate('parentId', 'name email mobile')
    return NextResponse.json(students)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, roomNo, parentId, monthlyFee, totalFee } = createStudentSchema.parse(body)

    await dbConnect()
    const student = await Student.create({ name, roomNo, parentId, monthlyFee, totalFee })
    const populated = await student.populate('parentId', 'name email mobile')

    return NextResponse.json(populated, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 })
  }
}
