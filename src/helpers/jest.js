import joi from 'joi';

function toMatchSchema(received, schema) {
  const { error } = joi.validate(received, schema);

  if (!error) {
    return {
      message: () => 'received value matches it the schema',
      pass: true,
    };
  }

  return {
    message: () =>
      `expected ${JSON.stringify(
        received
      )} to be valid, instead the validation return the error: ${JSON.stringify(
        error.message
      )}`,
    pass: false,
  };
}

expect.extend({ toMatchSchema });
