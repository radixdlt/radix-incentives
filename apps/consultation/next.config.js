/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  transpilePackages: ["@radixdlt/radix-dapp-toolkit"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.prod.website-files.com",
        port: "",
        pathname: "/**",
      },
    ],
  },
  // TODO: Re-enable this when we have a way to do it without breaking the build (see: https://github.com/vercel/next.js/issues/58595)
  // experimental: {
  //   serverComponentsExternalPackages: ["@radixdlt/radix-dapp-toolkit"],
  // },
};

export default config;
