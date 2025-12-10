import React from "react";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { PageHeader } from "./components/PageHeader";
import { ConfigForm } from "./components/ConfigForm";
import { AdsShowcase } from "./components/AdsShowcase";
import { ConfigurationRequired } from "./components/ConfigurationRequired";
import { LogsTest } from "./components/LogsTest";
import { usePlaygroundConfig } from "./hooks/usePlaygroundConfig";

export function App() {
  const {
    config,
    setConfig,
    refreshTrigger,
    handleRefresh,
    hasRequiredConfig,
  } = usePlaygroundConfig();

  return (
    <div className="min-h-screen bg-vtex-blue font-vtex">
      <Header />

      <main className="vtex-container">
        <div className="py-8">
          <PageHeader />

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="space-y-6">
              <ConfigForm
                config={config}
                setConfig={setConfig}
                onRefresh={handleRefresh}
              />
              <LogsTest />
            </div>

            <div>
              {hasRequiredConfig ? (
                <AdsShowcase config={config} refreshTrigger={refreshTrigger} />
              ) : (
                <ConfigurationRequired />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
