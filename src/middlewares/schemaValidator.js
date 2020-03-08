import joi from 'joi';

import { CustomError } from '../helpers';

class SchemaMiddleware {
  static run(schema, req, res, next) {
    try {
      const { error } = joi.validate(req, schema);

      if (error) {
        throw new CustomError(error.message, 400);
      }

      next();
    } catch ({ http_code, message }) {
      return res.status(http_code).send({ message });
    }
  }

  static validate(schema) {
    return SchemaMiddleware.run.bind(null, schema);
  }
}

export default SchemaMiddleware;
