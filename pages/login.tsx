import { useState } from 'react';
import { useRouter } from 'next/router';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase/firebase-config";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter(); // Initialize router

  // Sign in with email and password
  // const SignInWithEmail = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   if (!email || !password) {
  //     console.error("Provide Email and Password");
  //     return;
  //   }
  //   try {
  //     const userCredential = await signInWithEmailAndPassword(auth, email, password);
  //     const user = userCredential.user;
  //     console.log(user);
  //     router.push("/dashboard"); 
  //   } catch (error: any) {
  //     console.error("Error Code:", error.code, "Error Message:", error.message);
  //   }
  // };

  // Sign in with Google
  const SignInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential) {
        console.error("Error in user Credential");
        return;
      }
      const token = credential.accessToken;
      const user = result.user;
      console.log("Google Sign-in successful", user, token);
      router.push("/dashboard"); // Redirect to dashboard after Google login
    } catch (error: any) {
      console.error("Error Code:", error.code, "Error Message:", error.message);
    }
  };

  return (
    <>
    <div>
      {/* <form onSubmit={SignInWithEmail}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit">Sign In with Email</button>
      </form> */}

      <button onClick={SignInWithGoogle}>Sign In with Google</button>
    </div>
    <div className="bg-blue-500 min-h-screen flex items-center justify-center">
      <h1 className="text-white">Login Page</h1>
    </div>
    </>
  );
};

export default Login;
