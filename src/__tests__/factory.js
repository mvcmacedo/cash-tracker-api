import faker from 'faker';
import factory from 'factory-girl';

import {
  transactionTypes,
  transactionMethods,
  transactionFrequency,
} from '../enums';

import { TransactionModel, CategoryModel } from '../models';

const randomEnum = list => {
  const random = Math.floor(Math.random() * Object.keys(list).length);

  return list[Object.keys(list)[random]];
};

factory.define('Transaction', TransactionModel, {
  description: faker.lorem.sentence(),
  amount: faker.finance.amount(),
  type: randomEnum(transactionTypes),
  method: randomEnum(transactionMethods),
  frequency: randomEnum(transactionFrequency),
});

factory.define('Category', CategoryModel, {
  name: faker.name.firstName(),
  description: faker.lorem.sentence(),
  color: faker.internet.color(),
});

export default factory;
