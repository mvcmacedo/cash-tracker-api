import { CategoryModel } from '../models';
import { CustomError } from '../helpers';

class CategoryService {
  static async create(data) {
    return CategoryModel.create(data).catch(() => {
      throw new CustomError('Create category failed');
    });
  }

  static async get(filters = {}) {
    return CategoryModel.find(filters)
      .lean()
      .catch(() => {
        throw new CustomError('Find category failed');
      });
  }

  static async update(filters, data = {}) {
    if (!filters) {
      throw new CustomError('Filters not found');
    }

    return CategoryModel.updateMany(
      filters,
      { $set: data },
      { runValidators: true }
    ).catch(() => {
      throw new CustomError('Update category failed');
    });
  }

  static async delete(filters) {
    if (!filters) {
      throw new CustomError('Filters not found');
    }

    return CategoryModel.deleteMany(filters).catch(() => {
      throw new CustomError('Delete category failed');
    });
  }
}

export default CategoryService;
