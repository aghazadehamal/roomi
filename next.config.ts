import type { NextConfig } from "next";

function supabaseImageHostname(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) {
    return undefined;
  }

  try {
    return new URL(url).hostname;
  } catch {
    return undefined;
  }
}

const supabaseHostname = supabaseImageHostname();

const nextConfig: NextConfig = {
  images: supabaseHostname
    ? {
        remotePatterns: [
          {
            protocol: "https",
            hostname: supabaseHostname,
            pathname: "/storage/v1/object/public/**",
          },
        ],
      }
    : undefined,
};

export default nextConfig;
