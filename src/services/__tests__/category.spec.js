import { CategoryService } from '..';

import { CategoryModel } from '../../models';

import factory from '../../__tests__/factory';
import { up, down } from '../../__tests__/database';

import { categorySchema } from '../../__tests__/schemas';

const count = 5; // to createMany / buildMany

describe('Category Service', () => {
  beforeAll(up); // connect database

  afterEach(() => CategoryModel.deleteMany());

  afterAll(down); // disconnect database

  describe('Create', () => {
    it('Should NOT create category (model error)', async () => {
      const spy = jest
        .spyOn(CategoryModel, 'create')
        .mockImplementation(() => {
          throw new Error();
        });

      try {
        await CategoryService.create();
      } catch (err) {
        expect(err).toBeDefined();
      }

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('Should NOT create category (validation error)', async () => {
      await CategoryService.create({}).catch(err => {
        expect(err).toBeDefined();
        expect(err.message).toContain('Category validation failed');
      });
    });

    it('Should NOT create category (missing required field)', async () => {
      const category = await factory.build('Category');

      delete category.name;

      await CategoryService.create(category).catch(err => {
        expect(err).toBeDefined();
        expect(err.message).toContain('Category validation failed');
      });
    });

    it('Should create category', async () => {
      const category = await factory.build('Category');

      const createdCategory = await CategoryService.create(
        category
      ).catch(err => {
        expect(err).toBeUndefined();
      });

      expect(createdCategory).toBeDefined();
    });
  });

  describe('Get', () => {
    it('Should NOT get categories (model error)', async () => {
      const spy = jest
        .spyOn(CategoryModel, 'find')
        .mockImplementation(() => {
          throw new Error();
        });

      try {
        await CategoryService.get();
      } catch (err) {
        expect(err).toBeDefined();
      }

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('Should get categories (empty list)', async () => {
      const categories = await CategoryService.get();

      expect(categories).toBeInstanceOf(Array);
      expect(categories).toHaveLength(0);
    });

    it('Should get categories', async () => {
      await factory.createMany('Category', count);

      const categories = await CategoryService.get();

      expect(categories).toBeInstanceOf(Array);
      expect(categories).toHaveLength(count);
      expect(categories).toMatchSchema(categorySchema);
    });

    it('Should get categories (with filters)', async () => {
      const name = 'test name';

      await factory.create('Category');
      await factory.create('Category', { name });

      const categories = await CategoryService.get({ name });

      expect(categories).toBeInstanceOf(Array);
      expect(categories).toHaveLength(1);
      expect(categories[0].name).toBe(name);
      expect(categories).toMatchSchema(categorySchema);
    });
  });

  describe('Update', () => {
    it('Should NOT update category (without filters)', async () => {
      try {
        await CategoryService.update();
      } catch (err) {
        expect(err).toBeDefined();
        expect(err.message).toBe('Filters not found');
      }
    });

    it('Should NOT update category (model error)', async () => {
      const spy = jest
        .spyOn(CategoryModel, 'updateMany')
        .mockImplementation(() => {
          throw new Error();
        });

      try {
        await CategoryService.update({});
      } catch (err) {
        expect(err).toBeDefined();
      }

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('Should NOT update category (invalid field)', async () => {
      const { id: _id } = await factory.create('Category');

      await CategoryService.update({ _id }, { amount: 'test' });

      const [update] = await CategoryService.get({ _id });

      expect(update).toBeDefined();
      expect(update.amount).toBeUndefined();
    });

    it('Should update category', async () => {
      const name = 'test';

      const { id: _id } = await factory.create('Category');

      await CategoryService.update({ _id }, { name });

      const [update] = await CategoryService.get({ _id });

      expect(update).toBeDefined();
      expect(update.name).toBe(name);
    });

    it('Should update category (changing invalid type)', async () => {
      const { id: _id } = await factory.create('Category');

      await CategoryService.update({ _id }, { name: 123 });

      const [update] = await CategoryService.get({ _id });

      expect(update).toBeDefined();
      expect(update.name).toBe('123');
    });
  });

  describe('Delete', () => {
    it('Should NOT delete category (model error)', async () => {
      const spy = jest
        .spyOn(CategoryModel, 'deleteMany')
        .mockImplementation(() => {
          throw new Error();
        });

      try {
        await CategoryService.delete({});
      } catch (err) {
        expect(err).toBeDefined();
      }

      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });

    it('Should NOT delete category (without filters)', async () => {
      try {
        await CategoryService.delete();
      } catch (err) {
        expect(err).toBeDefined();
        expect(err.message).toBe('Filters not found');
      }
    });

    it('Should delete category', async () => {
      const { id: _id } = await factory.create('Category');

      await CategoryService.delete({ _id });

      const [deletedCategory] = await CategoryService.get({ _id });

      expect(deletedCategory).toBeUndefined();
    });

    it('Should delete multiple category', async () => {
      const name = 'test';
      await factory.createMany('Category', count, { name });
      const createdCategories = await CategoryService.get({ name });

      expect(createdCategories).toHaveLength(count);

      await CategoryService.delete({ name });

      const categories = await CategoryService.get({ name });

      expect(categories).toHaveLength(0);
    });
  });
});
