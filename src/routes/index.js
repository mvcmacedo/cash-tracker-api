import { Router } from 'express';

import TransactionRoute from './transaction';

const router = new Router();

router.use('/transactions', TransactionRoute);

export default router;
