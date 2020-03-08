import { TransactionModel } from '../models';

import { CustomError } from '../helpers';

class TransactionService {
  static async create(data) {
    return TransactionModel.create(data).catch(() => {
      throw new CustomError('Create transaction failed');
    });
  }

  static async get(filters = {}, { per_page = null, page = null } = {}) {
    // before date filter
    if (filters.end) {
      filters.date = { $lte: filters.end, ...filters.date };
      delete filters.end;
    }

    // after date filter
    if (filters.start) {
      filters.date = { $gte: filters.start, ...filters.date };
      delete filters.start;
    }

    // minimum amount filter
    if (filters.minAmount) {
      filters.amount = { $gte: filters.minAmount, ...filters.amount };
      delete filters.minAmount;
    }

    // maximum amount filter
    if (filters.maxAmount) {
      filters.amount = { $lte: filters.maxAmount, ...filters.amount };
      delete filters.maxAmount;
    }

    /**
     * find transactions with filters,
     * category and pagination, if it exists
     */

    return TransactionModel.find(filters)
      .populate('category')
      .limit(Number(per_page))
      .skip(Number(page))
      .lean()
      .catch(() => {
        throw new CustomError('Find transaction failed');
      });
  }

  static async update(filters, data = {}) {
    if (!filters) {
      throw new CustomError('Filters not found', 400);
    }

    return TransactionModel.updateMany(
      filters,
      { $set: data },
      { runValidators: true }
    ).catch(() => {
      throw new CustomError('Update transaction failed');
    });
  }

  static async delete(filters) {
    if (!filters) {
      throw new CustomError('Filters not found', 400);
    }

    return TransactionModel.deleteMany(filters).catch(() => {
      throw new CustomError('Delete transaction failed');
    });
  }
}

export default TransactionService;
