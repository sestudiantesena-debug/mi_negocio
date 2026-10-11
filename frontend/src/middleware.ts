import { authMiddleware } from '@clerk/nextjs/server';

export default authMiddleware({
  publicRoutes: [
    '/',
    '/productos(.*)',
    '/carrito(.*)',
    '/chat(.*)',
    '/api/webhook/(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
  ],
  ignoredRoutes: [
    '/api/webhook/(.*)',
  ],
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};