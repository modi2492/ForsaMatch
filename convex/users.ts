// convex/users.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";
import { generateRandomString } from "./helpers";

// دالة لإرسال الرابط السحري لتسجيل الدخول
export const sendMagicLink = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const resend = new Resend(process.env.RESEND_API_KEY);

    const loginToken = generateRandomString(32);
    const tokenExpiration = Date.now() + 15 * 60 * 1000;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, { loginToken, tokenExpiration });
    } else {
      await ctx.db.insert("users", {
        email: args.email,
        specializations: [],
        frequency: "weekly",
        loginToken,
        tokenExpiration,
      });
    }

    const loginLink = `${process.env.NEXT_PUBLIC_SITE_URL}/login?token=${loginToken}&email=${encodeURIComponent(args.email)}`;

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: args.email,
      subject: "Your Magic Link to ForsaMatch",
      html: `<p>Click the following link to log in: <a href="${loginLink}">Log In to ForsaMatch</a></p>`,
    });

    return "Magic link sent!";
  },
});

// دالة للتحقق من الرابط السحري وتسجيل الدخول
export const verifyMagicLink = mutation({
  args: { email: v.string(), token: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (
      user &&
      user.loginToken !== undefined &&
      user.loginToken === args.token &&
      user.tokenExpiration !== undefined &&
      user.tokenExpiration > Date.now()
    ) {
      await ctx.db.patch(user._id, { loginToken: undefined, tokenExpiration: undefined });
      return { success: true, user };
    }

    return { success: false, message: "الرابط غير صالح أو انتهت صلاحيته." };
  },
});

// دالة للحصول على المستخدم المسجل دخوله حاليًا (تم تعديلها)
export const getAuthenticatedUser = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    return user;
  },
});

// دالة لتحديث تفضيلات المستخدم (تم تعديلها)
export const updateUserPreferences = mutation({
  args: {
    email: v.string(), // إضافة البريد الإلكتروني كمدخل
    specializations: v.array(v.string()),
    frequency: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        specializations: args.specializations,
        frequency: args.frequency,
      });
      return user._id;
    }
    throw new Error("يجب تسجيل الدخول لتحديث التفضيلات.");
  },
});
