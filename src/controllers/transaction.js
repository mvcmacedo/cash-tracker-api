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
    } catch (error) {
      return res.send(error);
    }
  }

  static async get(req, res) {
    try {
      const { id: _id } = req.params;

      const [transaction] = await TransactionService.get({
        _id,
      });

      if (!transaction) {
        throw new CustomError(`Transaction ${_id} not found`, 404);
      }

      return res.send(transaction);
    } catch ({ http_code, message }) {
      return res.status(http_code).send({ message });
    }
  }

  static async create(req, res) { }

  static async udpate(req, res) { }

  static async delete(req, res) { }

  static async report(req, res) { }
}

export default TransactionController;
