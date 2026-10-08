import { SiteLayout } from "@/components/SiteLayout";
import { HeroBanner } from "@/components/HeroBanner";
import { SectionHeading } from "@/components/SectionHeading";
import { DatabaseCategoryGrid } from "@/components/DatabaseCategoryGrid";

export function FashionCollectionPage() {
  return (
    <SiteLayout>
      <main>
        <HeroBanner
          title={
            <>
              Fashion Collection
              <br />
              <span className="text-champagne">Style in every detail</span>
            </>
          }
          button="Explore collection"
          eyebrow="The fashion edit"
          image="/fashioncollection/hero/fassion-hero.png"
          to="/fashion-collection"
        />
        <section className="bg-cream px-5 py-20 texture-paper sm:py-24">
          <SectionHeading
            eyebrow="Curated categories"
            title="Shop by category"
            subtitle="Find the details that make your style unmistakably yours."
          />
          <DatabaseCategoryGrid className="mt-12" />
        </section>
      </main>
    </SiteLayout>
  );
}

export default FashionCollectionPage;
