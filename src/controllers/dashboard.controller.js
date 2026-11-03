
import {
  getDashboardSummary,
  getProjectSummary,
} from "../services/dashboard.service.js";

// 1. OVERALL DASHBOARD
export const getSummary = async (req, res, next) => {
  try {
    const summary = await getDashboardSummary(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Dashboard summary retrieved successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};

// 2. PROJECT-WISE DASHBOARD
export const getProjectDashboard = async (
  req,
  res,
  next
) => {
  try {
    const summary = await getProjectSummary(
      req.params.id,
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      message: "Project summary retrieved successfully",
      data: summary,
    });
  } catch (error) {
    next(error);
  }
};
