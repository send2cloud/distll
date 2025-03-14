
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Distill from "./pages/Distill";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  console.log("App rendering, checking routes");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* Style-based summarization routes */}
            <Route path="/eli5/*" element={<Distill />} />
            <Route path="/simple/*" element={<Distill />} />
            <Route path="/esl/*" element={<Distill />} />
            <Route path="/tweet/*" element={<Distill />} />
            {/* Bullet count route */}
            <Route path="/:bulletCount(\d+)/*" element={<Distill />} />
            {/* Direct URL summarization - this MUST come last to avoid blocking other routes */}
            <Route path="/:url" element={<Distill />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
