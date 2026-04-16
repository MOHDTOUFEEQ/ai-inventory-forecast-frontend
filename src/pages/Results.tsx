import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Package, AlertTriangle, RefreshCw } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { usePredictionState } from "@/lib/prediction-store";
import { useEffect } from "react";

export default function Results() {
  const { result, runPrediction, loading } = usePredictionState();

  // Auto-run if no result
  useEffect(() => {
    if (!result && !loading) {
      runPrediction();
    }
  }, []);

  if (!result) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Loading predictions...
        </div>
      </DashboardLayout>
    );
  }

  const chartData = result.forecastedDemand.map((d, i) => ({
    day: `Day ${i + 1}`,
    forecast: d,
    stock: result.stockLevels[i],
    historical: i < result.historicalDemand.length ? result.historicalDemand[i] : undefined,
  }));

  const cards = [
    {
      title: "Predicted Daily Demand",
      value: `${result.predictedDemand} units/day`,
      icon: TrendingUp,
    },
    {
      title: "Current Stock Level",
      value: `${result.currentStock} units`,
      icon: Package,
    },
    {
      title: "Shortage Risk",
      value: result.shortageRisk === "safe" ? "Safe" : "Risk Detected",
      icon: AlertTriangle,
      badge: result.shortageRisk,
    },
    {
      title: "Reorder Recommendation",
      value: `Reorder suggested in ${result.reorderDays} days`,
      icon: RefreshCw,
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <h2 className="text-2xl font-bold text-foreground">Prediction Results</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c) => (
            <Card key={c.title} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.title}</CardTitle>
                <c.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-xl font-bold">{c.value}</p>
                {c.badge && (
                  <Badge
                    variant={c.badge === "safe" ? "default" : "destructive"}
                    className={c.badge === "safe" ? "mt-2 bg-success text-success-foreground" : "mt-2"}
                  >
                    {c.badge === "safe" ? "Safe" : "Risk"}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Forecast Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Demand Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="forecast" stroke="hsl(217 91% 60%)" strokeWidth={2} name="Forecasted Demand" dot={false} />
                {chartData[0]?.historical !== undefined && (
                  <Line type="monotone" dataKey="historical" stroke="hsl(220 10% 70%)" strokeWidth={1.5} strokeDasharray="4 4" name="Historical Demand" dot={false} />
                )}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Stock Levels Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Stock Level Projection</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="day" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="stock" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Stock Level" dot={false} />
                <ReferenceLine y={100} stroke="hsl(0 84% 60%)" strokeDasharray="6 3" label="Reorder Point" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
