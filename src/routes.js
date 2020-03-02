import { Router } from 'express';

const router = new Router();

router.use('/', (req, res) => {
  res.send({ message: 'Hello World' });
});

export default router;
