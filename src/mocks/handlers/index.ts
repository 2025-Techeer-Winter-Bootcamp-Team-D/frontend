import { authHandlers } from "./auth";
import { companyHandlers } from "./company";
import { industryHandlers } from "./industry";
import { comparisonHandlers } from "./comparisons";

export const handlers = [
  ...authHandlers,
  ...companyHandlers,
  ...industryHandlers,
  ...comparisonHandlers,
];
