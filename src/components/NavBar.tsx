// src/components/NavBar.tsx (example path)
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Link from "next/link";

export default function NavBar() {
  const [user, setUser] = useState<any>(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <nav>
      <Link href="/">Home</Link>
      {user ? (
        <>
          <Link href="/dashboard">Dashboard</Link>
          <button onClick={() => auth.signOut()}>Sign Out</button>
        </>
      ) : (
        <Link href="/auth/login">Sign In</Link>
      )}
    </nav>
  );
}
