import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/view/components/ui/card";
import { Receita, CustoServico, ResumoFinanceiro } from "@/model/entities";
import { FinanceiroResumo } from "./FinanceiroResumo";
import { Label } from "@/view/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/view/components/ui/select";
import { useConfigListOptions } from "@/viewmodel/configLists/useConfigListOptions";
import { Button } from "@/view/components/ui/button";
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
