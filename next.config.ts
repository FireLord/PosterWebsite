import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  outputFileTracingIncludes: {
    '/api/**/*': ['fonts/**/*'],
  },
  images: {
    domains: ['qlhrinvawhhcluwpjgbv.supabase.co'],
  },
};

export default nextConfig;
