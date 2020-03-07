import { TransactionModel } from '../models';

class TransactionService {
  static create(data) {
    return TransactionModel.create(data);
  }

  static get(filters = {}, { per_page = null, page = null } = {}) {
    // before date filter
    if (filters.end) filters.date.$lte = filters.end;

    // after date filter
    if (filters.start) filters.date.$gte = filters.start;

    // minimum amount filter
    if (filters.minAmount) filters.amount.$gte = filters.minAmount;

    // maximum amount filter
    if (filters.maxAmount) filters.amount.$lte = filters.maxAmount;

    /**
     * find transactions with filters,
     * category and pagination, if it exists
     */
    return TransactionModel.find(filters)
      .populate('category')
      .limit(per_page)
      .skip(page)
      .lean();
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
