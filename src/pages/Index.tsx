import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, AlertTriangle, Brain, CalendarDays } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getDashboardSummary, type DashboardSummaryResponse } from "@/lib/api/dashboard";

export default function Index() {
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      getDashboardSummary()
        .then((d) => {
          if (!cancelled) setSummary(d);
        })
        .catch(() => {
          if (!cancelled) setSummary(null);
        });

    load();
    const id = window.setInterval(load, 5000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const daysRemaining = useMemo(() => {
    if (!summary) return null;
    if (!summary.avg_daily_demand || summary.avg_daily_demand <= 0) return null;
    return summary.current_stock / summary.avg_daily_demand;
  }, [summary]);

  const insight = useMemo(() => {
    if (!summary) return "Run a forecast to see live insights.";
    const avg = summary.avg_daily_demand ?? 0;
    const stock = summary.current_stock ?? 0;
    const days = daysRemaining ?? 0;
    const risk = summary.shortage_risk_level === "high" ? "HIGH" : "LOW";
    return `Demand average is ${avg.toFixed(2)} units per day. Current stock of ${stock.toFixed(
      0
    )} units will last ${days ? days.toFixed(1) : "N/A"} days. Shortage risk is ${risk}. Last forecast date: ${
      summary.last_forecast_date ?? "N/A"
    }.`;
  }, [summary, daysRemaining]);

  const stats = useMemo(
    () => [
      {
        title: "Avg Daily Demand",
        value: summary ? `${summary.avg_daily_demand.toFixed(2)} units/day` : "—",
        icon: TrendingUp,
        color: "text-primary",
      },
      {
        title: "Current Stock",
        value: summary ? `${summary.current_stock.toFixed(0)} units` : "—",
        icon: Package,
        color: "text-muted-foreground",
      },
      {
        title: "Shortage Risk Level",
        value: summary ? (summary.shortage_risk_level === "high" ? "High Risk" : "Low Risk") : "—",
        icon: AlertTriangle,
        color: summary && summary.shortage_risk_level === "high" ? "text-destructive" : "text-success",
      },
      {
        title: "Forecast Confidence",
        value: summary ? `${(summary.forecast_accuracy * 100).toFixed(1)}%` : "—",
        icon: Brain,
        color: "text-purple-600",
      },
      {
        title: "Days Until Shortage",
        value: summary && summary.days_until_shortage != null ? `${summary.days_until_shortage} days` : "N/A",
        icon: AlertTriangle,
        color: summary && summary.days_until_shortage != null && summary.days_until_shortage <= 7 ? "text-destructive" : "text-success",
      },
      {
        title: "Last Forecast Date",
        value: summary?.last_forecast_date ?? "—",
        icon: CalendarDays,
        color: "text-muted-foreground",
      },
    ],
    [summary]
  );

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Predict future demand using Moving Average and detect stock shortage risks using AI and BPM workflow logic.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {stats.map((s) => (
            <Card key={s.title} className="shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.title}</CardTitle>
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">AI Insight</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>{insight}</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-2">
            <p>1. Navigate to <strong>Forecast</strong> to upload a dataset and configure prediction parameters.</p>
            <p>2. Click <strong>Run Forecast</strong> to generate demand predictions using the Moving Average model.</p>
            <p>3. View charts and shortage risk indicators on the <strong>Results</strong> page.</p>
            <p>4. Explore the <strong>Workflow</strong> page to see the BPM-based reorder process.</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
