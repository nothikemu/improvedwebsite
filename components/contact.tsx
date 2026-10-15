import { site } from "@/data/site";
import { Guestbook } from "./guestbook";
import { SectionHeading } from "./section-heading";

export function Contact() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="container-page py-[clamp(3.5rem,8vw,6.5rem)]"
    >
      <SectionHeading id="contact" title="contact" aside="Say hi anywhere below, or leave a note in the guestbook." />

      <div className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-8">
        <ul className="lg:col-span-7" aria-label="Social links">
          {site.socials.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-baseline justify-between gap-6 border-b border-line py-5 transition-colors hover:border-line-strong"
              >
                <span className="stretch-on-hover text-[clamp(2.25rem,6vw,4rem)] leading-[0.95] font-bold tracking-[-0.02em] group-hover:text-accent">
                  {link.label}
                </span>
                <span className="meta text-right text-muted transition-colors group-hover:text-fg">
                  {link.detail}
                  <span aria-hidden="true"> ↗</span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="lg:col-span-5">
          <Guestbook />
        </div>
      </div>
    </section>
  );
}
