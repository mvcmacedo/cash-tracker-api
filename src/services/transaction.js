import { TransactionModel } from '../models';

class TransactionService {
  static create(data) {
    return TransactionModel.create(data);
  }

  static get(filters = {}) {
    return TransactionModel.find(filters);
  }

  static update(filters, data = {}) {
    if (!filters) {
      throw new Error('Filters not found');
    }

    return TransactionModel.updateMany(
      filters,
      { $set: data },
      { runValidators: true }
    );
  }

  static delete(filters) {
    if (!filters) {
      throw new Error('Filters not found');
    }

    return TransactionModel.deleteMany(filters);
  }
}

export default TransactionService;
