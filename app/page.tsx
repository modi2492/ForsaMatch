// src/app/page.tsx

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const sendMagicLink = useMutation(api.users.sendMagicLink);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await sendMagicLink({ email });
      setMessage("تم إرسال رابط سحري إلى بريدك الإلكتروني.");
    } catch (error) {
      setMessage("حدث خطأ. يرجى المحاولة مرة أخرى.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">تسجيل الدخول</h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          أدخل بريدك الإلكتروني لتلقي رابط سحري لتسجيل الدخول.
        </p>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md border p-2"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-blue-500 p-2 text-white hover:bg-blue-600"
          >
            إرسال رابط تسجيل الدخول
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-green-600">{message}</p>}
      </div>
    </div>
  );
}
