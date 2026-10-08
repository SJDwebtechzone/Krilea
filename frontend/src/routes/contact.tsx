import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/components/contect";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us | Kriléa" },
      {
        name: "description",
        content:
          "Have a question about Kriléa? Our team is here to help with orders, styling and more.",
      },
      { property: "og:title", content: "Contact Us | Kriléa" },
      {
        property: "og:description",
        content:
          "Reach the Kriléa team for thoughtful help with your jewellery journey.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});
