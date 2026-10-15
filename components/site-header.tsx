"use client";

import { useEffect, useRef, useState } from "react";
import { site } from "@/data/site";
import { STATUS_LABEL } from "@/lib/lanyard";
import { usePresence } from "./hooks";
import { ThemeToggle } from "./theme-toggle";

const LINKS = [
  { id: "about", label: "about" },
  { id: "projects", label: "projects" },
  { id: "contact", label: "contact" },
] as const;

function PresenceDot() {
  const { phase, presence } = usePresence();
  if (phase !== "ready" || !presence) return null;
  const label = STATUS_LABEL[presence.discord_status];
  return (
    <span
      className="status-dot"
      data-status={presence.discord_status}
      title={`${label} on Discord`}
      role="img"
      aria-label={`${label} on Discord`}
    />
  );
}

export function SiteHeader() {
  const [active, setActive] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);

  // Highlight the section currently crossing the upper part of the viewport.
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
          else if (entry.target.id === LINKS[0].id && entry.boundingClientRect.top > 0) setActive(null);
        }
      },
      { rootMargin: "-35% 0px -60% 0px" },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Close the mobile menu on Escape or a click outside it.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!menu.current?.contains(target) && !menuButton.current?.contains(target)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="container-page flex h-(--header-h) items-center justify-between gap-4">
        <a href="#top" className="group flex items-center gap-2.5" aria-label={`${site.handle}, back to top`}>
          <span className="stretch-on-hover text-[0.95rem] font-semibold tracking-tight">{site.handle}</span>
          <PresenceDot />
        </a>

        <nav aria-label="Sections" className="flex items-center gap-1">
          <ul className="hidden items-center gap-1 sm:flex">
            {LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={`#${link.id}`}
                  aria-current={active === link.id ? "location" : undefined}
                  className="relative block rounded-sm px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg aria-[current]:text-fg"
                >
                  {link.label}
                  <span
                    aria-hidden="true"
                    className={`absolute inset-x-3 -bottom-px h-px origin-left bg-accent transition-transform duration-300 ease-(--ease-out) ${
                      active === link.id ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              </li>
            ))}
          </ul>

          <button
            ref={menuButton}
            type="button"
            className="meta rounded-sm px-2.5 py-2 text-fg sm:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? "close" : "menu"}
          </button>

          <ThemeToggle />
        </nav>
      </div>

      <div
        ref={menu}
        id="mobile-menu"
        hidden={!open}
        className="border-t border-line bg-bg sm:hidden"
      >
        <ul className="container-page py-3">
          {LINKS.map((link) => (
            <li key={link.id}>
              <a
                href={`#${link.id}`}
                onClick={() => setOpen(false)}
                aria-current={active === link.id ? "location" : undefined}
                className="stretch-on-hover flex items-baseline justify-between py-2.5 text-2xl font-semibold aria-[current]:text-accent"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div aria-hidden="true" className="scroll-progress absolute inset-x-0 -bottom-px h-px bg-accent" />
    </header>
  );
}
