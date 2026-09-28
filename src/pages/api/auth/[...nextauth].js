import NextAuth from 'next-auth/next';
import CredentialsProvider from 'next-auth/providers/credentials';

import { getTokenAPI } from '../../../services';
import { customAxios } from '../../../hooks';
import { decryptOnlyFront, encrypt, findErrorOrMessage, getFirstTwoLetters } from '../../../helpers';
import { pagesByPerfil } from '../../../helpers/config';

export const authOptions = {
   providers: [
      CredentialsProvider({
         name: 'EASY Login',
         credentials: {},
         async authorize(credentials) {
            try {
               const resToken = await getTokenAPI();
               if (resToken?.status !== 200) {
                  throw new Error(resToken?.message);
               }

               const { parseInfo } = credentials;
               let { userName, password } = JSON.parse(decryptOnlyFront(parseInfo));
               const uidd = crypto.randomUUID();
               let headers = {
                  'X-Trace-Id': uidd,
                  'X-Client-Secret': uidd,
                  Authorization: 'Bearer ' + (resToken?.token || undefined),
               };

               let data = JSON.stringify({ userName, password: encrypt(password) });

               const result = await customAxios('/v1/auth/login', 'POST', headers, data);
               if (result.status !== 200) {
                  let msj = findErrorOrMessage(result);
                  throw new Error(msj || 'Ocurrió un error al intentar iniciar sesión');
               }

               const { firstName, secondName, secondSurname, firstSurname, idProfile, ...others } = result.data;
               let fullName = firstName + ' ' + firstSurname;
               return {
                  ...others,
                  firstLetters: getFirstTwoLetters(fullName),
                  fullName,
                  idProfile,
                  settings: pagesByPerfil[idProfile],
               };
            } catch (error) {
               throw new Error(error?.message);
            }
         },
      }),
   ],
   pages: {
      signIn: '/Login',
      error: '/Login',
   },
   secret: process.env.NEXTAUTH_SECRET,
   session: {
      //* Maximum session duration in seconds
      maxAge: 14400,
      strategy: 'jwt',
      //* Frequency with which the session is refreshed in seconds
      updateAge: 3600,
   },
   jwt: {},
   callbacks: {
      async jwt({ token, account, user }) {
         if (account) {
            token.user = { ...user };
         }
         return token;
      },
      async session({ session, token }) {
         session.user = { ...token.user };
         return session;
      },
   },
};

export default NextAuth(authOptions);
