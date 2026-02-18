import { Toaster } from "@/view/components/ui/toaster";
import { Toaster as Sonner } from "@/view/components/ui/sonner";
import { TooltipProvider } from "@/view/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/view/components/layout/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "@/view/Index";
import Atendimentos from "@/view/pages/atendimentos/Atendimentos";
import NovoAtendimento from "@/view/pages/atendimentos/NovoAtendimento";
import NotFound from "@/view/NotFound";
import Login from "@/view/Login";
import { ProtectedRoute } from "@/view/components/ProtectedRoute";
import Servicos from "@/view/pages/servicos/Servicos";
import NovoServico from "@/view/pages/servicos/NovoServico";
import Beneficios from "@/view/pages/beneficios/Beneficios";
import NovoBeneficio from "@/view/pages/beneficios/NovoBeneficio";
import Formulario from "@/view/pages/formulario/Formulario";
import Perfil from "@/view/Perfil";
import Colaboradores from "@/view/pages/colaboradores/Colaboradores";
import NovoColaborador from "@/view/pages/colaboradores/NovoColaborador";
import EditarColaborador from "@/view/pages/colaboradores/EditarColaborador";
import Relatorio from "@/view/pages/relatorios/Relatorios";
import NovoRelatorio from "@/view/pages/relatorios/NovoRelatorio";
import Idas from "@/view/idasaoBanco/Idas";
import NovaIda from "@/view/idasaoBanco/NovaIda";
import Processos from "@/view/processosAdvogados/Processos";
import NovoProcesso from "@/view/processosAdvogados/NovoProcesso";
import FinanceiroPage from "@/view/FinanceiroPage";
import Concessoes from "@/view/pages/concessoes/Concessoes";
import NovaConcessao from "@/view/pages/concessoes/NovaConcessao";

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
                    <Route path="/atendimentos/novo" element={<NovoAtendimento />} />
                    <Route path="/atendimentos/editar/:id" element={<NovoAtendimento />} />
                    <Route path="/servicos" element={<Servicos />} />
                    <Route path="/servicos/novo" element={<NovoServico />} />
                    <Route path="/servicos/editar/:id" element={<NovoServico />} />
                    <Route path="/beneficios" element={<Beneficios />} />
                    <Route path="/beneficios/novo" element={<NovoBeneficio />} />
                    <Route path="/beneficios/editar/:id" element={<NovoBeneficio />} />
                    <Route path="/formulario" element={<Formulario />} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/admin-colaboradores" element={<Colaboradores />} />
                    <Route path="/admin-colaboradores/novo" element={<NovoColaborador />} />
                    <Route path="/admin-colaboradores/editar/:id" element={<EditarColaborador />} />
                    <Route path="/relatorio" element={<Relatorio />} />
                    <Route path="/relatorio/novo" element={<NovoRelatorio />} />
                    <Route path="/relatorio/editar/:id" element={<NovoRelatorio />} />
                    
                    <Route path="/idas-banco" element={<Idas />} />
                    <Route path="/idas-banco/nova" element={<NovaIda />} />
                    <Route path="/idas-banco/editar/:id" element={<NovaIda />} />

                    <Route path="/processos-advogados" element={<Processos />} />
                    <Route path="/processos-advogados/novo" element={<NovoProcesso />} />
                    <Route path="/processos-advogados/editar/:id" element={<NovoProcesso />} />

                    <Route path="/financeiro" element={<FinanceiroPage />} />
                    <Route path="/concessoes" element={<Concessoes />} />
                    <Route path="/concessoes/novo" element={<NovaConcessao />} />
                    <Route path="/concessoes/editar/:id" element={<NovaConcessao />} />
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

