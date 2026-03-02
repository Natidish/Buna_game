import { useEffect, useState } from "react";
import { TelegramWebApp } from "@twa-dev/sdk";

const API_URL = "http://localhost:3001";

export default function BunaGame() {
  const [userId, setUserId] = useState("");
  const [points, setPoints] = useState(0);
  const [energy, setEnergy] = useState(100);

  useEffect(() => {
    TelegramWebApp.ready();
    const id = TelegramWebApp.initDataUnsafe?.user?.id?.toString();
    setUserId(id);

    fetch(`${API_URL}/api/user/${id}`)
      .then(r => r.json())
      .then(d => {
        setPoints(d.points);
        setEnergy(d.energy);
      });
  }, []);

  const tap = async () => {
    const res = await fetch(`${API_URL}/api/tap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
