import { TransactionModel } from '../models';

class TransactionService {
  static create(data) {
    return TransactionModel.create(data);
  }

  static get(filters = {}) {
    return TransactionModel.find(filters);
  }

  static update(filters = {}, data = {}) {
    return TransactionModel.updateMany(filters, { $set: data });
  }

  static delete(filters = {}) {
    return TransactionModel.deleteMany(filters);
  }
}

export default TransactionService;
