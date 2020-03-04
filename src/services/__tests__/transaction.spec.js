import { TransactionModel } from '../../models';
import TransactionService from '../transaction';

import factory from '../../__tests__/factory';
import { up, down } from '../../__tests__/database';

const count = 5; // to createMany / buildMany

describe('Transaction Service', () => {
  beforeAll(up); // connect database

  afterEach(() => TransactionModel.deleteMany());

  afterAll(down); // disconnect database

  describe('Create', () => {
    it('Should NOT create transaction (model error)', async () => {
      const spy = jest
        .spyOn(TransactionModel, 'create')
        .mockImplementation(() => {
          throw new Error();
        });

      try {
        await TransactionService.create();
      } catch (err) {
        expect(err).toBeDefined();
      }

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });

    it('Should NOT create transaction (validation error)', async () => {
      await TransactionService.create({}).catch(err => {
        expect(err).toBeDefined();
        expect(err.message).toContain('Transaction validation failed');
      });
    });

    it('Should NOT create transaction (missing required field)', async () => {
      const transaction = await factory.build('Transaction');

      delete transaction.description;

      await TransactionService.create(transaction).catch(err => {
        expect(err).toBeDefined();
        expect(err.message).toContain('Transaction validation failed');
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

      const transaction = await factory.build('Transaction', { category });

      const createdTransaction = await TransactionService.create(transaction);

      expect(createdTransaction).toBeDefined();
      expect(String(createdTransaction.category)).toBe(category);
    });
  });

  describe('Get', () => {
    it('Should NOT get transactions (model error)', async () => {
      const spy = jest
        .spyOn(TransactionModel, 'find')
        .mockImplementation(() => {
          throw new Error();
        });

      try {
        await TransactionService.get();
      } catch (err) {
        expect(err).toBeDefined();
      }

      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
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

      const transactions = await TransactionService.get({ description });

      expect(transactions).toBeInstanceOf(Array);
      expect(transactions).toHaveLength(1);

      expect(
        transactions.every(t => t.description === description)
      ).toBeTruthy();
    });
  });

  describe('Update', () => {
    it('Should NOT update transaction (without filters)', async () => {
      try {
        await TransactionService.update();
      } catch (err) {
        expect(err).toBeDefined();
        expect(err.message).toBe('Filters not found');
      }
    });

    it('Should NOT update transaction (model error)', async () => {
      const spy = jest
        .spyOn(TransactionModel, 'updateMany')
        .mockImplementation(() => {
          throw new Error();
        });

      try {
        await TransactionService.update({});
      } catch (err) {
        expect(err).toBeDefined();
      }

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
        .mockImplementation(() => {
          throw new Error();
        });

      try {
        await TransactionService.delete({});
      } catch (err) {
        expect(err).toBeDefined();
      }

      expect(spy).toHaveBeenCalled();

      spy.mockRestore();
    });

    it('Should NOT delete transaction (without filters)', async () => {
      try {
        await TransactionService.delete();
      } catch (err) {
        expect(err).toBeDefined();
        expect(err.message).toBe('Filters not found');
      }
    });

    it('Should delete transaction', async () => {
      const { id: _id } = await factory.create('Transaction');

      await TransactionService.delete({ _id });

      const [deletedTransaction] = await TransactionService.get({ _id });

      expect(deletedTransaction).toBeUndefined();
    });

    it('Should delete multiple transaction', async () => {
      const description = 'test';
      await factory.createMany('Transaction', count, { description });
      const createdTransactions = await TransactionService.get({ description });

      expect(createdTransactions).toHaveLength(count);

      await TransactionService.delete({ description });

      const transactions = await TransactionService.get({ description });

      expect(transactions).toHaveLength(0);
    });
  });
});
