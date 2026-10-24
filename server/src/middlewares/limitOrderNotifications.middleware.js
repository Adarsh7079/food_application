const requestsByIp = new Map();

const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  maxRequests = 5,
  message = "Too many requests. Please try again later.",
} = {}) => (req, res, next) => {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  const key = `${req.baseUrl}${req.route?.path || req.path}:${ip}`;

  for (const [requestKey, entry] of requestsByIp) {
    if (now - entry.startedAt >= windowMs) requestsByIp.delete(requestKey);
  }

  const entry = requestsByIp.get(key);
  if (!entry || now - entry.startedAt >= windowMs) {
    requestsByIp.set(key, { startedAt: now, count: 1 });
    return next();
  }

  if (entry.count >= maxRequests) {
    return res.status(429).json({
      statusCode: 429,
      success: false,
      message,
      data: null,
      errors: [],
    });
  }

  entry.count += 1;
  return next();
};

module.exports = createRateLimiter;
