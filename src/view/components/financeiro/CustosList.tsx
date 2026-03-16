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
import { CustoServico } from "@/model/entities";
import { useState, useMemo } from "react";
import { useConfigListOptions } from "@/viewmodel/configLists/useConfigListOptions";

interface CustosListProps {
  custos: CustoServico[];
  loading: boolean;
  escritorio: string;
  setEscritorio: (value: string) => void;
  escritoriosOptions: Array<{ value: string; label: string }>;
  loadingEscritorios: boolean;
  onEdit: (id: string, data: Partial<CustoServico>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CustosList({
  custos,
  loading,
  escritorio,
  setEscritorio,
  escritoriosOptions,
  loadingEscritorios,
  onEdit,
  onDelete,
}: CustosListProps) {
  const [editing, setEditing] = useState<CustoServico | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoriaEdit, setCategoriaEdit] = useState<CustoServico["categoria"]>("outros");

  const { options: categoriasOptions } = useConfigListOptions("categoria", { activeOnly: true });

  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroMes, setFiltroMes] = useState<string>("todos");
  const [filtroAno, setFiltroAno] = useState<string>("todos");
  const [filtroPago, setFiltroPago] = useState<string>("todos");
  const [filtroRecorrente, setFiltroRecorrente] = useState<string>("todos");

  const anosDisponiveis = useMemo(() => {
    const anos = custos.map(c => new Date(c.data).getFullYear());
    return Array.from(new Set(anos)).sort((a, b) => b - a);
  }, [custos]);

  const custosFiltrados = useMemo(() => {
    return custos.filter(custo => {
      const data = new Date(custo.data);

      if (filtroCategoria !== "todas" && custo.categoria !== filtroCategoria) return false;
      if (filtroAno !== "todos" && data.getFullYear().toString() !== filtroAno) return false;
      if (filtroMes !== "todos" && data.getMonth().toString() !== filtroMes) return false;
      
      if (filtroPago !== "todos") {
        const isPago = filtroPago === "sim";
        if (custo.pago !== isPago) return false;
      }

      if (filtroRecorrente !== "todos") {
        const isRecorrente = filtroRecorrente === "sim";
        if (custo.recorrente !== isRecorrente) return false;
      }

      return true;
    });
  }, [custos, filtroCategoria, filtroMes, filtroAno, filtroPago, filtroRecorrente]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Deseja realmente excluir este custo?");
    if (!confirmed) return;
    await onDelete(id);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const formData = new FormData(event.currentTarget);
    const descricao = String(formData.get("descricao") || "");
    const subcategoria = String(formData.get("subcategoria") || editing.subcategoria || "");
    const categoria = categoriaEdit;
    const valor = Number(formData.get("valor") || 0);
    const dataStr = String(formData.get("data") || "");
    const data = dataStr ? new Date(dataStr) : editing.data;
    const origem = String(formData.get("origem") || editing.origem || "");
    const pago = formData.get("pago") === "on";
    const recorrente = formData.get("recorrente") === "on";

    setSaving(true);
    try {
      await onEdit(editing.id, {
        descricao,
        subcategoria,
        categoria,
        valor,
        data,
        origem,
        pago,
        recorrente
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
          <CardTitle>Custos do Serviço</CardTitle>
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
        <CardTitle>Custos do Serviço</CardTitle>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mt-4">
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
                {categoriasOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
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

          <div>
            <Label>Pago?</Label>
            <Select value={filtroPago} onValueChange={setFiltroPago}>
              <SelectTrigger>
                <SelectValue placeholder="Pago?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Recorrente?</Label>
            <Select value={filtroRecorrente} onValueChange={setFiltroRecorrente}>
              <SelectTrigger>
                <SelectValue placeholder="Recorrente?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
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
              <TableHead>Data</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Recorrente</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {custosFiltrados.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  Nenhum custo registrado.
                </TableCell>
              </TableRow>
            ) : (
              custosFiltrados.map((custo) => (
                <TableRow key={custo.id}>
                  <TableCell className="font-medium">{custo.descricao}</TableCell>
                  <TableCell className="capitalize">{custo.categoria}</TableCell>
                  <TableCell>{formatDate(custo.data)}</TableCell>
                  <TableCell>{formatCurrency(custo.valor)}</TableCell>
                  <TableCell>
                    {custo.recorrente ? (
                      <Badge variant="outline">Sim</Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">Não</span>
                    )}
                  </TableCell>
                  <TableCell className="space-x-2">
                    <Dialog
                      open={!!editing && editing.id === custo.id}
                      onOpenChange={(open) => {
                        if (open) {
                          setEditing(custo);
                          setCategoriaEdit(custo.categoria);
                        } else {
                          setEditing((current) =>
                            current && current.id === custo.id ? null : current
                          );
                        }
                      }}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          Editar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Editar Custo</DialogTitle>
                        </DialogHeader>
                        {editing && editing.id === custo.id && (
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
                              <Select
                                value={categoriaEdit}
                                onValueChange={setCategoriaEdit}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  {categoriasOptions.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="valor">Valor</Label>
                                <Input
                                  id="valor"
                                  name="valor"
                                  type="number"
                                  step="0.01"
                                  defaultValue={editing.valor}
                                  required
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="data">Data</Label>
                                <Input
                                  id="data"
                                  name="data"
                                  type="date"
                                  defaultValue={editing.data.toISOString().split("T")[0]}
                                  required
                                />
                              </div>
                            </div>
                        <div className="grid gap-2">
                          <Label htmlFor="subcategoria">Subcategoria (Opcional)</Label>
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
                        <div className="flex items-center space-x-2">
                          <input
                            id="pago"
                            name="pago"
                            type="checkbox"
                            defaultChecked={editing.pago}
                          />
                          <Label htmlFor="pago">Já foi pago?</Label>
                        </div>
                            <div className="flex items-center space-x-2">
                              <input
                                id="recorrente"
                                name="recorrente"
                                type="checkbox"
                                defaultChecked={editing.recorrente}
                              />
                              <Label htmlFor="recorrente">É recorrente?</Label>
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
                      onClick={() => handleDelete(custo.id)}
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
