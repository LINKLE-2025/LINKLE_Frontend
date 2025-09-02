// src/components/map/MapContainer.tsx
import { useEffect, useRef, useState } from "react";
import MapWrapper from "./MapWrapper";
import { useKakaoLoader } from "@/hooks/useKakaoLoader";
import type { Draft, Spot } from "@/types/map";
import SpotModal from "@/components/spot/SpotModal";
import SpotCreateModal from "@/components/spot/SpotCreateModal";

interface MapContainerProps {
  apiKey?: string; // Vite: import.meta.env.VITE_KAKAO_MAP_KEY
  defaultCenter?: { lat: number; lng: number };
  defaultLevel?: number;
}

export default function MapContainer({
  apiKey = import.meta.env.VITE_KAKAO_MAP_KEY as string,
  defaultCenter = { lat: 37.5665, lng: 126.978 },
  defaultLevel = 5,
}: MapContainerProps) {
  const ready = useKakaoLoader(apiKey);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const kakaoMap = useRef<any>(null);
  const geocoder = useRef<any>(null);

  const [spots, setSpots] = useState<Spot[]>([]);
  const [selected, setSelected] = useState<Spot | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openSpot, setOpenSpot] = useState(false);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    const { kakao } = window as any;
    const center = new kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng);
    kakaoMap.current = new kakao.maps.Map(mapRef.current, { center, level: defaultLevel });
    geocoder.current = new kakao.maps.services.Geocoder();

    kakao.maps.event.addListener(kakaoMap.current, "click", (mouseEvent: any) => {
      const latlng = mouseEvent.latLng;
      const lat = latlng.getLat();
      const lng = latlng.getLng();
      reverseGeocode(lat, lng).then((address) => {
        setDraft({ lat, lng, address: address ?? "" });
        setOpenCreate(true);
      });
    });
  }, [ready, defaultCenter.lat, defaultCenter.lng, defaultLevel]);

  useEffect(() => {
    if (!ready || !kakaoMap.current) return;
    const { kakao } = window as any;
    // clear overlays: naive approach by recreating map overlays
    // draw markers
    spots.forEach((s) => {
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(s.lat, s.lng),
        map: kakaoMap.current,
        clickable: true,
      });
      kakao.maps.event.addListener(marker, "click", () => {
        setSelected(s);
        setOpenSpot(true);
      });
    });
  }, [ready, spots]);

  const reverseGeocode = (lat: number, lng: number): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!geocoder.current) return resolve(null);
      geocoder.current.coord2RegionCode(lng, lat, (result: any, status: any) => {
        if (status === (window as any).kakao.maps.services.Status.OK && result.length > 0) {
          resolve(result[0].address_name as string);
        } else {
          resolve(null);
        }
      });
    });
  };

  const createSpot = (spot: Spot) => {
    setSpots((prev) => [{ ...spot, id: `${Date.now()}` }, ...prev]);
    setOpenCreate(false);
    setDraft(null);
  };

  const addPhoto = (data: { url: string; caption?: string }) => {
    if (!selected) return;
    setSpots((prev) =>
      prev.map((s) =>
        s.id === selected.id
          ? { ...s, photos: [...(s.photos ?? []), { url: data.url, caption: data.caption }] }
          : s,
      ),
    );
  };

  const addMessage = (data: { text: string }) => {
    if (!selected) return;
    setSpots((prev) =>
      prev.map((s) =>
        s.id === selected.id
          ? {
              ...s,
              messages: [...(s.messages ?? []), { text: data.text, ts: new Date().toISOString() }],
            }
          : s,
      ),
    );
  };

  return (
    <MapWrapper>
      <div ref={mapRef} className='w-full h-full' />

      <SpotCreateModal
        open={openCreate}
        draft={draft}
        onClose={() => setOpenCreate(false)}
        onCreate={createSpot}
      />

      <SpotModal
        open={openSpot}
        spot={selected}
        onClose={() => setOpenSpot(false)}
        onAddPhoto={addPhoto}
        onAddMessage={addMessage}
      />
    </MapWrapper>
  );
}
