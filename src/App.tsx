import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PredictionProvider } from "@/lib/prediction-store";
import Index from "./pages/Index";
import Forecast from "./pages/Forecast";
import Results from "./pages/Results";
import Workflow from "./pages/Workflow";
import ModelInfo from "./pages/ModelInfo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PredictionProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/forecast" element={<Forecast />} />
            <Route path="/results" element={<Results />} />
            <Route path="/workflow" element={<Workflow />} />
            <Route path="/model-info" element={<ModelInfo />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PredictionProvider>
  </QueryClientProvider>
);

export default App;
