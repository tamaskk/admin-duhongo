import LoginComponent from "@/components/login";
import { SessionProvider } from "next-auth/react";
import Head from "next/head";

const Login = () => {
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <Head>
        <title>Admin Eliteperformance</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SessionProvider>
        <LoginComponent />
      </SessionProvider>
    </div>
  );
};

export default Login;
