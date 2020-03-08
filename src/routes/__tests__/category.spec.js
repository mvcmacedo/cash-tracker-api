import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../app';

import { categorySchema } from '../../__tests__/schemas';

import factory from '../../__tests__/factory';

import { up, down } from '../../__tests__/database';

import { CategoryModel } from '../../models';

const count = 5; // to createMany / buildMany

describe('Category Route', () => {
  beforeAll(up); // connect database
  afterAll(down); // disconnect database

  afterEach(() => CategoryModel.deleteMany());

  describe('List', () => {
    it('Should NOT list categories (invalid filter)', async () => {
      const response = await request(app)
        .get('/categories?date=test')
        .expect(400);

      expect(response.body.message).toContain('date');
    });

    it('Should list categories', async () => {
      const response = await request(app)
        .get('/categories')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body).toEqual([]);
    });

    it('Should list categories (without filters)', async () => {
      await factory.createMany('Category', count);

      const response = await request(app)
        .get('/categories')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body).toMatchSchema(categorySchema);
    });

    it('Should list categories (with filters)', async () => {
      await factory.createMany('Category', count);

      await factory.createMany('Category', count, {
        description: 'test',
      });

      const response = await request(app)
        .get('/categories?description=test')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body).toHaveLength(count);
      expect(response.body).toMatchSchema(categorySchema);
    });
  });

  describe('Get', () => {
    it('Should NOT get category (category not found)', async () => {
      const id = mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/categories/${id}`)
        .expect(404);

      expect(response.body.message).toBe(`Category ${id} not found`);
    });

    it('Should NOT get category (model error)', async () => {
      const id = 'test';

      const response = await request(app)
        .get(`/categories/${id}`)
        .expect(500);

      expect(response.body.message).toBe(`Find category failed`);
    });

    it('Should get category', async () => {
      const { id } = await factory.create('Category');

      const response = await request(app)
        .get(`/categories/${id}`)
        .expect(200);

      expect(response.body).toMatchSchema(categorySchema);
    });
  });

  describe('Post', () => {
    it('Should NOT create category', async () => {
      await request(app)
        .post('/categories')
        .expect(400);
    });

    it('Should NOT create category (missing required field)', async () => {
      const { _doc: category } = await factory.build('Category');
      delete category._id;
      delete category.name;

      await request(app)
        .post('/categories')
        .set('Accept', 'application/json')
        .send(category)
        .expect(400);
    });

    it('Should NOT create category (model error)', async () => {
      const spy = jest
        .spyOn(CategoryModel, 'create')
        .mockImplementation(async () => {
          throw new Error();
        });

      const { _doc: category } = await factory.build('Category');
      delete category._id;

      const response = await request(app)
        .post('/categories')
        .set('Accept', 'application/json')
        .send(category)
        .expect(500);

      expect(spy).toHaveBeenCalled();
      expect(response.body.message).toBe('Create category failed');

      spy.mockRestore();
    });

    it('Should create category', async () => {
      const { _doc: category } = await factory.build('Category');
      delete category._id;

      const response = await request(app)
        .post('/categories')
        .set('Accept', 'application/json')
        .send(category)
        .expect(201);

      expect(response.body).toMatchSchema(categorySchema);
    });
  });

  describe('Put', () => {
    it('Should NOT update category', async () => {
      const id = 'test';

      const response = await request(app)
        .put(`/categories/${id}`)
        .set('Accept', 'application/json')
        .send({})
        .expect(500);

      expect(response.body.message).toBe('Find category failed');
    });

    it('Should NOT update category (category not found)', async () => {
      const id = mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/categories/${id}`)
        .set('Accept', 'application/json')
        .send({})
        .expect(404);

      expect(response.body.message).toBe(`Category ${id} not found`);
    });

    it('Should NOT update category (model error)', async () => {
      const spy = jest
        .spyOn(CategoryModel, 'updateMany')
        .mockImplementation(async () => {
          throw new Error();
        });

      const { id } = await factory.create('Category');

      const response = await request(app)
        .put(`/categories/${id}`)
        .set('Accept', 'application/json')
        .send({})
        .expect(500);

      expect(spy).toHaveBeenCalled();
      expect(response.body.message).toBe('Update category failed');

      spy.mockRestore();
    });

    it('Should update category', async () => {
      const { id } = await factory.create('Category');

      const response = await request(app)
        .put(`/categories/${id}`)
        .set('Accept', 'application/json')
        .send({ description: 'test' })
        .expect(200);

      expect(response.body).toMatchSchema(categorySchema);
      expect(response.body.description).toBe('test');
    });
  });

  describe('Delete', () => {
    it('Should NOT delete category', async () => {
      const id = 'test';

      const response = await request(app)
        .delete(`/categories/${id}`)
        .expect(500);

      expect(response.body.message).toBe('Find category failed');
    });

    it('Should NOT delete category (category not found)', async () => {
      const id = mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/categories/${id}`)
        .expect(404);

      expect(response.body.message).toBe(`Category ${id} not found`);
    });

    it('Should NOT delete category (model error)', async () => {
      const spy = jest
        .spyOn(CategoryModel, 'deleteMany')
        .mockImplementation(async () => {
          throw new Error();
        });

      const { id } = await factory.create('Category');

      const response = await request(app)
        .delete(`/categories/${id}`)
        .expect(500);

      expect(spy).toHaveBeenCalled();
      expect(response.body.message).toBe('Delete category failed');

      spy.mockRestore();
    });

    it('Should delete category', async () => {
      const { id } = await factory.create('Category');

      const response = await request(app)
        .delete(`/categories/${id}`)
        .expect(204);

      expect(response.body).toEqual({});
    });
  });
});
