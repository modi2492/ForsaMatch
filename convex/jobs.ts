// convex/jobs.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// دالة لإضافة وظيفة جديدة (يمكن استخدامها من لوحة تحكم إدارية)
export const addJob = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    specialization: v.string(),
    link: v.string(),
  },
  handler: async (ctx, args) => {
    // تحقق من صلاحية المستخدم (مثال: هل هو مدير؟)
    // هذا الجزء يمكن تطويره لاحقًا لضمان الأمان
    
    // إضافة الوظيفة إلى قاعدة البيانات
    await ctx.db.insert("jobs", {
      title: args.title,
      description: args.description,
      specialization: args.specialization,
      link: args.link,
      dateAdded: Date.now(),
    });
  },
});

// دالة لجلب كل الوظائف
export const getJobs = query({
  handler: async (ctx) => {
    return await ctx.db.query("jobs").order("desc").collect();
  },
});

// دالة لجلب الوظائف بناءً على التخصصات
export const getJobsBySpecialization = query({
  args: { specializations: v.array(v.string()) },
  handler: async (ctx, args) => {
    if (args.specializations.length === 0) {
      return [];
    }

    const jobPromises = args.specializations.map(async (spec) => {
      return await ctx.db
        .query("jobs")
        .filter((q) => q.eq(q.field("specialization"), spec))
        .order("desc")
        .collect();
    });

    const jobArrays = await Promise.all(jobPromises);
    return jobArrays.flat(); // دمج جميع النتائج في مصفوفة واحدة
  },
});
