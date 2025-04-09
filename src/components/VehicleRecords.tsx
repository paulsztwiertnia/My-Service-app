"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase-config";
import { useRouter } from 'next/router';
import { VehicleModal } from "./VehicleModal";

// Props for VehicleRecords
interface VehicleRecordsProps {
  userId?: string;
}

export default function VehicleRecords({ userId }: VehicleRecordsProps) {
  const router = useRouter();
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [vehicleRecords, setVehicleRecords] = useState<any[]>([]);
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

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: currentYear - 1769 + 1 }, (_, i) => i + 1769);

  useEffect(() => {
    const fetchVehicleRecords = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, "Vehicle Records"), where("userId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const vehicleRecordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVehicleRecords(vehicleRecordsData);

        // Get the highest vehicle number for this specific user
        const userVehicleNumbers = vehicleRecordsData
          .map(record => {
            const [, vehicleNum] = record.id.split('_');
            return parseInt(vehicleNum);
          })
          .filter(num => !isNaN(num));
        
        const highestNum = Math.max(0, ...userVehicleNumbers);
        setNextId(highestNum + 1);
      }
    };

    fetchVehicleRecords();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!make || !model || !year || !mileage) {
      console.log("Please provide all vehicle details");
      return;
    }

    try {
      // Create a unique ID combining user ID and vehicle number
      const uniqueId = `${auth.currentUser?.uid}_${nextId}`;
      const docRef = doc(db, "Vehicle Records", uniqueId);
      await setDoc(docRef, {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        dateCreated: new Date().toISOString(),
        vehicleMake: make,
        vehicleModel: model,
        vehicleYear: year,
        vehicleMileage: mileage,
      });

      setMake('');
      setModel('');
      setYear('');
      setMileage('');
      setNextId(nextId + 1);

      const q = query(collection(db, "Vehicle Records"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const vehicleRecordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicleRecords(vehicleRecordsData);
    } catch (error) {
      console.error("Error adding vehicle: ", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "Vehicle Records", id));
      const q = query(collection(db, "Vehicle Records"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const vehicleRecordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicleRecords(vehicleRecordsData);
    } catch (error) {
      console.error("Error deleting vehicle record: ", error);
    }
  };

  const handleDeleteModal = (id: string) => {
    setModal({ show: true, id, mode: 'delete' });
  };

  const handleEditModal = (id: string) => {
    setModal({ show: true, id, mode: 'edit' });
  };

  const handleModalDelete = async (id: string) => {
    await handleDelete(id);
    setModal({ show: false, id: null, mode: 'delete' });
  };

  const handleModalEdit = async (id: string, updates: {
    vehicleMake: string;
    vehicleModel: string;
    vehicleYear: number;
    vehicleMileage: number;
  }) => {
    try {
      const recordRef = doc(db, "Vehicle Records", id);
      await updateDoc(recordRef, updates);
      
      const q = query(collection(db, "Vehicle Records"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const vehicleRecordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicleRecords(vehicleRecordsData);
      
      setModal({ show: false, id: null, mode: 'edit' });
    } catch (error) {
      console.error("Error updating vehicle record: ", error);
    }
  };

  const handleModalCancel = () => {
    setModal({ show: false, id: null, mode: 'delete' });
  };

  const handleViewVehicle = (vehicleId: string) => {
    router.push(`/vehicles/${vehicleId}`);
  };

  return (
    <div className="flex flex-col mt-10">
      <h2>Add a vehicle record</h2>
      <form onSubmit={handleSubmit} className="flex flex-row gap-2">
        <div className="flex flex-col gap-2">
          <p>Enter your Vehicle Make</p>
          <input
            type="text"
            placeholder="Vehicle Make"
            value={make}
            onChange={(e) => setMake(e.target.value)}
            className="border p-2 mb-2"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>Enter your Vehicle Model</p>
          <input
            type="text"
          placeholder="Vehicle Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
            className="border p-2 mb-2"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>Enter your Vehicle Year</p>
          <input
            type="number"
          placeholder="Vehicle Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
            className="border p-2 mb-2"
          />
        </div>
        <div className="flex flex-col gap-2">
          <p>Enter your Vehicle Mileage</p>
          <input
            type="text"
          placeholder="Vehicle Mileage"
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
            className="border p-2 mb-2"
          />
        </div>
        <div className="flex flex-col mt-8">
          <button type="submit" className="bg-blue-500 text-white px-4 py-2">Add Vehicle</button>
        </div>
      </form>

      <h2>Your Vehicle {vehicleRecords.length === 1 ? "" : "s"}</h2>
      <table className="max-w-6xl border-collapse border border-gray-200">
        <thead className="bg-gray-100 text-left text-sm font-medium text-black uppercase">
          <tr>
            <th className="px-6 py-3">Vehicle Make</th>
            <th className="px-6 py-3">Vehicle Model</th>
            <th className="px-6 py-3">Vehicle Year</th>
            <th className="px-6 py-3">Vehicle Mileage</th>
            <th className="px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {vehicleRecords.map((record) => (
            <tr key={record.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.vehicleMake}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.vehicleModel}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.vehicleYear}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.vehicleMileage}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-black flex flex-row gap-2">
                <button 
                  onClick={() => handleDeleteModal(record.id)} 
                  className="delete-button"
                >
                  Delete
                </button>
                <button 
                  onClick={() => handleEditModal(record.id)} 
                  className="edit-button"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleViewVehicle(record.id)}
                  className="view-button"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modal.show && (
        <VehicleModal 
          show={modal.show}
          mode={modal.mode}
          record={vehicleRecords.find(record => record.id === modal.id)}
          onDelete={handleModalDelete}
          onEdit={handleModalEdit}
          onCancel={handleModalCancel}
        />
      )}
    </div>
  );
} 