import { Router } from 'express';

import TransactionRoute from './transaction';
import CategoryRoute from './category';

const router = new Router();

router.use('/transactions', TransactionRoute);
router.use('/categories', CategoryRoute);

export default router;
