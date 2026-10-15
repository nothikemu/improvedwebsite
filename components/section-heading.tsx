type Props = {
  id: string;
  title: string;
  /** Short supporting text on the right. */
  aside?: React.ReactNode;
};

export function SectionHeading({ id, title, aside }: Props) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-line pb-4">
      <h2
        id={`${id}-title`}
        className="stretch-expanded text-[clamp(2.25rem,6.5vw,4.75rem)] leading-[0.9] font-bold tracking-[-0.02em]"
      >
        {title}
      </h2>
      {aside && <div className="meta max-w-[46ch] pb-1 text-muted">{aside}</div>}
    </div>
  );
}
