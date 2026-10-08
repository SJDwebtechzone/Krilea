import { SiteLayout } from "@/components/SiteLayout";
import { HeroBanner } from "@/components/HeroBanner";
import { SectionHeading } from "@/components/SectionHeading";
import { DatabaseCategoryGrid } from "@/components/DatabaseCategoryGrid";

export function SilverCollectionPage() {
  return (
    <SiteLayout>
      <main>
        <HeroBanner
          title={
            <>
              Silver Collection
              <br />
              <span className="text-champagne">Timeless elegance, every day</span>
            </>
          }
          button="Explore collection"
          eyebrow="The silver edit"
          image="/silvercollection/hero/silver-hero.png"
          to="/silver-collection"
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

export default SilverCollectionPage;
