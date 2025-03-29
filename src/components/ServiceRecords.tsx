"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase-config";
import { CalendarComponent } from "./calendar";
import { ServiceModal } from './ServiceModal';

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
  const [editMileage, setEditMileage] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [mileage, setMileage] = useState('');
  const [nextId, setNextId] = useState(1);
  const [modal, setModal] = useState<{ 
    show: boolean; 
    id: string | null; 
    mode: 'delete' | 'edit' 
  }>({ 
    show: false, 
    id: null, 
    mode: 'delete' 
  });

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
        
        // Get the highest service number for this specific user
        const userServiceNumbers = recordsData
          .map(record => {
            const [, serviceNum] = record.id.split('_');
            return parseInt(serviceNum);
          })
          .filter(num => !isNaN(num));
        
        const highestNum = Math.max(0, ...userServiceNumbers);
        setNextId(highestNum + 1);
        
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
      // Create a unique ID combining user ID and service number
      const uniqueId = `${auth.currentUser?.uid}_${nextId}`;
      const docRef = doc(db, "Service Records", uniqueId);
      await setDoc(docRef, {
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
      setNextId(nextId + 1);

      const q = query(collection(db, "Service Records"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(sortRecordsByDate(recordsData));
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
        setEditDate(recordToEdit.serviceDate ? new Date(recordToEdit.serviceDate.seconds * 1000) : null);
        setEditMileage(recordToEdit.vehicleMileage.toString());
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
      setEditDate(null);
      setEditMileage('');

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

  const handleDeleteModal = (id: string) => {
    setModal({ show: true, id, mode: 'delete' });
  };

  const handleEditModal = (id: string) => {
    setModal({ show: true, id, mode: 'edit' });
  };

  const handleModalDelete = (id: string) => {
    handleDelete(id);
    setModal({ show: false, id: null, mode: 'delete' });
  };

  const handleModalEdit = async (id: string, updates: { 
    serviceType: string; 
    cost: number;
    serviceDate: Date;
    vehicleMileage: number;
  }) => {
    try {
      const recordRef = doc(db, "Service Records", id);
      await updateDoc(recordRef, updates);
      
      const q = query(collection(db, "Service Records"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(sortRecordsByDate(recordsData));
      
      setModal({ show: false, id: null, mode: 'edit' });
    } catch (error) {
      console.error("Error updating service: ", error);
    }
  };

  const handleModalCancel = () => {
    setModal({ show: false, id: null, mode: 'delete' });
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
            type="number"
            placeholder="Mileage"
            value={mileage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || !isNaN(Number(value))) {
                setMileage(value);
              }
            }}
            min={0}
            className="border p-2"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>Enter the date of service</p>
          <CalendarComponent 
            date={date} 
            onSelect={(selectedDate) => setDate(selectedDate || null)} 
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>Enter the cost</p>
          <input
            type="number"
            placeholder="Cost"
            value={cost}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || !isNaN(Number(value))) {
                setCost(value);
              }
            }}
            min={0}
            className="border p-2"
          />
        </div>
        <div className="flex flex-row gap-2 mt-8">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2">Submit Service Record</button>
          <button onClick={() => {
            setText('');
            setCost('');
            setDate(null);
            setMileage('');
          }} className="bg-red-500 text-white px-4 py-2">Clear</button>
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
            <tr key={record.id} className="hover:bg-gray-200">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.serviceType}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.vehicleMileage}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {record.serviceDate ? new Date(record.serviceDate.seconds * 1000).toLocaleDateString() : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${record.cost}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-black flex flex-row gap-2">
                <button 
                  onClick={() => handleDeleteModal(record.id)} 
                  className="bg-red-500 text-white px-4 py-2 rounded"
                >
                  Delete
                </button>
                <button 
                  onClick={() => handleEditModal(record.id)} 
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal.show && (
        <ServiceModal 
          show={modal.show}
          mode={modal.mode}
          record={records.find(record => record.id === modal.id)}
          onDelete={handleModalDelete}
          onEdit={handleModalEdit}
          onCancel={handleModalCancel}
        />
      )}
    </div>
  );
} 