import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth"; // Import for checking auth state
import { useRouter } from "next/router"; // Router hook from Next.js for navigation
import { auth, db } from "../firebase/firebase-config"; // Firebase config for auth and Firestore
import { collection, addDoc, getDocs, query, where, doc, deleteDoc, updateDoc } from "firebase/firestore"; // Firestore methods for CRUD operations
import NavBar from "../src/components/NavBar"; // Navbar component for layout

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function Dashboard() {
  // State variables
  const [user, setUser] = useState<any>(null); // Stores the authenticated user object
  const [loading, setLoading] = useState(true); // Tracks if data is loading

  // States for service records
  const [text, setText] = useState(''); // Stores input for new service type
  const [cost, setCost] = useState(''); // Stores input for new service cost
  const [date, setDate] = useState<Date | null>(null); // Stores input for new service date

  const [editText, setEditText] = useState(''); // Stores the updated service type when editing
  const [editCost, setEditCost] = useState(''); // Stores the updated cost when editing
  const [editDate, setEditDate] = useState<Date | null>(null); // Stores input for new service date

  const [editingRecord, setEditingRecord] = useState<any>(null); // Tracks the record being edited
  const [records, setRecords] = useState<any[]>([]); // Stores the fetched service records

  // States for vehicle records
  const [make, setMake] = useState(''); // Stores input for car make
  const [model, setModel] = useState(''); // Stores input for car model
  const [year, setYear] = useState(''); // Stores input for car year
  const [mileage, setMileage] = useState(''); // Stores input for car mileage

  const [editMake, setEditMake] = useState(''); 
  const [editModel, setEditModel] = useState('');
  const [editYear, setEditYear] = useState('');
  const [editMileage, setEditMileage] = useState('')

  const [editingVehicleRecord, setEditingVehicleRecord] = useState<any>(null); //Track the vehicle record being edited
  const [vehicleRecords, setVehicleRecords] = useState<any[]>([]); // Stores the fetched vehicle records


  const router = useRouter(); // Next.js router instance for navigation

  // Effect for handling authentication state
  useEffect(() => {
    // Check if the user is authenticated
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser); // Set user data if authenticated
      } else {
        router.push("/login"); // Redirect to login if not authenticated
      }
      setLoading(false); // Set loading to false once the check is complete
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, [router]);

  // Effect for fetching service records from Firestore
  useEffect(() => {
    const fetchRecords = async () => {
      if (user) {
        // Query Firestore for service records matching the logged-in user
        const q = query(collection(db, "Service Records"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q); // Fetch documents matching the query
        const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Map results
        setRecords(recordsData); // Set the fetched records to state
      }
    };

    fetchRecords(); // Call the fetch function
  }, [user]); // Run when 'user' state changes

  // Effect for fetching vehicle records from Firestore
  useEffect(() => {
    const fetchVehicleRecords = async () => {
      if (user) {
        // Query Firestore for service records matching the logged-in user
        const q = query(collection(db, "Vehicle Records"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q); // Fetch documents matching the query
        const vehicleRecordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // Map results
        setVehicleRecords(vehicleRecordsData); // Set the fetched records to state
      }
    };

    fetchVehicleRecords(); // Call the fetch function
  }, [user]); // Run when 'user' state changes

  // Handle form submission for adding a new service record
  const handleSubmitService = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    if (!text || !cost || !date ) {
      console.log("Please provide both service type, cost, and date.");
      return; // Validate that both fields are provided
    }

    try {
      // Add new service record to Firestore
      await addDoc(collection(db, "Service Records"), {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        dateCreated: new Date().toISOString(), // Add current timestamp
        cost: Number(cost), // Convert cost to number
        serviceType: text,
        serviceDate: date,       
        vehicleMake: make,
      });
      console.log('Service record added successfully.');

      // Clear input fields
      setText('');
      setCost('');
      setDate(null);
      setMake('');

      // Fetch updated records and refresh the list
      const q = query(collection(db, "Service Records"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(recordsData);
    } catch (error) {
      console.error("Error adding service: ", error); // Log any errors
    }
  };

  // Handle form submission for adding a new service record
  const handleSubmitVehicle = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    if (!make ) {
      console.log("Please provide make");
      return; // Validate that both fields are provided
    }
    if (!model ) {
      console.log("Please provide model");
      return; // Validate that both fields are provided
    }
    if (!year ) {
      console.log("Please provide year");
      return; // Validate that both fields are provided
    }
    if (!mileage ) {
      console.log("Please provide mileage");
      return; // Validate that both fields are provided
    }

    try {
      // Add new service record to Firestore
      await addDoc(collection(db, "Vehicle Records"), {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        dateCreated: new Date().toISOString(), // Add current timestamp
        vehicleMake: make,
        vehicleModel: model,
        vehicleYear: year,
        vehicleMileage: mileage,
      });
      console.log('Vehicle record added successfully.');

      // Clear input fields
      setMake('');
      setModel('');
      setYear('');
      setMileage('');

      // Fetch updated records and refresh the list
      const q = query(collection(db, "Vehicle Records"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const vehicleRecordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicleRecords(vehicleRecordsData);
    } catch (error) {
      console.error("Error adding vehicle : ", error); // Log any errors
    }
  };
  
  // Handle record deletion
  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "Service Records", id)); // Delete the record from Firestore
      console.log('Service record deleted successfully.');

      // Fetch updated records after deletion
      const q = query(collection(db, "Service Records"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(recordsData);
    } catch (error) {
      console.error("Error deleting service: ", error); // Log any errors
    }
  };

  // Handle vehicle record deletion
  const handleVehicleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "Vehicle Records", id)); // Delete the record from Firestore
      console.log('Vehicle record deleted successfully.');

      // Fetch updated records after deletion
      const q = query(collection(db, "Vehicle Records"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const vehicleRecordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicleRecords(vehicleRecordsData);
    } catch (error) {
      console.error("Error deleting vehicle record: ", error); // Log any errors
    }
  };

  // Handle record editing (populates fields for editing)
  const handleEdit = async (id: string) => {
    try {
      // Find the record to edit
      const recordToEdit = records.find(record => record.id === id);
      if (recordToEdit) {
        setEditingRecord(recordToEdit); // Set the record to be edited
        setEditText(recordToEdit.serviceType); // Set the service type for editing
        setEditCost(recordToEdit.cost.toString()); // Set the cost for editing
      }
    } catch (error) {
      console.error("Error fetching record for edit: ", error); // Log any errors
    }
  };

    // Handle record editing (populates fields for editing)
    const handleVehicleEdit = async (id: string) => {
      try {
        // Find the record to edit
        const vehicleRecordToEdit = vehicleRecords.find(record => record.id === id);
        if (vehicleRecordToEdit) {
          setEditingVehicleRecord(vehicleRecordToEdit); // Set the record to be edited
          setEditMake(vehicleRecordToEdit.vehicleMake); // Set the service type for editing
          setEditModel(vehicleRecordToEdit.vehicleModel); // Set the cost for editing
          setEditYear(vehicleRecordToEdit.vehicleYear); // Set the cost for editing
          setEditMileage(vehicleRecordToEdit.vehicleMileage); // Set the cost for editing
        }
      } catch (error) {
        console.error("Error fetching record for edit: ", error); // Log any errors
      }
    };

  // Handle updating the service record
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    if (!editingRecord) {
      console.log("No record is being edited.");
      return; // Validate that there's a record being edited
    }

    try {
      // Update the record in Firestore
      const recordRef = doc(db, "Service Records", editingRecord.id);
      await updateDoc(recordRef, {
        serviceType: editText, // Update service type
        cost: Number(editCost), // Update cost
      });
      console.log('Service record updated successfully.');

      // Clear editing state
      setEditingRecord(null);
      setEditText('');
      setEditCost('');

      // Fetch updated records after update
      const q = query(collection(db, "Service Records"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const recordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecords(recordsData);
    } catch (error) {
      console.error("Error updating service: ", error); // Log any errors
    }
  };

  // Handle updating the service record
  const handleVehicleUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission

    if (!editingVehicleRecord) {
      console.log("No vehicle record is being edited.");
      return; // Validate that there's a record being edited
    }

    try {
      // Update the record in Firestore
      const recordRef = doc(db, "Vehicle Records", editingVehicleRecord.id);
      await updateDoc(recordRef, {
        vehicleMake: editMake,
        vehicleModel: editModel,
        vehicleYear: editYear,
        vehicleMileage: editMileage,
      });
      console.log('Service record updated successfully.');

      // Clear editing state
      setEditingVehicleRecord(null);
      setEditMake('');
      setEditModel('');
      setEditYear('');
      setEditMileage('');

      // Fetch updated records after update
      const q = query(collection(db, "Vehicle Records"), where("userId", "==", auth.currentUser?.uid));
      const querySnapshot = await getDocs(q);
      const vehicleRecordsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVehicleRecords(vehicleRecordsData);
    } catch (error) {
      console.error("Error updating vehicle record: ", error); // Log any errors
    }
  };

  // Loading state while data is being fetched
  if (loading) {
    return <p>Loading...</p>; // Display loading message
  }

  // Main component rendering
  return (
    <div >
      <NavBar /> {/* Navbar component */}
      <div>
        {user ? (
          <div>
            {/* Display user information */}
            <h1>Welcome, {user.email}</h1>
            {user.displayName && <h1>Name: {user.displayName.split(" ")[0]}</h1>}
            <button onClick={() => auth.signOut()}>
              Sign Out {/* Sign out button */}
            </button>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>
      <div className="bg-red-600">
        <h2>Enter your Vehicles information</h2>
        <form onSubmit={handleSubmitVehicle}>
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
          <br></br>
          <button type="submit">Submit Vehicle Record</button>
          <h2>Vehicle Records</h2>
          <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th>Vehicle Make</th>
              <th>Vehicle Model</th>
              <th>Vehicle Year</th>
              <th>Vehicle Mileage</th>
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
                  <button onClick={() => handleVehicleDelete(record.id)}>
                    Delete {/* Delete button */}
                  </button>
                  <button onClick={() => handleVehicleEdit(record.id)}>
                    Edit {/* Edit button */}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </form>
      </div>
      {editingVehicleRecord && (
        <div className="mt-4">
          <h2>Edit Vehicle Record</h2>
          <form onSubmit={handleVehicleUpdate}>
            <p>Edit Vehicle Make</p>
            <input
              type="text"
              value={editMake} // Bind input to state
              onChange={(e) => setEditMake(e.target.value)}
              className="border p-2 mb-2"
            />
            <p>Edit the Vehicle Model</p>
            <input
              type="text"
              value={editModel} // Bind input to state
              onChange={(e) => setEditModel(e.target.value)}
              className="border p-2 mb-2"
            />
            <p>Edit the Vehicle Year</p>
            <input
              type="text"
              value={editYear} // Bind input to state
              onChange={(e) => setEditYear(e.target.value)}
              className="border p-2 mb-2"
            />
            <p>Edit the Vehicle Mileage</p>
            <input
              type="text"
              value={editMileage} // Bind input to state
              onChange={(e) => setEditMileage(e.target.value)}
              className="border p-2 mb-2"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2">
              Update {/* Update button */}
            </button>
          </form>
        </div>
      )}
      <div className="bg-blue-500">
        <h2>Enter a new record</h2>
        <form onSubmit={handleSubmitService} >
          <p>Enter the type of service</p>
          <input
            type="text"
            placeholder="Type of Service"
            value={text} // Bind input to state
            onChange={(e) => setText(e.target.value)}
          />
          <p>Enter the cost</p>
          <input
            type="number"
            placeholder="Cost"
            value={cost} // Bind input to state
            onChange={(e) => setCost(e.target.value)}
          />
          <p>Enter the date of the service</p>
          <div className="p-5 mb-10">  
            <DatePicker
                selected={date}
                onChange={(date: Date | null) => setDate(date)}
                dateFormat="yyyy/MM/dd"
                className="p-2 border rounded-md"
            />
          </div>
          <br></br>
          <button type="submit">Submit</button>
        </form>
        <h2>Service Records</h2>
        <table className="min-w-full border-collapse border border-gray-200">
          <thead>
            <tr>
              <th>Type of Service</th>
              <th>Cost</th>
              <th>Service Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <tr key={record.id}>
                <td>{record.serviceType}</td>
                <td>{record.cost}</td>
                <td>{record.serviceDate ? new Date(record.serviceDate.seconds * 1000).toLocaleDateString() : "N/A"}</td> {/* Convert Firestore timestamp */}
                <td>
                  <button onClick={() => handleDelete(record.id)}>
                    Delete {/* Delete button */}
                  </button>
                  <button onClick={() => handleEdit(record.id)}>
                    Edit {/* Edit button */}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {editingRecord && (
        <div className="mt-4">
          <h2>Edit Record</h2>
          <form onSubmit={handleUpdate}>
            <p>Edit the type of service</p>
            <input
              type="text"
              value={editText} // Bind input to state
              onChange={(e) => setEditText(e.target.value)}
              className="border p-2 mb-2"
            />
            <p>Edit the cost</p>
            <input
              type="number"
              value={editCost} // Bind input to state
              onChange={(e) => setEditCost(e.target.value)}
              className="border p-2 mb-2"
            />

            <button type="submit" className="bg-blue-500 text-white px-4 py-2">
              Update {/* Update button */}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
