import { createContext, createElement, useCallback, useContext, useState, type ReactNode } from "react";
import { predict } from "@/lib/api/prediction";
import { getReorderDay } from "@/lib/simulation-utils";

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
  reorderDays: number | null;
  reorderRecommendation: string;
  forecastConfidence: number;
  historicalDemand: number[];
  forecastedDemand: number[];
  forecastDates: string[];
  stockLevels: number[];
}

type PredictionState = {
  file: File | null;
  setFile: (f: File | null) => void;
  config: PredictionConfig;
  setConfig: (c: PredictionConfig) => void;
  result: PredictionResult | null;
  loading: boolean;
  error: string | null;
  runPrediction: () => Promise<boolean>;
};

function usePredictionStateInternal(): PredictionState {
  const [file, setFile] = useState<File | null>(null);
  const [config, setConfig] = useState<PredictionConfig>({
    forecastHorizon: 14,
    initialStock: 300,
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
      // Backend expects snake_case fields (Flask /predict)
      const res = await predict({
        forecast_horizon: config.forecastHorizon,
        initial_stock: config.initialStock,
        reorder_point: config.reorderLevel,
        window_size: config.windowSize,
      }, file);

      const predictedDemand =
        res.forecast_values.length > 0
          ? res.forecast_values.reduce((a, b) => a + b, 0) / res.forecast_values.length
          : 0;
      const reorderDays = getReorderDay(res.stock_levels, config.reorderLevel);
      const used = res.used_parameters;
      const currentStock = used?.initial_stock ?? config.initialStock;

      setResult({
        predictedDemand: Math.round(predictedDemand),
        currentStock,
        shortageRisk: res.shortage_risk ? "risk" : "safe",
        reorderDays,
        reorderRecommendation: res.reorder_recommendation,
        forecastConfidence: res.forecast_confidence ?? 0,
        historicalDemand: res.historical_demand ?? [],
        forecastedDemand: res.forecast_values,
        forecastDates: res.forecast_dates,
        stockLevels: res.stock_levels,
      });
      return true;
    } catch (e) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : "Prediction failed. Please check your inputs.";
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [config, file]);

  return { file, setFile, config, setConfig, result, loading, error, runPrediction };
}

const PredictionContext = createContext<PredictionState | null>(null);

export function PredictionProvider({ children }: { children: ReactNode }) {
  const state = usePredictionStateInternal();
  return createElement(PredictionContext.Provider, { value: state }, children);
}

export function usePredictionState(): PredictionState {
  const ctx = useContext(PredictionContext);
  if (!ctx) {
    throw new Error("usePredictionState must be used within <PredictionProvider />");
  }
  return ctx;
}
