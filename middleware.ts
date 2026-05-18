import { withAuth } from 'next-auth/middleware';

const prodBaseUrl = 'https://main.d1fkse5la21xp8.amplifyapp.com';
if (process.env.NODE_ENV === 'production') {
  process.env.NEXTAUTH_URL = process.env.NEXTAUTH_URL || prodBaseUrl;
  process.env.NEXTAUTH_URL_INTERNAL =
    process.env.NEXTAUTH_URL_INTERNAL || prodBaseUrl;
}

const middlewareSecret =
  process.env.NEXTAUTH_SECRET ||
  'Lv3alFGMqJ064VQU+zYv6zCoowUizS1oYuBnDGWdmsxWlsWwWY0Z09I5yqj00sfz';

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
