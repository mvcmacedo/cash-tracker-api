import joi from 'joi';

import {
  transactionFrequency,
  transactionTypes,
  transactionMethods,
} from '../../enums';

class TransactionSchema {
  static get() {
    return joi
      .object({
        params: joi
          .object({
            id: joi.string().required(),
          })
          .required(),
      })
      .unknown(true)
      .required();
  }

  static list() {
    return joi
      .object({
        query: joi.object({
          description: joi.string(),
          amount: joi.number(),
          minAmount: joi.number(),
          maxAmount: joi.number(),
          start: joi.date(),
          end: joi.date(),
          date: joi.date(),
          method: joi.string(),
          type: joi.string(),
          frequency: joi.string(),
          category: joi.string(),
        }),
        headers: joi
          .object({
            page: joi.number(),
            per_page: joi.number(),
          })
          .unknown(true),
      })
      .unknown(true)
      .required();
  }

  static post() {
    return joi
      .object({
        body: joi
          .object({
            description: joi
              .string()
              .max(100)
              .required(),
            amount: joi.number().required(),
            location: joi.object({
              latitude: joi.string(),
              longitude: joi.string(),
            }),
            method: joi
              .string()
              .valid(
                transactionMethods.CASH,
                transactionMethods.CREDIT,
                transactionMethods.DEBIT,
                transactionMethods.SLIP,
                transactionMethods.TED
              ),
            type: joi
              .string()
              .valid(
                transactionTypes.CASHIN,
                transactionTypes.CASHOUT,
                transactionTypes.CREDIT,
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
            category: joi.string(),
          })
          .required(),
      })
      .unknown(true)
      .required();
  }

  static put() {
    return joi
      .object({
        params: joi
          .object({
            id: joi.string().required(),
          })
          .required(),
        body: joi
          .object({
            description: joi.string().max(100),
            amount: joi.number(),
            location: joi.object({
              latitude: joi.string(),
              longitude: joi.string(),
            }),
            method: joi
              .string()
              .valid(
                transactionMethods.CASH,
                transactionMethods.CREDIT,
                transactionMethods.DEBIT,
                transactionMethods.SLIP,
                transactionMethods.TED
              ),
            type: joi
              .string()
              .valid(
                transactionTypes.CASHIN,
                transactionTypes.CASHOUT,
                transactionTypes.CREDIT,
                transactionTypes.INVESTMENT
              ),
            frequency: joi
              .string()
              .valid(
                transactionFrequency.FIXED,
                transactionFrequency.VARIABLE,
                transactionFrequency.UNPLANNED
              ),
            date: joi.date(),
            category: joi.string(),
          })
          .required(),
      })
      .unknown(true)
      .required();
  }

  static delete() {
    return joi
      .object({
        params: joi
          .object({
            id: joi.string().required(),
          })
          .required(),
      })
      .unknown(true)
      .required();
  }
}

export default TransactionSchema;
