import { useState, useEffect } from 'react';
import { CalendarComponent } from "./calendar";

interface ServiceRecord {
  id: string;
  type: string;
  mileage: number;
  date: {
    seconds: number;
    toDate: () => Date;
  };
  cost: number;
}

interface ServiceModalProps {
  show: boolean;
  record: ServiceRecord;
  mode: 'delete' | 'edit';
  vehicleId: string;
  onDelete?: (id: string) => void;
  onEdit?: (id: string, updates: { 
    type: string;
    cost: number;
    date: Date;
    mileage: number;
  }) => void;
  onCancel: () => void;
}

export const ServiceModal = ({ show, record, mode, onDelete, onEdit, onCancel, vehicleId }: ServiceModalProps) => {
  const [editText, setEditText] = useState(record?.type || '');
  const [editCost, setEditCost] = useState(record?.cost?.toString() || '');
  const [editDate, setEditDate] = useState<Date | null>(null);
  const [editMileage, setEditMileage] = useState(record?.mileage?.toString() || '');

  useEffect(() => {
    if (record && mode === 'edit') {
      setEditText(record.type);
      setEditCost(record.cost.toString());
      if (record.date) {
        if (record.date.toDate) {
          setEditDate(record.date.toDate());
        } else if (record.date.seconds) {
          setEditDate(new Date(record.date.seconds * 1000));
        } else {
          setEditDate(new Date(record.date.seconds * 1000));
        }
      } else {
        setEditDate(null);
      }
      setEditMileage(record.mileage.toString());
    }
  }, [record, mode]);

  if (!show || !record) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'edit' && onEdit && editDate) {
      onEdit(record.id, {
        type: editText,
        cost: Number(editCost),
        date: editDate,
        mileage: Number(editMileage)
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        {mode === 'delete' ? (
          <>
            <h2 className="text-xl font-bold mb-4">Delete Service Record</h2>
            <p className="mb-4">Are you sure you want to delete this service record?</p>
            <div className="mb-4">
              <p><strong>Service Type:</strong> {record.type}</p>
              <p><strong>Mileage:</strong> {record.mileage.toLocaleString()}</p>
              <p><strong>Service Date:</strong> {
                record.date ? (
                  record.date.toDate ? 
                    record.date.toDate().toLocaleDateString() :
                    record.date.seconds ?
                      new Date(record.date.seconds * 1000).toLocaleDateString() :
                      new Date(record.date.seconds * 1000).toLocaleDateString()
                ) : "N/A"
              }</p>
              <p><strong>Cost:</strong> ${record.cost.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button 
                onClick={() => onDelete && onDelete(record.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Delete
              </button>
              <button 
                onClick={onCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-xl font-bold mb-4">Edit Service Record</h2>
            
            <div>
              <label className="block text-sm font-medium mb-1">Service Type</label>
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full border rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Mileage</label>
              <input
                type="number"
                value={editMileage}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || !isNaN(Number(value))) {
                    setEditMileage(value);
                  }
                }}
                className="w-full border rounded-md p-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Service Date</label>
              <CalendarComponent 
                date={editDate} 
                onSelect={(selectedDate) => setEditDate(selectedDate || null)} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cost</label>
              <input
                type="number"
                value={editCost}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || !isNaN(Number(value))) {
                    setEditCost(value);
                  }
                }}
                step="0.01"
                className="w-full border rounded-md p-2"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button 
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Save Changes
              </button>
              <button 
                type="button"
                onClick={onCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};