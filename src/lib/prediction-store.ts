import { useState, useCallback } from "react";

export interface PredictionConfig {
  forecastHorizon: number;
  initialStock: number;
  reorderLevel: number;
  windowSize: number;
}

export interface PredictionResult {
  predictedDemand: number;
  currentStock: number;
  shortageRisk: "safe" | "risk";
  reorderDays: number;
  historicalDemand: number[];
  forecastedDemand: number[];
  stockLevels: number[];
}

// Simple moving average simulation for demo
export function runLocalPrediction(
  config: PredictionConfig,
  data: number[]
): PredictionResult {
  const { forecastHorizon, initialStock, reorderLevel, windowSize } = config;
  const w = Math.min(windowSize, data.length);
  const recent = data.slice(-w);
  const avgDemand = recent.reduce((a, b) => a + b, 0) / w;

  const forecasted: number[] = [];
  const stockLevels: number[] = [];
  let stock = initialStock;

  for (let i = 0; i < forecastHorizon; i++) {
    const noise = avgDemand * (0.9 + Math.random() * 0.2);
    forecasted.push(Math.round(noise));
    stock -= noise;
    stockLevels.push(Math.round(stock));
  }

  const reorderDay = stockLevels.findIndex((s) => s <= reorderLevel);

  return {
    predictedDemand: Math.round(avgDemand),
    currentStock: initialStock,
    shortageRisk: reorderDay >= 0 && reorderDay <= 3 ? "risk" : "safe",
    reorderDays: reorderDay >= 0 ? reorderDay + 1 : forecastHorizon,
    historicalDemand: data.slice(-30),
    forecastedDemand: forecasted,
    stockLevels,
  };
}

const SAMPLE_DATA = Array.from({ length: 60 }, () =>
  Math.floor(40 + Math.random() * 30)
);

export function usePredictionState() {
  const [file, setFile] = useState<File | null>(null);
  const [config, setConfig] = useState<PredictionConfig>({
    forecastHorizon: 14,
    initialStock: 500,
    reorderLevel: 100,
    windowSize: 7,
  });
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runPrediction = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 1500));
      const res = runLocalPrediction(config, SAMPLE_DATA);
      setResult(res);
    } catch {
      setError("Prediction failed. Please check your inputs.");
    } finally {
      setLoading(false);
    }
  }, [config]);

  return { file, setFile, config, setConfig, result, loading, error, runPrediction };
}
