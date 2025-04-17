import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase-config';
import NavBar from '../../src/components/NavBar';
import ServiceRecords from '../../src/components/ServiceRecords';

interface VehicleData {
  make: string;
  model: string;
  year: string;
  mileage: string;
}

export default function VehiclePage() {
  const router = useRouter();
  const { id } = router.query;
  const [vehicle, setVehicle] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      if (id && typeof id === 'string') {
        try {
          const vehicleDoc = await getDoc(doc(db, `users/${user.uid}/vehicles`, id));
          
          if (!vehicleDoc.exists()) {
            console.log('Vehicle not found');
            router.push('/dashboard');
            return;
          }

          setVehicle(vehicleDoc.data() as VehicleData);
        } catch (error) {
          console.error("Error fetching vehicle data:", error);
          router.push('/dashboard');
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Vehicle not found</div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div className="mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4 ms-2">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h1>
        <span className="text-gray-500 text-sm ms-2">Mileage: {vehicle.mileage}</span>

        <div className="bg-white shadow-lg rounded-lg p-6">
          <ServiceRecords vehicleId={id as string} />
        </div>
      </div>
    </div>
  );
} 