import { createFileRoute } from "@tanstack/react-router";
import { SilverCollectionPage } from "@/components/silver_collection";

export const Route = createFileRoute("/silver-collection")({
  head: () => ({
    meta: [
      { title: "Silver Collection | Kriléa" },
      {
        name: "description",
        content:
          "Explore the Kriléa Silver Collection — quiet shine and timeless elegance for every day.",
      },
      { property: "og:title", content: "Silver Collection | Kriléa" },
      {
        property: "og:description",
        content:
          "Quiet shine, everyday ease and timeless silver jewellery from Kriléa.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SilverCollectionPage,
});
