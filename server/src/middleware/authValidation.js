import { body, validationResult } from "express-validator";

export const validate = (rules) => [
  ...rules,
  (req, res, next) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.status(400).json({
        message: "Please check the highlighted details.",
        errors: result.array().map(({ path, msg }) => ({ field: path, message: msg })),
      });
    }
    next();
  },
];

const normalizedEmail = () =>
  body("email")
    .isString()
    .withMessage("Email must be text.")
    .bail()
    .trim()
    .isEmail()
    .withMessage("Enter a valid email address.")
    .bail()
    .customSanitizer((value) => value.toLowerCase());

export const loginValidation = validate([
  normalizedEmail(),
  body("password").isString().notEmpty().withMessage("Enter your password."),
]);

export const registrationValidation = validate([
  body("name")
    .isString()
    .withMessage("Name must be text.")
    .bail()
    .trim()
    .isLength({ min: 2, max: 80 })
    .withMessage("Name must be between 2 and 80 characters."),
  body("companyName")
    .isString()
    .withMessage("Brokerage name must be text.")
    .bail()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Brokerage name must be between 2 and 100 characters."),
  normalizedEmail(),
  body("city")
    .optional({ values: "falsy" })
    .isString()
    .withMessage("City must be text.")
    .bail()
    .trim()
    .isLength({ max: 80 }),
  body("password")
    .isString()
    .withMessage("Password must be text.")
    .bail()
    .isString()
    .isLength({ min: 10, max: 128 })
    .withMessage("Password must be between 10 and 128 characters.")
    .bail()
    .matches(/[a-z]/)
    .withMessage("Password must include a lowercase letter.")
    .bail()
    .matches(/[A-Z]/)
    .withMessage("Password must include an uppercase letter.")
    .bail()
    .matches(/[0-9]/)
    .withMessage("Password must include a number."),
]);

export const emailValidation = validate([normalizedEmail()]);

export const emailCodeValidation = validate([
  normalizedEmail(),
  body("code")
    .isString()
    .withMessage("Code must be text.")
    .bail()
    .trim()
    .matches(/^\d{6}$/)
    .withMessage("Enter the 6-digit code."),
]);
