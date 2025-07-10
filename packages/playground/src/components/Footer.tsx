import React from "react";

export function Footer() {
  return (
    <footer className="border-t border-vtex-gray-winter bg-white mt-12">
      <div className="vtex-container">
        <div className="py-6 flex items-center justify-between">
          <a
            className="flex items-center space-x-2"
            href="https://ads.vtex.com/"
          >
            <span className="text-sm text-vtex-gray">Powered by</span>
            <span className="text-sm text-vtex-pink font-medium">VTEX Ads</span>
          </a>
          <div className="flex items-center space-x-4">
            <a
              href="https://vtex.github.io/ads-js/"
              className="text-sm text-vtex-pink font-medium"
            >
              Documentation
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
