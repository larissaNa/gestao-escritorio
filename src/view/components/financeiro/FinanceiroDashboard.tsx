import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/view/components/ui/card";
import { Receita, CustoServico, ResumoFinanceiro } from "@/model/entities";
import { FinanceiroResumo } from "./FinanceiroResumo";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface FinanceiroDashboardProps {
  receitas: Receita[];
  custos: CustoServico[];
  resumo: ResumoFinanceiro | null;
  loading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function FinanceiroDashboard({ receitas, custos, resumo, loading }: FinanceiroDashboardProps) {
  
  // Processamento para gráfico de evolução mensal
  const dadosMensais = useMemo(() => {
    const dados = new Map<string, { nome: string; receitas: number; custos: number; saldo: number; ordem: number }>();

    receitas.forEach(r => {
      const data = new Date(r.dataVencimento);
      const nomeMes = data.toLocaleString('pt-BR', { month: 'long' });
      const mesAno = `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}/${data.getFullYear()}`;
      const chave = `${data.getFullYear()}-${data.getMonth()}`; // Para ordenação
      
      if (!dados.has(chave)) {
        dados.set(chave, {
          nome: mesAno,
          receitas: 0,
          custos: 0,
          saldo: 0,
          ordem: data.getTime()
        });
      }
      
      const item = dados.get(chave)!;
      item.receitas += r.valorTotal;
      item.saldo += r.valorTotal;
    });

    custos.forEach(c => {
      const data = new Date(c.data);
      const nomeMes = data.toLocaleString('pt-BR', { month: 'long' });
      const mesAno = `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}/${data.getFullYear()}`;
      const chave = `${data.getFullYear()}-${data.getMonth()}`;
      
      if (!dados.has(chave)) {
        dados.set(chave, {
          nome: mesAno,
          receitas: 0,
          custos: 0,
          saldo: 0,
          ordem: data.getTime()
        });
      }
      
      const item = dados.get(chave)!;
      item.custos += c.valor;
      item.saldo -= c.valor;
    });

    return Array.from(dados.values()).sort((a, b) => a.ordem - b.ordem);
  }, [receitas, custos]);

  // Processamento para gráfico de pizza de categorias de receitas
  const dadosReceitasCategoria = useMemo(() => {
    const dados = new Map<string, number>();
    receitas.forEach(r => {
      const cat = r.categoria || 'Sem Categoria';
      dados.set(cat, (dados.get(cat) || 0) + r.valorTotal);
    });
    return Array.from(dados.entries()).map(([name, value]) => ({ name, value }));
  }, [receitas]);

  // Processamento para gráfico de pizza de categorias de custos
  const dadosCustosCategoria = useMemo(() => {
    const dados = new Map<string, number>();
    custos.forEach(c => {
      const cat = c.categoria || 'Outros';
      dados.set(cat, (dados.get(cat) || 0) + c.valor);
    });
    return Array.from(dados.entries()).map(([name, value]) => ({ name, value }));
  }, [custos]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatAxisCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Carregando dashboard...</div>;
  }

  return (
    <div className="space-y-4">
      <FinanceiroResumo resumo={resumo} loading={loading} />

      <div className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Evolução Financeira Mensal</CardTitle>
          </CardHeader>
          <CardContent className="h-[440px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dadosMensais}
                margin={{ top: 16, right: 24, left: 24, bottom: 56 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="nome"
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                  tickMargin={12}
                />
                <YAxis width={110} tickMargin={8} tickFormatter={(val) => formatAxisCurrency(Number(val))} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ paddingTop: 16 }} />
                <Line type="monotone" dataKey="receitas" name="Receitas" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="custos" name="Custos" stroke="#ef4444" strokeWidth={2} />
                <Line type="monotone" dataKey="saldo" name="Saldo" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosReceitasCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosReceitasCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Custos por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosCustosCategoria}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosCustosCategoria.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
