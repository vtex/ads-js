import React from "react";

export function Header() {
  return (
    <header className="bg-white border-b border-vtex-gray-winter">
      <div className="vtex-container">
        <div className="flex items-center justify-between py-6">
          <div className="flex items-center space-x-4">
            <img
              src="https://brand.vtex.com/wp-content/themes/vtex-brand/img/logo.svg"
              alt="VTEX Logo"
              className="h-8 w-auto"
            />
            <div className="h-8 w-px bg-vtex-gray-winter"></div>
            <div>
              <h1 className="text-2xl text-vtex-black font-normal">Ads</h1>
              <p className="text-sm text-vtex-gray -mt-1">
                React SDK Playground
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-vtex-gray">The Enterprise Digital</p>
            <p className="text-sm text-vtex-pink font-medium -mt-1">
              Commerce Platform
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
