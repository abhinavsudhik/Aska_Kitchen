import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import type { DataModel } from "./_generated/dataModel";

const CustomPassword = Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      name: params.name as string,
    };
  },
});

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Google, CustomPassword],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      console.log("createOrUpdateUser args:", args);
      return args.existingUserId ?? await ctx.db.insert("users", {
        email: args.profile.email,
        name: args.profile.name,
        role: "customer", // Default role
      });
    },
  },
});
