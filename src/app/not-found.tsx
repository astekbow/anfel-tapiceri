import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-linen px-4 text-center">
      <p className="font-display text-6xl italic text-camel">404</p>
      <h1 className="mt-4 font-display text-2xl text-pine">Kjo faqe nuk u gjet</h1>
      <p className="mt-2 max-w-sm text-[15px] text-mink">
        Ndoshta produkti është hequr ose linku ka ndryshuar.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-pine px-6 py-3 text-[15px] font-semibold text-ivory transition-colors hover:bg-pine-deep"
      >
        Kthehu në kryefaqe
      </Link>
    </div>
  );
}
