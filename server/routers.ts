import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { COOKIE_NAME } from "../shared/const.js";

// Helper function to ensure user exists
async function ensureUser(ctx: any) {
  let userId = ctx.user?.id;
  if (!userId) {
    const { createAnonymousUser } = await import("./db.js");
    const user = await createAnonymousUser();
    userId = user.id;

    // Create session for this new user with a name
    const { sdk } = await import("./_core/sdk.js");
    const sessionToken = await sdk.createSessionToken(user.openId, { name: "Anonymous" });
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.cookie(COOKIE_NAME, sessionToken, cookieOptions);
    console.log("Anonymous user created in ensureUser, userId:", userId, "openId:", user.openId);
  }
  return userId;
}

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  activities: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const userId = await ensureUser(ctx);
      const { getActivitiesByUserId } = await import("./db.js");
      return getActivitiesByUserId(userId);
    }),
    create: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ ctx, input }) => {
        const userId = await ensureUser(ctx);
        const { createActivity } = await import("./db.js");
        return createActivity(userId, input);
      }),
    update: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ ctx, input }) => {
        const userId = await ensureUser(ctx);
        const { updateActivity } = await import("./db.js");
        return updateActivity(input.id, userId, input);
      }),
    delete: publicProcedure
      .input((id: any) => id)
      .mutation(async ({ ctx, input }) => {
        const userId = await ensureUser(ctx);
        const { deleteActivity } = await import("./db.js");
        return deleteActivity(input, userId);
      }),
  }),

  bucketItems: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const userId = await ensureUser(ctx);
      const { getBucketItemsByUserId } = await import("./db.js");
      return getBucketItemsByUserId(userId);
    }),
    create: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ ctx, input }) => {
        const userId = await ensureUser(ctx);
        const { createBucketItem } = await import("./db.js");
        return createBucketItem(userId, input);
      }),
    update: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ ctx, input }) => {
        const userId = await ensureUser(ctx);
        const { updateBucketItem } = await import("./db.js");
        return updateBucketItem(input.id, userId, input.data);
      }),
    delete: publicProcedure
      .input((id: any) => id)
      .mutation(async ({ ctx, input }) => {
        const userId = await ensureUser(ctx);
        const { deleteBucketItem } = await import("./db.js");
        return deleteBucketItem(input, userId);
      }),
  }),

  passes: router({
    list: publicProcedure.query(async ({ ctx }) => {
      const userId = await ensureUser(ctx);
      const { getPassesByUserId } = await import("./db.js");
      return getPassesByUserId(userId);
    }),
    create: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ ctx, input }) => {
        const userId = await ensureUser(ctx);
        const { createPass } = await import("./db.js");
        return createPass(userId, input);
      }),
    updateVisits: publicProcedure
      .input((data: any) => data)
      .mutation(async ({ ctx, input }) => {
        const userId = await ensureUser(ctx);
        const { updatePassVisits } = await import("./db.js");
        return updatePassVisits(input.id, userId, input.visits);
      }),
    delete: publicProcedure
      .input((id: any) => id)
      .mutation(async ({ ctx, input }) => {
        const userId = await ensureUser(ctx);
        const { deletePass } = await import("./db.js");
        return deletePass(input, userId);
      }),
  }),
});
