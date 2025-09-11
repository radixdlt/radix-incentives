'use client';

import Link from 'next/link';
import {
  FaDiscord,
  FaFacebook,
  FaGithub,
  FaLinkedin,
  FaMedium,
  FaReddit,
  FaTelegram,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa';

type FooterProps = {
  className?: string;
};

export const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer
      // biome-ignore lint/nursery/useSortedClasses: eh
      className={`border-t border-white/10 mt-[100px] ${className ?? ''}`}
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Community Section - First on mobile, Right on desktop */}
          <div className="order-1 space-y-4 md:order-2">
            <h3 className="font-semibold text-lg text-white md:text-right">
              Join the Radix Community
            </h3>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link
                href="https://go.radixdlt.com/Discord"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border border-white/10 bg-white/5 p-2 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
                aria-label="Discord"
              >
                <FaDiscord className="h-5 w-5 text-white/70 transition-colors duration-200 group-hover:text-white" />
              </Link>
              <Link
                href="https://www.facebook.com/RadixDLT/"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border border-white/10 bg-white/5 p-2 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
                aria-label="Facebook"
              >
                <FaFacebook className="h-5 w-5 text-white/70 transition-colors duration-200 group-hover:text-white" />
              </Link>
              <Link
                href="https://github.com/radixdlt"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border border-white/10 bg-white/5 p-2 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
                aria-label="GitHub"
              >
                <FaGithub className="h-5 w-5 text-white/70 transition-colors duration-200 group-hover:text-white" />
              </Link>
              <Link
                href="https://medium.com/@radixdlt"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border border-white/10 bg-white/5 p-2 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
                aria-label="Medium"
              >
                <FaMedium className="h-5 w-5 text-white/70 transition-colors duration-200 group-hover:text-white" />
              </Link>
              <Link
                href="https://www.reddit.com/r/Radix/"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border border-white/10 bg-white/5 p-2 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
                aria-label="Reddit"
              >
                <FaReddit className="h-5 w-5 text-white/70 transition-colors duration-200 group-hover:text-white" />
              </Link>
              <Link
                href="https://t.me/radix_dlt"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border border-white/10 bg-white/5 p-2 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
                aria-label="Telegram"
              >
                <FaTelegram className="h-5 w-5 text-white/70 transition-colors duration-200 group-hover:text-white" />
              </Link>
              <Link
                href="https://twitter.com/RadixDLT"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border border-white/10 bg-white/5 p-2 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
                aria-label="Twitter"
              >
                <FaTwitter className="h-5 w-5 text-white/70 transition-colors duration-200 group-hover:text-white" />
              </Link>
              <Link
                href="https://www.youtube.com/c/radixdlt"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border border-white/10 bg-white/5 p-2 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
                aria-label="YouTube"
              >
                <FaYoutube className="h-5 w-5 text-white/70 transition-colors duration-200 group-hover:text-white" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/radixdlt"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded-lg border border-white/10 bg-white/5 p-2 transition-all duration-200 hover:border-white/20 hover:bg-white/10"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="h-5 w-5 text-white/70 transition-colors duration-200 group-hover:text-white" />
              </Link>
            </div>
          </div>

          {/* Links and Whitepapers - Left side on desktop, side by side */}
          <div className="order-2 md:order-1">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              {/* Links Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-white">Links</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href="https://www.radixdlt.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-white/70 transition-colors duration-200 hover:text-white"
                    >
                      Main Site
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="https://www.radixdlt.com/blog"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 transition-colors duration-200 hover:text-white"
                    >
                      Blog
                    </Link>
                    <Link
                      href="https://www.radixdlt.com/post/rss.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      // biome-ignore lint/nursery/useSortedClasses: eh
                      className="text-xs text-white/50 hover:text-white/70 transition-colors duration-200"
                    >
                      RSS
                    </Link>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="https://www.radixdlt.com/podcast"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/70 transition-colors duration-200 hover:text-white"
                    >
                      Podcast
                    </Link>
                    <Link
                      href="https://www.radixdlt.com/podcast/rss.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      // biome-ignore lint/nursery/useSortedClasses: eh
                      className="text-xs text-white/50 hover:text-white/70 transition-colors duration-200"
                    >
                      RSS
                    </Link>
                  </div>
                  <Link
                    href="https://www.radixdlt.com/privacy-policy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white/70 transition-colors duration-200 hover:text-white"
                  >
                    Privacy Notice
                  </Link>
                  <Link
                    href="https://cdn.prod.website-files.com/6053f7fca5bf627283b582c2/68c1810c6472b72f0f2a2b60_2025.09.08%20TERMS%20OF%20INCENTIVE%20DISTRIBUTION%20.docx.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white/70 transition-colors duration-200 hover:text-white"
                  >
                    Terms of Service
                  </Link>
                  <Link
                    href="https://www.radixdlt.com/radix-brand-pack"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white/70 transition-colors duration-200 hover:text-white"
                  >
                    Radix Brand Pack
                  </Link>
                </div>
              </div>

              {/* Whitepapers Section */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-white">
                  Whitepapers
                </h3>
                <div className="space-y-3">
                  <Link
                    href="https://radixdlt.com/whitepapers/defi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white/70 transition-colors duration-200 hover:text-white"
                  >
                    DeFi Whitepaper
                  </Link>
                  <Link
                    href="https://radixdlt.com/whitepapers/consensus"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white/70 transition-colors duration-200 hover:text-white"
                  >
                    Consensus Whitepaper
                  </Link>
                  <Link
                    href="http://radixdlt.com/whitepapers/peerreview"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white/70 transition-colors duration-200 hover:text-white"
                  >
                    Peer Reviewed Consensus Paper
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
