import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { neon } from '@neondatabase/serverless';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const sql = neon(process.env.DATABASE_URL!);
        const rows = await sql`SELECT * FROM users WHERE email = ${credentials.email as string} LIMIT 1`;
        const user = rows[0];
        if (!user) return null;
        const valid = await bcrypt.compare(credentials.password as string, user.password_hash as string);
        if (!valid) return null;
        return { id: String(user.id), name: user.name as string, email: user.email as string, role: user.role as string };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string | undefined;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
});
