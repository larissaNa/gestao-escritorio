import { useFinanceiro } from "@/viewmodel/useFinanceiroViewModel";
import { FinanceiroDashboard } from "@/view/components/financeiro/FinanceiroDashboard";
import { Label } from "@/view/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/view/components/ui/select";

export default function FinanceiroDashboardPage() {
  const { 
    loading, 
    receitas, 
    custos, 
    resumo, 
    escritorio,
    setEscritorio,
    escritoriosOptions,
    loadingEscritorios,
  } = useFinanceiro();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Financeiro</h2>
          <div className="grid gap-2">
            <Label>Escritório</Label>
            <Select value={escritorio} onValueChange={setEscritorio}>
              <SelectTrigger className="w-[320px]">
                <SelectValue placeholder={loadingEscritorios ? "Carregando..." : "Selecione"} />
              </SelectTrigger>
              <SelectContent>
                {escritoriosOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <FinanceiroDashboard 
        receitas={receitas} 
        custos={custos} 
        resumo={resumo} 
        loading={loading}
      />
    </div>
  );
}
