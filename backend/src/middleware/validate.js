import { ValidationError } from '../utils/errors.js';

/**
 * Express middleware generator that validates request payload against a Zod schema.
 *
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body'|'query'|'params'} source - Request property to validate (default: 'body')
 */
export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const details = err.errors.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));
        const firstMessage = details[0]?.message || 'Validation error';
        return next(new ValidationError(firstMessage, details));
      }
      return next(err);
    }
  };
};

