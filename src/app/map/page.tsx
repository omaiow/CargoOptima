"use client";

import { useEffect, useRef, useMemo } from "react";

import { motion } from "framer-motion";

import { PageLayout } from "@/components/layout/PageLayout";

import { CardSpotlight } from "@/components/aceternity/CardSpotlight";

import { useAppStore } from "@/lib/store";

import { PHILIPPINE_ROUTES } from "@/lib/routes";

import { formatPHP, formatNumber } from "@/lib/utils";



export default function MapPage() {

  const mapRef = useRef<HTMLDivElement>(null);

  const leafletRef = useRef<unknown>(null);

  const { currentRun, vehicleConfig } = useAppStore();



  const baseRoute = PHILIPPINE_ROUTES.find(r => r.id === vehicleConfig.selectedRoute) ?? PHILIPPINE_ROUTES[0];

  

  // Override coordinates if it's the custom route and custom coords exist

  const selectedRoute = {

    ...baseRoute,

    fromCoords: (baseRoute.id === "custom" && vehicleConfig.customFromCoords) ? vehicleConfig.customFromCoords : baseRoute.fromCoords,

    toCoords: (baseRoute.id === "custom" && vehicleConfig.customToCoords) ? vehicleConfig.customToCoords : baseRoute.toCoords,

  };



  useEffect(() => {

    if (typeof window === "undefined") return;

    let map: unknown = null;



    const initMap = async () => {

      const L = (await import("leaflet")).default;

      // @ts-ignore
      await import("leaflet/dist/leaflet.css");



      if (leafletRef.current) {

        (leafletRef.current as { remove: () => void }).remove();

      }

      if (!mapRef.current) return;



      // Fix default icon

      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;

      L.Icon.Default.mergeOptions({

        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",

      });



      map = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView(

        [14.5995, 120.9842], 12

      );



      // Dark OSM tiles

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {

        attribution: "Â© OpenStreetMap contributors",

      }).addTo(map as any);



      // From marker (cyan)

      const fromIcon = L.divIcon({

        className: "",

        html: `<div style="width:16px;height:16px;background:#00d4ff;border:2px solid #0a0f1e;border-radius:50%;box-shadow:0 0 12px rgba(0,212,255,0.8)"></div>`,

        iconSize: [16, 16],

        iconAnchor: [8, 8],

      });

      const toIcon = L.divIcon({

        className: "",

        html: `<div style="width:16px;height:16px;background:#ffd700;border:2px solid #0a0f1e;border-radius:50%;box-shadow:0 0 12px rgba(255,215,0,0.8)"></div>`,

        iconSize: [16, 16],

        iconAnchor: [8, 8],

      });



      L.marker(selectedRoute.fromCoords, { icon: fromIcon })

        .bindTooltip(`FROM: ${selectedRoute.from}`, { permanent: false, className: "leaflet-tooltip-p3" })

        .addTo(map as any);

      L.marker(selectedRoute.toCoords, { icon: toIcon })

        .bindTooltip(`TO: ${selectedRoute.to}`, { permanent: false, className: "leaflet-tooltip-p3" })

        .addTo(map as any);



      // Fetch exact route from OSRM (Open Source Routing Machine API, public equivalent to OpenRouteService)

      try {

        const res = await fetch(

          `https://router.project-osrm.org/route/v1/driving/${selectedRoute.fromCoords[1]},${selectedRoute.fromCoords[0]};${selectedRoute.toCoords[1]},${selectedRoute.toCoords[0]}?overview=full&geometries=geojson`

        );

        const data = await res.json();

        

        if (data.routes && data.routes[0]) {

          const coords = data.routes[0].geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);

          

          L.polyline(coords, {

            color: "#00d4ff", weight: 4, opacity: 0.8,

            shadowColor: "#00d4ff", shadowBlur: 10

          } as any).addTo(map as any);



          const bounds = L.latLngBounds(coords);

          (map as { fitBounds: (b: unknown, o: unknown) => void }).fitBounds(bounds, { padding: [60, 60] });

        } else {

          throw new Error("No route found");

        }

      } catch (err) {

        console.error("Routing failed, falling back to straight line:", err);

        L.polyline([selectedRoute.fromCoords, selectedRoute.toCoords], {

          color: "#00d4ff", weight: 3, opacity: 0.8, dashArray: "8 4",

        }).addTo(map as any);

        

        const bounds = L.latLngBounds([selectedRoute.fromCoords, selectedRoute.toCoords]);

        (map as { fitBounds: (b: unknown, o: unknown) => void }).fitBounds(bounds, { padding: [60, 60] });

      }



      leafletRef.current = map;

    };



    initMap().catch(console.error);

    return () => {

      if (leafletRef.current) {

        (leafletRef.current as { remove: () => void }).remove();

        leafletRef.current = null;

      }

    };

  }, [selectedRoute]);



  return (

    <PageLayout title="Route Map" subtitle="Philippine delivery route visualization" badge="Phase 3 · Route Context" decoWord="MAP">

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Map */}

        <div className="lg:col-span-2 space-y-4">

          <CardSpotlight className="p3r-card overflow-hidden">

            <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid rgba(0,68,204,0.3)" }}>

              <div className="font-heading font-bold text-p3r-cyan flex items-center gap-2">

                ROUTE: {selectedRoute.name}

              </div>

              <span className="p3r-badge">{selectedRoute.distance} km</span>

            </div>

            <div

              ref={mapRef}

              className="w-full"

              style={{ height: "440px", filter: "brightness(0.7) saturate(0.4) hue-rotate(180deg)" }}

            />

          </CardSpotlight>



          {/* Route legend */}

          <div className="flex gap-3">

            <div className="p3r-card flex-1 p-4 flex items-center gap-3">

              <div className="w-4 h-4 rounded-full bg-p3-cyan shadow-p3-cyan flex-shrink-0" />

              <div>

                <div className="font-mono text-xs font-bold text-p3r-cyan">ORIGIN</div>

                <div className="font-mono text-xs text-[#4488DD]">{selectedRoute.from}</div>

                <div className="font-mono text-[10px] text-[#4488DD]/60">{selectedRoute.fromCoords.map(c => c.toFixed(4)).join(", ")}</div>

              </div>

            </div>

            <div className="p3r-card flex-1 p-4 flex items-center gap-3">

              <div className="w-4 h-4 rounded-full bg-[#ffd700] flex-shrink-0" style={{ boxShadow: "0 0 12px rgba(255,215,0,0.6)" }} />

              <div>

                <div className="font-mono text-xs font-bold text-[#ffd700]">DESTINATION</div>

                <div className="font-mono text-xs text-[#4488DD]">{selectedRoute.to}</div>

                <div className="font-mono text-[10px] text-[#4488DD]/60">{selectedRoute.toCoords.map(c => c.toFixed(4)).join(", ")}</div>

              </div>

            </div>

          </div>

        </div>



        {/* Stats panel */}

        <div className="space-y-4">

          <CardSpotlight className="p3r-card p-5">

            <h3 className="font-heading font-bold text-p3r-cyan mb-4">Trip Details</h3>

            <div className="space-y-3">

              {[

                { label: "Route Distance", value: `${vehicleConfig.routeDistance} km`, color: "text-p3r-cyan" },

                { label: "Truck Model", value: "Isuzu Elf / N-Series", color: "text-white" },

                { label: "Max Capacity", value: `${vehicleConfig.maxCapacity} kg`, color: "text-white" },

                { label: "Base FCR", value: `${vehicleConfig.baseFCR} L/km`, color: "text-[#4488DD]" },

                { label: "Diesel Price", value: formatPHP(vehicleConfig.dieselPrice) + "/L", color: "text-[#ffd700]" },

              ].map(({ label, value, color }) => (

                <div key={label} className="flex justify-between pb-2" style={{ borderBottom: "1px solid rgba(0,68,204,0.2)" }}>

                  <span className="font-mono text-xs text-[#4488DD]">{label}</span>

                  <span className={`font-mono text-xs font-bold ${color}`}>{value}</span>

                </div>

              ))}

            </div>

          </CardSpotlight>



          {currentRun && (

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

              <CardSpotlight className="p3r-card p-5">

                <h3 className="font-heading font-bold text-p3r-cyan mb-4">Cargo Load Summary</h3>

                <div className="space-y-3">

                  {[

                    { label: "Items Loaded", value: `${currentRun.knapsackResult.selectedItems.length} items`, color: "text-p3r-cyan" },

                    { label: "Total Weight", value: `${currentRun.knapsackResult.totalWeight.toFixed(0)} kg`, color: "text-p3r-cyan" },

                    { label: "Adjusted FCR", value: `${currentRun.fuelResult.adjustedFCR.toFixed(4)} L/km`, color: "text-p3r-cyan" },

                    { label: "Total Fuel", value: `${currentRun.fuelResult.totalFuel.toFixed(2)} L`, color: "text-p3r-cyan" },

                    { label: "Fuel Cost", value: formatPHP(currentRun.fuelResult.totalCost), color: "text-[#ffd700]" },

                    { label: "Efficiency (E)", value: formatNumber(currentRun.fuelResult.efficiency, 4), color: "text-green-400" },

                    { label: "Gain vs Naive", value: `+${formatNumber(currentRun.fuelResult.efficiencyGainPercent, 1)}%`, color: "text-green-400" },

                  ].map(({ label, value, color }) => (

                    <div key={label} className="flex justify-between pb-2" style={{ borderBottom: "1px solid rgba(0,68,204,0.2)" }}>

                      <span className="font-mono text-xs text-[#4488DD]">{label}</span>

                      <span className={`font-mono text-xs font-bold ${color}`}>{value}</span>

                    </div>

                  ))}

                </div>

              </CardSpotlight>



              {/* Weight bar */}

              <CardSpotlight className="p3r-card p-5 mt-4">

                <div className="font-mono text-xs text-[#4488DD] mb-2">Cargo Loading Visualization</div>

                <div className="space-y-2">

                  {currentRun.knapsackResult.selectedItems.slice(0, 6).map((item) => (

                    <div key={item.id}>

                      <div className="flex justify-between font-mono text-[10px] text-[#4488DD] mb-1">

                        <span>{item.name.substring(0, 18)}</span>

                        <span>{item.weight} kg</span>

                      </div>

                      <div className="h-1.5 bg-p3-navy rounded-full overflow-hidden">

                        <motion.div

                          initial={{ width: 0 }}

                          animate={{ width: `${(item.weight / vehicleConfig.maxCapacity) * 100}%` }}

                          transition={{ duration: 0.8 }}

                          className="h-full bg-p3-cyan rounded-full"

                        />

                      </div>

                    </div>

                  ))}

                  {currentRun.knapsackResult.selectedItems.length > 6 && (

                    <p className="font-mono text-[10px] text-[#4488DD]">+{currentRun.knapsackResult.selectedItems.length - 6} more items</p>

                  )}

                </div>

              </CardSpotlight>

            </motion.div>

          )}



          {!currentRun && (

            <CardSpotlight className="p3r-card p-5 text-center">

              <div className="font-mono text-xs text-[#4488DD]">No optimization run yet.</div>

              <a href="/cargo" className="font-mono text-xs text-p3r-cyan hover:underline">Run optimization →</a>

            </CardSpotlight>

          )}

        </div>

      </div>

    </PageLayout>

  );

}



