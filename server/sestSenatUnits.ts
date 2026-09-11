export interface SestSenatUnit {
  id: string;
  name: string;
  city: string;
  state: string;
  neighborhood: string;
  address: string;
  zipCode?: string;
  phone?: string;
  latitude: number;
  longitude: number;
  isDeodoro?: boolean;
}

export const SEST_SENAT_UNITS: SestSenatUnit[] = [
  {
    id: "deodoro-rj",
    name: "SEST SENAT Deodoro (Unidade B-27)",
    city: "Rio de Janeiro",
    state: "RJ",
    neighborhood: "Deodoro",
    address: "Estrada do Camboatá, 4000 - Deodoro, Rio de Janeiro - RJ",
    phone: "(21) 3457-9200",
    latitude: -22.8552,
    longitude: -43.3768,
    isDeodoro: true,
  },
  {
    id: "serra-rj",
    name: "SEST SENAT Paciência / Santa Cruz",
    city: "Rio de Janeiro",
    state: "RJ",
    neighborhood: "Paciência",
    address: "Av. Cesário de Melo, 11443 - Paciência, Rio de Janeiro - RJ",
    phone: "(21) 3394-1100",
    latitude: -22.9068,
    longitude: -43.6272,
  },
  {
    id: "sao-goncalo-rj",
    name: "SEST SENAT São Gonçalo",
    city: "São Gonçalo",
    state: "RJ",
    neighborhood: "Tribobó",
    address: "Rod. Amaral Peixoto, Km 7 - Tribobó, São Gonçalo - RJ",
    phone: "(21) 2614-8800",
    latitude: -22.8364,
    longitude: -43.0234,
  },
  {
    id: "duque-de-caxias-rj",
    name: "SEST SENAT Duque de Caxias",
    city: "Duque de Caxias",
    state: "RJ",
    neighborhood: "Campos Elíseos",
    address: "Rod. Washington Luiz, km 105 - Duque de Caxias - RJ",
    phone: "(21) 3661-8000",
    latitude: -22.7231,
    longitude: -43.2982,
  },
  {
    id: "nova-iguacu-rj",
    name: "SEST SENAT Nova Iguaçu",
    city: "Nova Iguaçu",
    state: "RJ",
    neighborhood: "Comendador Soares",
    address: "Av. Tancredo Neves, 4425 - Comendador Soares, Nova Iguaçu - RJ",
    phone: "(21) 3779-9900",
    latitude: -22.7562,
    longitude: -43.4682,
  },
  {
    id: "resende-rj",
    name: "SEST SENAT Resende",
    city: "Resende",
    state: "RJ",
    neighborhood: "Vila Julieta",
    address: "R. Eurídice Paulina de Almeida, 320 - Resende - RJ",
    phone: "(24) 3381-8900",
    latitude: -22.4689,
    longitude: -44.4533,
  },
  {
    id: "campos-rj",
    name: "SEST SENAT Campos dos Goytacazes",
    city: "Campos dos Goytacazes",
    state: "RJ",
    neighborhood: "Parque Rodoviário",
    address: "Rua Arthur Barbosa, 180 - Campos dos Goytacazes - RJ",
    phone: "(22) 2737-1400",
    latitude: -21.7642,
    longitude: -41.3289,
  }
];

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export function findNearestUnit(lat?: number, lon?: number, preferredCity?: string): { nearest: SestSenatUnit; distanceKm?: number; note?: string } {
  const deodoro = SEST_SENAT_UNITS[0];
  if (lat !== undefined && lon !== undefined) {
    let minDistance = Infinity;
    let closestUnit = deodoro;
    for (const unit of SEST_SENAT_UNITS) {
      const dist = calculateDistanceKm(lat, lon, unit.latitude, unit.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        closestUnit = unit;
      }
    }
    return {
      nearest: closestUnit,
      distanceKm: minDistance,
      note: closestUnit.id === "deodoro-rj"
        ? "Cliente no raio prioritário da Unidade Deodoro RJ."
        : `Unidade física mais próxima: ${closestUnit.name} (~${minDistance} km). Central de inteligência e atendimento integrada com Deodoro.`
    };
  }

  if (preferredCity) {
    const norm = preferredCity.toLowerCase();
    const matched = SEST_SENAT_UNITS.find(u => norm.includes(u.city.toLowerCase()) || norm.includes(u.neighborhood.toLowerCase()));
    if (matched) {
      return {
        nearest: matched,
        note: `Identificado pelo município/região de ${preferredCity}.`
      };
    }
  }

  return {
    nearest: deodoro,
    note: "Unidade de referência: SEST SENAT Deodoro RJ (polo de excelência em capacitação e atendimento corporativo)."
  };
}
