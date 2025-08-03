// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,
  users: defineTable({
    email: v.string(),
    specializations: v.array(v.string()),
    frequency: v.string(),
    loginToken: v.optional(v.string()),
    tokenExpiration: v.optional(v.number()),
  }).index("by_email", ["email"]),

  jobs: defineTable({
    title: v.string(),
    description: v.string(),
    specialization: v.string(),
    link: v.string(),
    dateAdded: v.number(),
  }),
});
