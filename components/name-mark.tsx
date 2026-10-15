"use client";

import { useEffect, useRef } from "react";

/**
 * The display name, set in Archivo's widest cut. Letters stretch open on load;
 * with a mouse, letters near the pointer squeeze narrower and lighter, the way
 * a key gives under a finger. Purely visual: it has no click behavior.
 */
export function NameMark({ name }: { name: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const word = ref.current;
    const area = word?.closest("[data-name-area]") as HTMLElement | null;
    if (!word || !area) return;
    const capable = matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    if (!capable.matches || reduce.matches) return;

    const letters = Array.from(word.children) as HTMLElement[];
    // Letter centers in page coordinates, measured at rest so squeezing a
    // letter doesn't move the targets and feed back into itself.
    let centers: { x: number; y: number }[] = [];
    let radius = 1;
    let frame = 0;
    let pointer: { x: number; y: number } | null = null;

    const measure = () => {
      centers = letters.map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + scrollX + r.width / 2, y: r.top + scrollY + r.height / 2 };
      });
      radius = word.getBoundingClientRect().height * 1.25;
    };

    const render = () => {
      frame = 0;
      letters.forEach((el, i) => {
        let p = 0;
        if (pointer) {
          const d = Math.hypot(pointer.x - centers[i].x, (pointer.y - centers[i].y) * 0.6);
          p = Math.max(0, 1 - d / radius) ** 1.6;
        }
        el.style.setProperty("--p", p.toFixed(3));
      });
    };

    const queue = () => {
      if (!frame) frame = requestAnimationFrame(render);
    };

    const onEnter = () => {
      if (!pointer) measure();
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      if (!centers.length) measure();
      pointer = { x: e.pageX, y: e.pageY };
      queue();
    };
    const onLeave = () => {
      pointer = null;
      queue();
    };
    const onResize = () => {
      pointer = null;
      letters.forEach((el) => el.style.setProperty("--p", "0"));
      centers = [];
    };

    area.addEventListener("pointerenter", onEnter);
    area.addEventListener("pointermove", onMove);
    area.addEventListener("pointerleave", onLeave);
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      area.removeEventListener("pointerenter", onEnter);
      area.removeEventListener("pointermove", onMove);
      area.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <h1 className="name-mark">
      <span className="sr-only">{name}</span>
      <span ref={ref} aria-hidden="true" className="name-mark-word">
        {[...name].map((ch, i) => (
          <span key={i} className="name-mark-letter" style={{ "--i": i } as React.CSSProperties}>
            {ch}
          </span>
        ))}
      </span>
    </h1>
  );
}
