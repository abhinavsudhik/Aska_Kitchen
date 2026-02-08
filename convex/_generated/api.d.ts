/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as analytics from "../analytics.js";
import type * as auth from "../auth.js";
import type * as checkUser from "../checkUser.js";
import type * as clearAuth from "../clearAuth.js";
import type * as debug from "../debug.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as initProdSettings from "../initProdSettings.js";
import type * as items from "../items.js";
import type * as locations from "../locations.js";
import type * as orders from "../orders.js";
import type * as promoteAdmin from "../promoteAdmin.js";
import type * as seed from "../seed.js";
import type * as settings from "../settings.js";
import type * as setup from "../setup.js";
import type * as telegram from "../telegram.js";
import type * as timeslots from "../timeslots.js";
import type * as users from "../users.js";
import type * as verification from "../verification.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  analytics: typeof analytics;
  auth: typeof auth;
  checkUser: typeof checkUser;
  clearAuth: typeof clearAuth;
  debug: typeof debug;
  files: typeof files;
  http: typeof http;
  initProdSettings: typeof initProdSettings;
  items: typeof items;
  locations: typeof locations;
  orders: typeof orders;
  promoteAdmin: typeof promoteAdmin;
  seed: typeof seed;
  settings: typeof settings;
  setup: typeof setup;
  telegram: typeof telegram;
  timeslots: typeof timeslots;
  users: typeof users;
  verification: typeof verification;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
