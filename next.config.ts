// next.config.ts
import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // تعطيل optimizeCss لضمان استخدام إعدادات postcss الخاصة بنا
    optimizeCss: false, 
    optimizePackageImports: [
      '@convex-dev/auth',
      '@convex-dev/cron',
    ],
  },
};

export default nextConfig;
