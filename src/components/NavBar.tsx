// src/components/NavBar.tsx (example path)
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import Image from "next/image";

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
    <nav >
      <div className="flex flex-row justify-between gap-2">
        <div>
        <Link href="/signup">
          <Image src="/drive-wise-website-logo.png" alt="logo" width={200} height={150} />
        </Link>
        </div>
      
        <div>
          <Link className="px-4" href="/">Home</Link>
          {user ? (
            <>
              <Link className="px-4" href="/dashboard">Dashboard</Link>
              <Link className="px-4" href="/account">Account</Link>
              <button className="px-4" onClick={() => auth.signOut()}>Sign Out</button>
            </>
          ) : (
              <Link className="px-4" href="/auth/login">Sign In</Link>
            )}
        </div>
      </div>
    </nav>
  );
}
