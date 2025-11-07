import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Fee from '@/models/Fee'
import Transaction from '@/models/Transaction'
import Student from '@/models/Student'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { message, sender, timestamp } = body

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 })
    }

    await dbConnect()

    const amountMatch = message.match(/(?:Rs\.?|INR|₹)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)/i)
    const transactionIdMatch = message.match(/[Uu][Pp][Ii]\s*ref(?:erence)?\s*:?\s*([A-Z0-9]+)/i) || message.match(/(?:txn|transaction)\s*:?\s*([A-Z0-9]+)/i)
    const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, '')) : null
    const transactionId = transactionIdMatch ? transactionIdMatch[1] : null

    if (!amount) {
      return NextResponse.json({ error: 'Could not extract amount from SMS' }, { status: 400 })
    }

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()

    const unpaidFee = await Fee.findOne({
      amount,
      status: 'unpaid',
      month: { $gte: currentMonth - 2, $lte: currentMonth },
      year: currentYear,
    }).populate({
      path: 'studentId',
      populate: { path: 'parentId', select: 'mobile' },
    })

    if (!unpaidFee) {
      return NextResponse.json({ error: 'No matching unpaid fee found' }, { status: 404 })
    }

    unpaidFee.status = 'paid'
    unpaidFee.paymentDate = now
    await unpaidFee.save()

    await Transaction.create({
      studentId: unpaidFee.studentId._id,
      method: 'upi',
      amount,
      transactionId,
      rawSms: message,
      date: now,
    })

    return NextResponse.json({ message: 'Fee marked as paid via SMS webhook', feeId: unpaidFee._id })
  } catch (error) {
    console.error('SMS webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
