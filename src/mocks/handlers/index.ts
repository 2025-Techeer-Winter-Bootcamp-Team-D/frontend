import { authHandlers } from "./auth";
import { companyHandlers } from "./company";
import { industryHandlers } from "./industry";
import { comparisonHandlers } from "./comparisons";
import { rankingHandlers } from "./ranking";
import { favoritesHandlers } from "./favorites";

export const handlers = [
  ...authHandlers,
  ...companyHandlers,
  ...industryHandlers,
  ...comparisonHandlers,
  ...rankingHandlers,
  ...favoritesHandlers,
];
