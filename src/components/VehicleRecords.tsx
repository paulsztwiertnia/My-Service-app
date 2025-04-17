"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, doc, deleteDoc, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase-config";
import { useRouter } from 'next/router';
import { VehicleModal } from "./VehicleModal";
import { getMake } from "../../pages/utils/getMake";
import getMakeModel from "../../pages/utils/getMakeModel";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import CircularProgress from '@mui/material/CircularProgress';

interface VehicleMake {
  MakeId: number;
  MakeName: string;
}

interface VehicleModel {
  Make_ID: number;
  Make_Name: string;
  Model_ID: number;
  Model_Name: string;
}

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
  const [modal, setModal] = useState<{ 
    show: boolean; 
    id: string | null; 
    mode: 'delete' | 'edit' 
  }>({ 
    show: false, 
    id: null, 
    mode: 'delete' 
  });
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMake, setSelectedMake] = useState("");
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [modelsOpen, setModelsOpen] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [makes, setMakes] = useState<VehicleMake[]>([]);

  const currentYear = new Date().getFullYear();
  const minYear = 1769;
  const maxYear = currentYear + 1;

  const validateYear = (value: string): boolean => {
    const yearNum = parseInt(value);
    return !isNaN(yearNum) && yearNum >= minYear && yearNum <= maxYear;
  };

  useEffect(() => {
    getMake()
      .then((data) => setMakes(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const fetchVehicleRecords = async () => {
      if (auth.currentUser) {
        const vehiclesRef = collection(db, `users/${auth.currentUser.uid}/vehicles`);
        const querySnapshot = await getDocs(vehiclesRef);
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

    if (!validateYear(year)) {
      console.log(`Vehicle year must be between ${minYear} and ${maxYear}`);
      return;
    }

    try {
      const vehiclesRef = collection(db, `users/${auth.currentUser?.uid}/vehicles`);
      const docRef = doc(vehiclesRef);
      await setDoc(docRef, {
        make: make,
        model: model,
        year: year,
        mileage: mileage,
        dateAdded: new Date()
      });

      setMake('');
      setModel('');
      setYear('');
      setMileage('');

      const querySnapshot = await getDocs(vehiclesRef);
      const vehicleRecordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicleRecords(vehicleRecordsData);
    } catch (error) {
      console.error("Error adding vehicle: ", error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, `users/${auth.currentUser?.uid}/vehicles/${id}`));
      const vehiclesRef = collection(db, `users/${auth.currentUser?.uid}/vehicles`);
      const querySnapshot = await getDocs(vehiclesRef);
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
      const recordRef = doc(db, `users/${auth.currentUser?.uid}/vehicles/${id}`);
      await updateDoc(recordRef, {
        make: updates.vehicleMake,
        model: updates.vehicleModel,
        year: updates.vehicleYear,
        mileage: updates.vehicleMileage
      });
      
      const vehiclesRef = collection(db, `users/${auth.currentUser?.uid}/vehicles`);
      const querySnapshot = await getDocs(vehiclesRef);
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

  const fetchModels = async (make: string) => {
    if (!make) return;
    setIsLoadingModels(true);
    try {
      const modelData = await getMakeModel(make);
      setModels(modelData);
      setModelsOpen(true);
    } catch (error) {
      console.error("Error fetching models:", error);
      setModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  return (
    <div className="flex flex-col mt-10"> 
      <h2>Add a vehicle record</h2>
      <form onSubmit={handleSubmit} className="flex flex-row gap-2 pb-6">
        <div className="flex flex-col gap-2">
          <div className="relative">
            
            <button 
              type="button"
              className="px-4 py-2 text-left border text-slate-400 w-[200px] flex flex-row justify-between"
              onClick={() => setIsOpen(!isOpen)}
            >
              <p className="text-md text-gray-600">{selectedMake || "Select make"}</p>
              {isOpen ? <ExpandLessIcon sx={{ fontSize: '24px' }} /> : <ExpandMoreIcon sx={{ fontSize: '24px' }} />}
            </button>
            
            {isOpen && (
              <div className="absolute z-10 w-[200px] mt-1 bg-white border rounded-md shadow-lg max-h-96 overflow-y-auto">
                <ul>
                  {makes.map((make, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => {
                        setSelectedMake(make.MakeName);
                        setMake(make.MakeName);
                        setModel('');
                        setModels([]);
                        setModelsOpen(false);
                        fetchModels(make.MakeName);
                        setIsOpen(false);
                      }}
                    >
                      <p className="text-md text-gray-600">{make.MakeName}</p>
                    </div>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
        </div>
        <div className="flex flex-col gap-2">
          <div className="relative">

            <button
              type="button"
              onClick={() => setModelsOpen(!modelsOpen)}
              className="px-4 py-2 text-left border text-slate-400 w-[200px] flex flex-row justify-between"
              disabled={isLoadingModels || !selectedMake}
            >
            { selectedMake && (
              <p className="text-md text-gray-600">{isLoadingModels 
                ? <CircularProgress size={12} />
                : model || "Select a model"}
              </p>

            )}
            { !selectedMake && (
              <p className="text-md text-gray-600 cursor-not-allowed">Select a make</p>
            )}
              { modelsOpen ? <ExpandLessIcon sx={{ fontSize: '24px' }} /> : <ExpandMoreIcon sx={{ fontSize: '24px' }} />}
            </button>
            
            
            {modelsOpen && models.length > 0 && (
              <div className="absolute z-10 w-[200px] mt-1 bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto">
                {models.map((modelItem: VehicleModel, index) => (
                  <div
                    key={modelItem.Model_ID}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setModel(modelItem.Model_Name);
                      setModelsOpen(false);
                    }}
                  >
                    <p className="text-md text-gray-600">{modelItem.Model_Name}</p>
                    
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <input
            type="number"
            placeholder="Vehicle Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            min={minYear}
            max={maxYear}
            onBlur={(e) => {
              const value = e.target.value;
              if (value && !validateYear(value)) {
                alert(`Please enter a year between ${minYear} and ${maxYear}`);
                setYear('');
              }
            }}
            className="border p-2 mb-2 w-[200px]" 
          />
        </div>
        <div className="flex flex-col gap-2">
          <input
            type="text"
            placeholder="Vehicle Mileage"
            value={mileage}
            onChange={(e) => setMileage(e.target.value)}
            className="border p-2 mb-2"
          />
        </div>
        <div className="flex flex-col mt-8">
          <button type="submit" className="blue-button-2">Add Vehicle</button>
        </div>
      </form>

      <h2>Your Vehicle{vehicleRecords.length === 1 ? "" : "s"}</h2>
      <table className="max-w-6xl border-collapse border border-gray-200 mt-2">
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
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.make}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.model}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.year}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{record.mileage}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-black flex flex-row gap-2">
                <button 
                  onClick={() => handleDeleteModal(record.id)} 
                  className="red-button"
                >
                  Delete
                </button>
                <button 
                  onClick={() => handleEditModal(record.id)} 
                  className="blue-button"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleViewVehicle(record.id)}
                  className="green-button"
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