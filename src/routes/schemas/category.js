import joi from 'joi';

class CategorySchema {
  static get() {
    return joi
      .object({
        params: joi
          .object({
            id: joi.string().required(),
          })
          .required(),
      })
      .unknown(true)
      .required();
  }

  static list() {
    return joi
      .object({
        query: joi.object({
          name: joi.string(),
          description: joi.string(),
        }),
      })
      .unknown(true)
      .required();
  }

  static post() {
    return joi
      .object({
        body: joi
          .object({
            name: joi
              .string()
              .max(15)
              .required(),
            description: joi.string().max(100),
            color: joi.string(),
            icon: joi.string(),
          })
          .required(),
      })
      .unknown(true)
      .required();
  }

  static put() {
    return joi
      .object({
        params: joi
          .object({
            id: joi.string().required(),
          })
          .required(),
        body: joi
          .object({
            name: joi.string().max(15),
            description: joi.string().max(100),
            icon: joi.string(),
            color: joi.string(),
          })
          .required(),
      })
      .unknown(true)
      .required();
  }

  static delete() {
    return joi
      .object({
        params: joi
          .object({
            id: joi.string().required(),
          })
          .required(),
      })
      .unknown(true)
      .required();
  }
}

export default CategorySchema;
