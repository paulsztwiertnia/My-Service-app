"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase-config";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Props for ServiceRecords 
interface ServiceRecordsProps {
  userId?: string;
}

export default function ServiceRecords({ userId }: ServiceRecordsProps) {
  // States for service records
  const [text, setText] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [editText, setEditText] = useState('');
  const [editCost, setEditCost] = useState('');
  const [editDate, setEditDate] = useState<Date | null>(null);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [make, setMake] = useState('');

  useEffect(() => {
    const fetchRecords = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, "Service Records"), where("userId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecords(recordsData);
      }
    };

    fetchRecords();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text || !cost || !date) {
      console.log("Please provide service type, cost, and date.");
      return;
    }

    try {
      await addDoc(collection(db, "Service Records"), {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        dateCreated: new Date().toISOString(),
        cost: Number(cost),
        serviceType: text,
        serviceDate: date,
        vehicleMake: make,
      });

      setText('');
      setCost('');
      setDate(null);
      setMake('');

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

  return (
    <div className="bg-blue-500">
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
        <p>Enter the date of the service</p>
        <div className="mb-10">
          <DatePicker
            selected={date}
            onChange={(date: Date | null) => setDate(date)}
            placeholderText="yyyy/mm/dd"
            dateFormat="yyyy/mm/dd"
            className="p-2 border rounded-md"
          />
        </div>
        <br />
        <button type="submit">Submit</button>
      </form>

      <h2>Service Records</h2>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th>Type of Service</th>
            <th>Cost</th>
            <th>Service Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{record.serviceType}</td>
              <td>{record.cost}</td>
              <td>{record.serviceDate ? new Date(record.serviceDate.seconds * 1000).toLocaleDateString() : "N/A"}</td>
              <td>
                <button onClick={() => handleDelete(record.id)}>Delete</button>
                <button onClick={() => handleEdit(record.id)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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
            <button type="submit" className="bg-blue-500 text-white px-4 py-2">
              Update
            </button>
          </form>
        </div>
      )}
    </div>
  );
} 