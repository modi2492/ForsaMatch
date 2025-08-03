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

    // 1. إنشاء رمز فريد
    const loginToken = generateRandomString(32);
    const tokenExpiration = Date.now() + 15 * 60 * 1000; // 15 دقيقة

    // 2. تحديث أو إنشاء المستخدم في قاعدة البيانات
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      // إذا كان المستخدم موجودًا، قم بتحديث الرمز وتاريخ انتهاء الصلاحية
      await ctx.db.patch(existingUser._id, { loginToken, tokenExpiration });
    } else {
      // إذا لم يكن موجودًا، أنشئ مستخدمًا جديدًا
      await ctx.db.insert("users", {
        email: args.email,
        specializations: [],
        frequency: "weekly",
        loginToken,
        tokenExpiration,
      });
    }

    // 3. إرسال البريد الإلكتروني عبر Resend
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
      // الرمز صحيح ولم تنته صلاحيته.
      // نستخدم undefined لمسح الحقول الاختيارية
      await ctx.db.patch(user._id, { loginToken: undefined, tokenExpiration: undefined });
      return { success: true, user };
    }

    return { success: false, message: "الرابط غير صالح أو انتهت صلاحيته." };
  },
});

// دالة للحصول على المستخدم المسجل دخوله حاليًا
export const getAuthenticatedUser = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    return user;
  },
});

// دالة لتحديث تفضيلات المستخدم
export const updateUserPreferences = mutation({
  args: {
    specializations: v.array(v.string()),
    frequency: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("يجب تسجيل الدخول لتحديث التفضيلات.");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email!))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        specializations: args.specializations,
        frequency: args.frequency,
      });
      return user._id;
    }
  },
});
