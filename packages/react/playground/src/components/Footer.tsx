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
          <div className="text-sm text-vtex-gray">
            Build amazing commerce experiences
          </div>
        </div>
      </div>
    </footer>
  );
}
