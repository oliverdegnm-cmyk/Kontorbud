"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

function makeIcon(L) {
  return L.divIcon({
    className: "",
    html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:#2A55E5;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(20,33,61,.35);"><div style="width:10px;height:10px;border-radius:50%;background:#fff;transform:rotate(45deg);"></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30],
  });
}

export default function TaskMap({ tasks }) {
  const [icon, setIcon] = useState(null);

  useEffect(() => {
    import("leaflet").then((L) => setIcon(makeIcon(L)));
  }, []);

  const points = tasks.filter((t) => t.lat && t.lng);
  const center = points.length ? [points[0].lat, points[0].lng] : [55.6761, 12.5683]; // København som default

  if (!icon) {
    return (
      <div style={{ borderRadius: 16, border: "1.5px solid #E4E8F0", height: "100%", minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center", color: "#5B6478", fontSize: 13 }}>
        Indlæser kort…
      </div>
    );
  }

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid #E4E8F0", height: "100%", minHeight: 420 }}>
      <MapContainer center={center} zoom={points.length ? 8 : 7} style={{ height: "100%", width: "100%", minHeight: 420 }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-bidragydere'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((t) => (
          <Marker key={t.id} position={[t.lat, t.lng]} icon={icon}>
            <Popup>
              <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", minWidth: 160 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: "#5B6478", marginBottom: 6 }}>{t.budget}</div>
                <Link href={`/opgave/${t.id}`} style={{ fontSize: 12, fontWeight: 700, color: "#2A55E5" }}>
                  Se opgave →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
