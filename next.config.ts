import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";
import { getSentryBuildOptions } from "@/lib/sentry/build-config";

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default withSentryConfig(nextConfig, getSentryBuildOptions());
