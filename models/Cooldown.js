import mongoose from 'mongoose';

const CooldownSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  lastRequestAt: { type: Date, required: true },
});

export default mongoose.models.Cooldown || mongoose.model('Cooldown', CooldownSchema);