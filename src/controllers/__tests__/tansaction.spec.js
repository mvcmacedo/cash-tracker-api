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

    it('Should NOT list transactions', async () => {
      request.setQuery({ _id: 'test' });
      await TransactionController.list(request, response);

      expect(mockResponse.message).toBeDefined();
      expect(mockResponse.message).toBe('Find transaction failed');
    });

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
      expect(mockResponse.message).toBe(`Transaction ${id} not found`);
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

  describe('Create', () => {
    it('Should NOT create transaction', async () => {
      request.setBody({});

      await TransactionController.create(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse.message).toBe('Create transaction failed');
    });

    it('Should NOT create transaction (missing required field)', async () => {
      const { _doc: transaction } = await factory.build('Transaction');

      delete transaction.description;

      request.setBody(transaction);

      await TransactionController.create(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse.message).toBe('Create transaction failed');
    });

    it('Should create transaction', async () => {
      const { _doc: transaction } = await factory.build('Transaction');

      request.setBody(transaction);

      await TransactionController.create(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse._doc).toMatchSchema(transactionSchema);
    });

    it('Should create transaction (with category)', async () => {
      const { id: category } = await factory.create('Category');

      const { _doc: transaction } = await factory.build('Transaction', {
        category,
      });

      request.setBody(transaction);

      await TransactionController.create(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse._doc).toMatchSchema(transactionSchema);
      expect(mockResponse._doc.category._doc).toMatchSchema(
        categorySchema
      );
    });
  });

  describe('Update', () => {
    it('Should NOT update transaction (search error)', async () => {
      request.setParams({ id: 'test' });

      await TransactionController.update(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse.message).toBe(`Find transaction failed`);
    });

    it('Should NOT update transaction (transaction not found)', async () => {
      const id = mongoose.Types.ObjectId();

      request.setParams({ id });

      await TransactionController.update(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse.message).toBe(`Transaction ${id} not found`);
    });

    it('Should NOT update transaction (update error)', async () => {
      const spy = jest
        .spyOn(TransactionModel, 'updateMany')
        .mockImplementation(async () => {
          throw new Error();
        });

      const { id } = await factory.create('Transaction');

      request.setParams({ id });
      request.setBody({});

      await TransactionController.update(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse.message).toBe('Update transaction failed');

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('Should update transaction', async () => {
      const { id } = await factory.create('Transaction');

      request.setParams({ id });
      request.setBody({ description: 'test' });

      await TransactionController.update(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse).toMatchSchema(transactionSchema);
    });

    it('Should update transaction (update category)', async () => {
      const name = 'test';

      const { id: category } = await factory.create('Category');

      const { id } = await factory.create('Transaction', {
        category,
      });

      const { id: newCategory } = await factory.create('Category', {
        name,
      });

      request.setParams({ id });
      request.setBody({ category: newCategory });

      await TransactionController.update(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse).toMatchSchema(transactionSchema);
      expect(mockResponse.category).toMatchSchema(categorySchema);
      expect(mockResponse.category.name).toBe(name);
    });
  });

  describe('Delete', () => {
    it('Should NOT delete transaction (search error)', async () => {
      request.setParams({ id: 'test' });

      await TransactionController.delete(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse.message).toBe(`Find transaction failed`);
    });

    it('Should NOT delete transaction (transaction not found)', async () => {
      const id = mongoose.Types.ObjectId();

      request.setParams({ id });

      await TransactionController.delete(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse.message).toBe(`Transaction ${id} not found`);
    });

    it('Should NOT delete transaction (delete error)', async () => {
      const spy = jest
        .spyOn(TransactionModel, 'deleteMany')
        .mockImplementation(async () => {
          throw new Error();
        });

      const { id } = await factory.create('Transaction');

      request.setParams({ id });

      await TransactionController.delete(request, response);

      expect(mockResponse).toBeDefined();
      expect(mockResponse.message).toBe('Delete transaction failed');

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('Should delete transaction', async () => {
      const { id } = await factory.create('Transaction');

      request.setParams({ id });

      await TransactionController.delete(request, response);

      const [deletedTransaction] = await TransactionModel.find({
        _id: id,
      });

      expect(mockResponse).toBeUndefined();
      expect(deletedTransaction).toBeUndefined();
    });
  });
});
