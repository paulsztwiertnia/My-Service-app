import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { auth } from "../firebase/firebase-config";
import NavBar from "../src/components/NavBar";


export default function Account() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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


    return (
        <div>
            <NavBar />
            <div>
                <h1 className="text-2xl font-bold p-4">Profile</h1>
                {user ? (
                    <div className="flex flex-col p-4">
                        <div className="flex flex-col gap-2 p-4">
                            {user.displayName && <h1>Welcome, {user.displayName.split(" ")[0]}</h1>}
                            <p>{user.email}</p>
                            <button className="bg-blue-500 text-white p-2 rounded-md w-fit" onClick={() => auth.signOut()}>Sign Out</button>
                        </div>
                        <div className="flex flex-col gap-2 p-4">
                            <p className="text-lg font-bold">Personal Information</p>
                            <p>Name: {user.displayName}</p>
                            <p>Email: {user.email}</p>
                        </div>
                        <div className="flex flex-col gap-2 p-4 ">
                            <p className="text-lg font-bold">Preferences</p>
                            <p>Language: English</p>
                            <p>Currency: USD</p>
                            <p>Theme: Light</p>
                            <p>Notifications: On</p>
                            <p>Settings</p>
                        </div>
                    </div>
                ) : (
                    <p>Loading...</p>
                )}
            </div>
        </div>
    );
    
    
}