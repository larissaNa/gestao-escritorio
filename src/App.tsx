import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Atendimentos from "./pages/Atendimentos";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Servicos from "./pages/Servicos";
import Beneficios from "./pages/Beneficios";
import Formulario from "./pages/Formulario";
import Perfil from "./pages/Perfil";
import AdminColaboradores from "./pages/AdminColaboradores";
import Relatorio from "./pages/Relatorio";
import IdasBanco from "./pages/IdasBanco";
import ProcessosAdvogados from "./pages/ProcessosAdvogados";
import FinanceiroPage from "./pages/FinanceiroPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <AppLayout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/atendimentos" element={<Atendimentos />} />
                    <Route path="/servicos" element={<Servicos />} />
                    <Route path="/beneficios" element={<Beneficios />} />
                    <Route path="/formulario" element={<Formulario />} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/admin-colaboradores" element={<AdminColaboradores />} />
                    <Route path="/relatorio" element={<Relatorio />} />
                    <Route path="/idas-banco" element={<IdasBanco />} />
                    <Route path="processos-advogados" element={<ProcessosAdvogados />} />
                    <Route path="/financeiro" element={<FinanceiroPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
