import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Student from '@/models/Student'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const updateStudentSchema = z.object({
  name: z.string().min(2).optional(),
  roomNo: z.string().min(1).optional(),
  parentId: z.string().optional(),
  monthlyFee: z.number().positive().optional(),
  totalFee: z.number().positive().optional(),
})

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const parsed = updateStudentSchema.parse(body)

    await dbConnect()
    const student = await Student.findByIdAndUpdate(params.id, parsed, { new: true }).populate('parentId', 'name email mobile')
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json(student)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const student = await Student.findByIdAndDelete(params.id)
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Student deleted' })
  } catch {
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
  }
}
