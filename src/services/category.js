import { CategoryModel } from '../models';

class CategoryService {
  static create(data) {
    return CategoryModel.create(data);
  }

  static get(filters = {}) {
    return CategoryModel.find(filters);
  }

  static update(filters = {}, data = {}) {
    return CategoryModel.updateMany(filters, { $set: data });
  }

  static delete(filters = {}) {
    return CategoryModel.deleteMany(filters);
  }
}

export default CategoryService;
