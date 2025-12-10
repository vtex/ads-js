import React from "react";
import { AdsProvider } from "@vtex/ads-react";

/**
 * Component to test error logging
 * This component intentionally creates errors to test the logging system
 */
export function LogsTest() {
  const [testType, setTestType] = React.useState<
    "none" | "missing-identity" | "missing-hydration"
  >("none");
  const [hasError, setHasError] = React.useState(false);

  React.useEffect(() => {
    if (testType !== "none") {
      setHasError(false);
      // Small delay to ensure state is updated
      const timer = setTimeout(() => {
        setHasError(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [testType]);

  if (hasError && testType === "missing-identity") {
    // This will trigger an error because identity is missing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props: any = { environment: "production" };
    return (
      <AdsProvider {...props}>
        <div className="vtex-card border-l-4 border-l-vtex-pink">
          <h3 className="text-xl text-vtex-black mb-4">Testing Error Log</h3>
          <p className="text-sm text-vtex-gray mb-4">
            This should have triggered an error. Check the console and network
            tab.
          </p>
          <button
            onClick={() => {
              setTestType("none");
              setHasError(false);
            }}
            className="vtex-button-secondary"
          >
            Reset
          </button>
        </div>
      </AdsProvider>
    );
  }

  if (hasError && testType === "missing-hydration") {
    // This will trigger an error because hydrationStrategy is missing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const props: any = {
      identity: {
        accountName: "test",
        publisherId: "test",
        sessionId: "test",
      },
      environment: "production",
    };
    return (
      <AdsProvider {...props}>
        <div className="vtex-card border-l-4 border-l-vtex-pink">
          <h3 className="text-xl text-vtex-black mb-4">Testing Error Log</h3>
          <p className="text-sm text-vtex-gray mb-4">
            This should have triggered an error. Check the console and network
            tab.
          </p>
          <button
            onClick={() => {
              setTestType("none");
              setHasError(false);
            }}
            className="vtex-button-secondary"
          >
            Reset
          </button>
        </div>
      </AdsProvider>
    );
  }

  return (
    <div className="vtex-card border-l-4 border-l-vtex-pink">
      <h3 className="text-xl text-vtex-black mb-4">Test Error Logging</h3>
      <p className="text-sm text-vtex-gray mb-4">
        Click the buttons below to test error logging. Errors will be logged
        when environment is set to "production". Check the browser console and
        network tab to see the logs.
      </p>
      <div className="space-y-3">
        <button
          onClick={() => setTestType("missing-identity")}
          className="vtex-button-secondary w-full"
        >
          Test Error: Missing Identity
        </button>
        <button
          onClick={() => setTestType("missing-hydration")}
          className="vtex-button-secondary w-full"
        >
          Test Error: Missing Hydration Strategy
        </button>
      </div>
    </div>
  );
}

