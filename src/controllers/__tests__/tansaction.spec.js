import mongoose from 'mongoose';
import { Request } from 'jest-express/lib/request';
import { Response } from 'jest-express/lib/response';

import { TransactionController } from '..';

import factory from '../../__tests__/factory';
import { up, down } from '../../__tests__/database';

import { CategoryModel, TransactionModel } from '../../models';

import {
  transactionSchema,
  categorySchema,
} from '../../__tests__/schemas';

describe('Transaction Controller', () => {
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

  afterEach(async () => {
    await CategoryModel.deleteMany();
    await TransactionModel.deleteMany();
  });

  describe('List', () => {
    const count = 5;

    it('Should list transactions', async () => {
      await TransactionController.list(request, response);

      expect(mockResponse).toEqual([]);
    });

    it('Should list transactions (without filters)', async () => {
      await factory.createMany('Transaction', count);

      await TransactionController.list(request, response);

      expect(mockResponse).toBeInstanceOf(Array);
      expect(mockResponse).toHaveLength(count);
      expect(mockResponse).toMatchSchema(transactionSchema);
    });

    it('Should list transactions (with filters)', async () => {
      const description = 'test description';

      await factory.createMany('Transaction', count);
      await factory.create('Transaction', { description });

      request.setQuery({ description });
      await TransactionController.list(request, response);

      expect(mockResponse).toBeInstanceOf(Array);
      expect(mockResponse).toHaveLength(1);
      expect(mockResponse).toMatchSchema(transactionSchema);
    });

    it('Should list transactions (with category)', async () => {
      const { id: category } = await factory.create('Category');

      await factory.create('Transaction', { category });

      await TransactionController.list(request, response);

      expect(mockResponse).toBeInstanceOf(Array);
      expect(mockResponse).toMatchSchema(transactionSchema);
      expect(mockResponse[0].category).toMatchSchema(categorySchema);
    });

    it('Should list transactions (by category)', async () => {
      const { id: category } = await factory.create('Category');

      await factory.create('Transaction');
      await factory.create('Transaction', { category });

      request.setQuery({ category });
      await TransactionController.list(request, response);

      expect(mockResponse).toBeInstanceOf(Array);
      expect(mockResponse).toHaveLength(1);
      expect(mockResponse).toMatchSchema(transactionSchema);
      expect(mockResponse[0].category).toMatchSchema(categorySchema);
    });

    it('Should list transactions (with pagination)', async () => {
      await factory.createMany('Transaction', count * 2);

      request.setHeaders({ per_page: count, page: 1 });
      await TransactionController.list(request, response);

      expect(mockResponse).toBeInstanceOf(Array);
      expect(mockResponse).toHaveLength(count);
      expect(mockResponse).toMatchSchema(transactionSchema);
    });
  });

  describe('Get', () => {
    it('Should NOT get transaction (service error)', async () => {
      request.setParams({ id: 'test' });
      await TransactionController.get(request, response);

      expect(mockResponse.message).toBeDefined();
      expect(mockResponse.message).toBe('Find transaction failed');
    });

    it('Should NOT get transaction (transaction not found)', async () => {
      const id = mongoose.Types.ObjectId();

      request.setParams({ id });
      await TransactionController.get(request, response);

      expect(mockResponse.message).toBeDefined();
      expect(mockResponse.message).toBe(
        `Transaction ${id} not found`
      );
    });

    it('Should get transaction', async () => {
      const { id } = await factory.create('Transaction');

      request.setParams({ id });
      await TransactionController.get(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse).toMatchSchema(transactionSchema);
    });

    it('Should get transaction (with category)', async () => {
      const { id: category } = await factory.create('Category');
      const { id } = await factory.create('Transaction', {
        category,
      });

      request.setParams({ id });
      await TransactionController.get(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse).toMatchSchema(transactionSchema);
      expect(mockResponse.category).toMatchSchema(categorySchema);
    });
  });
});
