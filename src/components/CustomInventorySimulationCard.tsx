import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { predict } from "@/lib/api/prediction";
import { computeReorderActionDays, getFirstBreachIndex, getReorderDay } from "@/lib/simulation-utils";

type CustomScenarioForm = {
  productName: string;
  initialStockLevel: number;
  currentInventoryLevel: number;
  estimatedDailyDemand: number;
  forecastPeriod: number;
  reorderLevel: number;
  leadTimeDays: number;
};

type CustomScenarioResult = {
  forecastDates: string[];
  forecastValues: number[];
  stockLevels: number[];
  shortageRisk: boolean;
  reorderRecommendation: string;
};

export function CustomInventorySimulationCard() {
  const [form, setForm] = useState<CustomScenarioForm>({
    productName: "",
    initialStockLevel: 500,
    currentInventoryLevel: 500,
    estimatedDailyDemand: 25,
    forecastPeriod: 14,
    reorderLevel: 100,
    leadTimeDays: 3,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CustomScenarioResult | null>(null);

  const chartData = useMemo(() => {
    if (!result) return [];
    return result.stockLevels.map((stock, i) => ({
      day: `Day ${i + 1}`,
      date: result.forecastDates[i],
      stock,
      demand: result.forecastValues[i],
    }));
  }, [result]);

  const reorderDay = useMemo(() => {
    if (!result) return null;
    return getReorderDay(result.stockLevels, form.reorderLevel);
  }, [result, form.reorderLevel]);

  const actionDay = useMemo(() => {
    if (!result) return null;
    const breachIdx = getFirstBreachIndex(result.stockLevels, form.reorderLevel);
    return computeReorderActionDays(breachIdx, form.leadTimeDays);
  }, [result, form.reorderLevel, form.leadTimeDays]);

  const handleRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await predict({
        forecast_horizon: form.forecastPeriod,
        initial_stock: form.currentInventoryLevel,
        reorder_point: form.reorderLevel,
        window_size: 7,
        estimated_daily_demand: form.estimatedDailyDemand,
        lead_time_days: form.leadTimeDays,
        product_name: form.productName,
        current_inventory_level: form.currentInventoryLevel,
        initial_stock_level: form.initialStockLevel,
      });

      setResult({
        forecastDates: res.forecast_dates,
        forecastValues: res.forecast_values,
        stockLevels: res.stock_levels,
        shortageRisk: res.shortage_risk,
        reorderRecommendation: res.reorder_recommendation,
      });
    } catch (e) {
      const message =
        e && typeof e === "object" && "message" in e
          ? String((e as { message: unknown }).message)
          : "Simulation failed. Please check your inputs.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">Custom Inventory Scenario Testing</CardTitle>
        <CardDescription>
          Simulate inventory changes based on your own expected demand and stock values.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="productName">Product Name / Item Name</Label>
            <Input
              id="productName"
              value={form.productName}
              placeholder="e.g., Steel Rod 10mm"
              onChange={(e) => setForm((p) => ({ ...p, productName: e.target.value }))}
            />
          </div>

          {[
            { key: "initialStockLevel" as const, label: "Initial Stock Level", help: "Starting stock for the scenario" },
            { key: "currentInventoryLevel" as const, label: "Current Inventory Level", help: "Stock used as simulation starting point" },
            { key: "estimatedDailyDemand" as const, label: "Estimated Daily Demand", help: "Overrides model demand (units/day)" },
            { key: "forecastPeriod" as const, label: "Forecast Period (days)", help: "Number of days to simulate" },
            { key: "reorderLevel" as const, label: "Reorder Level", help: "Threshold to trigger reorder" },
            { key: "leadTimeDays" as const, label: "Lead Time (days)", help: "Days required to receive replenishment" },
          ].map((field) => (
            <div key={field.key} className="space-y-1.5">
              <Label htmlFor={field.key}>{field.label}</Label>
              <Input
                id={field.key}
                type="number"
                value={form[field.key]}
                onChange={(e) => setForm((p) => ({ ...p, [field.key]: Number(e.target.value) }))}
              />
              <p className="text-xs text-muted-foreground">{field.help}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <Button onClick={handleRun} disabled={loading} size="lg" className="w-full sm:w-auto">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Run Custom Simulation
          </Button>

          {result && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Status:</span>
              <Badge
                variant={result.shortageRisk ? "destructive" : "default"}
                className={result.shortageRisk ? "" : "bg-success text-success-foreground"}
              >
                {result.shortageRisk ? "Shortage Risk Detected" : "Stock Safe"}
              </Badge>
            </div>
          )}
        </div>

        {result && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Stock Level Projection</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="stock"
                        stroke="hsl(142 76% 36%)"
                        strokeWidth={2}
                        name="Stock Level"
                        dot={false}
                      />
                      <ReferenceLine
                        y={form.reorderLevel}
                        stroke="hsl(0 84% 60%)"
                        strokeDasharray="6 3"
                        label="Reorder Level"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Demand Assumption</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="demand"
                        stroke="hsl(217 91% 60%)"
                        strokeWidth={2}
                        name="Estimated Demand"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="rounded-lg border bg-card p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                {form.productName ? (
                  <>
                    <span className="font-medium text-foreground">{form.productName}</span> —{" "}
                  </>
                ) : null}
                {result.reorderRecommendation}
              </p>

              {actionDay !== null ? (
                <p className="text-sm">
                  <span className="font-medium">Reorder required in:</span>{" "}
                  {actionDay === 0 ? "Today" : `${actionDay} day(s)`}{" "}
                  <span className="text-muted-foreground">
                    (Lead time: {form.leadTimeDays} day(s), breach around day {reorderDay ?? "N/A"})
                  </span>
                </p>
              ) : (
                <p className="text-sm">
                  <span className="font-medium">Reorder required in:</span>{" "}
                  <span className="text-muted-foreground">Not required in this period</span>
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

