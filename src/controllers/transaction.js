import { TransactionService } from '../services';

import { CustomError } from '../helpers';

class TransactionController {
  static async list(req, res) {
    try {
      const filters = req.query;
      const pagination = req.headers;

      const transactions = await TransactionService.get(
        filters,
        pagination
      );

      return res.send(transactions);
    } catch ({ http_code, message }) {
      return res.status(http_code).send({ message });
    }
  }

  static async get(req, res) {
    try {
      const { id: _id } = req.params;

      const [transaction] = await TransactionService.get({ _id });

      if (!transaction) {
        throw new CustomError(`Transaction ${_id} not found`, 404);
      }

      return res.send(transaction);
    } catch ({ http_code, message }) {
      return res.status(http_code).send({ message });
    }
  }

  static async create(req, res) {
    try {
      const transaction = req.body;

      const createdTransaction = await TransactionService.create(
        transaction
      );

      return res.status(201).send(createdTransaction);
    } catch ({ http_code, message }) {
      return res.status(http_code).send({ message });
    }
  }

  static async update(req, res) {
    try {
      const { id: _id } = req.params;

      const [transaction] = await TransactionService.get({ _id });

      if (!transaction) {
        throw new CustomError(`Transaction ${_id} not found`, 404);
      }

      const data = req.body;

      await TransactionService.update({ _id }, data);

      const [updatedTransaction] = await TransactionService.get({ _id });

      return res.send(updatedTransaction);
    } catch ({ http_code, message }) {
      return res.status(http_code).send({ message });
    }
  }

  static async delete(req, res) {
    try {
      const { id: _id } = req.params;

      const [transaction] = await TransactionService.get({ _id });

      if (!transaction) {
        throw new CustomError(`Transaction ${_id} not found`, 404);
      }

      await TransactionService.delete({ _id });

      return res.status(204).send();
    } catch ({ http_code, message }) {
      return res.status(http_code).send({ message });
    }
  }

  static async sumByType(req, res) {
    try {
      const filters = req.query;
      const { groupBy } = req.params;

      const transactions = await TransactionService.sumByType(
        filters,
        groupBy
      );

      return res.send(transactions);
    } catch ({ http_code, message }) {
      return res.status(http_code).send({ message });
    }
  }
}

export default TransactionController;
