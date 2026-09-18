const validate = (schema, target = "body") => (req, res, next) => {
  const result = schema.safeParse(req[target]);

  if (!result.success) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: result.error.issues.map((issue) => ({
        field: issue.path.join(".") || target,
        message: issue.message,
      })),
    });
  }

  req.validated = { ...(req.validated || {}), [target]: result.data };
  req[target] = result.data;
  return next();
};

module.exports = validate;
