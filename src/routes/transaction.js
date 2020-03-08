import { Router } from 'express';

import { TransactionSchema } from './schemas';
import { SchemaValidator } from '../middlewares';
import { TransactionController } from '../controllers';

const router = new Router();

router
  .route('/')
  .get(
    SchemaValidator.validate(TransactionSchema.list()),
    TransactionController.list
  )
  .post(
    SchemaValidator.validate(TransactionSchema.post()),
    TransactionController.create
  );

router
  .route('/:id')
  .get(
    SchemaValidator.validate(TransactionSchema.get()),
    TransactionController.get
  )
  .put(
    SchemaValidator.validate(TransactionSchema.put()),
    TransactionController.update
  )
  .delete(
    SchemaValidator.validate(TransactionSchema.delete()),
    TransactionController.delete
  );

export default router;
