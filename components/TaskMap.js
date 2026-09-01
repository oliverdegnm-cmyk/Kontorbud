"use client";

import { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { MarkerClusterer } from "@googlemaps/markerclusterer";

// Brand-farvet nål med KB-prik i midten, i stedet for Googles standard røde dråbe.
function brandIcon(google) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="40" viewBox="0 0 34 40">
    <path d="M17 0C7.6 0 0 7.6 0 17c0 12 17 23 17 23s17-11 17-23C34 7.6 26.4 0 17 0z" fill="#2A55E5"/>
    <circle cx="17" cy="16" r="6.5" fill="#fff"/>
  </svg>`;
  return {
    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg),
    scaledSize: new google.maps.Size(34, 40),
    anchor: new google.maps.Point(17, 40),
  };
}

export default function TaskMap({ tasks }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const clustererRef = useRef(null);
  const [googleObj, setGoogleObj] = useState(null);
  const [error, setError] = useState("");

  const points = tasks.filter((t) => t.lat && t.lng);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError("Google Maps-nøgle mangler. Tilføj NEXT_PUBLIC_GOOGLE_MAPS_API_KEY i Vercel.");
      return;
    }
    const loader = new Loader({ apiKey, version: "weekly" });
    loader
      .load()
      .then((google) => {
        if (!mapRef.current) return;
        const center = points.length ? { lat: points[0].lat, lng: points[0].lng } : { lat: 55.6761, lng: 12.5683 };
        mapInstance.current = new google.maps.Map(mapRef.current, {
          center,
          zoom: points.length ? 8 : 7,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        });
        setGoogleObj(google);
      })
      .catch(() => setError("Kunne ikke indlæse Google Maps. Tjek at nøglen er korrekt og faktureringen er aktiveret."));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!googleObj || !mapInstance.current) return;
    if (clustererRef.current) clustererRef.current.clearMarkers();

    const markers = points.map((t) => {
      const marker = new googleObj.maps.Marker({
        position: { lat: t.lat, lng: t.lng },
        title: t.title,
        icon: brandIcon(googleObj),
      });
      const info = new googleObj.maps.InfoWindow({
        content: `<div style="font-family:'Plus Jakarta Sans',sans-serif;min-width:160px">
          <div style="font-weight:700;font-size:13px;margin-bottom:4px">${t.title}</div>
          <div style="font-size:12px;color:#5B6478;margin-bottom:6px">${t.budget}</div>
          <a href="/opgave/${t.id}" style="font-size:12px;font-weight:700;color:#2A55E5">Se opgave →</a>
        </div>`,
      });
      marker.addListener("click", () => info.open({ anchor: marker, map: mapInstance.current }));
      return marker;
    });

    clustererRef.current = new MarkerClusterer({ map: mapInstance.current, markers });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleObj, tasks]);

  if (error) {
    return (
      <div style={{ borderRadius: 16, border: "1.5px solid #E4E8F0", height: "100%", minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center", color: "#C0392B", fontSize: 13, padding: 20, textAlign: "center" }}>
        {error}
      </div>
    );
  }

  return (
    <div
      ref={mapRef}
      style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid #E4E8F0", height: "100%", minHeight: 420 }}
    >
      {!googleObj && (
        <div style={{ height: "100%", minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center", color: "#5B6478", fontSize: 13 }}>
          Indlæser kort…
        </div>
      )}
    </div>
  );
}
