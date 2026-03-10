import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Prevent caching for all pages
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, s-maxage=0, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Surrogate-Control', 'no-store');
  
  // Handle language from URL query param
  const url = request.nextUrl;
  const langParam = url.searchParams.get('lang');
  
  if (langParam === 'de' || langParam === 'en') {
    response.cookies.set('language', langParam, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      httpOnly: false,
    });
    
    // Remove lang from URL and redirect
    const newUrl = url.clone();
    newUrl.searchParams.delete('lang');
    return NextResponse.redirect(newUrl);
  }
  
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|og-image.png).*)',
  ],
};
