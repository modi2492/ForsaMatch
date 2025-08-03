// src/app/login/page.tsx

"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("جاري التحقق من رابط تسجيل الدخول...");
  const verifyMagicLink = useMutation(api.users.verifyMagicLink);
  const isAuthenticated = useQuery(api.users.getAuthenticatedUser); // سنضيف هذه الدالة لاحقًا

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("الرابط غير صالح.");
      return;
    }

    const verify = async () => {
      try {
        const result = await verifyMagicLink({ email, token });
        if (result.success) {
          setStatus("تم تسجيل الدخول بنجاح! جاري التوجيه...");
          // هنا يمكنك إعادة توجيه المستخدم إلى صفحة أخرى
          // مثلاً: router.push('/dashboard');
        } else {
          setStatus(result.message);
        }
      } catch (error) {
        setStatus("حدث خطأ أثناء التحقق من الرابط.");
      }
    };
    verify();
  }, [searchParams, verifyMagicLink]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md">
        <p>{status}</p>
      </div>
    </div>
  );
}
