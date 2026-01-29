import { query } from "./_generated/server";

export const checkEnv = query({
    args: {},
    handler: async () => {
        return {
            CONVEX_SITE_URL: process.env.CONVEX_SITE_URL || "NOT SET",
            DEPLOYMENT: process.env.CONVEX_DEPLOYMENT || "NOT SET",
        };
    },
});
