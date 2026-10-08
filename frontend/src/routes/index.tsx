import { createFileRoute } from "@tanstack/react-router";
import { HomePage } from "@/components/home";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kriléa | Timeless Jewellery for Every Chapter" },
      {
        name: "description",
        content:
          "Discover Kriléa's emerald and champagne-gold jewellery, thoughtfully designed for every chapter of you.",
      },
      { property: "og:title", content: "Kriléa | Timeless Jewellery for Every Chapter" },
      {
        property: "og:description",
        content:
          "Thoughtful jewellery designs with an emerald soul and a timeless point of view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});
