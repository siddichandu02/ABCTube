import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
  const response = new ApiResponse(200, "Service is healthy", "OK");
  return res.status(response.status).json(response);
});
export { healthCheck };
