import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/components/about";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About KRILÉA | Precious, and Timelessly Yours" },
      {
        name: "description",
        content:
          "KRILÉA is born from the harmony of grace, beauty and timeless elegance. Inspired by the essence of Krishna and Lalithambika.",
      },
      { property: "og:title", content: "About KRILÉA | Precious, and Timelessly Yours" },
      {
        property: "og:description",
        content:
          "KRILÉA is born from the harmony of grace, beauty and timeless elegance. Discover jewellery that celebrates individuality and confidence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});
