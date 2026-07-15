import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Park Systems Analyst Picks",
    short_name: "TPS Picks",
    description: "Mobile analyst picks for crude oil, silver, and real estate.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#07110f",
    theme_color: "#07110f",
    orientation: "portrait",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
