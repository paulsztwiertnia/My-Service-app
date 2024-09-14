import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import NavBar from "../src/components/NavBar"; 

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login"); // Redirect to login if not authenticated
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  return (
    <div className="min-h-screen">
      <NavBar /> {/* Include the NavBar */}
      <div className="flex justify-center items-center min-h-screen">
        {user ? (
          <div>
            <h1>Welcome, {user.email}</h1>
            {user.displayName && (
              <h1>Name: {user.displayName.split(" ")[0]}</h1> // Display first name
            )}
            <button
              className="p-2 bg-red-500 text-white"
              onClick={() => auth.signOut()}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
