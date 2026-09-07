import { withAuth } from 'next-auth/middleware';

const isProd = process.env.NODE_ENV === 'production';
const nextAuthUrl = process.env.NEXTAUTH_URL?.trim() || '';
const middlewareSecret =
  process.env.NEXTAUTH_SECRET?.trim() ||
  process.env.AUTH_SECRET?.trim() ||
  '';

if (isProd) {
  if (!nextAuthUrl) {
    throw new Error(
      'Missing NEXTAUTH_URL for middleware. Set Amplify branch env and redeploy.',
    );
  }
  if (!middlewareSecret) {
    throw new Error(
      'Missing NEXTAUTH_SECRET (or AUTH_SECRET) for middleware. Set Amplify branch env and redeploy.',
    );
  }
  process.env.NEXTAUTH_URL = nextAuthUrl;
  process.env.NEXTAUTH_URL_INTERNAL =
    process.env.NEXTAUTH_URL_INTERNAL?.trim() || nextAuthUrl;
}

export default withAuth({
  secret: middlewareSecret || undefined,
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|api/auth|api/proxy|api/documents|login).*)',
  ],
};
