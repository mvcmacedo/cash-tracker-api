import mongoose from 'mongoose';
import { Request } from 'jest-express/lib/request';
import { Response } from 'jest-express/lib/response';

import { CategoryController } from '..';

import factory from '../../__tests__/factory';
import { up, down } from '../../__tests__/database';

import { CategoryModel } from '../../models';

import { categorySchema } from '../../__tests__/schemas';

describe('Category Controller', () => {
  beforeAll(up); // connect database
  afterAll(down); // disconnect database

  let request;
  let response;
  let mockResponse;

  beforeEach(() => {
    request = new Request();
    response = new Response();

    response.send = jest.fn(res => {
      mockResponse = res;
    });
  });

  afterEach(() => CategoryModel.deleteMany);

  describe('List', () => {
    const count = 5;

    it('Should list categories', async () => {
      await CategoryController.list(request, response);

      expect(mockResponse).toEqual([]);
    });

    it('Should list categories (without filters)', async () => {
      await factory.createMany('Category', count);

      await CategoryController.list(request, response);

      expect(mockResponse).toBeInstanceOf(Array);
      expect(mockResponse).toHaveLength(count);
      expect(mockResponse).toMatchSchema(categorySchema);
    });

    it('Should list categories (with filters)', async () => {
      const description = 'test description';

      await factory.createMany('Category', count);
      await factory.create('Category', { description });

      request.setQuery({ description });

      await CategoryController.list(request, response);

      expect(mockResponse).toBeInstanceOf(Array);
      expect(mockResponse).toHaveLength(1);
      expect(mockResponse).toMatchSchema(categorySchema);
    });
  });

  describe('Get', () => {
    it('Should NOT get category (service error)', async () => {
      request.setParams({ id: 'test' });

      await CategoryController.get(request, response);

      expect(mockResponse.message).toBeDefined();
      expect(mockResponse.message).toBe('Find category failed');
    });

    it('Should NOT get category (category not found)', async () => {
      const id = mongoose.Types.ObjectId();

      request.setParams({ id });

      await CategoryController.get(request, response);

      expect(mockResponse.message).toBeDefined();
      expect(mockResponse.message).toBe(`Category ${id} not found`);
    });

    it('Should get category', async () => {
      const { id } = await factory.create('Category');

      request.setParams({ id });

      await CategoryController.get(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse).toMatchSchema(categorySchema);
    });
  });

  describe('Create', () => {
    it('Should NOT create category', async () => {
      request.setBody({});

      await CategoryController.create(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse.message).toBe('Create category failed');
    });

    it('Should NOT create category (missing required field)', async () => {
      const { _doc: category } = await factory.build('Category');

      delete category.name;

      request.setBody(category);

      await CategoryController.create(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse.message).toBe('Create category failed');
    });

    it('Should create category', async () => {
      const { _doc: category } = await factory.build('Category');

      request.setBody(category);

      await CategoryController.create(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse._doc).toMatchSchema(categorySchema);
    });
  });

  describe('Update', () => {
    it('Should NOT update category (search error)', async () => {
      request.setParams({ id: 'test' });

      await CategoryController.update(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse.message).toBe(`Find category failed`);
    });

    it('Should NOT update category (category not found)', async () => {
      const id = mongoose.Types.ObjectId();

      request.setParams({ id });

      await CategoryController.update(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse.message).toBe(`Category ${id} not found`);
    });

    it('Should NOT update category (update error)', async () => {
      const spy = jest
        .spyOn(CategoryModel, 'updateMany')
        .mockImplementation(async () => {
          throw new Error();
        });

      const { id } = await factory.create('Category');

      request.setParams({ id });
      request.setBody({});

      await CategoryController.update(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse.message).toBe('Update category failed');

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('Should update category', async () => {
      const { id } = await factory.create('Category');

      request.setParams({ id });
      request.setBody({ description: 'test' });

      await CategoryController.update(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse).toMatchSchema(categorySchema);
      expect(mockResponse.description).toBe('test');
    });
  });

  describe('Delete', () => {
    it('Should NOT delete category (search error)', async () => {
      request.setParams({ id: 'test' });

      await CategoryController.delete(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse.message).toBe(`Find category failed`);
    });

    it('Should NOT delete category (category not found)', async () => {
      const id = mongoose.Types.ObjectId();

      request.setParams({ id });

      await CategoryController.delete(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse.message).toBe(`Category ${id} not found`);
    });

    it('Should NOT delete category (delete error)', async () => {
      const spy = jest
        .spyOn(CategoryModel, 'deleteMany')
        .mockImplementation(async () => {
          throw new Error();
        });

      const { id } = await factory.create('Category');

      request.setParams({ id });

      await CategoryController.delete(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse.message).toBe('Delete category failed');

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('Should delete category', async () => {
      const { id } = await factory.create('Category');

      request.setParams({ id });

      await CategoryController.delete(request, response);

      const [deletedCategory] = await CategoryModel.find({
        _id: id,
      });

      expect(mockResponse).toBeUndefined();
      expect(deletedCategory).toBeUndefined();
    });
  });
});
