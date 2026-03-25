import { Toaster } from "@/view/components/ui/toaster";
import { Toaster as Sonner } from "@/view/components/ui/sonner";
import { TooltipProvider } from "@/view/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/view/components/layout/AppSidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "@/view/Index";
import Atendimentos from "@/view/atendimentos/Atendimentos";
import FechamentosAtendimentos from "@/view/atendimentos/FechamentosAtendimentos";
import HistoricoAtendimentos from "@/view/atendimentos/HistoricoAtendimentos";
import NovoAtendimento from "@/view/atendimentos/NovoAtendimento";
import NotFound from "@/view/NotFound";
import Login from "@/view/Login";
import { ProtectedRoute } from "@/view/components/ProtectedRoute";
import Servicos from "@/view/servicos/Servicos";
import NovoServico from "@/view/servicos/NovoServico";
import Beneficios from "@/view/beneficios/Beneficios";
import NovoBeneficio from "@/view/beneficios/NovoBeneficio";
import Formulario from "@/view/formulario/Formulario";
import Perfil from "@/view/Perfil";
import Colaboradores from "@/view/colaboradores/Colaboradores";
import NovoColaborador from "@/view/colaboradores/NovoColaborador";
import EditarColaborador from "@/view/colaboradores/EditarColaborador";
import Listas from "@/view/admin/Listas";
import Relatorio from "@/view/relatorios/Relatorios";
import NovoRelatorio from "@/view/relatorios/NovoRelatorio";
import RelatorioMensal from "@/view/relatorios/RelatorioMensal";
import Idas from "@/view/idasaoBanco/Idas";
import NovaIda from "@/view/idasaoBanco/NovaIda";
import Processos from "@/view/processosAdvogados/Processos";
import NovoProcesso from "@/view/processosAdvogados/NovoProcesso";
import FinanceiroPage from "@/view/FinanceiroPage";
import FinanceiroDashboardPage from "@/view/FinanceiroDashboardPage";
import FinanceiroFluxoCaixaPage from "@/view/FinanceiroFluxoCaixaPage";

import Concessoes from "@/view/concessoes/Concessoes";
import NovaConcessao from "@/view/concessoes/NovaConcessao";
import ExportarConcessoes from "@/view/concessoes/ExportarConcessoes";
import AcoesAdvogados from "./view/acoesAdvogados/AcoesAdvogados";
import ExportarBeneficios from "./view/beneficios/ExportarBeneficios";

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
                    <Route path="/atendimentos/fechamentos" element={<FechamentosAtendimentos />} />
                    <Route path="/atendimentos/historico/:cpf" element={<HistoricoAtendimentos />} />
                    <Route path="/atendimentos/novo" element={<NovoAtendimento />} />
                    <Route path="/atendimentos/editar/:id" element={<NovoAtendimento />} />
                    <Route path="/servicos" element={<Servicos />} />
                    <Route path="/servicos/novo" element={<NovoServico />} />
                    <Route path="/servicos/editar/:id" element={<NovoServico />} />
                    <Route path="/beneficios" element={<Beneficios />} />
                    <Route path="/beneficios/novo" element={<NovoBeneficio />} />
                    <Route path="/beneficios/editar/:id" element={<NovoBeneficio />} />
                    <Route path="/beneficios/exportar" element={<ExportarBeneficios />} />
                    <Route path="/formulario" element={<Formulario />} />
                    <Route path="/perfil" element={<Perfil />} />
                    <Route path="/admin-colaboradores" element={<Colaboradores />} />
                    <Route path="/admin-colaboradores/novo" element={<NovoColaborador />} />
                    <Route path="/admin-colaboradores/editar/:id" element={<EditarColaborador />} />
                    <Route path="/admin-listas" element={<Listas />} />
                    <Route path="/relatorio" element={<Relatorio />} />
                    <Route path="/relatorio/novo" element={<NovoRelatorio />} />
                    <Route path="/relatorio/editar/:id" element={<NovoRelatorio />} />
                    <Route path="/relatorio/mensal" element={<RelatorioMensal />} />
                    
                    <Route path="/idas-banco" element={<Idas />} />
                    <Route path="/idas-banco/nova" element={<NovaIda />} />
                    <Route path="/idas-banco/editar/:id" element={<NovaIda />} />

                    <Route path="acoes-advogados" element={<AcoesAdvogados />} />

                    <Route path="/processos-advogados" element={<Processos />} />
                    <Route path="/processos-advogados/novo" element={<NovoProcesso />} />
                    <Route path="/processos-advogados/editar/:id" element={<NovoProcesso />} />

                    <Route path="/financeiro" element={<FinanceiroPage />} />
                    <Route path="/financeiro/dashboard" element={<FinanceiroDashboardPage />} />
                    <Route path="/financeiro/fluxo-caixa" element={<FinanceiroFluxoCaixaPage />} />
                    <Route path="/concessoes" element={<Concessoes />} />
                    <Route path="/concessoes/novo" element={<NovaConcessao />} />
                    <Route path="/concessoes/editar/:id" element={<NovaConcessao />} />
                    <Route path="/concessoes/exportar" element={<ExportarConcessoes />} />
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
