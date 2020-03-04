import faker from 'faker';
import factory from 'factory-girl';

import { transactionTypes, transactionMethods } from '../enums';

import { TransactionModel, CategoryModel } from '../models';

factory.define('Transaction', TransactionModel, {
  description: faker.lorem.sentence(),
  amount: faker.finance.amount(),
  type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
  method:
    transactionMethods[Math.floor(Math.random() * transactionMethods.length)],
});

factory.define('Category', CategoryModel, {
  name: faker.name.firstName(),
  description: faker.lorem.sentence(),
  color: faker.internet.color(),
});

export default factory;
