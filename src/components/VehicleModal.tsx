import { useState, useEffect } from 'react';
import { CalendarComponent } from "./calendar";

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
    
    useEffect(() => {
      if (record && mode === 'edit') {
        setEditMake(record.vehicleMake);
        setEditModel(record.vehicleModel);
        setEditYear(record.vehicleYear.toString());
        setEditMileage(record.vehicleMileage.toString());
      }
    }, [record, mode]);
  
    if (!show || !record) return null;
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (mode === 'edit' && onEdit ) {
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
        <div className="bg-white p-8 rounded-lg">
          {mode === 'delete' ? (
            <>
              <h2 className="text-lg font-bold mb-4">Are you sure you want to delete this service record?</h2>
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
          // render the edit modal
            <>
              <h2 className="text-lg font-bold mb-4">Edit Service Record</h2>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <p>Edit the type of service</p>
                  <input
                    type="text"
                    value={editMake}
                    onChange={(e) => setEditMake(e.target.value)}
                    className="border p-2"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p>Edit the mileage</p>
                  <input
                    type="number"
                    value={editMileage}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || !isNaN(Number(value))) {
                        setEditMileage(value);
                      }
                    }}
                    className="border p-2"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p>Edit the model</p>
                  <input
                    type="text"
                    value={editModel}
                    onChange={(e) => setEditModel(e.target.value)}
                    className="border p-2"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p>Edit the year</p>
                  <input
                    type="number"
                    value={editYear}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || !isNaN(Number(value))) {
                        setEditYear(value);
                      }
                    }}
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