import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase-config';
import NavBar from '../../src/components/NavBar';
import ServiceRecords from '../../src/components/ServiceRecords';

interface VehicleData {
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: string;
  vehicleMileage: string;
  userId: string;
}

interface ServiceRecord {
  id: string;
  serviceType: string;
  cost: number;
  serviceDate: any;
}

export default function VehiclePage() {
  const router = useRouter();
  const { id } = router.query;
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVehicleData = async () => {
      if (!id || !auth.currentUser) return;

      try {
        // Fetch vehicle details
        const vehicleDoc = await getDoc(doc(db, "Vehicle Records", id as string));
        
        if (!vehicleDoc.exists()) {
          router.push('/dashboard');
          return;
        }

        const vehicleData = vehicleDoc.data() as VehicleData;
        
        // Verify the vehicle belongs to the current user
        if (vehicleData.userId !== auth.currentUser.uid) {
          router.push('/dashboard');
          return;
        }

        setVehicle(vehicleData);

        // Fetch related service records
        const serviceQuery = query(
          collection(db, "Service Records"),
          where("userId", "==", auth.currentUser.uid),
          where("vehicleId", "==", id)
        );

        const serviceSnapshot = await getDocs(serviceQuery);
        const serviceData = serviceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ServiceRecord[];

        setServiceRecords(serviceData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vehicle data:", error);
        setLoading(false);
      }
    };

    fetchVehicleData();
  }, [id, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!vehicle) {
    return <div>Vehicle not found</div>;
  }

  return (
    <div>
      <NavBar />
      <div className="mx-auto p-4">
        <button 
          onClick={() => router.push('/dashboard')}
          className="mb-4 bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back to Dashboard
        </button>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">
            {vehicle.vehicleYear} {vehicle.vehicleMake} {vehicle.vehicleModel}
          </h1>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-semibold">Make:</p>
              <p>{vehicle.vehicleMake}</p>
            </div>
            <div>
              <p className="font-semibold">Model:</p>
              <p>{vehicle.vehicleModel}</p>
            </div>
            <div>
              <p className="font-semibold">Year:</p>
              <p>{vehicle.vehicleYear}</p>
            </div>
            <div>
              <p className="font-semibold">Mileage:</p>
              <p>{vehicle.vehicleMileage}</p>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Service History</h2>
          <ServiceRecords userId={auth.currentUser?.uid} />

        </div>
      </div>
    </div>
  );
} 