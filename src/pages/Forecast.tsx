import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2 } from "lucide-react";
import { usePredictionState } from "@/lib/prediction-store";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { CustomInventorySimulationCard } from "@/components/CustomInventorySimulationCard";

export default function Forecast() {
  const { file, setFile, config, setConfig, loading, error, runPrediction } = usePredictionState();
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRun = async () => {
    const ok = await runPrediction();
    if (ok) {
      navigate("/results");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Forecast Configuration</h2>
          <p className="text-muted-foreground mt-1">Upload your dataset and configure prediction parameters.</p>
        </div>

        {/* File Upload */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Upload Inventory Dataset</CardTitle>
            <CardDescription>Accept CSV files containing historical demand data.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => inputRef.current?.click()}
            >
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                {file ? file.name : "Click to upload or drag & drop a CSV file"}
              </p>
              <input
                ref={inputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Parameters */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Prediction Parameters</CardTitle>
            <CardDescription>Configure the moving average forecast model.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key: "forecastHorizon" as const, label: "Forecast Horizon (days)", help: "Number of days to predict ahead" },
              { key: "initialStock" as const, label: "Initial Stock Level", help: "Current inventory quantity" },
              { key: "reorderLevel" as const, label: "Reorder Level", help: "Threshold to trigger reorder" },
              { key: "windowSize" as const, label: "Moving Average Window", help: "Number of past days for average (default 7)" },
            ].map((field) => (
              <div key={field.key} className="space-y-1.5">
                <Label htmlFor={field.key}>{field.label}</Label>
                <Input
                  id={field.key}
                  type="number"
                  value={config[field.key]}
                  onChange={(e) =>
                    setConfig({ ...config, [field.key]: Number(e.target.value) })
                  }
                />
                <p className="text-xs text-muted-foreground">{field.help}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        <Button onClick={handleRun} disabled={loading} size="lg" className="w-full sm:w-auto">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Run Forecast
        </Button>

        {/* Custom Inventory Simulation */}
        <CustomInventorySimulationCard />
      </div>
    </DashboardLayout>
  );
}
