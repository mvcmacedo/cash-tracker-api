import { TransactionService } from '..';

import { TransactionModel, CategoryModel } from '../../models';

import { CustomError } from '../../helpers';
import factory from '../../__tests__/factory';
import { up, down } from '../../__tests__/database';

const count = 5; // to createMany / buildMany

describe('Transaction Service', () => {
  beforeAll(up); // connect database

  afterEach(async () => {
    await CategoryModel.deleteMany();
    await TransactionModel.deleteMany();
  });

  afterAll(down); // disconnect database

  describe('Create', () => {
    it('Should NOT create transaction (model error)', async () => {
      const spy = jest
        .spyOn(TransactionModel, 'create')
        .mockImplementation(async () => {
          throw new Error();
        });

      await TransactionService.create().catch(err => {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(CustomError);
        expect(err.message).toBe('Create transaction failed');
      });

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('Should NOT create transaction (validation error)', async () => {
      await TransactionService.create({}).catch(err => {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(CustomError);
        expect(err.message).toBe('Create transaction failed');
      });
    });

    it('Should NOT create transaction (missing required field)', async () => {
      const transaction = await factory.build('Transaction');

      delete transaction.description;

      await TransactionService.create(transaction).catch(err => {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(CustomError);
        expect(err.message).toBe('Create transaction failed');
      });
    });

    it('Should create transaction', async () => {
      const transaction = await factory.build('Transaction');

      await TransactionService.create(transaction).catch(err => {
        expect(err).toBeUndefined();
      });
    });

    it('Should create transaction (with category)', async () => {
      const { id: category } = await factory.create('Category');

      const transaction = await factory.build('Transaction', {
        category,
      });

      const createdTransaction = await TransactionService.create(
        transaction
      );

      expect(createdTransaction).toBeDefined();
      expect(String(createdTransaction.category)).toBe(category);
    });
  });

  describe('Get', () => {
    it('Should NOT get transactions (model error)', async () => {
      try {
        await TransactionService.get({
          _id: 'test',
        });
      } catch (err) {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(CustomError);
        expect(err.message).toBe('Find transaction failed');
      }
    });

    it('Should get transactions (empty list)', async () => {
      const transactions = await TransactionService.get();

      expect(transactions).toBeInstanceOf(Array);
      expect(transactions).toHaveLength(0);
    });

    it('Should get transactions', async () => {
      await factory.createMany('Transaction', count);

      const transactions = await TransactionService.get();

      expect(transactions).toBeInstanceOf(Array);
      expect(transactions).toHaveLength(count);
    });

    it('Should get transactions (with filters)', async () => {
      const description = 'test description';

      await factory.create('Transaction');
      await factory.create('Transaction', { description });

      const transactions = await TransactionService.get({
        description,
      });

      expect(transactions).toBeInstanceOf(Array);
      expect(transactions).toHaveLength(1);

      expect(
        transactions.every(t => t.description === description)
      ).toBeTruthy();
    });

    it('Should get transactions (start date)', async () => {
      const today = new Date();

      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await factory.create('Transaction', { date: today });
      await factory.create('Transaction', { date: nextMonth });

      const transactions = await TransactionService.get({
        date: { $gte: nextMonth },
      });

      expect(transactions).toHaveLength(1);
      expect(transactions[0].date).toEqual(nextMonth);
    });

    it('Should get transactions (end date)', async () => {
      const today = new Date();

      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await factory.create('Transaction', { date: today });
      await factory.create('Transaction', { date: nextMonth });

      const transactions = await TransactionService.get({
        date: { $lte: today },
      });

      expect(transactions).toHaveLength(1);
      expect(transactions[0].date).toEqual(today);
    });

    it('Should get transactions (date range)', async () => {
      const today = new Date();

      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const twoMonthsAhead = new Date();
      twoMonthsAhead.setMonth(twoMonthsAhead.getMonth() + 2);

      await factory.create('Transaction', { date: today });
      await factory.create('Transaction', { date: nextMonth });

      const transactions = await TransactionService.get({
        date: { $gte: today, $lte: nextMonth },
      });

      expect(transactions).toHaveLength(2);
      expect(transactions[0].date).toEqual(today);
      expect(transactions[1].date).toEqual(nextMonth);
    });

    it('Should get transactions (paginate)', async () => {
      await factory.createMany('Transaction', 20);

      const allTransactions = await TransactionService.get();

      const transactions = await TransactionService.get(
        {},
        {
          page: 2,
          per_page: 10,
        }
      );

      expect(transactions).toHaveLength(10);

      expect(allTransactions).toEqual(
        expect.arrayContaining(transactions)
      );
    });

    it('Should get transactions (with category)', async () => {
      const { id: category } = await factory.create('Category');

      const { _id } = await factory.create('Transaction', {
        category,
      });

      const [transaction] = await TransactionService.get({ _id });

      expect(transaction).toBeDefined();
      expect(transaction.category).toBeDefined();
      expect(transaction.category).toBeInstanceOf(Object);
    });

    it('Should get transactions (by category)', async () => {
      const { id: category } = await factory.create('Category');

      await factory.create('Transaction');

      await factory.create('Transaction', {
        category,
      });

      const transactions = await TransactionService.get({ category });

      expect(transactions).toHaveLength(1);
      expect(transactions[0].category).toBeDefined();
    });
  });

  describe('Update', () => {
    it('Should NOT update transaction (without filters)', async () => {
      await TransactionService.update().catch(err => {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(CustomError);
        expect(err.message).toBe('Filters not found');
      });
    });

    it('Should NOT update transaction (model error)', async () => {
      const spy = jest
        .spyOn(TransactionModel, 'updateMany')
        .mockImplementation(async () => {
          throw new Error();
        });

      await TransactionService.update({}).catch(err => {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(CustomError);
        expect(err.message).toBe('Update transaction failed');
      });

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('Should NOT update transaction (invalid field)', async () => {
      const { id: _id } = await factory.create('Transaction');

      await TransactionService.update({ _id }, { color: 'test' });

      const [update] = await TransactionService.get({ _id });

      expect(update).toBeDefined();
      expect(update.color).toBeUndefined();
    });

    it('Should update transaction', async () => {
      const description = 'test';

      const { id: _id } = await factory.create('Transaction');

      await TransactionService.update({ _id }, { description });

      const [update] = await TransactionService.get({ _id });

      expect(update).toBeDefined();
      expect(update.description).toBe(description);
    });

    it('Should update transaction (changing invalid type)', async () => {
      const { id: _id } = await factory.create('Transaction');

      await TransactionService.update({ _id }, { amount: '123' });

      const [update] = await TransactionService.get({ _id });

      expect(update).toBeDefined();
      expect(update.amount).toBe(123);
    });
  });

  describe('Delete', () => {
    it('Should NOT delete transaction (model error)', async () => {
      const spy = jest
        .spyOn(TransactionModel, 'deleteMany')
        .mockImplementation(async () => {
          throw new Error();
        });

      await TransactionService.delete({}).catch(err => {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(CustomError);
        expect(err.message).toBe('Delete transaction failed');
      });

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('Should NOT delete transaction (without filters)', async () => {
      await TransactionService.delete().catch(err => {
        expect(err).toBeDefined();
        expect(err).toBeInstanceOf(CustomError);
        expect(err.message).toBe('Filters not found');
      });
    });

    it('Should delete transaction', async () => {
      const { id: _id } = await factory.create('Transaction');

      await TransactionService.delete({ _id });

      const [deletedTransaction] = await TransactionService.get({
        _id,
      });

      expect(deletedTransaction).toBeUndefined();
    });

    it('Should delete multiple transaction', async () => {
      const description = 'test';
      await factory.createMany('Transaction', count, { description });
      const createdTransactions = await TransactionService.get({
        description,
      });

      expect(createdTransactions).toHaveLength(count);

      await TransactionService.delete({ description });

      const transactions = await TransactionService.get({
        description,
      });

      expect(transactions).toHaveLength(0);
    });
  });
});
