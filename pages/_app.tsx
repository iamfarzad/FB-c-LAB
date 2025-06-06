import React, { useEffect, Suspense } from 'react';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import Layout from '../src/components/Layout';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import '../src/index.css'; // Adjusted path
import '../src/i18n'; // Import i18next configuration

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();

  // Handle route changes for analytics or other side effects
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Add any route change logic here
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Suspense fallback="Loading...">
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </Suspense>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default MyApp;
