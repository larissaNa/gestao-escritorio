import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/view/components/ui/table";
import { Badge } from "@/view/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/view/components/ui/card";
import { Button } from "@/view/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/view/components/ui/dialog";
import { Input } from "@/view/components/ui/input";
import { Label } from "@/view/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/view/components/ui/select";
import { Receita } from "@/model/entities";
import { useState, useMemo } from "react";
import { useConfigListOptions } from "@/viewmodel/configLists/useConfigListOptions";

interface ReceitaListProps {
  receitas: Receita[];
  loading: boolean;
  escritorio: string;
  setEscritorio: (value: string) => void;
  escritoriosOptions: Array<{ value: string; label: string }>;
  loadingEscritorios: boolean;
  onEdit: (id: string, data: Partial<Receita>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ReceitaList({
  receitas,
  loading,
  escritorio,
  setEscritorio,
  escritoriosOptions,
  loadingEscritorios,
  onEdit,
  onDelete,
}: ReceitaListProps) {
  const [editing, setEditing] = useState<Receita | null>(null);
  const [saving, setSaving] = useState(false);

  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroMes, setFiltroMes] = useState<string>("todos");
  const [filtroAno, setFiltroAno] = useState<string>("todos");

  const anosDisponiveis = useMemo(() => {
    const anos = receitas.map(r => new Date(r.dataVencimento).getFullYear());
    return Array.from(new Set(anos)).sort((a, b) => b - a);
  }, [receitas]);

  const { options: categoriasOptions } = useConfigListOptions("categoria", { activeOnly: true });

  const receitasFiltradas = useMemo(() => {
    return receitas.filter(receita => {
      const data = new Date(receita.dataVencimento);
      
      if (filtroCategoria !== "todas" && receita.categoria !== filtroCategoria) return false;
      if (filtroStatus !== "todos" && receita.status !== filtroStatus) return false;
      if (filtroAno !== "todos" && data.getFullYear().toString() !== filtroAno) return false;
      if (filtroMes !== "todos" && data.getMonth().toString() !== filtroMes) return false;
      
      return true;
    });
  }, [receitas, filtroCategoria, filtroStatus, filtroAno, filtroMes]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const getStatusBadge = (status: Receita['status']) => {
    switch (status) {
      case 'pago':
        return <Badge className="bg-green-500 hover:bg-green-600">Pago</Badge>;
      case 'pendente':
        return <Badge variant="outline" className="text-yellow-600 border-yellow-600">Pendente</Badge>;
      case 'atrasado':
        return <Badge variant="destructive">Atrasado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Deseja realmente excluir esta receita?");
    if (!confirmed) return;
    await onDelete(id);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const formData = new FormData(event.currentTarget);
    const descricao = String(formData.get("descricao") || "");
    const categoria = String(formData.get("categoria") || "");
    const subcategoria = String(formData.get("subcategoria") || editing.subcategoria || "");
    const origem = String(formData.get("origem") || editing.origem || "");
    const valorTotal = Number(formData.get("valorTotal") || 0);
    const valorPago = Number(formData.get("valorPago") || 0);
    const dataVencimentoStr = String(formData.get("dataVencimento") || "");
    const dataVencimento = dataVencimentoStr ? new Date(dataVencimentoStr) : editing.dataVencimento;
    const status = valorPago >= valorTotal ? "pago" : "pendente";
    const valorAberto = valorTotal - valorPago;

    setSaving(true);
    try {
      await onEdit(editing.id, {
        descricao,
        categoria,
        subcategoria,
        origem,
        valorTotal,
        valorPago,
        valorAberto,
        dataVencimento,
        status
      });
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Receitas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Receitas</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4">
          <div>
            <Label>Escritório</Label>
            <Select value={escritorio} onValueChange={setEscritorio} disabled={loadingEscritorios || escritoriosOptions.length === 0}>
              <SelectTrigger>
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

          <div>
            <Label>Categoria</Label>
            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas</SelectItem>
                {categoriasOptions.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Status</Label>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="atrasado">Atrasado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Mês</Label>
            <Select value={filtroMes} onValueChange={setFiltroMes}>
              <SelectTrigger>
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="0">Janeiro</SelectItem>
                <SelectItem value="1">Fevereiro</SelectItem>
                <SelectItem value="2">Março</SelectItem>
                <SelectItem value="3">Abril</SelectItem>
                <SelectItem value="4">Maio</SelectItem>
                <SelectItem value="5">Junho</SelectItem>
                <SelectItem value="6">Julho</SelectItem>
                <SelectItem value="7">Agosto</SelectItem>
                <SelectItem value="8">Setembro</SelectItem>
                <SelectItem value="9">Outubro</SelectItem>
                <SelectItem value="10">Novembro</SelectItem>
                <SelectItem value="11">Dezembro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Ano</Label>
            <Select value={filtroAno} onValueChange={setFiltroAno}>
              <SelectTrigger>
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {anosDisponiveis.map(ano => (
                  <SelectItem key={ano} value={ano.toString()}>{ano}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Valor Pago</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receitasFiltradas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  Nenhuma receita encontrada.
                </TableCell>
              </TableRow>
            ) : (
              receitasFiltradas.map((receita) => (
                <TableRow key={receita.id}>
                  <TableCell className="font-medium">{receita.descricao}</TableCell>
                  <TableCell>{receita.categoria}</TableCell>
                  <TableCell>{formatDate(receita.dataVencimento)}</TableCell>
                  <TableCell>{formatCurrency(receita.valorTotal)}</TableCell>
                  <TableCell>{formatCurrency(receita.valorPago)}</TableCell>
                  <TableCell>{getStatusBadge(receita.status)}</TableCell>
                  <TableCell className="space-x-2">
                    <Dialog open={!!editing && editing.id === receita.id} onOpenChange={(open) => {
                      if (open) {
                        setEditing(receita);
                      } else {
                        setEditing((current) => current && current.id === receita.id ? null : current);
                      }
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Editar Receita</DialogTitle>
                        </DialogHeader>
                        {editing && editing.id === receita.id && (
                          <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="descricao">Descrição</Label>
                              <Input
                                id="descricao"
                                name="descricao"
                                defaultValue={editing.descricao}
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="categoria">Categoria</Label>
                              <Input
                                id="categoria"
                                name="categoria"
                                defaultValue={editing.categoria}
                                required
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="subcategoria">Subcategoria</Label>
                              <Input
                                id="subcategoria"
                                name="subcategoria"
                                defaultValue={editing.subcategoria}
                              />
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="origem">Origem</Label>
                              <Input
                                id="origem"
                                name="origem"
                                defaultValue={editing.origem}
                                required
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="valorTotal">Valor Total</Label>
                                <Input
                                  id="valorTotal"
                                  name="valorTotal"
                                  type="number"
                                  step="0.01"
                                  defaultValue={editing.valorTotal}
                                  required
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="valorPago">Valor Pago</Label>
                                <Input
                                  id="valorPago"
                                  name="valorPago"
                                  type="number"
                                  step="0.01"
                                  defaultValue={editing.valorPago}
                                  required
                                />
                              </div>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="dataVencimento">Vencimento</Label>
                              <Input
                                id="dataVencimento"
                                name="dataVencimento"
                                type="date"
                                defaultValue={editing.dataVencimento.toISOString().split("T")[0]}
                                required
                              />
                            </div>
                            <Button type="submit" disabled={saving}>
                              {saving ? "Salvando..." : "Salvar alterações"}
                            </Button>
                          </form>
                        )}
                      </DialogContent>
                    </Dialog>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(receita.id)}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
