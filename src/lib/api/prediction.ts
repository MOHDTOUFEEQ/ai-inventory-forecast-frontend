import { http } from "./http";

export type PredictRequest = {
  forecast_horizon: number;
  initial_stock: number;
  reorder_point: number;
  window_size?: number;
  estimated_daily_demand?: number;
  lead_time_days?: number;
  product_name?: string;
  current_inventory_level?: number;
  initial_stock_level?: number;
};

export type PredictResponse = {
  forecast_dates: string[];
  forecast_values: number[];
  historical_demand?: number[];
  stock_levels: number[];
  shortage_risk: boolean;
  reorder_recommendation: string;
  days_until_shortage?: number | null;
  forecast_confidence?: number;
  used_parameters?: {
    forecast_horizon: number;
    initial_stock: number;
    reorder_point: number;
    window_size: number;
  };
};

export async function predict(request: PredictRequest, file?: File | null): Promise<PredictResponse> {
  if (file) {
    const form = new FormData();
    for (const [k, v] of Object.entries(request)) {
      if (v === undefined || v === null) continue;
      form.append(k, String(v));
    }
    form.append("file", file);
    const { data } = await http.post<PredictResponse>("/predict", form);
    return data;
  }

  const { data } = await http.post<PredictResponse>("/predict", request);
  return data;
}

