import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../firebase/firebase-config";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Sign up with email and password
//   const SignupWithEmail = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!email || !password) {
//       <p>Provide a valid email address and password</p>
//       console.error("Provide Email and Password");
//       return;
//     }
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const user = userCredential.user;
//       console.log(user);
//     } catch (error: any) {
//       console.error("Error Code:", error.code, "Error Message:", error.message);
//     }
//   };

  // Sign up with Google
  const SignUpWithGoogle = async () => {
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
    } catch (error: any) {
      console.error("Error Code:", error.code, "Error Message:", error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      {/* <form onSubmit={SignupWithEmail}>
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
        <button type="submit">Sign Up with Email</button>
      </form> */}

      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={SignUpWithGoogle}>Sign Up with Google</button>
    </div>
  );
};

export default SignUp;
