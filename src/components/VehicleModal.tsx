import { useState, useEffect } from 'react';
import { CalendarComponent } from "./calendar";
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

interface VehicleRecord {
  id: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;
  vehicleMileage: number;
  serviceDate: {
    seconds: number;
  };
  cost: number;
}

interface VehicleModalProps {
  show: boolean;
  record: VehicleRecord;
  mode: 'delete' | 'edit';
  onDelete?: (id: string) => void;
  onEdit?: (id: string, updates: { 
    vehicleMake: string; 
    vehicleModel: string;
    vehicleYear: number;
    vehicleMileage: number;
  }) => void;
  onCancel: () => void;
}

export const VehicleModal = ({ show, record, mode, onDelete, onEdit, onCancel }: VehicleModalProps) => {
  const [editMake, setEditMake] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editMileage, setEditMileage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMake, setSelectedMake] = useState("");
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [modelsOpen, setModelsOpen] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [makes, setMakes] = useState<VehicleMake[]>([]);

  // Year validation constants
  const currentYear = new Date().getFullYear();
  const minYear = 1769;
  const maxYear = currentYear + 1;

  const validateYear = (value: string): boolean => {
    const yearNum = parseInt(value);
    return !isNaN(yearNum) && yearNum >= minYear && yearNum <= maxYear;
  };

  // Fetch makes on component mount
  useEffect(() => {
    getMake()
      .then((data) => setMakes(data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (record && mode === 'edit') {
      setEditMake(record.vehicleMake);
      setSelectedMake(record.vehicleMake);
      setEditModel(record.vehicleModel);
      setEditYear(record.vehicleYear.toString());
      setEditMileage(record.vehicleMileage.toString());
      // Fetch models for the current make
      if (record.vehicleMake) {
        fetchModels(record.vehicleMake);
      }
    }
  }, [record, mode]);

  const fetchModels = async (make: string) => {
    if (!make) return;
    setIsLoadingModels(true);
    try {
      const modelData = await getMakeModel(make);
      setModels(modelData);
    } catch (error) {
      console.error("Error fetching models:", error);
      setModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  if (!show || !record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!editMake || !editModel || !editYear || !editMileage) {
      alert("Please provide all vehicle details");
      return;
    }

    if (!validateYear(editYear)) {
      alert(`Vehicle year must be between ${minYear} and ${maxYear}`);
      return;
    }

    if (mode === 'edit' && onEdit) {
      onEdit(record.id, {
        vehicleMake: editMake,
        vehicleModel: editModel,
        vehicleYear: Number(editYear),
        vehicleMileage: Number(editMileage)
      });
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg w-[500px]">
        {mode === 'delete' ? (
          <>
            <h2 className="text-lg font-bold mb-4">Are you sure you want to delete this vehicle record?</h2>
            <div className="mb-4">
              <p><strong>Make:</strong> {record.vehicleMake}</p>
              <p><strong>Model:</strong> {record.vehicleModel}</p>
              <p><strong>Year:</strong> {record.vehicleYear}</p>
              <p><strong>Mileage:</strong> {record.vehicleMileage}</p>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={() => onDelete?.(record.id)} 
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete
              </button>
              <button 
                onClick={onCancel} 
                className="bg-gray-300 text-black px-4 py-2 rounded ml-2"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-lg font-bold mb-4">Edit Vehicle Record</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <p>Vehicle Make</p>
                <div className="relative">
                  <button 
                    type="button"
                    className="px-4 py-2 text-left border text-slate-400 w-full flex flex-row justify-between"
                    onClick={() => setIsOpen(!isOpen)}
                  >
                    <p className="text-md text-gray-600">{selectedMake || "Select make"}</p>
                    {isOpen ? <ExpandLessIcon sx={{ fontSize: '24px' }} /> : <ExpandMoreIcon sx={{ fontSize: '24px' }} />}
                  </button>
                  
                  {isOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border rounded-md shadow-lg max-h-96 overflow-y-auto">
                      <ul>
                        {makes.map((make) => (
                          <div
                            key={make.MakeId}
                            className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                              setSelectedMake(make.MakeName);
                              setEditMake(make.MakeName);
                              setEditModel('');
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
                <p>Vehicle Model</p>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setModelsOpen(!modelsOpen)}
                    className="px-4 py-2 text-left border text-slate-400 w-full flex flex-row justify-between"
                    disabled={isLoadingModels || !selectedMake}
                  >
                    {selectedMake && (
                      <p className="text-md text-gray-600">
                        {isLoadingModels 
                          ? <CircularProgress size={12} />
                          : editModel || "Select a model"}
                      </p>
                    )}
                    {!selectedMake && (
                      <p className="text-md text-gray-600 cursor-not-allowed">Select a make</p>
                    )}
                    {modelsOpen ? <ExpandLessIcon sx={{ fontSize: '24px' }} /> : <ExpandMoreIcon sx={{ fontSize: '24px' }} />}
                  </button>
                  
                  {modelsOpen && models.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border rounded-md shadow-lg max-h-64 overflow-y-auto">
                      {models.map((modelItem) => (
                        <div
                          key={modelItem.Model_ID}
                          className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                          onClick={() => {
                            setEditModel(modelItem.Model_Name);
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
                <p>Vehicle Year</p>
                <input
                  type="number"
                  value={editYear}
                  onChange={(e) => setEditYear(e.target.value)}
                  min={minYear}
                  max={maxYear}
                  onBlur={(e) => {
                    const value = e.target.value;
                    if (value && !validateYear(value)) {
                      alert(`Please enter a year between ${minYear} and ${maxYear}`);
                      setEditYear('');
                    }
                  }}
                  className="border p-2"
                />
                <span className="text-xs text-gray-500">
                  Year must be between {minYear} and {maxYear}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <p>Vehicle Mileage</p>
                <input
                  type="number"
                  value={editMileage}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || !isNaN(Number(value))) {
                      setEditMileage(value);
                    }
                  }}
                  min="0"
                  className="border p-2"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button 
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Update
                </button>
                <button 
                  type="button"
                  onClick={onCancel} 
                  className="bg-gray-300 text-black px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};