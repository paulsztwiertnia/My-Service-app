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
  const [mileage, setMileage] = useState('');

  const sortRecordsByDate = (records: any[]) => {
    return records.sort((a, b) => {
      const dateA = a.serviceDate?.seconds || 0;
      const dateB = b.serviceDate?.seconds || 0;
      return dateB - dateA;
    });
  };

  useEffect(() => {
    const fetchRecords = async () => {
      if (auth.currentUser) {
        const q = query(
          collection(db, "Service Records"), 
          where("userId", "==", auth.currentUser.uid),
        );
        const querySnapshot = await getDocs(q);
        const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecords(sortRecordsByDate(recordsData));
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
        vehicleMileage: Number(mileage),
      });

      setText('');
      setCost('');
      setDate(null);
      setMileage('');
      const q = query(collection(db, "Service Records"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Sort records by service date (latest first)
      const sortedRecords = sortRecordsByDate(recordsData);
      
      setRecords(sortedRecords);
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
      setRecords(sortRecordsByDate(recordsData));
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
      
      // Sort records by service date (latest first)
      const sortedRecords = sortRecordsByDate(recordsData);
      
      setRecords(sortedRecords);
    } catch (error) {
      console.error("Error updating service: ", error);
    }
  };

  return (
    <div className="px-10 mt-10">
      <h2>Add a service record</h2>
      <form onSubmit={handleSubmit} className="flex flex-row gap-2">
        <div className="flex flex-col gap-2">
          <p>Enter the type of service</p>
          <input
            type="text"
            placeholder="Type of Service"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="border p-2 mb-2"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>Enter the mileage at service</p>
          <input
            type="text"
            placeholder="Mileage"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            className="border p-2 mb-2"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>Enter the date of service</p>
          <DatePicker
            selected={date}
            onChange={(date: Date | null) => setDate(date)}
            placeholderText="yyyy/mm/dd"
            dateFormat="yyyy/mm/dd"
            className="p-2 border rounded-md"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>Enter the cost</p>
          <input
            type="number"
            placeholder="Cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            className="border p-2 mb-2"
          />
        </div>
        <div className="flex flex-col mt-8">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2">Submit Service Record</button>
        </div>
      </form>

      <h2>Service Records</h2>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead className="bg-gray-100 text-left text-sm font-medium text-black uppercase">
          <tr>
            <th className="px-6 py-3">Type of Service</th>
            <th className="px-6 py-3">Mileage</th>
            <th className="px-6 py-3">Service Date</th>
            <th className="px-6 py-3">Cost</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {records.map((record) => (
            <tr key={record.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.serviceType}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.vehicleMileage}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record.serviceDate ? new Date(record.serviceDate.seconds * 1000).toLocaleDateString() : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.cost}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-black flex flex-row gap-2">
                <button onClick={() => handleDelete(record.id)} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
                <button onClick={() => handleEdit(record.id)} className="bg-blue-500 text-white px-4 py-2 rounded">Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingRecord && (
        <div className="mt-4">
          <h2>Edit Service Record</h2>
          <form onSubmit={handleUpdate} className="flex flex-row gap-2">
            <div className="flex flex-col gap-2">
              <p>Edit the type of service</p>
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="border p-2 mb-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p>Edit the cost</p>
              <input
                type="number"
                value={editCost}
                onChange={(e) => setEditCost(e.target.value)}
                className="border p-2 mb-2"
              />
            </div>
            <div className="flex flex-row gap-2 mt-8">
              <button type="submit" className="bg-green-500 text-white px-4 py-2">
                Update
              </button>
              <button onClick={() => setEditingRecord(null)} className="bg-yellow-500 text-white px-4 py-2">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 