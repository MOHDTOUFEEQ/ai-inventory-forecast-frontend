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
import { useNavigate } from "react-router-dom";

export default function Results() {
  const { result, loading, config } = usePredictionState();
  const navigate = useNavigate();

  useEffect(() => {
    if (!result && !loading) {
      navigate("/forecast");
    }
  }, [loading, navigate, result]);

  if (!result) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-muted-foreground">
          Loading predictions...
        </div>
      </DashboardLayout>
    );
  }

  const histStart = Math.max(0, result.historicalDemand.length - result.forecastedDemand.length);
  const chartData = result.forecastedDemand.map((d, i) => ({
    day: `Day ${i + 1}`,
    date: result.forecastDates[i] ?? `Day ${i + 1}`,
    forecast: d,
    stock: result.stockLevels[i],
    historical: histStart + i < result.historicalDemand.length ? result.historicalDemand[histStart + i] : undefined,
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
      value: result.reorderRecommendation,
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

        <Card className="shadow-sm border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">AI Insight</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Forecast confidence is <span className="font-medium text-foreground">{(result.forecastConfidence * 100).toFixed(1)}%</span>.
              Predicted demand averages <span className="font-medium text-foreground">{result.predictedDemand}</span> units/day, and stock
              is projected to breach the reorder point in about{" "}
              <span className="font-medium text-foreground">{result.reorderDays === null ? "N/A" : result.reorderDays}</span>{" "}
              day(s).
            </p>
            <p>{result.reorderRecommendation}</p>
          </CardContent>
        </Card>

        {/* Forecast Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Demand Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="date" fontSize={12} />
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
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="stock" stroke="hsl(142 76% 36%)" strokeWidth={2} name="Stock Level" dot={false} />
                <ReferenceLine y={config.reorderLevel} stroke="hsl(0 84% 60%)" strokeDasharray="6 3" label="Reorder Point" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
