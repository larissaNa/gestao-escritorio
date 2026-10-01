import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/view/components/ui/card";
import { Receita, CustoServico, ResumoFinanceiro, ADVOGADOS_HONORARIOS } from "@/model/entities";
import { FinanceiroResumo } from "./FinanceiroResumo";
import { Label } from "@/view/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/view/components/ui/select";
import { useConfigListOptions } from "@/viewmodel/configLists/useConfigListOptions";
import { Button } from "@/view/components/ui/button";
import { Badge } from "@/view/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/view/components/ui/table";
import { X } from "lucide-react";
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
  BarChart,
  Bar,
} from "recharts";
import { normalizeDateOnly } from "@/lib/utils";

interface FinanceiroDashboardProps {
  receitas: Receita[];
  custos: CustoServico[];
  resumo: ResumoFinanceiro | null;
  loading: boolean;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function FinanceiroDashboard({ receitas, custos, resumo, loading }: FinanceiroDashboardProps) {
  const [filtroCatReceita, setFiltroCatReceita] = useState<string>("ALL");
  const [filtroSubCatReceita, setFiltroSubCatReceita] = useState<string>("ALL");
  const [filtroCatCusto, setFiltroCatCusto] = useState<string>("ALL");
  const [filtroSubCatCusto, setFiltroSubCatCusto] = useState<string>("ALL");

  const { options: categorias } = useConfigListOptions('categoria', { activeOnly: true });
  const { options: subcategorias } = useConfigListOptions('subcategoria', { activeOnly: true });

  const subCatsReceita = useMemo(() => {
    if (filtroCatReceita === "ALL") return [];
    return subcategorias.filter(s => s.parentId === filtroCatReceita);
  }, [subcategorias, filtroCatReceita]);

  const subCatsCusto = useMemo(() => {
    if (filtroCatCusto === "ALL") return [];
    return subcategorias.filter(s => s.parentId === filtroCatCusto);
  }, [subcategorias, filtroCatCusto]);

  // Processamento para gráfico de evolução mensal
  const dadosMensais = useMemo(() => {
    const dados = new Map<string, { nome: string; receitas: number; custos: number; saldo: number; ordem: number }>();

    receitas.forEach(r => {
      const data = normalizeDateOnly(r.dataVencimento);
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
      const data = normalizeDateOnly(c.data);
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
      // Filtro de categoria
      if (filtroCatReceita !== "ALL" && r.categoria !== filtroCatReceita) return;
      // Filtro de subcategoria
      if (filtroSubCatReceita !== "ALL" && r.subcategoria !== filtroSubCatReceita) return;

      const label = (filtroCatReceita === "ALL") 
        ? (r.categoria || 'Sem Categoria')
        : (r.subcategoria || 'Sem Subcategoria');

      dados.set(label, (dados.get(label) || 0) + r.valorTotal);
    });
    return Array.from(dados.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [receitas, filtroCatReceita, filtroSubCatReceita]);

  // Processamento para gráfico de pizza de categorias de custos
  const dadosCustosCategoria = useMemo(() => {
    const dados = new Map<string, number>();
    custos.forEach(c => {
      // Filtro de categoria
      if (filtroCatCusto !== "ALL" && c.categoria !== filtroCatCusto) return;
      // Filtro de subcategoria
      if (filtroSubCatCusto !== "ALL" && c.subcategoria !== filtroSubCatCusto) return;

      const label = (filtroCatCusto === "ALL")
        ? (c.categoria || 'Outros')
        : (c.subcategoria || 'Sem Subcategoria');

      dados.set(label, (dados.get(label) || 0) + c.valor);
    });
    return Array.from(dados.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [custos, filtroCatCusto, filtroSubCatCusto]);

  // Processamento para Desempenho e Retorno por Advogado
  const dadosDesempenhoAdvogados = useMemo(() => {
    return ADVOGADOS_HONORARIOS.map((advogado) => {
      const receitasAdv = receitas.filter((r) => r.advogadoResponsavel === advogado);
      const custosAdv = custos.filter((c) => c.advogadoResponsavel === advogado);

      const receitaTotal = receitasAdv.reduce((sum, r) => sum + (r.valorTotal || 0), 0);
      const receitaRecebida = receitasAdv.reduce((sum, r) => sum + (r.valorPago || 0), 0);
      const receitaAberto = receitasAdv.reduce((sum, r) => sum + (r.valorAberto ?? Math.max(0, (r.valorTotal || 0) - (r.valorPago || 0))), 0);
      const custoTotal = custosAdv.reduce((sum, c) => sum + (c.valor || 0), 0);
      const custoPago = custosAdv.reduce((sum, c) => sum + (c.pago ? c.valor || 0 : 0), 0);
      const custoPendente = custosAdv.reduce((sum, c) => sum + (!c.pago ? c.valor || 0 : 0), 0);
      const saldoLiquido = receitaTotal - custoTotal;
      const margem = receitaTotal > 0 ? ((saldoLiquido / receitaTotal) * 100) : 0;

      return {
        advogado,
        receitaTotal,
        receitaRecebida,
        receitaAberto,
        custoTotal,
        custoPago,
        custoPendente,
        saldoLiquido,
        margem,
        qtdReceitas: receitasAdv.length,
        qtdCustos: custosAdv.length,
      };
    });
  }, [receitas, custos]);

  const totaisAdvogados = useMemo(() => {
    return dadosDesempenhoAdvogados.reduce(
      (acc, curr) => ({
        receitaTotal: acc.receitaTotal + curr.receitaTotal,
        receitaRecebida: acc.receitaRecebida + curr.receitaRecebida,
        custoTotal: acc.custoTotal + curr.custoTotal,
        saldoLiquido: acc.saldoLiquido + curr.saldoLiquido,
      }),
      { receitaTotal: 0, receitaRecebida: 0, custoTotal: 0, saldoLiquido: 0 }
    );
  }, [dadosDesempenhoAdvogados]);

  const dadosGraficoAdvogados = useMemo(() => {
    return dadosDesempenhoAdvogados.map((item) => ({
      nomeCompleto: item.advogado,
      Receitas: item.receitaTotal,
      Custos: item.custoTotal,
      Saldo: item.saldoLiquido,
    }));
  }, [dadosDesempenhoAdvogados]);

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

      {/* Retorno Financeiro por Advogado */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>Retorno Financeiro por Advogado</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Comparativo entre receitas geradas (honorários advocatícios) e custos associados por advogado
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm bg-slate-50 dark:bg-slate-900 border rounded-lg px-3 py-2">
              <div>
                <span className="text-xs text-muted-foreground block">Total Honorários</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totaisAdvogados.receitaTotal)}
                </span>
              </div>
              <div className="border-l pl-3">
                <span className="text-xs text-muted-foreground block">Total Custos</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(totaisAdvogados.custoTotal)}
                </span>
              </div>
              <div className="border-l pl-3">
                <span className="text-xs text-muted-foreground block">Saldo Geral</span>
                <span className={`font-bold ${totaisAdvogados.saldoLiquido >= 0 ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400"}`}>
                  {formatCurrency(totaisAdvogados.saldoLiquido)}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Gráfico comparativo de barras */}
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dadosGraficoAdvogados}
                margin={{ top: 16, right: 24, left: 24, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nomeCompleto" tickMargin={8} />
                <YAxis width={110} tickMargin={8} tickFormatter={(val) => formatAxisCurrency(Number(val))} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend verticalAlign="top" height={36} />
                <Bar dataKey="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Custos" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Saldo" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Tabela detalhada por advogado */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Advogado</TableHead>
                  <TableHead className="text-right">Receitas Geradas</TableHead>
                  <TableHead className="text-right">Valor Recebido</TableHead>
                  <TableHead className="text-right">Custos do Serviço</TableHead>
                  <TableHead className="text-right">Saldo Líquido</TableHead>
                  <TableHead className="text-center">Margem</TableHead>
                  <TableHead className="text-center">Registros</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosDesempenhoAdvogados.map((d) => (
                  <TableRow key={d.advogado}>
                    <TableCell className="font-medium">{d.advogado}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(d.receitaTotal)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatCurrency(d.receitaRecebida)}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-rose-600 dark:text-rose-400">
                      {formatCurrency(d.custoTotal)}
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      <span className={d.saldoLiquido >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                        {formatCurrency(d.saldoLiquido)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={d.saldoLiquido >= 0 ? "default" : "destructive"} className="text-xs">
                        {d.margem.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {d.qtdReceitas} {d.qtdReceitas === 1 ? 'rec.' : 'recs.'} / {d.qtdCustos} {d.qtdCustos === 1 ? 'custo' : 'custos'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Receitas por {filtroCatReceita === "ALL" ? "Categoria" : "Subcategoria"}</CardTitle>
              <div className="flex gap-2">
                <div className="w-[140px]">
                  <Select value={filtroCatReceita} onValueChange={(v) => {
                    setFiltroCatReceita(v);
                    setFiltroSubCatReceita("ALL");
                  }}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todas Categorias</SelectItem>
                      {categorias.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {filtroCatReceita !== "ALL" && (
                  <div className="w-[140px]">
                    <Select value={filtroSubCatReceita} onValueChange={setFiltroSubCatReceita}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Subcategoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todas Subcats</SelectItem>
                        {subCatsReceita.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
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
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle>Custos por {filtroCatCusto === "ALL" ? "Categoria" : "Subcategoria"}</CardTitle>
              <div className="flex gap-2">
                <div className="w-[140px]">
                  <Select value={filtroCatCusto} onValueChange={(v) => {
                    setFiltroCatCusto(v);
                    setFiltroSubCatCusto("ALL");
                  }}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todas Categorias</SelectItem>
                      {categorias.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {filtroCatCusto !== "ALL" && (
                  <div className="w-[140px]">
                    <Select value={filtroSubCatCusto} onValueChange={setFiltroSubCatCusto}>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Subcategoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Todas Subcats</SelectItem>
                        {subCatsCusto.map(s => (
                          <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
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
