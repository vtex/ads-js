import React from "react";

export function PageHeader() {
  return (
    <div className="mb-8">
      <h2 className="text-3xl text-vtex-black mb-2">Ads React SDK Playground</h2>
      <p className="text-vtex-gray max-w-2xl">
        Configure and test VTEX Ads platform with different hydration
        strategies, search parameters, and facets. Experience how our React SDK
        integrates seamlessly with your commerce platform.
      </p>
      <p className="mt-4">
        <a
          href="https://vtex.github.io/ads-js/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-vtex-pink underline"
        >
          Ads JS documentation
        </a>
      </p>
    </div>
  );
}
