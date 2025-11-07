import mongoose from 'mongoose'

const transactionSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  method: { type: String, enum: ['upi', 'cash', 'bank'], required: true },
  amount: { type: Number, required: true },
  transactionId: { type: String },
  rawSms: { type: String },
  date: { type: Date, required: true },
}, { timestamps: true })

export default mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema)
