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

  // Modify the useEffect to handle auth state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      // Only fetch data if we have both user and id
      if (id) {
        fetchVehicleData(user.uid);
      }
    });

    return () => unsubscribe();
  }, [id, router]);

  // Separate the fetch logic into its own function
  const fetchVehicleData = async (userId: string) => {
    try {
      const vehicleDoc = await getDoc(doc(db, "Vehicle Records", id as string));
      
      if (!vehicleDoc.exists()) {
        router.push('/dashboard');
        return;
      }

      const vehicleData = vehicleDoc.data() as VehicleData;
      
      if (vehicleData.userId !== userId) {
        router.push('/dashboard');
        return;
      }

      setVehicle(vehicleData);

      const serviceQuery = query(
        collection(db, "Service Records"),
        where("userId", "==", userId),
        where("vehicleId", "==", id)
      );

      const serviceSnapshot = await getDocs(serviceQuery);
      const serviceData = serviceSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ServiceRecord[];

      setServiceRecords(serviceData);
    } catch (error) {
      console.error("Error fetching vehicle data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!vehicle) {
    return <div>Vehicle not found</div>;
  }

  return (
    <div>
      <NavBar />
      <div className="mx-auto p-6">
          <h1 className="text-2xl font-bold mb-4 ms-2">
            {vehicle.vehicleYear} {vehicle.vehicleMake} {vehicle.vehicleModel}
          </h1>
          <span className="text-gray-500 text-sm ms-2">Mileage: {vehicle.vehicleMileage}</span>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Service History</h2>
          <ServiceRecords userId={auth.currentUser?.uid} />

        </div>
      </div>
    </div>
  );
} 