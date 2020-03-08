import request from 'supertest';
import mongoose from 'mongoose';

import app from '../../app';

import {
  transactionSchema,
  categorySchema,
} from '../../__tests__/schemas';

import factory from '../../__tests__/factory';

import { up, down } from '../../__tests__/database';

import { CategoryModel, TransactionModel } from '../../models';

const count = 5; // to createMany / buildMany

describe('Transaction Route', () => {
  beforeAll(up); // connect database
  afterAll(down); // disconnect database

  afterEach(async () => {
    await CategoryModel.deleteMany();
    await TransactionModel.deleteMany();
  });

  describe('List', () => {
    it('Should NOT list transactions (invalid filter)', async () => {
      const response = await request(app)
        .get('/transactions?name=test')
        .expect(400);

      expect(response.body.message).toContain('name');
    });

    it('Should list transactions', async () => {
      const response = await request(app)
        .get('/transactions')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body).toEqual([]);
    });

    it('Should list transactions (without filters)', async () => {
      await factory.createMany('Transaction', count);

      const response = await request(app)
        .get('/transactions')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body).toMatchSchema(transactionSchema);
    });

    it('Should list transactions (with filters)', async () => {
      await factory.createMany('Transaction', count);

      await factory.createMany('Transaction', count, {
        description: 'test',
      });

      const response = await request(app)
        .get('/transactions?description=test')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body).toHaveLength(count);
      expect(response.body).toMatchSchema(transactionSchema);
    });

    it('Should list transactions (with category)', async () => {
      const { id: category } = await factory.create('Category');

      await factory.create('Transaction', {
        category,
      });

      const response = await request(app)
        .get('/transactions')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body).toMatchSchema(transactionSchema);
      expect(response.body.category).toMatchSchema(categorySchema);
    });

    it('Should list transactions (by category)', async () => {
      const { id: category } = await factory.create('Category');

      await factory.create('Transaction');

      await factory.create('Transaction', {
        category,
      });

      const response = await request(app)
        .get(`/transactions?category=${category}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body).toHaveLength(1);
      expect(response.body).toMatchSchema(transactionSchema);
      expect(response.body.category).toMatchSchema(categorySchema);
    });

    it('Should list transactions (with date range)', async () => {
      const today = new Date();

      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await factory.create('Transaction', { date: today });
      await factory.create('Transaction', { date: nextMonth });

      const response = await request(app)
        .get(`/transactions?start=${nextMonth.toISOString()}`)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body).toHaveLength(1);
      expect(response.body).toMatchSchema(transactionSchema);
    });

    it('Should list transactions (with amount range)', async () => {
      await factory.create('Transaction', { amount: 10 });
      await factory.create('Transaction', { amount: 20 });

      const response = await request(app)
        .get('/transactions?minAmount=20')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body).toHaveLength(1);
      expect(response.body[0].amount).toBe(20);
      expect(response.body).toMatchSchema(transactionSchema);
    });

    it('Should list transactions (amount between)', async () => {
      await factory.create('Transaction', { amount: 10 });
      await factory.create('Transaction', { amount: 20 });
      await factory.create('Transaction', { amount: 30 });

      const response = await request(app)
        .get('/transactions?minAmount=10&maxAmount=25')
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body).toHaveLength(2);
      expect(response.body[0].amount).toBe(10);
      expect(response.body[1].amount).toBe(20);
      expect(response.body).toMatchSchema(transactionSchema);
    });

    it('Should list transactions (with pagination)', async () => {
      await factory.createMany('Transaction', count * 2);

      const response = await request(app)
        .get('/transactions')
        .set('page', 0)
        .set('per_page', 5)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body).toHaveLength(count);
      expect(response.body).toMatchSchema(transactionSchema);
    });
  });

  describe('Get', () => {
    it('Should NOT get transaciton (transaction not found)', async () => {
      const id = mongoose.Types.ObjectId();

      const response = await request(app)
        .get(`/transactions/${id}`)
        .expect(404);

      expect(response.body.message).toBe(`Transaction ${id} not found`);
    });

    it('Should NOT get transaciton (model error)', async () => {
      const id = 'test';

      const response = await request(app)
        .get(`/transactions/${id}`)
        .expect(500);

      expect(response.body.message).toBe(`Find transaction failed`);
    });

    it('Should get transaciton', async () => {
      const { id } = await factory.create('Transaction');

      const response = await request(app)
        .get(`/transactions/${id}`)
        .expect(200);

      expect(response.body).toMatchSchema(transactionSchema);
    });
  });

  describe('Post', () => {
    it('Should NOT create transaction', async () => {
      await request(app)
        .post('/transactions')
        .expect(400);
    });

    it('Should NOT create transaction (missing required field)', async () => {
      const { _doc: transaction } = await factory.build('Transaction');
      delete transaction._id;
      delete transaction.date;

      await request(app)
        .post('/transactions')
        .set('Accept', 'application/json')
        .send(transaction)
        .expect(400);
    });

    it('Should NOT create transaction (model error)', async () => {
      const spy = jest
        .spyOn(TransactionModel, 'create')
        .mockImplementation(async () => {
          throw new Error();
        });

      const { _doc: transaction } = await factory.build('Transaction');
      delete transaction._id;

      const response = await request(app)
        .post('/transactions')
        .set('Accept', 'application/json')
        .send(transaction)
        .expect(500);

      expect(spy).toHaveBeenCalled();
      expect(response.body.message).toBe('Create transaction failed');

      spy.mockRestore();
    });

    it('Should create transaction', async () => {
      const { _doc: transaction } = await factory.build('Transaction');
      delete transaction._id;

      const response = await request(app)
        .post('/transactions')
        .set('Accept', 'application/json')
        .send(transaction)
        .expect(201);

      expect(response.body).toMatchSchema(transactionSchema);
    });
  });

  describe('Put', () => {
    it('Should NOT update transaction', async () => {
      const id = 'test';

      const response = await request(app)
        .put(`/transactions/${id}`)
        .set('Accept', 'application/json')
        .send({})
        .expect(500);

      expect(response.body.message).toBe('Find transaction failed');
    });

    it('Should NOT update transaction (transaction not found)', async () => {
      const id = mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/transactions/${id}`)
        .set('Accept', 'application/json')
        .send({})
        .expect(404);

      expect(response.body.message).toBe(`Transaction ${id} not found`);
    });

    it('Should NOT update transaction (model error)', async () => {
      const spy = jest
        .spyOn(TransactionModel, 'updateMany')
        .mockImplementation(async () => {
          throw new Error();
        });

      const { id } = await factory.create('Transaction');

      const response = await request(app)
        .put(`/transactions/${id}`)
        .set('Accept', 'application/json')
        .send({})
        .expect(500);

      expect(spy).toHaveBeenCalled();
      expect(response.body.message).toBe('Update transaction failed');

      spy.mockRestore();
    });

    it('Should update transaction', async () => {
      const { id } = await factory.create('Transaction');

      const response = await request(app)
        .put(`/transactions/${id}`)
        .set('Accept', 'application/json')
        .send({ description: 'test' })
        .expect(200);

      expect(response.body).toMatchSchema(transactionSchema);
      expect(response.body.description).toBe('test');
    });
  });

  describe('Delete', () => {
    it('Should NOT delete transaction', async () => {
      const id = 'test';

      const response = await request(app)
        .delete(`/transactions/${id}`)
        .expect(500);

      expect(response.body.message).toBe('Find transaction failed');
    });

    it('Should NOT delete transaction (transaction not found)', async () => {
      const id = mongoose.Types.ObjectId();

      const response = await request(app)
        .delete(`/transactions/${id}`)
        .expect(404);

      expect(response.body.message).toBe(`Transaction ${id} not found`);
    });

    it('Should NOT delete transaction (model error)', async () => {
      const spy = jest
        .spyOn(TransactionModel, 'deleteMany')
        .mockImplementation(async () => {
          throw new Error();
        });

      const { id } = await factory.create('Transaction');

      const response = await request(app)
        .delete(`/transactions/${id}`)
        .expect(500);

      expect(spy).toHaveBeenCalled();
      expect(response.body.message).toBe('Delete transaction failed');

      spy.mockRestore();
    });

    it('Should delete transaction', async () => {
      const { id } = await factory.create('Transaction');

      const response = await request(app)
        .delete(`/transactions/${id}`)
        .expect(204);

      expect(response.body).toEqual({});
    });
  });
});
