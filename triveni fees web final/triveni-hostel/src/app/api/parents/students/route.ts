import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Student from '@/models/Student'
import Fee from '@/models/Fee'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || user.role !== 'parent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const { searchParams } = new URL(req.url)
    const parentId = searchParams.get('parentId')

    const students = await Student.find({ parentId }).populate('parentId', 'name email mobile')
    const studentsWithFees = await Promise.all(
      students.map(async (student) => {
        const fees = await Fee.find({ studentId: student._id }).sort({ year: -1, month: -1 })
        return { ...student.toObject(), fees }
      })
    )

    return NextResponse.json(studentsWithFees)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 })
  }
}
