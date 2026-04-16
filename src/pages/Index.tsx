import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Package, AlertTriangle, Brain } from "lucide-react";

const stats = [
  { title: "Avg Daily Demand", value: "52 units", icon: TrendingUp, color: "text-primary" },
  { title: "Current Stock", value: "500 units", icon: Package, color: "text-muted-foreground" },
  { title: "Shortage Alerts", value: "0 active", icon: AlertTriangle, color: "text-success" },
  { title: "Model Accuracy", value: "94.2%", icon: Brain, color: "text-primary" },
];

export default function Index() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Predict future demand using Moving Average and detect stock shortage risks using AI and BPM workflow logic.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
