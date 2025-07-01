import Link from 'next/link';
import Image from 'next/image';

export const Logo = () => {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
      <Image
        src="https://cdn.prod.website-files.com/6053f7fca5bf627283b582c2/6266da2a5acb38c8eacf5938_radix_logo_white.png"
        alt="Radix Consultation"
        width={80}
        height={32}
      />
    </Link>
  );
};
