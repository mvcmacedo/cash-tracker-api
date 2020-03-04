import { CategoryModel } from '../models';

class CategoryService {
  static create(data) {
    return CategoryModel.create(data);
  }

  static get(filters = {}) {
    return CategoryModel.find(filters);
  }

  static update(filters, data = {}) {
    if (!filters) {
      throw new Error('Filters not found');
    }

    return CategoryModel.updateMany(
      filters,
      { $set: data },
      { runValidators: true }
    );
  }

  static delete(filters) {
    if (!filters) {
      throw new Error('Filters not found');
    }

    return CategoryModel.deleteMany(filters);
  }
}

export default CategoryService;
