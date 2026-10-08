import { createFileRoute } from "@tanstack/react-router";
import { FashionCollectionPage } from "@/components/fashion_collection";

export const Route = createFileRoute("/fashion-collection")({
  head: () => ({
    meta: [
      { title: "Fashion Collection | Kriléa" },
      {
        name: "description",
        content:
          "Explore the Kriléa Fashion Collection — statement jewellery with a modern mood.",
      },
      { property: "og:title", content: "Fashion Collection | Kriléa" },
      {
        property: "og:description",
        content:
          "Statement pieces and modern details made for your style story.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: FashionCollectionPage,
});
