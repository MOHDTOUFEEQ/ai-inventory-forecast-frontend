import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ModelInfo() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Model Explanation</h2>
          <p className="text-muted-foreground mt-1">Understanding the AI prediction approach.</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Moving Average Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              The system uses a <strong className="text-foreground">Simple Moving Average (SMA)</strong> to forecast future demand based on historical consumption patterns.
            </p>

            <div className="bg-muted rounded-lg p-4 font-mono text-center text-foreground">
              ŷ<sub>t</sub> = (1/n) × Σ y<sub>t−i</sub> &nbsp; for i = 1 to n
            </div>

            <div className="space-y-2">
              <p><strong className="text-foreground">Where:</strong></p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong className="text-foreground">ŷ<sub>t</sub></strong> — Predicted demand at time t</li>
                <li><strong className="text-foreground">n</strong> — Window size (number of historical periods)</li>
                <li><strong className="text-foreground">y<sub>t−i</sub></strong> — Actual demand at time t−i</li>
              </ul>
            </div>

            <p>
              The model smooths out short-term fluctuations and highlights longer-term trends. A larger window produces a smoother forecast but responds slower to changes, while a smaller window is more responsive but noisier.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Shortage Detection Logic</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>The system projects future stock levels by subtracting predicted daily demand from the current inventory:</p>
            <div className="bg-muted rounded-lg p-4 font-mono text-center text-foreground">
              Stock<sub>t+k</sub> = Stock<sub>t</sub> − Σ ŷ<sub>t+j</sub> &nbsp; for j = 1 to k
            </div>
            <p>
              If projected stock falls below the <strong className="text-foreground">reorder level</strong> within the forecast horizon, the system flags a <strong className="text-destructive">shortage risk</strong> and triggers the BPM reorder workflow.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
