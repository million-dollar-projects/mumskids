import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { messages } from './messages';

// 支持的语言
export const locales = ['zh', 'en'] as const;
export type Locale = typeof locales[number];

export default getRequestConfig(async ({ locale }) => {
  // 验证传入的locale参数
  if (!locales.includes(locale as Locale)) notFound();

  return {
    locale: locale as string,
    messages: messages[locale as Locale]
  };
}); 