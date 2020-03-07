import joi from 'joi';

import {
  transactionFrequency,
  transactionMethods,
  transactionTypes,
} from '../enums';

const transaction = {
  _id: joi.object(),
  description: joi
    .string()
    .max(100)
    .required(),
  amount: joi.number().required(),
  location: joi.object(),
  method: joi
    .string()
    .valid(
      transactionMethods.TED,
      transactionMethods.CASH,
      transactionMethods.DEBIT,
      transactionMethods.SLIP,
      transactionMethods.CREDIT
    ),
  type: joi
    .string()
    .valid(
      transactionTypes.CREDIT,
      transactionTypes.CASHIN,
      transactionTypes.CASHOUT,
      transactionTypes.INVESTMENT
    )
    .required(),
  frequency: joi
    .string()
    .valid(
      transactionFrequency.FIXED,
      transactionFrequency.VARIABLE,
      transactionFrequency.UNPLANNED
    )
    .required(),
  date: joi.date().required(),
  category: joi.alternatives().try(joi.string(), joi.object()),
  createdAt: joi.date(),
  updatedAt: joi.date(),
  __v: joi.number(),
};

const transactionSchema = joi
  .alternatives()
  .try(
    joi.object(transaction).required(),
    joi.array().items(joi.object(transaction).required())
  );

const category = {
  _id: joi.object(),
  name: joi
    .string()
    .max(15)
    .required(),
  description: joi.string().max(100),
  icon: joi.string(),
  color: joi.string(),
  createdAt: joi.date(),
  updatedAt: joi.date(),
  __v: joi.number(),
};

const categorySchema = joi
  .alternatives()
  .try(
    joi.object(category).required(),
    joi.array().items(joi.object(category).required())
  );

export { transactionSchema, categorySchema };
