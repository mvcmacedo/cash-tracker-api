import { CategoryService } from '../services';

import { CustomError } from '../helpers';

class CategoryController {
  static async list(req, res) {
    try {
      const filters = req.query;

      const categories = await CategoryService.get(filters);

      return res.send(categories);
    } catch (error) {
      return res.send(error);
    }
  }

  static async get(req, res) {
    try {
      const { id: _id } = req.params;

      const [category] = await CategoryService.get({ _id });

      if (!category) {
        throw new CustomError(`Category ${_id} not found`, 404);
      }

      return res.send(category);
    } catch ({ http_code, message }) {
      return res.status(http_code).send({ message });
    }
  }

  static async create(req, res) {
    try {
      const category = req.body;

      const createdCategory = await CategoryService.create(category);

      return res.status(201).send(createdCategory);
    } catch ({ http_code, message }) {
      return res.status(http_code).send({ message });
    }
  }

  static async update(req, res) {
    try {
      const { id: _id } = req.params;

      const [category] = await CategoryService.get({ _id });

      if (!category) {
        throw new CustomError(`Category ${_id} not found`, 404);
      }

      const data = req.body;

      await CategoryService.update({ _id }, data);

      const [updatedCategory] = await CategoryService.get({ _id });

      return res.send(updatedCategory);
    } catch ({ http_code, message }) {
      return res.status(http_code).send({ message });
    }
  }

  static async delete(req, res) {
    try {
      const { id: _id } = req.params;

      const [category] = await CategoryService.get({ _id });

      if (!category) {
        throw new CustomError(`Category ${_id} not found`, 404);
      }

      await CategoryService.delete({ _id });

      return res.status(204).send();
    } catch ({ http_code, message }) {
      return res.status(http_code).send({ message });
    }
  }
}

export default CategoryController;
