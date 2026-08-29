import { withAuth } from 'next-auth/middleware';

const prodBaseUrl =
  process.env.NEXTAUTH_URL?.trim() ||
  'https://main.d26n82vm7gk12r.amplifyapp.com';
if (process.env.NODE_ENV === 'production') {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || prodBaseUrl;
  process.env.NEXTAUTH_URL_INTERNAL =
    process.env.NEXTAUTH_URL_INTERNAL || process.env.NEXTAUTH_URL || prodBaseUrl;
}

const middlewareSecret =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  'UsAf4NRKLadbjtn8qCpkDZi9le7ETXcYwS51y6vBuHI';

export default withAuth({
  secret: middlewareSecret,
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|api/auth|api/proxy|login).*)',
  ],
};
