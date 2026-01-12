import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumoFinanceiro } from "@/types";
import { DollarSign, TrendingUp, CreditCard, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface FinanceiroResumoProps {
  resumo: ResumoFinanceiro | null;
  loading: boolean;
}

export function FinanceiroResumo({ resumo, loading }: FinanceiroResumoProps) {
  const { isAdmin } = useAuth();

  if (!isAdmin) {
    return null;
  }

  if (loading || !resumo) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(resumo.receitaTotal)}</div>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(resumo.receitaRecebida)} recebidos
          </p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(resumo.receitaPendente)} pendentes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Custos do Serviço</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(resumo.custosTotais)}</div>
          <p className="text-xs text-muted-foreground">
            Gastos operacionais
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Resultado Líquido</CardTitle>
          <Wallet className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${resumo.resultadoLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(resumo.resultadoLiquido)}
          </div>
          <p className="text-xs text-muted-foreground">
            Recebido - Custos
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Projeção Futura</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(resumo.projecaoFutura)}</div>
          <p className="text-xs text-muted-foreground">
            Estimativa de honorários
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
