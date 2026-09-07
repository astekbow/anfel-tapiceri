const icons = {
  custom: (
    <>
      <rect x="2.5" y="8" width="19" height="8" rx="1.5" />
      <path d="M6.5 8v3.2M10.5 8v4.2M14.5 8v3.2M18.5 8v4.2" />
    </>
  ),
  reupholster: (
    <>
      <circle cx="6" cy="6" r="2.4" />
      <circle cx="6" cy="18" r="2.4" />
      <path d="M8 7.4 20 19M8 16.6 20 5" />
    </>
  ),
  sofa: (
    <>
      <path d="M5 11V8.5A2.5 2.5 0 0 1 7.5 6h9A2.5 2.5 0 0 1 19 8.5V11" />
      <path d="M3 13.5a2 2 0 0 1 4 0v.5h10v-.5a2 2 0 0 1 4 0V16a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <path d="M6 18v1.8M18 18v1.8" />
    </>
  ),
  bed: (
    <>
      <path d="M2.5 18.5v-11" />
      <path d="M2.5 14h19v4.5" />
      <path d="M2.5 16.5h19" />
      <circle cx="6.8" cy="10.2" r="1.7" />
      <path d="M10.5 14v-3.2a1.3 1.3 0 0 1 1.3-1.3h6.2a3.5 3.5 0 0 1 3.5 3.5V14" />
    </>
  ),
};

export type ServiceIconName = keyof typeof icons;

export default function ServiceIcon({
  name,
  className = "h-6 w-6",
}: {
  name: ServiceIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {icons[name]}
    </svg>
  );
}
