import { model, Schema } from 'mongoose';

const CategorySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 15,
    },
    description: {
      type: String,
      maxlength: 100,
    },
    icon: String,
    color: String,
  },
  {
    timestamps: true,
  }
);

export default model('Category', CategorySchema);
