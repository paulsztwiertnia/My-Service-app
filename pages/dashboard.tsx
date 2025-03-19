import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth"; // Import for checking auth state
import { useRouter } from "next/router"; // Router hook from Next.js for navigation
import { auth } from "../firebase/firebase-config"; // Firebase config for auth
import NavBar from "../src/components/NavBar"; // Navbar component for layout
import ServiceRecords from "../src/components/ServiceRecords";
import VehicleRecords from "../src/components/VehicleRecords";

export default function Dashboard() {
  // State variables
  const [user, setUser] = useState<any>(null); // Stores the authenticated user object
  const [loading, setLoading] = useState(true); // Tracks if data is loading

  const router = useRouter(); // Next.js router instance for navigation

  // Effect for handling authentication state
  useEffect(() => {
    // Check if the user is authenticated
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set user data if authenticated
      } else {
        router.push("/login"); // Redirect to login if not authenticated
      }
      setLoading(false); // Set loading to false once the check is complete
    }, );

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [router]);

  // REPLACE WITH USE SUSPENSE
  // Loading state while data is being fetched
  // if (loading) {
  //   return <p>Loading...</p>; // Display loading message
  // }

  return (
    <div>
      <NavBar /> {/* Navbar component */}
      <div>
        {user ? (
          <div>
            <h1>Welcome, {user.email}</h1>
            {user.displayName && <h1>Name: {user.displayName.split(" ")[0]}</h1>}
            <button onClick={() => auth.signOut()}>
              Sign Out 
            </button>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      
      {/* if user object exists then show vehicle records */}
      {user && <VehicleRecords userId={user.uid} />}

      {/* if user object exists with more than 0 vehicle then show service records */}
      {/* {user && <ServiceRecords userId={user.uid} />} */}
    </div>
  );
}
