import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-surface/70 backdrop-blur-md border-b border-surface-container/20">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-primary"
        >
          The Sacred Library
        </Link>

        <nav className="hidden sm:flex gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 hover:text-primary transition"
          >
            Browse
          </Link>
          <Link
            href="/search"
            className="text-sm font-medium text-gray-700 hover:text-primary transition"
          >
            Search
          </Link>
        </nav>
      </div>
    </header>
  );
}

