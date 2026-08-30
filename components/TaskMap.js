"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import Link from "next/link";

// Rundet "nål" med KB-mærket i midten, i samme stil som logoet i toppen af siden -
// pænere og mere brand-tro end Leaflets standard-nål.
function makeIcon(L) {
  return L.divIcon({
    className: "",
    html: `
      <div style="position:relative; width:34px; height:40px;">
        <div style="position:absolute; top:0; left:0; width:34px; height:34px; border-radius:11px 11px 11px 3px; background:#2A55E5; transform:rotate(45deg); box-shadow:0 3px 8px rgba(20,33,61,.35);"></div>
        <div style="position:absolute; top:5px; left:5px; width:24px; height:24px; display:flex; align-items:center; justify-content:center; color:#fff; font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:11px;">KB</div>
      </div>`,
    iconSize: [34, 40],
    iconAnchor: [17, 36],
    popupAnchor: [0, -34],
  });
}

// Klynge-bobler når flere opgaver ligger tæt på hinanden - viser et antal i stedet
// for overlappende nåle, ligesom Handyhands kort.
function makeClusterIcon(L) {
  return (cluster) => {
    const count = cluster.getChildCount();
    const size = count < 10 ? 34 : count < 100 ? 40 : 46;
    return L.divIcon({
      html: `<div style="width:${size}px; height:${size}px; border-radius:50%; background:#2A55E5; border:3px solid #fff; box-shadow:0 3px 10px rgba(20,33,61,.35); display:flex; align-items:center; justify-content:center; color:#fff; font-family:'Plus Jakarta Sans',sans-serif; font-weight:800; font-size:${count < 100 ? 13 : 11}px;">${count}</div>`,
      className: "",
      iconSize: [size, size],
    });
  };
}

export default function TaskMap({ tasks }) {
  const [L, setL] = useState(null);

  useEffect(() => {
    import("leaflet").then((mod) => setL(mod.default || mod));
  }, []);

  const points = tasks.filter((t) => t.lat && t.lng);
  const center = points.length ? [points[0].lat, points[0].lng] : [55.6761, 12.5683]; // København som default

  if (!L) {
    return (
      <div style={{ borderRadius: 16, border: "1.5px solid #E4E8F0", height: "100%", minHeight: 420, display: "flex", alignItems: "center", justifyContent: "center", color: "#5B6478", fontSize: 13 }}>
        Indlæser kort…
      </div>
    );
  }

  const icon = makeIcon(L);

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid #E4E8F0", height: "100%", minHeight: 420 }}>
      <MapContainer center={center} zoom={points.length ? 8 : 7} style={{ height: "100%", width: "100%", minHeight: 420 }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-bidragydere'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MarkerClusterGroup iconCreateFunction={makeClusterIcon(L)} maxClusterRadius={50} spiderfyOnMaxZoom={true}>
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
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
