import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin');

  // --- Redirect logged-in users from /login and /signup ---
  if (token && (pathname === '/login' || pathname === '/signup')) {
    try {
      await jwtVerify(token, JWT_SECRET); 
      // Valid token, redirect away from login/signup
      return NextResponse.redirect(new URL('/companies', request.url));
    } catch (error) {
      // Invalid token, clear it but allow access to login/signup
      const response = NextResponse.next(); 
      response.cookies.set({ name: 'token', value: '', maxAge: 0 });
      return response;
    }
  }
  // --- End redirect --- 

  // Allow access to public routes if user is NOT logged in or accessing them anyway
  const publicRoutes = ['/login', '/signup', '/', '/companies']; // Added /companies as public
  if (publicRoutes.includes(pathname) || pathname.startsWith('/company/')) { // Allow individual company pages too
     // Note: The check above already handled redirecting logged-in users away from /login & /signup
    return NextResponse.next(); 
  }

  // --- Protected Routes Logic --- 
  if (!token) {
    // No token, redirect to login (preserving intended destination if needed)
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname); // Keep track of where they wanted to go
    return NextResponse.redirect(loginUrl);
  }

  // Token exists, verify it for protected routes
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Basic check for payload structure (adjust as needed)
    if (typeof payload.id !== 'number' || typeof payload.isAdmin !== 'boolean') {
        console.warn('Middleware: Invalid JWT payload structure', payload);
        throw new Error('Invalid token payload');
    }

    // Check admin role using isAdmin for admin routes
    if (isAdminRoute && payload.isAdmin !== true) { 
       // Not an admin trying to access admin route, redirect
      console.log('Middleware: Non-admin access attempt to admin route');
      return NextResponse.redirect(new URL('/', request.url)); 
    }

    // Valid token, role OK, allow access
    return NextResponse.next();

  } catch (error) {
    // Invalid/expired token for a protected route, redirect to login
    console.error('Middleware token verification error:', error);
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.set({ name: 'token', value: '', maxAge: 0 }); // Clear invalid token
    return response;
  }
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico).*) ',
  ],
}; 