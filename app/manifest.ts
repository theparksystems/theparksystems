import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "The Park Systems Analyst Picks",
    short_name: "ARIA Picks",
    description:
      "ARIA analyst slate with deployment-local PARKS SQLite memory.",
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
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
