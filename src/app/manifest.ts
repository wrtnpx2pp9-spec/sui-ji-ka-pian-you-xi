import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AI 人生模拟器",
    short_name: "人生模拟器",
    description: "固定美术资源和 AI 剧本生产工作流驱动的互动人生模拟 PWA。",
    start_url: "/",
    display: "standalone",
    background_color: "#111827",
    theme_color: "#0f766e",
    icons: [
      {
        src: "/icons/app-icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
