"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase-config";

// Props for VehicleRecords
interface VehicleRecordsProps {
  userId?: string;
}

export default function VehicleRecords({ userId }: VehicleRecordsProps) {
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

  useEffect(() => {
    const fetchVehicleRecords = async () => {
      if (auth.currentUser) {
        const q = query(collection(db, "Vehicle Records"), where("userId", "==", auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        const vehicleRecordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setVehicleRecords(vehicleRecordsData);
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
      await addDoc(collection(db, "Vehicle Records"), {
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

  return (
    <div className="bg-red-600">
      <h2>Enter your Vehicles information</h2>
      <form onSubmit={handleSubmit}>
        <p>Enter your Vehicle Make</p>
        <input
          type="text"
          placeholder="Vehicle Make"
          value={make}
          onChange={(e) => setMake(e.target.value)}
        />
        <p>Enter your Vehicle Model</p>
        <input
          type="text"
          placeholder="Vehicle Model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
        />
        <p>Enter your Vehicle Year</p>
        <input
          type="text"
          placeholder="Vehicle Year"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <p>Enter your Vehicle Mileage</p>
        <input
          type="text"
          placeholder="Vehicle Mileage"
          value={mileage}
          onChange={(e) => setMileage(e.target.value)}
        />
        <br />
        <button type="submit">Submit Vehicle Record</button>
      </form>

      <h2>Vehicle Records</h2>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr>
            <th>Vehicle Make</th>
            <th>Vehicle Model</th>
            <th>Vehicle Year</th>
            <th>Vehicle Mileage</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicleRecords.map((record) => (
            <tr key={record.id}>
              <td>{record.vehicleMake}</td>
              <td>{record.vehicleModel}</td>
              <td>{record.vehicleYear}</td>
              <td>{record.vehicleMileage}</td>
              <td>
                <button onClick={() => handleDelete(record.id)}>Delete</button>
                <button onClick={() => handleEdit(record.id)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingVehicleRecord && (
        <div className="mt-4">
          <h2>Edit Vehicle Record</h2>
          <form onSubmit={handleUpdate}>
            <p>Edit Vehicle Make</p>
            <input
              type="text"
              value={editMake}
              onChange={(e) => setEditMake(e.target.value)}
              className="border p-2 mb-2"
            />
            <p>Edit the Vehicle Model</p>
            <input
              type="text"
              value={editModel}
              onChange={(e) => setEditModel(e.target.value)}
              className="border p-2 mb-2"
            />
            <p>Edit the Vehicle Year</p>
            <input
              type="text"
              value={editYear}
              onChange={(e) => setEditYear(e.target.value)}
              className="border p-2 mb-2"
            />
            <p>Edit the Vehicle Mileage</p>
            <input
              type="text"
              value={editMileage}
              onChange={(e) => setEditMileage(e.target.value)}
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