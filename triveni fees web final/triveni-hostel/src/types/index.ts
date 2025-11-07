export interface User {
  _id: string
  name: string
  email: string
  mobile: string
  role: 'admin' | 'parent'
}

export interface Student {
  _id: string
  name: string
  roomNo: string
  parentId: string | User
  monthlyFee: number
  totalFee: number
}

export interface Fee {
  _id: string
  studentId: string | Student
  month: number
  year: number
  amount: number
  status: 'paid' | 'unpaid'
  paymentDate?: Date
}

export interface Transaction {
  _id: string
  studentId: string | Student
  method: 'upi' | 'cash' | 'bank'
  amount: number
  transactionId?: string
  rawSms?: string
  date: Date
}
