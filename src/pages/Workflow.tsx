import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, AlertTriangle, ShoppingCart, UserCheck, RefreshCw } from "lucide-react";

const steps = [
  {
    icon: Package,
    title: "Check Inventory",
    desc: "System monitors current stock levels against configured thresholds in real-time.",
  },
  {
    icon: AlertTriangle,
    title: "Detect Shortage Risk",
    desc: "AI model predicts future demand and identifies potential shortage scenarios.",
  },
  {
    icon: ShoppingCart,
    title: "Trigger Reorder Process",
    desc: "When stock is projected to fall below reorder level, an automated purchase order is initiated.",
  },
  {
    icon: UserCheck,
    title: "Manager Approval",
    desc: "Reorder request is routed to the supply chain manager for review and approval.",
  },
  {
    icon: RefreshCw,
    title: "Update Stock",
    desc: "Once approved and received, inventory records are updated to reflect new stock levels.",
  },
];

export default function Workflow() {
  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h2 className="text-2xl font-bold text-foreground">BPM Workflow</h2>
          <p className="text-muted-foreground mt-1">
            Business Process Management workflow for automated reorder recommendations.
          </p>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Reorder Workflow Steps</CardTitle>
            <CardDescription>Automated process triggered when shortage risk is detected.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative pl-8">
              {/* Vertical line */}
              <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-border" />

              <div className="space-y-8">
                {steps.map((step, i) => (
                  <div key={i} className="relative flex gap-4">
                    {/* Dot */}
                    <div className="absolute -left-8 top-1 flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-card">
                        <step.icon className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Step {i + 1}: {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
