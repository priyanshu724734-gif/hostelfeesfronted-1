import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Fee from '@/models/Fee'
import Student from '@/models/Student'
import { getUserFromRequest } from '@/lib/auth'
import pdfMake from 'pdfmake'

const printer = new pdfMake({})

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

    const tableBody = [
      ['Student Name', 'Room No', 'Parent Name', 'Parent Mobile', 'Month', 'Year', 'Amount', 'Status', 'Payment Date'],
    ]

    fees.forEach((fee: any) => {
      tableBody.push([
        fee.studentId.name,
        fee.studentId.roomNo,
        fee.studentId.parentId.name,
        fee.studentId.parentId.mobile,
        fee.month.toString(),
        fee.year.toString(),
        fee.amount.toString(),
        fee.status,
        fee.paymentDate ? fee.paymentDate.toISOString().split('T')[0] : '',
      ])
    })

    const docDefinition: any = {
      content: [
        { text: 'Triveni Hostel Fees Report', style: 'header' },
        { text: new Date().toLocaleDateString(), alignment: 'right', margin: [0, 0, 0, 20] },
        {
          table: {
            headerRows: 1,
            widths: ['*', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
            body: tableBody,
          },
          layout: 'lightHorizontalLines',
        },
      ],
      styles: {
        header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 20] },
      },
    }

    const pdfDoc = printer.createPdfKitDocument(docDefinition)
    const chunks: Buffer[] = []

    return new Promise<Response>((resolve, reject) => {
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk))
      pdfDoc.on('end', () => {
        const pdf = Buffer.concat(chunks)
        resolve(
          new NextResponse(pdf, {
            headers: {
              'Content-Type': 'application/pdf',
              'Content-Disposition': 'attachment; filename=fees-report.pdf',
            },
          })
        )
      })
      pdfDoc.on('error', reject)
      pdfDoc.end()
    })
  } catch (error) {
    console.error('PDF export error:', error)
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 })
  }
}
