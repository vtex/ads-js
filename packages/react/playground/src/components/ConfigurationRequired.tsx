import React from "react";

export function ConfigurationRequired() {
  return (
    <div className="vtex-card">
      <div className="text-center">
        <h3 className="text-xl text-vtex-black mb-6 border-b border-vtex-gray-winter pb-3 text-center">
          Configuration Required
        </h3>
        <p className="text-vtex-gray mb-6 max-w-md mx-auto">
          Please fill in the <strong>Account Name</strong> and{" "}
          <strong>Publisher ID</strong> in the configuration form to start
          testing ads.
        </p>
      </div>
    </div>
  );
}

