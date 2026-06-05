import Joi from 'joi';

const schema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number()
    .default(3000),
  DATABASE_URL: Joi.string()
    .required(),
  JWT_SECRET: Joi.string()
    .required(),
  JWT_EXPIRES_IN: Joi.string()
    .default('24h'),
  CLOUDINARY_CLOUD_NAME: Joi.string()
    .required(),
  CLOUDINARY_API_KEY: Joi.string()
    .required(),
  CLOUDINARY_API_SECRET: Joi.string()
    .required(),
  SENDGRID_API_KEY: Joi.string()
    .required(),
  SENDGRID_FROM_EMAIL: Joi.string()
    .default('noreply@check-oil.com'),
  MERCADOPAGO_ACCESS_TOKEN: Joi.string()
    .required(),
  MERCADOPAGO_WEBHOOK_URL: Joi.string()
    .required(),
  TIENDA_URL: Joi.string()
    .default('http://localhost:5173'),
  ADMIN_URL: Joi.string()
    .default('http://localhost:5174'),
});

const { error, value: validatedEnv } = schema.validate(process.env, {
  abortEarly: false,
  stripUnknown: true,
});

if (error) {
  const errorMessage = error.details
    .map((detail) => `${detail.context.label}: ${detail.message}`)
    .join('; ');
  throw new Error(`Environment validation failed: ${errorMessage}`);
}

export default validatedEnv;
