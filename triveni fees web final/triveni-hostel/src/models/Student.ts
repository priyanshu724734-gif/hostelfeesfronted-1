import mongoose from 'mongoose'

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  roomNo: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  monthlyFee: { type: Number, required: true },
  totalFee: { type: Number, required: true },
}, { timestamps: true })

export default mongoose.models.Student || mongoose.model('Student', studentSchema)
