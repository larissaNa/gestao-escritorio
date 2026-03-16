import { useFinanceiro } from "@/viewmodel/useFinanceiroViewModel";
import { FinanceiroResumo } from "@/view/components/financeiro/FinanceiroResumo";
import { ReceitaList } from "@/view/components/financeiro/ReceitaList";
import { CustosList } from "@/view/components/financeiro/CustosList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/view/components/ui/tabs";
import { NovaReceitaDialog } from "@/view/components/financeiro/NovaReceitaDialog";
import { NovoCustoDialog } from "@/view/components/financeiro/NovoCustoDialog";

export default function FinanceiroPage() {
  const { 
    loading, 
    receitas, 
    custos, 
    resumo, 
    escritorio,
    setEscritorio,
    escritoriosOptions,
    loadingEscritorios,
    addReceita,
    updateReceita,
    deleteReceita,
    addCusto,
    updateCusto,
    deleteCusto,
  } = useFinanceiro();

  const actionsDisabled = loadingEscritorios || escritoriosOptions.length === 0;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
        <div className="flex items-center space-x-2">
          <NovaReceitaDialog onSave={addReceita} disabled={actionsDisabled} defaultEscritorio={escritorio} />
          <NovoCustoDialog onSave={addCusto} disabled={actionsDisabled} defaultEscritorio={escritorio} />
        </div>
      </div>

      {/* <FinanceiroResumo resumo={resumo} loading={loading} /> */}

      <Tabs defaultValue="receitas" className="space-y-4">
        <TabsList>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="custos">Custos</TabsTrigger>
        </TabsList>
        <TabsContent value="receitas" className="space-y-4">
          <ReceitaList 
            receitas={receitas} 
            loading={loading} 
            escritorio={escritorio}
            setEscritorio={setEscritorio}
            escritoriosOptions={escritoriosOptions}
            loadingEscritorios={loadingEscritorios}
            onEdit={updateReceita}
            onDelete={deleteReceita}
          />
        </TabsContent>
        <TabsContent value="custos" className="space-y-4">
          <CustosList 
            custos={custos} 
            loading={loading} 
            escritorio={escritorio}
            setEscritorio={setEscritorio}
            escritoriosOptions={escritoriosOptions}
            loadingEscritorios={loadingEscritorios}
            onEdit={updateCusto}
            onDelete={deleteCusto}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
