interface VehicleModel {
  Make_ID: number;
  Make_Name: string;
  Model_ID: number;
  Model_Name: string;
}

async function getMakeModel(make: string): Promise<VehicleModel[]> {
  try {
    // Clean up and standardize the make name
    const cleanMake = make.trim().toLowerCase();
    const encodedMake = encodeURIComponent(cleanMake);
    const url = `https://vpic.nhtsa.dot.gov/api/vehicles/getmodelsformake/${encodedMake}?format=json`;

    //console.log('Requesting URL:', url); 

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0', 
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Debug the raw response
    const text = await response.text();
    console.log('Raw response:', text);

    // Try to parse the JSON
    try {
      const data = JSON.parse(text);
      return data.Results || [];
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      throw new Error(`Failed to parse API response: ${parseError as Error}`);
    }
  } catch (error) {
    console.error(`Error fetching models for ${make}:`, error);
    throw error;
  }
}

export default getMakeModel;
