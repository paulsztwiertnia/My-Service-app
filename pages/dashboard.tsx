import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/router";
import { auth, db } from "../firebase/firebase-config"; 
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc } from "firebase/firestore";
import NavBar from "../src/components/NavBar";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [cost, setCost] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [editingRecord, setEditingRecord] = useState<any>(null); 
  const [editText, setEditText] = useState('');
  const [editCost, setEditCost] = useState('');
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

  useEffect(() => {
    const fetchRecords = async () => {
      if (user) {
        const q = query(collection(db, "Service Records"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecords(recordsData);
      }
    };

    fetchRecords();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text || !cost) {
      console.log("Please provide both service type and cost.");
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
      console.log('Service record added successfully.');

      setText('');
      setCost('');

      const q = query(collection(db, "Service Records"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(recordsData);
    } catch (error) {
      console.error("Error adding service: ", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "Service Records", id));
      console.log('Service record deleted successfully.');
      const q = query(collection(db, "Service Records"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(recordsData);
    } catch (error) {
      console.error("Error deleting service: ", error);
    }
  };

  const handleEdit = async (id: string) => {
    try {
      const recordToEdit = records.find(record => record.id === id);
      if (recordToEdit) {
        setEditingRecord(recordToEdit);
        setEditText(recordToEdit.serviceType);
        setEditCost(recordToEdit.cost.toString());
      }
    } catch (error) {
      console.error("Error fetching record for edit: ", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingRecord) {
      console.log("No record is being edited.");
      return;
    }

    try {
      const recordRef = doc(db, "Service Records", editingRecord.id);
      await updateDoc(recordRef, {
        serviceType: editText,
        cost: Number(editCost),
      });
      console.log('Service record updated successfully.');
      setEditingRecord(null);
      setEditText('');
      setEditCost('');
      const q = query(collection(db, "Service Records"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(recordsData);
    } catch (error) {
      console.error("Error updating service: ", error);
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div className="min-h-screen">
      <NavBar />
      <div className="flex justify-center items-center min-h-screen">
        {user ? (
          <div>
            <h1>Welcome, {user.email}</h1>
            {user.displayName && <h1>Name: {user.displayName.split(" ")[0]}</h1>}
            <button
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
        <form onSubmit={handleSubmit} className="mb-4">
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
          <button type="submit" >Submit</button>
        </form>
        <h2>Service Records</h2>
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th>Type of Service</th>
              <th>Cost</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>{record.serviceType}</td>
                <td>{record.cost}</td>
                <td>
                  <button
                    onClick={() => handleDelete(record.id)}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => handleEdit(record.id)}
                    className="text-blue-500"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingRecord && (
        <div className="mt-4">
          <h2>Edit Record</h2>
          <form onSubmit={handleUpdate}>
            <p>Edit the type of service</p>
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="border p-2 mb-2"
            />
            <p>Edit the cost</p>
            <input
              type="number"
              value={editCost}
              onChange={(e) => setEditCost(e.target.value)}
              className="border p-2 mb-2"
            />
            <button type="submit">Update</button>
            <button
              type="button"
              onClick={() => {
                setEditingRecord(null);
                setEditText('');
                setEditCost('');
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
