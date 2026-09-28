import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import { constProfiles as Profile } from './helpers/config/gbConstants';

export async function middleware(req) {
   const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
   if (!session) {
      return NextResponse.redirect(new URL('/Login', req.url));
   }

   const { settings, idProfile } = session.user;
   const { startPage, path, allowedPages } = settings;
   const nextUrl = req.nextUrl.pathname;
   const isAllowed = allowedPages.some((page) => nextUrl.includes(page));

   if (idProfile !== Profile.EMG && !nextUrl.includes(path) && !isAllowed) {
      return NextResponse.redirect(new URL(startPage, req.url));
   }

   if (nextUrl !== '/' && !nextUrl.includes(path) && !isAllowed) {
      return NextResponse.redirect(new URL(startPage, req.url));
   }

   return NextResponse.next();
}

export const config = {
   matcher: ['/', '/ADC/:path*', '/EMG/:path*', '/MRC/:path*', '/LDC/:path*', '/Shared/:path*', '/SEC/:path*', '/FAC/:path*'],
};
