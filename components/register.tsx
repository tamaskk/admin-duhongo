import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

const RegisterComponent = () => {
  const [userData, setUserData] = useState({ userName: "", password: "", passwordAgain: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const { data: session, status } = useSession();

//   useEffect(() => {
//     if (status === "loading") return;
    
//     if (session) {
//       router.push('/blog-posts')
//     }
//   }, [session, status, router])

  const loginHandler = async () => {
    if (userData.userName === "" || userData.password === "") {
      alert("Töltsd ki az összes mezőt!");
      return;
    }

    try {
      setLoading(true);
      const result = await signIn("credentials", {
        redirect: false,
        email: userData.userName,
        password: userData.password,
        callbackUrl: "/blog-posts",
      });

      if (result?.error) {
        alert(result.error);
        setLoading(false);
        return;
      }

      setLoading(false);
      router.push("/blog-posts");
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-700">Regisztráció</h1>
        
        <div className="mb-4">
          <label htmlFor="username" className="block text-gray-600 mb-2">Felhasználónév</label>
          <input
            id="username"
            type="text"
            placeholder="Felhasználónév"
            value={userData.userName}
            className="w-full p-3 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={(e) => setUserData({ ...userData, userName: e.target.value })}
          />
        </div>
        
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-600 mb-2">Jelszó</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Jelszó"
              className="w-full p-3 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userData.password}
              onChange={(e) => setUserData({ ...userData, password: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
            >
              {!showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="passwordagain" className="block text-gray-600 mb-2">Jelszó újra</label>
          <div className="relative">
            <input
              id="passwordagain"
              type={showPassword ? "text" : "password"}
              placeholder="Jelszó újra"
              className="w-full p-3 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={userData.passwordAgain}
              onChange={(e) => setUserData({ ...userData, passwordAgain: e.target.value })}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500"
            >
              {!showPassword ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        
        <button
          onClick={loginHandler}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-300"
          disabled={loading}
        >
          {loading ? "Bejelentkezés..." : "Bejelentkezés"}
        </button>
      </div>
    </div>
  );
};

export default RegisterComponent;
