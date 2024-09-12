import mongoose, { Schema, Document } from 'mongoose';

export interface ITopic extends Document {
  title: string;
  content: string;
  category: mongoose.Types.ObjectId;
  favoriteCount: number;
  createdBy: mongoose.Types.ObjectId;
}

const TopicSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  favoriteCount: { type: Number, default: 0 },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export default mongoose.model<ITopic>('Topic', TopicSchema);