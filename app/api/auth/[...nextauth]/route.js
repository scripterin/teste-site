import NextAuth from 'next-auth';
import DiscordProvider from 'next-auth/providers/discord';

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: {
          scope: 'identify',

        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.discordId = profile.id;
        token.username = profile.username;
        token.discriminator = profile.discriminator;
        token.avatar = profile.avatar;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.discordId = token.discordId;
        session.user.username = token.username;
        session.user.discriminator = token.discriminator;
        session.user.avatar = token.avatar
          ? `https://cdn.discordapp.com/avatars/${token.discordId}/${token.avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/${parseInt(token.discriminator || '0') % 5}.png`;
        delete session.user.email;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  secret: process.env.NEXTAUTH_SECRET ?? "b5SKikTFcEzlu5bO0qoUneiaeX8PtLnj",
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, 
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',

      },
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };