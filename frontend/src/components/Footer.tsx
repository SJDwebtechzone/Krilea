import { Link } from "@tanstack/react-router";
import { Mail, Phone, MapPin } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";

// Centralized configuration for easy maintenance
const FOOTER_CONFIG = {
  socials: [
    {
      name: "Instagram",
      href: "https://instagram.com/krilea.official",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      ),
    },
    {
      name: "YouTube",
      href: "https://youtube.com/@krilea",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
          <path d="m10 15 5-3-5-3z" fill="currentColor" stroke="none" />
        </svg>
      ),
    },
    {
      name: "X",
      href: "https://x.com/krilea",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: "https://facebook.com/krilea",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
    },
    {
      name: "Pinterest",
      href: "https://pinterest.com/krilea",
      icon: (props: React.SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
          <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.546.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
        </svg>
      ),
    },
  ],
  quickLinks: [
    { label: "Home", to: "/" },
    { label: "About", to: "/about" },
    { label: "Silver Collection", to: "/silver-collection" },
    { label: "Fashion Collection", to: "/fashion-collection" },
    { label: "Contact", to: "/contact" },
  ],
  customerCareLinks: [
    { label: "Track order", to: "/account" },
    { label: "Shipping policy", to: "/contact" },
    { label: "Return & refund", to: "/contact" },
    { label: "FAQs", to: "/contact" },
  ],
  contact: {
    email: "support@krilea.in",
    phone: "+91 93647 33735",
    phoneRaw: "+919364733735",
    whatsapp: "+91 93647 33736",
    whatsappLink: "https://wa.me/919364733736",
    location: "Chennai, Tamil Nadu, India",
  },
  legal: [
    { label: "Terms & Conditions", to: "/contact" },
    { label: "Privacy Policy", to: "/contact" },
  ],
};

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M17.472 14.382c-.301-.15-1.782-.879-2.057-.98-.276-.1-.477-.15-.678.15-.2.301-.778.98-.954 1.18-.175.201-.351.226-.652.075s-1.272-.469-2.423-1.496c-.896-.799-1.501-1.786-1.677-2.087-.175-.301-.019-.464.132-.614.136-.135.301-.351.452-.527.15-.175.201-.301.301-.501.101-.201.05-.376-.025-.527-.075-.15-.678-1.633-.929-2.238-.244-.589-.493-.509-.678-.519-.175-.01-.376-.01-.577-.01-.201 0-.527.075-.803.376-.276.301-1.054 1.03-1.054 2.511 0 1.482 1.079 2.912 1.23 3.113.15.201 2.122 3.24 5.141 4.544.718.31 1.279.496 1.716.635.722.23 1.38.197 1.9-.119.579-.351 1.782-1.782 2.033-2.51.251-.728.251-1.354.175-1.48-.075-.125-.276-.201-.577-.351zM12.04 2C6.53 2 2.06 6.47 2.06 11.98c0 1.94.55 3.75 1.51 5.29L2 22l4.87-1.54c1.48.88 3.2 1.39 5.17 1.39 5.51 0 9.98-4.47 9.98-9.98C22.02 6.47 17.55 2 12.04 2zm0 18.23c-1.68 0-3.23-.48-4.55-1.31l-.33-.2-3.32 1.05 1.07-3.23-.22-.35c-.93-1.4-1.43-3.04-1.43-4.74 0-4.55 3.7-8.25 8.25-8.25 4.55 0 8.25 3.7 8.25 8.25 0 4.55-3.7 8.25-8.25 8.25z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="bg-emerald-deep text-cream border-t border-champagne/20">
      {/* Main 4-Column Footer Area */}
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1.25fr] lg:gap-12">
          
          {/* COLUMN 1 — BRAND / LOGO */}
          <div className="space-y-6">
            <BrandMark />
            <p className="max-w-xs text-[13px] leading-relaxed text-cream/75 font-light tracking-wide">
              Timeless jewellery for the modern you.
              <br />
              Thoughtfully designed, made to stay with you.
            </p>

            {/* Social Icons Row */}
            <div className="pt-2">
              <nav aria-label="Social media links">
                <ul className="flex items-center gap-3">
                  {FOOTER_CONFIG.socials.map((social) => {
                    const Icon = social.icon;
                    return (
                      <li key={social.name}>
                        <a
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={social.name}
                          className="flex h-9 w-9 items-center justify-center rounded-full border border-champagne/30 bg-emerald-deep/80 text-cream/80 transition-all duration-300 hover:border-champagne hover:bg-champagne/15 hover:text-champagne hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </div>

          {/* COLUMN 2 — QUICK LINKS */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
              Quick Links
            </h3>
            <nav className="mt-6" aria-label="Quick links navigation">
              <ul className="space-y-3.5 text-[13px] text-cream/75 font-light">
                {FOOTER_CONFIG.quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="inline-block transition-all duration-200 hover:text-champagne hover:translate-x-1 focus-visible:outline-none focus-visible:text-champagne"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* COLUMN 3 — CUSTOMER CARE */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
              Customer Care
            </h3>
            <nav className="mt-6" aria-label="Customer care navigation">
              <ul className="space-y-3.5 text-[13px] text-cream/75 font-light">
                {FOOTER_CONFIG.customerCareLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="inline-block transition-all duration-200 hover:text-champagne hover:translate-x-1 focus-visible:outline-none focus-visible:text-champagne"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* COLUMN 4 — CONTACT US */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-champagne">
              Contact Us
            </h3>
            <address className="not-italic mt-6 space-y-4 text-[13px] text-cream/75 font-light">
              {/* Email */}
              <div className="flex items-center gap-3 group">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-champagne/15 text-champagne group-hover:bg-champagne/25 transition-colors">
                  <Mail className="h-3.5 w-3.5" />
                </div>
                <a
                  href={`mailto:${FOOTER_CONFIG.contact.email}`}
                  className="transition-colors hover:text-champagne focus-visible:outline-none focus-visible:text-champagne break-all"
                >
                  {FOOTER_CONFIG.contact.email}
                </a>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3 group">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-champagne/15 text-champagne group-hover:bg-champagne/25 transition-colors">
                  <Phone className="h-3.5 w-3.5" />
                </div>
                <a
                  href={`tel:${FOOTER_CONFIG.contact.phoneRaw}`}
                  className="transition-colors hover:text-champagne focus-visible:outline-none focus-visible:text-champagne whitespace-nowrap"
                >
                  {FOOTER_CONFIG.contact.phone}
                </a>
              </div>

              {/* WhatsApp */}
              <div className="flex items-center gap-3 group">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-champagne/15 text-champagne group-hover:bg-champagne/25 transition-colors">
                  <WhatsAppIcon className="h-3.5 w-3.5" />
                </div>
                <a
                  href={FOOTER_CONFIG.contact.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-champagne focus-visible:outline-none focus-visible:text-champagne whitespace-nowrap"
                >
                  {FOOTER_CONFIG.contact.whatsapp}
                </a>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-champagne/15 text-champagne mt-0.5">
                  <MapPin className="h-3.5 w-3.5" />
                </div>
                <span className="leading-snug text-cream/70">
                  {FOOTER_CONFIG.contact.location}
                </span>
              </div>
            </address>
          </div>

        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="border-t border-cream/15 bg-[#081e18]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-5 text-center text-xs text-cream/55 sm:flex-row sm:text-left sm:px-8 lg:px-10">
          <div>
            Copyright © 2026 All rights reserved | by{" "}
            <a
              href="https://devspectra.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-champagne hover:underline hover:text-champagne-soft transition-colors"
            >
              DevSpectra
            </a>
          </div>

          <div className="flex items-center gap-6 text-xs text-cream/60">
            {FOOTER_CONFIG.legal.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="transition-colors hover:text-champagne focus-visible:outline-none focus-visible:text-champagne"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
