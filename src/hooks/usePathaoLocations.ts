import { useState, useEffect } from "react";
import { pathaoService } from "@/services/pathao";

export function usePathaoLocations() {
  const [cities, setCities] = useState<any[]>([]);
  const [zones, setZones] = useState<any[]>([]);
  const [areas, setAreas] = useState<any[]>([]);

  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedZone, setSelectedZone] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");

  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingZones, setLoadingZones] = useState(false);
  const [loadingAreas, setLoadingAreas] = useState(false);

  // Load Cities on Mount
  useEffect(() => {
    setLoadingCities(true);
    pathaoService.getCities()
      .then((res) => {
        if (res.success && res.data?.data) {
          setCities(res.data.data);
        } else if (res.data) {
          setCities(Array.isArray(res.data) ? res.data : (res.data.data || []));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingCities(false));
  }, []);

  // Load Zones when City changes
  useEffect(() => {
    if (!selectedCity) {
      setZones([]);
      setAreas([]);
      setSelectedZone("");
      setSelectedArea("");
      return;
    }
    setLoadingZones(true);
    setSelectedZone("");
    setSelectedArea("");
    pathaoService.getZones(parseInt(selectedCity))
      .then((res) => {
        if (res.success && res.data?.data) {
          setZones(res.data.data);
        } else if (res.data) {
          setZones(Array.isArray(res.data) ? res.data : (res.data.data || []));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingZones(false));
  }, [selectedCity]);

  // Load Areas when Zone changes
  useEffect(() => {
    if (!selectedZone) {
      setAreas([]);
      setSelectedArea("");
      return;
    }
    setLoadingAreas(true);
    setSelectedArea("");
    pathaoService.getAreas(parseInt(selectedZone))
      .then((res) => {
        if (res.success && res.data?.data) {
          setAreas(res.data.data);
        } else if (res.data) {
          setAreas(Array.isArray(res.data) ? res.data : (res.data.data || []));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingAreas(false));
  }, [selectedZone]);

  return {
    cities,
    zones,
    areas,
    selectedCity,
    setSelectedCity,
    selectedZone,
    setSelectedZone,
    selectedArea,
    setSelectedArea,
    loadingCities,
    loadingZones,
    loadingAreas,
  };
}
