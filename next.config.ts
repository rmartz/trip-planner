import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import { getSentryBuildOptions } from "@/lib/sentry/build-config";

const nextConfig: NextConfig = {};

export default withSentryConfig(nextConfig, getSentryBuildOptions());
