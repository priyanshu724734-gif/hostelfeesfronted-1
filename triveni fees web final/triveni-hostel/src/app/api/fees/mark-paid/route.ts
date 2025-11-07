import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Fee from '@/models/Fee'
import Transaction from '@/models/Transaction'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req)
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { feeId, method, transactionId, rawSms } = body

    await dbConnect()
    const fee = await Fee.findById(feeId).populate('studentId')
    if (!fee) {
      return NextResponse.json({ error: 'Fee not found' }, { status: 404 })
    }

    fee.status = 'paid'
    fee.paymentDate = new Date()
    await fee.save()

    await Transaction.create({
      studentId: fee.studentId._id,
      method,
      amount: fee.amount,
      transactionId,
      rawSms,
      date: new Date(),
    })

    return NextResponse.json({ message: 'Marked as paid' })
  } catch {
    return NextResponse.json({ error: 'Failed to mark as paid' }, { status: 500 })
  }
}
