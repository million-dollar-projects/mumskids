'use client'

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { messages } from '@/i18n/messages';
import { DiscoverPractices } from '@/components/discover/discover-practices';
import { useAuth } from '@/lib/auth/context';

interface DiscoverPageProps {
  params: Promise<{ locale: string }>;
}

export default function DiscoverPage({ params }: DiscoverPageProps) {
  const [locale, setLocale] = useState('zh');
  const { user, loading } = useAuth();

  useEffect(() => {
    const getLocale = async () => {
      const resolvedParams = await params;
      setLocale(resolvedParams.locale);
    };
    getLocale();
  }, [params]);

  const t = messages[locale as keyof typeof messages] || messages.zh;

  return (
    <div className="min-h-screen">

      <Header
        locale={locale}
        variant={user ? "authenticated" : "landing"}
        isFixed={true}
      />

      {/* Hero Section */}
      <div className="sm:py-16 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 sm:text-center mt-10 sm:mt-0">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 hidden sm:block">
            {t.discover.title}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl sm:mx-auto mx-0 font-bold">
            {t.discover.subtitle}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
        <DiscoverPractices locale={locale} t={t} />
      </main>

      <Footer locale={locale} />
    </div>
  );
}