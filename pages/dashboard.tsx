import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth"; // Import for checking auth state
import { useRouter } from "next/router"; // Router hook from Next.js for navigation
import { auth } from "../firebase/firebase-config"; // Firebase config for auth
import NavBar from "../src/components/NavBar"; // Navbar component for layout
//import ServiceRecords from "../src/components/ServiceRecords";
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


  return (
    <div>
      <div className="">
        <NavBar />
      </div>
      
      <div className="flex flex-col justify-center items-center mx-10 mt-10">
        {user && <VehicleRecords userId={user.uid} />}
      </div>
    </div>
  );
}
