import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Fee from '@/models/Fee'
import Student from '@/models/Student'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    await dbConnect()
    const { searchParams } = new URL(req.url)
    const studentId = searchParams.get('studentId')
    const status = searchParams.get('status')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const filter: any = {}
    if (studentId) filter.studentId = studentId
    if (status) filter.status = status
    if (month) filter.month = parseInt(month)
    if (year) filter.year = parseInt(year)

    const fees = await Fee.find(filter)
      .populate({
        path: 'studentId',
        populate: { path: 'parentId', select: 'name email mobile' },
      })
      .sort({ year: -1, month: -1 })

    return NextResponse.json(fees)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch fees' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { studentId, month, year, amount, status } = body

    await dbConnect()
    const fee = await Fee.create({ studentId, month, year, amount, status })
    const populated = await fee.populate({
      path: 'studentId',
      populate: { path: 'parentId', select: 'name email mobile' },
    })

    return NextResponse.json(populated, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to create fee' }, { status: 500 })
  }
}
