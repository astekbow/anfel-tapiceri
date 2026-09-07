export default function SectionHeading({
  title,
  text,
  className = "",
}: {
  title: string;
  text?: string;
  className?: string;
}) {
  return (
    <div className={`max-w-2xl ${className}`}>
      <h2 className="font-display text-3xl text-pine sm:text-4xl">{title}</h2>
      <div className="stitch mt-4 w-16" />
      {text && <p className="mt-4 leading-relaxed text-mink">{text}</p>}
    </div>
  );
}
