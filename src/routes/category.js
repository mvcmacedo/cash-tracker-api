import { Router } from 'express';

import { CategorySchema } from './schemas';
import { SchemaValidator } from '../middlewares';
import { CategoryController } from '../controllers';

const router = new Router();

router
  .route('/')
  .get(
    SchemaValidator.validate(CategorySchema.list()),
    CategoryController.list
  )
  .post(
    SchemaValidator.validate(CategorySchema.post()),
    CategoryController.create
  );

router
  .route('/:id')
  .get(
    SchemaValidator.validate(CategorySchema.get()),
    CategoryController.get
  )
  .put(
    SchemaValidator.validate(CategorySchema.put()),
    CategoryController.update
  )
  .delete(
    SchemaValidator.validate(CategorySchema.delete()),
    CategoryController.delete
  );

export default router;
