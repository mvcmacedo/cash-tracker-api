import { TransactionService } from '../services';

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

  static async get(req, res) { }

  static async create(req, res) { }

  static async udpate(req, res) { }

  static async delete(req, res) { }

  static async report(req, res) { }
}

export default TransactionController;
