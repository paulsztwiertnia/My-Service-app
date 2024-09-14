import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { auth } from "../firebase/firebase-config"; 
import NavBar from "../src/components/NavBar"; 

const db = getFirestore(); 

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true); 
  const [text, setText] = useState(''); 
  const [cost, setCost] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/login"); 
      }
      setLoading(false); 
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return <p>Loading...</p>; 
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text || !cost) {
      console.log("Please fill in all fields");
      return;
    }

    try {
      await addDoc(collection(db, "Service Records"), {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email, 
        cost: Number(cost),
        serviceType: text,
        date: new Date().toISOString(),
      });
      console.log('Service added!');
      setText('');
      setCost('');
    } catch (error) {
      console.error("Error adding service: ", error);
    }
  };

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="flex justify-center items-center min-h-screen">
        {user ? (
          <div>
            <h1>Welcome, {user.email}</h1>
            {user.displayName && <h1>Name: {user.displayName.split(" ")[0]}</h1>}
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
      <div>
        <h2>Enter a new record</h2>
        <form onSubmit={handleSubmit}>
          <p>Enter the type of service</p>
          <input
            type="text"
            placeholder="Type of Service"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          <p>Enter the cost</p>
          <input
            type="number"
            placeholder="Cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
          />
          
          <button type="submit" className="text-black p-2">Submit</button>
        </form>
      </div>
    </div>
  );
}
