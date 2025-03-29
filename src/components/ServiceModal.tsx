import { useState, useEffect } from 'react';
import { CalendarComponent } from "./calendar";

interface ServiceRecord {
    id: string;
    serviceType: string;
    vehicleMileage: number;
    serviceDate: {
      seconds: number;
    };
    cost: number;
  }
  
  interface ServiceModalProps {
    show: boolean;
    record: ServiceRecord;
    mode: 'delete' | 'edit';
    onDelete?: (id: string) => void;
    onEdit?: (id: string, updates: { 
      serviceType: string; 
      cost: number;
      serviceDate: Date;
      vehicleMileage: number;
    }) => void;
    onCancel: () => void;
  }
  
  export const ServiceModal = ({ show, record, mode, onDelete, onEdit, onCancel }: ServiceModalProps) => {
    const [editText, setEditText] = useState(record?.serviceType || '');
    const [editCost, setEditCost] = useState(record?.cost?.toString() || '');
    const [editDate, setEditDate] = useState<Date | null>(null);
    const [editMileage, setEditMileage] = useState(record?.vehicleMileage?.toString() || '');

    useEffect(() => {
      if (record && mode === 'edit') {
        setEditText(record.serviceType);
        setEditCost(record.cost.toString());
        setEditDate(record.serviceDate ? new Date(record.serviceDate.seconds * 1000) : null);
        setEditMileage(record.vehicleMileage.toString());
      }
    }, [record, mode]);
  
    if (!show || !record) return null;
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (mode === 'edit' && onEdit && editDate) {
        onEdit(record.id, {
          serviceType: editText,
          cost: Number(editCost),
          serviceDate: editDate,
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
                <p><strong>Service Type:</strong> {record.serviceType}</p>
                <p><strong>Mileage:</strong> {record.vehicleMileage}</p>
                <p><strong>Service Date:</strong> {
                  record.serviceDate ? 
                  new Date(record.serviceDate.seconds * 1000).toLocaleDateString() : 
                  "N/A"
                }</p>
                <p><strong>Cost:</strong> ${record.cost}</p>
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
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
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
                  <p>Edit the service date</p>
                  <CalendarComponent 
                    date={editDate} 
                    onSelect={(selectedDate) => setEditDate(selectedDate || null)} 
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <p>Edit the cost</p>
                  <input
                    type="number"
                    value={editCost}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || !isNaN(Number(value))) {
                        setEditCost(value);
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