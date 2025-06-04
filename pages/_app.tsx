import React, { useEffect } from 'react';
import { ThemeProvider } from '../src/contexts/ThemeContext';
import Layout from '../src/components/Layout';
import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import '../styles/globals.css';

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
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ThemeProvider>
  );
}

export default MyApp;
