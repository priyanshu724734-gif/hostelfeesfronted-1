import mongoose from 'mongoose'
import dbConnect from '../src/lib/db'
import User from '../src/models/User'
import Student from '../src/models/Student'
import Fee from '../src/models/Fee'
import Transaction from '../src/models/Transaction'
import { hashPassword } from '../src/lib/auth'

const MONTHLY_FEE = 5000

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Rohan', 'Arjun', 'Sai', 'Kabir', 'Aryan', 'Reyansh', 'Ishaan', 'Dhruv', 'Yuvraj', 'Atharv', 'Krishna', 'Shaurya', 'Advik', 'Pranav', 'Ayaan', 'Ivan', 'Mohammed', 'Rishi', 'Zayan', 'Eshaan', 'Faiyaz', 'Harsh', 'Kian', 'Laksh', 'Neil', 'Ojas']
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Kumar', 'Singh', 'Yadav', 'Jain', 'Reddy', 'Patel', 'Shah', 'Mehta', 'Joshi', 'Pillai', 'Nair', 'Menon', 'Iyer', 'Rao', 'Chatterjee', 'Mukherjee', 'Banerjee', 'Chakraborty', 'Sengupta', 'Das', 'Mishra', 'Tripathi', 'Dubey', 'Tiwari', 'Pandey', 'Biswas', 'Chakraborty']

function getRandomItem(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}
function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
function randomMobile() {
  const digits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('')
  return digits
}
function randomEmail(name: string, role: string) {
  const domains = role === 'parent' ? ['gmail.com', 'yahoo.com', 'outlook.com'] : ['hostel.com', 'triveni.com']
  const domain = getRandomItem(domains)
  return `${name.toLowerCase().replace(/\s+/g, '')}${getRandomInt(10, 99)}@${domain}`
}

async function seed() {
  await dbConnect()
  await User.deleteMany({})
  await Student.deleteMany({})
  await Fee.deleteMany({})
  await Transaction.deleteMany({})

  const adminPasswordHash = await hashPassword('admin123')
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@triveni.com',
    mobile: '9999999999',
    passwordHash: adminPasswordHash,
    role: 'admin',
  })

  const students = []
  const parents = []
  for (let i = 0; i < 30; i++) {
    const studentName = `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`
    const parentName = `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`
    const parentMobile = randomMobile()
    const studentMobile = randomMobile()
    const roomNo = `A${String(i + 1).padStart(2, '0')}`

    const parentPasswordHash = await hashPassword('parent123')
    const parent = await User.create({
      name: parentName,
      email: randomEmail(parentName, 'parent'),
      mobile: parentMobile,
      passwordHash: parentPasswordHash,
      role: 'parent',
    })
    parents.push(parent)

    const student = await Student.create({
      name: studentName,
      roomNo,
      parentId: parent._id,
      monthlyFee: MONTHLY_FEE,
      totalFee: MONTHLY_FEE * 12,
    })
    students.push(student)
  }

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const months = Array.from({ length: 12 }, (_, i) => i + 1)

  for (const student of students) {
    for (const month of months) {
      const isPaid = month < currentMonth || (month === currentMonth && Math.random() > 0.5)
      await Fee.create({
        studentId: student._id,
        month,
        year: currentYear,
        amount: MONTHLY_FEE,
        status: isPaid ? 'paid' : 'unpaid',
        paymentDate: isPaid ? new Date(currentYear, month - 1, getRandomInt(1, 28)) : undefined,
      })
    }
  }

  const paidFees = await Fee.find({ status: 'paid' }).populate('studentId')
  for (const fee of paidFees as any[]) {
    await Transaction.create({
      studentId: fee.studentId._id,
      method: getRandomItem(['upi', 'cash', 'bank']),
      amount: fee.amount,
      transactionId: `TXN${Date.now()}${getRandomInt(100, 999)}`,
      date: fee.paymentDate,
    })
  }

  console.log('✅ Seeded 1 admin, 30 parents, 30 students, fees, and transactions')
  console.log(`👤 Admin login: mobile=9999999999, password=admin123`)
  console.log(`👨‍👩‍👧 Parent login: mobile=<any parent mobile>, password=parent123`)
  process.exit()
}

seed().catch(err => {
  console.error('❌ Seed error:', err)
  process.exit(1)
})
