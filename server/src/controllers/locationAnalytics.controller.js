const locationAnalyticsService = require("../services/locationAnalytics.service");
const ApiResponse = require("../utils/ApiResponse");
const sendApiError = require("../utils/sendApiError");

const getLocationAnalytics = async (req, res) => {
  try {
    const result = await locationAnalyticsService.getLocationAnalytics(
      req.validated.query,
    );
    return res.status(200).json(
      new ApiResponse(200, result, "Location analytics fetched successfully"),
    );
  } catch (error) {
    return sendApiError(res, error, "Location analytics fetch failed");
  }
};

module.exports = { getLocationAnalytics };
