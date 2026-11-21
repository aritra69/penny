import path from "node:path";
import { fileURLToPath } from "node:url";
import nextEnv from "@next/env";

// Penny keeps one .env at the repo root. Next only reads the app's own folder, so load the root too.
nextEnv.loadEnvConfig(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."));

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
