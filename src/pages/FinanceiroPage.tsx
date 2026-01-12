import { useFinanceiro } from "@/hooks/useFinanceiro";
import { FinanceiroResumo } from "@/components/financeiro/FinanceiroResumo";
import { ReceitaList } from "@/components/financeiro/ReceitaList";
import { CustosList } from "@/components/financeiro/CustosList";
import { ProjecaoList } from "@/components/financeiro/ProjecaoList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NovaReceitaDialog } from "@/components/financeiro/NovaReceitaDialog";
import { NovoCustoDialog } from "@/components/financeiro/NovoCustoDialog";
import { NovaProjecaoDialog } from "@/components/financeiro/NovaProjecaoDialog";

export default function FinanceiroPage() {
  const { 
    loading, 
    receitas, 
    projecoes, 
    custos, 
    resumo, 
    addReceita,
    addCusto,
    addProjecao
  } = useFinanceiro();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
        <div className="flex items-center space-x-2">
          <NovaReceitaDialog onSave={addReceita} />
          <NovoCustoDialog onSave={addCusto} />
          <NovaProjecaoDialog onSave={addProjecao} />
        </div>
      </div>

      <FinanceiroResumo resumo={resumo} loading={loading} />

      <Tabs defaultValue="receitas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="custos">Custos</TabsTrigger>
          <TabsTrigger value="projecoes">Projeções</TabsTrigger>
        </TabsList>
        <TabsContent value="receitas" className="space-y-4">
          <ReceitaList receitas={receitas} loading={loading} />
        </TabsContent>
        <TabsContent value="custos" className="space-y-4">
          <CustosList custos={custos} loading={loading} />
        </TabsContent>
        <TabsContent value="projecoes" className="space-y-4">
          <ProjecaoList projecoes={projecoes} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
