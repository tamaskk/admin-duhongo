import { connectToDatabase } from "@/db/mongoDB";
import NextAuth, { AuthOptions, Session, User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt", // Use JWT for session strategy
  },
  secret: process.env.NEXTAUTH_SECRET || "default_secret", // Store secrets securely
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required.");
        }

        const client = await connectToDatabase();
        const adminsCollection = client.db().collection("admins");

        // Find user by email
        const admin = await adminsCollection.findOne({ email: credentials.email });

        if (!admin) {
          client.close();
          throw new Error("No user found with this email.");
        }

        // Validate password
        const isPasswordMatch = await bcrypt.compare(
          credentials.password,
          admin.password
        );

        if (!isPasswordMatch) {
          client.close();
          throw new Error("Invalid password.");
        }

        client.close();

        // Return user details to encode into the JWT token
        return {
          id: admin._id.toString(),
          email: admin.email,
        };
      },
    }),
  ],
  callbacks: {
    // Add extra fields to the JWT token
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    // Pass additional fields to the session
    async session({ session, token }) {
      if (token) {
        session.user = {
          email: token.email as string
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login", // Custom sign-in page
    error: "/auth/error", // Error page
  },
};

export default NextAuth(authOptions);
