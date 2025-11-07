import mongoose from 'mongoose'

const feeSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['paid', 'unpaid'], required: true, default: 'unpaid' },
  paymentDate: { type: Date },
}, { timestamps: true })

feeSchema.index({ studentId: 1, month: 1, year: 1 }, { unique: true })

export default mongoose.models.Fee || mongoose.model('Fee', feeSchema)
