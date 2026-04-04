const Joi = require('joi');
const ErrorHandler = require('../utils/errorHandler');

const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });

  if (error) {
    const message = error.details.map((d) => d.message).join('; ');
    return next(new ErrorHandler(422, message));
  }

  req.body = value;
  next();
};

const tiptapNodeSchema = Joi.object({
  type: Joi.string().required(),
  attrs: Joi.object().optional(),
  content: Joi.array().items(Joi.link('#node')).optional(),
  marks: Joi.array().items(Joi.object()).optional(),
  text: Joi.string().optional(),
}).id('node');

const tiptapDocSchema = Joi.object({
  type: Joi.string().valid('doc').required(),
  content: Joi.array().items(tiptapNodeSchema).min(1).required(),
});

exports.validateCreateArticle = validate(
  Joi.object({
    title: Joi.string()
      .trim()
      .min(1)
      .max(300)
      .custom((value, helpers) => {
        const words = value.trim().split(/\s+/).length;
        if (words < 10 || words > 25) {
          return helpers.error('any.invalid');
        }
        return value;
      })
      .messages({ 'any.invalid': 'Title must be between 10 and 25 words.' })
      .required(),
    description: tiptapDocSchema.required(),
    category: Joi.string()
      .valid(
        'Politics', 'Technology', 'Railway', 'Sports',
        'Markets', 'India News', 'International News', 'Health', 'Education'
      )
      .required(),
  })
);

exports.validateAddComment = validate(
  Joi.object({
    commentBody: Joi.string().trim().min(1).max(500).required(),
  })
);

exports.validateSignup = validate(
  Joi.object({
    username: Joi.string().trim().alphanum().min(3).max(30).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(8).max(128).required(),
    role: Joi.string().valid('user', 'admin').default('user'),
  })
);

exports.validateSignin = validate(
  Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().required(),
  })
);

exports.validateUpdatePassword = validate(
  Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required(),
    confirmPassword: Joi.any()
      .valid(Joi.ref('newPassword'))
      .required()
      .messages({ 'any.only': 'Passwords must match.' }),
  })
);

exports.validateForgetPassword = validate(
  Joi.object({
    email: Joi.string().email().lowercase().required(),
  })
);

exports.validateResetPassword = validate(
  Joi.object({
    otp: Joi.string().required(),
    password: Joi.string().min(8).max(128).required(),
    confirmPassword: Joi.any()
      .valid(Joi.ref('password'))
      .required()
      .messages({ 'any.only': 'Passwords must match.' }),
  })
);

exports.validateFilterArticles = validate(
  Joi.object({
    data: Joi.alternatives().try(
      Joi.string().trim().min(1),
      Joi.object({
        food: Joi.boolean().allow(null),
        travel: Joi.boolean().allow(null),
        politics: Joi.boolean().allow(null),
        technology: Joi.boolean().allow(null),
      })
    ).required(),
  })
);
