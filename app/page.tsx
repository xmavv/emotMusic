import Link from "next/link";

export default function Home() {
  return (
    <main
      className={`h-screen w-screen bg-[url('/equalizer.gif')] bg-no-repeat bg-cover`}
    >
      <div className="h-full backdrop-brightness-30">
        <ul className="text-right text-3xl pt-4 pr-6 leading-15">
          <li>
            <Link href="/countriesmap">COUNTRIESMAP</Link>
          </li>
          <li>
            <Link href="/spiderchart/58">SPIDERCHART</Link>
          </li>
          <li>
            <Link href="/pacmap">PACMAP</Link>
          </li>
          <li>
            <Link href="/3D">3D</Link>
          </li>
        </ul>
      </div>
    </main>
  );
}
