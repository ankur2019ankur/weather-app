"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export type HighlightOfDayData = {
  visibility: string;
  drivingConditions: string;
  pressure: string;
  stability: string;
  sunrise: string;
  sunset: string;
  airQuality: string;
  airQualityStatus: string;
};

type HighlightApiResponse = {
  message: string;
  data: HighlightOfDayData;
};

export function useHighlightOfDay() {
  const [data, setData] = useState<HighlightOfDayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const base =
      process.env.NEXT_PUBLIC_WEATHER_API_BASE_URL?.replace(/\/$/, "") ??
      "http://localhost:3005";
    const url = `${base}/api/hardcodedapi/highlight-of-day`;

    let cancelled = false;

    axios
      .get<HighlightApiResponse>(url, {
        headers: { accept: "application/json" },
      })
      .then((res) => {
        if (cancelled) return;
        if (res.data?.data) {
          setData(res.data.data);
        } else {
          setData(null);
          setError("Invalid response");
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setData(null);
        setError(axios.isAxiosError(err) ? err.message : "Request failed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { data, loading, error };
}
