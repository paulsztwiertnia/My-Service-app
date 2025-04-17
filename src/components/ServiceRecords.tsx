"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase-config";
import { CalendarComponent } from "./calendar";
import { ServiceModal } from './ServiceModal';

interface ServiceRecordsProps {
  vehicleId: string;
}

export default function ServiceRecords({ vehicleId }: ServiceRecordsProps) {
  // States for service records
  const [text, setText] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [mileage, setMileage] = useState('');
  const [loading, setLoading] = useState(false);
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
      const dateA = a.date?.seconds || 0;
      const dateB = b.date?.seconds || 0;
      return dateB - dateA;
    });
  };

  useEffect(() => {
    const fetchRecords = async () => {
      if (!auth.currentUser) return;
      
      setLoading(true);
      try {
        const servicesRef = collection(db, `users/${auth.currentUser.uid}/vehicles/${vehicleId}/serviceRecords`);
        const querySnapshot = await getDocs(servicesRef);
        const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Fetched records:', recordsData);
        setRecords(sortRecordsByDate(recordsData));
      } catch (error) {
        console.error("Error fetching service records:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [vehicleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text || !cost || !date || !mileage) {
      alert("Please provide all service details");
      return;
    }

    try {
      const servicesRef = collection(db, `users/${auth.currentUser?.uid}/vehicles/${vehicleId}/serviceRecords`);
      await addDoc(servicesRef, {
        type: text,
        cost: Number(cost),
        date: date,
        mileage: Number(mileage),
        dateCreated: new Date().toISOString()
      });

      // Reset form
      setText('');
      setCost('');
      setDate(null);
      setMileage('');

      // Refresh records
      const querySnapshot = await getDocs(servicesRef);
      const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(sortRecordsByDate(recordsData));
    } catch (error) {
      console.error("Error adding service:", error);
      alert("Failed to add service record. Please try again.");
    }
  };

  const handleDelete = async (id: string) => {
    if (!auth.currentUser) return;
    
    try {
      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/vehicles/${vehicleId}/serviceRecords/${id}`));
      setRecords(records.filter(record => record.id !== id));
    } catch (error) {
      console.error("Error deleting service:", error);
      alert("Failed to delete service record. Please try again.");
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
    mileage: number;
  }) => {
    if (!auth.currentUser) return;

    try {
      const recordRef = doc(db, `users/${auth.currentUser.uid}/vehicles/${vehicleId}/serviceRecords/${id}`);
      await updateDoc(recordRef, updates);
      
      // Update local state
      setRecords(prevRecords => {
        const updatedRecords = prevRecords.map(record => 
          record.id === id ? { ...record, ...updates } : record
        );
        return sortRecordsByDate(updatedRecords);
      });
      
      setModal({ show: false, id: null, mode: 'edit' });
    } catch (error) {
      console.error("Error updating service:", error);
      alert("Failed to update service record. Please try again.");
    }
  };

  const handleModalCancel = () => {
    setModal({ show: false, id: null, mode: 'delete' });
  };

  return (
    <div className="px-10 mt-10">
      <h2 className="text-2xl font-bold mb-6">Add a service record</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="flex flex-col gap-2">
          <label className="font-medium">Type of Service</label>
          <input
            type="text"
            placeholder="Oil Change, Tire Rotation, etc."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="border rounded-md p-2"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label className="font-medium">Mileage at Service</label>
          <input
            type="number"
            placeholder="Current Mileage"
            value={mileage}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || !isNaN(Number(value))) {
                setMileage(value);
              }
            }}
            min={0}
            className="border rounded-md p-2"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium">Service Date</label>
          <CalendarComponent 
            date={date} 
            onSelect={(selectedDate) => setDate(selectedDate || null)} 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="font-medium">Cost</label>
          <input
            type="number"
            placeholder="Service Cost"
            value={cost}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || !isNaN(Number(value))) {
                setCost(value);
              }
            }}
            min={0}
            step="0.01"
            className="border rounded-md p-2"
          />
        </div>

        <div className="col-span-full flex gap-2">
          <button 
            type="submit" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Add Service Record
          </button>
          <button 
            type="button"
            onClick={() => {
              setText('');
              setCost('');
              setDate(null);
              setMileage('');
            }} 
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Clear Form
          </button>
        </div>
      </form>

      <h2 className="text-2xl font-bold mb-4">Service History</h2>
      {loading ? (
        <div className="text-center py-4">Loading service records...</div>
      ) : records.length === 0 ? (
        <div className="text-center py-4 text-gray-500">No service records found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mileage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.type || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.mileage?.toLocaleString() || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {record.date && record.date.toDate 
                      ? record.date.toDate().toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${record.cost?.toLocaleString(undefined, { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    }) || '0.00'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      onClick={() => handleEditModal(record.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteModal(record.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal.show && (
        <ServiceModal 
          show={modal.show}
          mode={modal.mode}
          record={records.find(record => record.id === modal.id)}
          vehicleId={vehicleId}
          onDelete={handleModalDelete}
          onEdit={handleModalEdit}
          onCancel={handleModalCancel}
        />
      )}
    </div>
  );
} 