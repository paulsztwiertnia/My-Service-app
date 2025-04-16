interface VehicleMake {
  MakeId: number;
  MakeName: string;
}

const commonMakeIds = [
  448, // TOYOTA
  474, // HONDA
  478, // NISSAN
  460, // FORD
  467, // CHEVROLET
  472, // GMC
  468, // BUICK
  469, // CADILLAC
  477, // CHRYSLER
  476, // DODGE
  482, // VOLKSWAGEN
  498, // HYUNDAI
  499, // KIA
  473, // MAZDA
  523, // SUBARU
  481, // MITSUBISHI
  515, // LEXUS
  475, // ACURA
  480, // INFINITI
  449, // MERCEDES-BENZ
  452, // BMW
  582, // AUDI
  485, // VOLVO
  464, // LINCOLN
  456, // MINI
  492, // FIAT
  584, // PORSCHE
  442,  // JAGUAR
  440, // ASTON MARTIN
  443, // MASERATI
  445, // ROLLS-ROYCE
  454, // BUGATTI
  466, // LOTUS
  471, // OPEL
  533, // MAYBACH
  542, // ISUZU
  572, // SAAB
  583, // BENTLEY
  603, // FERRARI
  2236, // MCLAREN
  502, // LAMBORGHINI
  441, // TESLA
  493, // ALFA ROMEO
  497, // LANCIA
  509, //SUZUKI
  536, //PONTIAC
  1896, // KOENIGSEGG
  5083, // GENESIS
  5554, // PEUGOT
  10224, // POLESTAR
  10919, // LUCID
  11832, // SHELBY
  11856, // FISKER
  11921 // RIMAC
];

export async function getMake(): Promise<VehicleMake[]> {
  try {
    const url = 'https://vpic.nhtsa.dot.gov/api/vehicles/GetMakesForVehicleType/car?format=json';

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

    const data = await response.json();

    // Find excluded makes
    const excludedMakes = data.Results.filter(
      (make: VehicleMake) => !commonMakeIds.includes(make.MakeId)
    );
    console.log("Excluded makes:", excludedMakes);

    const sortedAlphaMakes = data.Results.sort((a: VehicleMake, b: VehicleMake) => a.MakeName.localeCompare(b.MakeName));

    return sortedAlphaMakes.filter((make: VehicleMake) => commonMakeIds.includes(make.MakeId));
  } catch (error) {
    console.error(`Error fetching vehicle makes: ${error}`);
    throw error;
  }
}
