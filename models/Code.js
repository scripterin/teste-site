import mongoose from 'mongoose';

const CodeSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  testSelectat: {
    type: String,
    required: true,
    enum: ['RADIO', 'BLS', 'REZIDENȚIAT', 'SMULS TEORETIC'],
  },
  cod: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  used: {
    type: Boolean,
    default: false,
  },
});

// TTL — MongoDB șterge automat codul după expirare
CodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
CodeSchema.index({ userId: 1 });

export default mongoose.models.Code || mongoose.model('Code', CodeSchema);