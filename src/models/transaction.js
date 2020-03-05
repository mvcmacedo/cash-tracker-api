import { Schema, model } from 'mongoose';

import {
  transactionTypes,
  transactionMethods,
  transactionFrequency,
} from '../enums';

const TransactionSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
      maxlength: 100,
    },
    amount: {
      type: Number,
      required: true,
    },
    location: {
      latitude: {
        type: String,
      },
      longitude: {
        type: String,
      },
    },
    method: {
      type: String,
      enum: Object.values(transactionMethods),
    },
    type: {
      type: String,
      enum: Object.values(transactionTypes),
      required: true,
    },
    frequency: {
      type: String,
      enum: Object.values(transactionFrequency),
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: new Date(),
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
    },
  },
  {
    timestamps: true,
  }
);
export default model('Transaction', TransactionSchema);
