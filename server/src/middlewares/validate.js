const sendApiError = require("../utils/sendApiError");

const validate =
  (schema, target = "body") =>
  (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) {
      return sendApiError(res, result.error);
    }

    req.validated = { ...(req.validated || {}), [target]: result.data };
    // In Express 5, req.query is a read-only getter. Controllers can always
    // access the normalized value through req.validated.
    if (target !== "query") req[target] = result.data;
    return next();
  };

module.exports = validate;
