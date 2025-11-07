import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Fee from '@/models/Fee'
import Student from '@/models/Student'
import { getUserFromRequest } from '@/lib/auth'
import { Parser } from 'json2csv'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const fees = await Fee.find({})
      .populate({
        path: 'studentId',
        populate: { path: 'parentId', select: 'name email mobile' },
      })
      .sort({ year: -1, month: -1 })

    const rows = fees.map((fee: any) => ({
      'Student Name': fee.studentId.name,
      'Room No': fee.studentId.roomNo,
      'Parent Name': fee.studentId.parentId.name,
      'Parent Mobile': fee.studentId.parentId.mobile,
      'Parent Email': fee.studentId.parentId.email,
      'Month': fee.month,
      'Year': fee.year,
      'Amount': fee.amount,
      'Status': fee.status,
      'Payment Date': fee.paymentDate ? fee.paymentDate.toISOString().split('T')[0] : '',
    }))

    const parser = new Parser()
    const csv = parser.parse(rows)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename=fees-report.csv',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to generate CSV' }, { status: 500 })
  }
}
