"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useAppStore } from "@/lib/store";

export const InteractiveRouteMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<unknown>(null);
  const { vehicleConfig, setVehicleConfig } = useAppStore();
  
  const [pinState, setPinState] = useState<"need_origin" | "need_dest" | "done">("need_origin");

  // Local state for pins
  const [fromCoords, setFromCoords] = useState<[number, number] | null>(vehicleConfig.customFromCoords || null);
  const [toCoords, setToCoords] = useState<[number, number] | null>(vehicleConfig.customToCoords || null);

  // Search state
  const [originQuery, setOriginQuery] = useState("");
  const [destQuery, setDestQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const calculateDistance = useCallback(async (origin: [number, number], dest: [number, number]) => {
    try {
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${origin[1]},${origin[0]};${dest[1]},${dest[0]}?overview=false`);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const distanceKm = data.routes[0].distance / 1000;
        setVehicleConfig({ 
          customFromCoords: origin, 
          customToCoords: dest,
          routeDistance: parseFloat(distanceKm.toFixed(1))
        });
      }
    } catch (err) {
      console.error("OSRM failed, using fallback", err);
      setVehicleConfig({ customFromCoords: origin, customToCoords: dest });
    }
  }, [setVehicleConfig]);

  const handleSearch = async (type: "origin" | "dest") => {
    const query = type === "origin" ? originQuery : destQuery;
    if (!query) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&countrycodes=ph&limit=1`);
      const data = await res.json();
      
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        
        if (type === "origin") {
          setFromCoords([lat, lng]);
          if (toCoords) calculateDistance([lat, lng], toCoords);
          else setPinState("need_dest");
        } else {
          setToCoords([lat, lng]);
          setPinState("done");
          if (fromCoords) calculateDistance(fromCoords, [lat, lng]);
        }
      } else {
        alert("Location not found. Try adding a city name (e.g. 'Makati').");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    let map: unknown = null;
    let markers: unknown[] = [];
    let polyline: unknown = null;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      // @ts-ignore
      await import("leaflet/dist/leaflet.css");

      if (leafletRef.current) {
        (leafletRef.current as { remove: () => void }).remove();
      }
      if (!mapRef.current) return;

      map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView(
        fromCoords || [14.5995, 120.9842], 10
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map as any);

      const createIcon = (color: string) => L.divIcon({
        className: "",
        html: `<div style="width:16px;height:16px;background:${color};border:2px solid #0a0f1e;border-radius:50%;box-shadow:0 0 12px ${color}"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const drawMapState = () => {
        markers.forEach((m: any) => m.remove());
        markers = [];
        if (polyline) (polyline as any).remove();

        if (fromCoords) {
          const m = L.marker(fromCoords, { icon: createIcon("#00d4ff") })
            .bindTooltip("Origin", { permanent: true, className: "leaflet-tooltip-p3" })
            .addTo(map as any);
          markers.push(m);
        }
        if (toCoords) {
          const m = L.marker(toCoords, { icon: createIcon("#ffd700") })
            .bindTooltip("Destination", { permanent: true, className: "leaflet-tooltip-p3" })
            .addTo(map as any);
          markers.push(m);
        }

        if (fromCoords && toCoords) {
          polyline = L.polyline([fromCoords, toCoords], {
            color: "#00d4ff", weight: 3, opacity: 0.8, dashArray: "8 4"
          }).addTo(map as any);
          
          const bounds = L.latLngBounds([fromCoords, toCoords]);
          (map as any).fitBounds(bounds, { padding: [40, 40] });
        } else if (fromCoords) {
          (map as any).setView(fromCoords, 13);
        }
      };

      drawMapState();

      (map as any).on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        if (pinState === "need_origin" || pinState === "done") {
          setFromCoords([lat, lng]);
          setToCoords(null);
          setPinState("need_dest");
        } else if (pinState === "need_dest") {
          setToCoords([lat, lng]);
          setPinState("done");
          calculateDistance(fromCoords!, [lat, lng]);
        }
      });

      leafletRef.current = map;
    };

    initMap().catch(console.error);

    return () => {
      if (leafletRef.current) {
        (leafletRef.current as { remove: () => void }).remove();
        leafletRef.current = null;
      }
    };
  }, [fromCoords, toCoords, pinState, calculateDistance]);

  return (
    <div className="space-y-3 mt-4 mb-4">
      {/* Search Bars */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search Origin (e.g. Makati)" 
            className="p3r-input flex-1 py-1.5 px-3 text-xs" 
            value={originQuery}
            onChange={(e) => setOriginQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch("origin")}
          />
          <button 
            onClick={() => handleSearch("origin")}
            disabled={isSearching}
            className="p3r-btn-blue px-3 py-1 text-[10px] whitespace-nowrap"
            style={{ clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)" }}
          >
            {isSearching ? "..." : "FIND"}
          </button>
        </div>
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search Destination (e.g. Pasay)" 
            className="p3r-input flex-1 py-1.5 px-3 text-xs" 
            value={destQuery}
            onChange={(e) => setDestQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch("dest")}
          />
          <button 
            onClick={() => handleSearch("dest")}
            disabled={isSearching}
            className="p3r-btn-blue px-3 py-1 text-[10px] whitespace-nowrap"
            style={{ clipPath: "polygon(6px 0, 100% 0, calc(100% - 6px) 100%, 0 100%)" }}
          >
            {isSearching ? "..." : "FIND"}
          </button>
        </div>
      </div>

      {/* Map Header */}
      <div className="flex justify-between items-center mt-2">
        <label className="p3r-label mb-0">Pin Custom Route</label>
        <button 
          onClick={() => { setFromCoords(null); setToCoords(null); setPinState("need_origin"); }}
          className="font-mono text-[10px] text-p3r-cyan border border-p3r-cyan px-2 py-0.5 hover:bg-p3r-cyan hover:text-[#05050A] transition-colors"
        >
          RESET PINS
        </button>
      </div>
      
      <div className="flex gap-2 mb-1 font-mono text-[10px]">
        <div className={`px-2 py-1 flex-1 text-center border-b-2 transition-colors ${pinState === "need_origin" ? "border-p3r-cyan text-p3r-cyan bg-[#001A88]" : "border-[#002299] text-[#4488DD]"}`}>
          1. CLICK ORIGIN
        </div>
        <div className={`px-2 py-1 flex-1 text-center border-b-2 transition-colors ${pinState === "need_dest" ? "border-[#ffd700] text-[#ffd700] bg-[#332200]" : "border-[#002299] text-[#4488DD]"}`}>
          2. CLICK DESTINATION
        </div>
      </div>

      <div 
        ref={mapRef} 
        className="w-full border-2 border-[#0044CC] overflow-hidden" 
        style={{ height: "250px", filter: "brightness(0.7) saturate(0.4) hue-rotate(180deg)" }} 
      />
      <div className="font-mono text-[10px] text-[#4488DD] text-center">
        Type an address or click the map directly. Distance is auto-calculated.
      </div>
    </div>
  );
};
