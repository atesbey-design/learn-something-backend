import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;  // password artık opsiyonel
  readTopics: string[];
  favoriteTopics: mongoose.Types.ObjectId[];
  lastReadDate: Date;
  dailyReadCount: number;
  lastFavoriteAdded: Date;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },  // password artık zorunlu değil
  readTopics: { type: [String], default: [] },
  favoriteTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  lastReadDate: { type: Date, default: null },
  dailyReadCount: { type: Number, default: 0 },
  lastFavoriteAdded: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);