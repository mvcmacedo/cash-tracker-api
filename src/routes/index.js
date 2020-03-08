import { Router } from 'express';

import TransactionRoute from './transaction';
import CategoryRoute from './category';
import HealthCheck from './healthCheck';

const router = new Router();

router.use('/healths', HealthCheck);
router.use('/transactions', TransactionRoute);
router.use('/categories', CategoryRoute);

export default router;
