import { authHandlers } from "./auth";
import { companyHandlers } from "./company";
import { industryHandlers } from "./industry";
import { dashboardHandlers } from "./dashboard";

export const handlers = [
  ...authHandlers,
  ...companyHandlers,
  ...industryHandlers,
  ...dashboardHandlers,
];
