
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Distill from "./pages/Distill";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          {/* Style-based summarization routes */}
          <Route path="/eli5/:url" element={<Distill />} />
          <Route path="/simple/:url" element={<Distill />} />
          <Route path="/esl/:url" element={<Distill />} />
          <Route path="/tweet/:url" element={<Distill />} />
          {/* Bullet count route - needs to be before the generic URL route */}
          <Route path="/:bulletCount(\d+)/:url" element={<Distill />} />
          {/* Direct URL summarization (no prefix) */}
          <Route path="/:url" element={<Distill />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
