import createMiddleware from 'next-intl/middleware';
import { locales } from './i18n/request';
import { updateSession } from './lib/supabase/middleware';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  // 支持的语言列表
  locales,
  
  // 默认语言
  defaultLocale: 'zh',
  
  // 语言检测策略
  localeDetection: true,
});

export default async function middleware(request: NextRequest) {
  // 首先处理Supabase认证会话
  const supabaseResponse = await updateSession(request);
  
  // 如果不是API路由，继续处理国际化
  if (!request.nextUrl.pathname.startsWith('/api')) {
    const intlResponse = intlMiddleware(request);
    
    // 合并响应头和cookies
    if (intlResponse && supabaseResponse) {
      intlResponse.headers.forEach((value, key) => {
        supabaseResponse.headers.set(key, value);
      });
      supabaseResponse.cookies.getAll().forEach((cookie) => {
        intlResponse.cookies.set(cookie.name, cookie.value, {
          ...cookie,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production'
        });
      });
      return intlResponse;
    }
    
    return intlResponse;
  }
  
  return supabaseResponse;
}

export const config = {
  // 匹配所有路径除了_next/static、_next/image、favicon.ico
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}; 