import NextAuth, { customFetch } from "next-auth";
import Google from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "@/lib/db";
import https from "https";

function ipv4Fetch(url: RequestInfo | URL, opts: RequestInit = {}): Promise<Response> {
  return new Promise((resolve, reject) => {
    const u = new URL(url.toString());

    // Handle URLSearchParams, string, or Buffer body
    let body: Buffer | undefined;
    if (opts.body) {
      if (opts.body instanceof URLSearchParams) {
        body = Buffer.from(opts.body.toString());
      } else {
        body = Buffer.from(opts.body as string);
      }
    }

    const req = https.request(
      {
        hostname: u.hostname,
        path: u.pathname + u.search,
        method: opts.method ?? "GET",
        headers: {
          ...(opts.headers as Record<string, string>),
          ...(body ? { "Content-Length": body.length } : {}),
        },
        family: 4,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          const responseBody = Buffer.concat(chunks).toString();
          resolve(new Response(responseBody, {
            status: res.statusCode,
            headers: res.headers as HeadersInit,
          }));
        });
      }
    );
    req.on("error", reject);
    if (body) req.write(body);
    req.end();
  });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      issuer: "https://accounts.google.com",
      authorization: {
        url: "https://accounts.google.com/o/oauth2/v2/auth",
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
      token: "https://oauth2.googleapis.com/token",
      userinfo: "https://openidconnect.googleapis.com/v1/userinfo",
      [customFetch]: ipv4Fetch, // 👈 override fetch for this provider only
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.language = (user as any).language;
        session.user.preferred_qari = (user as any).preferred_qari;
        session.user.preferred_translation = (user as any).preferred_translation;
        session.user.last_opened_page = (user as any).last_opened_page;
      }
      return session;
    },
  },
  debug: true,
  pages: {
    signIn: "/login",
  },
});