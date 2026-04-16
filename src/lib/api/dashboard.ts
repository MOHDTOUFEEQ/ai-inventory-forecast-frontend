import { http } from "./http";

export type DashboardSummaryResponse = {
  avg_daily_demand: number;
  current_stock: number;
  shortage_alerts: number;
  shortage_risk_level: "low" | "high";
  forecast_accuracy: number;
  days_until_shortage: number | null;
  last_forecast_date: string | null;
};

export type PredictionHistoryItem = {
  _id: string;
  timestamp: string;
  forecast_horizon: number;
  window_size: number;
  initial_stock: number;
  reorder_level: number;
  avg_daily_demand: number;
  shortage_risk: boolean;
  days_until_shortage?: number | null;
  reorder_recommendation: string;
};

export type LatestPredictionItem = {
  _id: string;
  timestamp: string;
  forecast_horizon: number;
  window_size: number;
  initial_stock: number;
  reorder_level: number;
  avg_daily_demand: number;
  confidence_score?: number;
  forecast_dates?: string[];
  forecast_values?: number[];
  stock_levels?: number[];
  shortage_risk: boolean;
  days_until_shortage?: number | null;
  reorder_recommendation: string;
};

export async function getDashboardSummary(): Promise<DashboardSummaryResponse> {
  const { data } = await http.get<DashboardSummaryResponse>("/dashboard-summary");
  return data;
}

export async function getPredictionHistory(): Promise<{ items: PredictionHistoryItem[] }> {
  const { data } = await http.get<{ items: PredictionHistoryItem[] }>("/prediction-history");
  return data;
}

export async function getLatestPrediction(): Promise<{ item: LatestPredictionItem | null }> {
  const { data } = await http.get<{ item: LatestPredictionItem | null }>("/latest-prediction");
  return data;
}

