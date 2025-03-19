"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase-config";
import { useRouter } from 'next/router';

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
  const [editMake, setEditMake] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editMileage, setEditMileage] = useState('');
  const [editingVehicleRecord, setEditingVehicleRecord] = useState<any>(null);
  const [vehicleRecords, setVehicleRecords] = useState<any[]>([]);
  const [nextId, setNextId] = useState(1);

  useEffect(() => {
    const fetchVehicleRecords = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, "Vehicle Records"), where("userId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const vehicleRecordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVehicleRecords(vehicleRecordsData);

        const numericIds = vehicleRecordsData
          .map(record => parseInt(record.id))
          .filter(id => !isNaN(id));
        const highestId = Math.max(0, ...numericIds);
        setNextId(highestId + 1);
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
      const docRef = doc(db, "Vehicle Records", nextId.toString());
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

  const handleEdit = async (id: string) => {
    try {
      const vehicleRecordToEdit = vehicleRecords.find(record => record.id === id);
      if (vehicleRecordToEdit) {
        setEditingVehicleRecord(vehicleRecordToEdit);
        setEditMake(vehicleRecordToEdit.vehicleMake);
        setEditModel(vehicleRecordToEdit.vehicleModel);
        setEditYear(vehicleRecordToEdit.vehicleYear);
        setEditMileage(vehicleRecordToEdit.vehicleMileage);
      }
    } catch (error) {
      console.error("Error fetching record for edit: ", error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingVehicleRecord) {
      console.log("No vehicle record is being edited.");
      return;
    }

    try {
      const recordRef = doc(db, "Vehicle Records", editingVehicleRecord.id);
      await updateDoc(recordRef, {
        vehicleMake: editMake,
        vehicleModel: editModel,
        vehicleYear: editYear,
        vehicleMileage: editMileage,
      });

      setEditingVehicleRecord(null);
      setEditMake('');
      setEditModel('');
      setEditYear('');
      setEditMileage('');

      const q = query(collection(db, "Vehicle Records"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const vehicleRecordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicleRecords(vehicleRecordsData);
    } catch (error) {
      console.error("Error updating vehicle record: ", error);
    }
  };

  const handleViewVehicle = (vehicleId: string) => {
    router.push(`/vehicles/${vehicleId}`);
  };

  return (
    <div className="px-10 mt-10">
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
            type="text"
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
          <button type="submit" className="bg-blue-500 text-white px-4 py-2">Submit Vehicle Record</button>
        </div>
      </form>

      <h2>Your Vehicles</h2>
      <table className="min-w-full border-collapse border border-gray-200">
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
            <tr key={record.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.vehicleMake}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.vehicleModel}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.vehicleYear}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.vehicleMileage}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-black flex flex-row gap-2">
                <button onClick={() => handleDelete(record.id)} className="bg-red-500 text-white px-4 py-2 rounded">Delete</button>
                <button onClick={() => handleEdit(record.id)} className="bg-blue-500 text-white px-4 py-2 rounded">Edit</button>
                <button 
                  onClick={() => handleViewVehicle(record.id)}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingVehicleRecord && (
        <div className="mt-4">
          <h2>Edit Vehicle Record</h2>
          <form onSubmit={handleUpdate} className="flex flex-row gap-2">
            <div className="flex flex-col gap-2">
              <p>Edit Vehicle Make</p>
              <input
                type="text"
                value={editMake}
                onChange={(e) => setEditMake(e.target.value)}
                className="border p-2 mb-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p>Edit the Vehicle Model</p>
              <input
                type="text"
              value={editModel}
              onChange={(e) => setEditModel(e.target.value)}
              className="border p-2 mb-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p>Edit the Vehicle Year</p>
              <input
                type="text"
                value={editYear}
              onChange={(e) => setEditYear(e.target.value)}
              className="border p-2 mb-2"
              />
            </div>
            <div className="flex flex-col gap-2">
              <p>Edit the Vehicle Mileage</p>
              <input
                type="text"
              value={editMileage}
              onChange={(e) => setEditMileage(e.target.value)}
                className="border p-2 mb-2"
              />
            </div>
            <div className="flex flex-row gap-2 mt-8">
              <button type="submit" className="bg-green-500 text-white px-4 py-2">
                Update
              </button>
              <button onClick={() => setEditingVehicleRecord(null)} className="bg-yellow-500 text-white px-4 py-2">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
} 