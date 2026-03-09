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
import { ProjecaoFinanceira } from "@/model/entities";
import { useState } from "react";

interface ProjecaoListProps {
  projecoes: ProjecaoFinanceira[];
  loading: boolean;
  onEdit: (id: string, data: Partial<ProjecaoFinanceira>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ProjecaoList({ projecoes, loading, onEdit, onDelete }: ProjecaoListProps) {
  const [editing, setEditing] = useState<ProjecaoFinanceira | null>(null);
  const [saving, setSaving] = useState(false);
  const [probabilidadeEdit, setProbabilidadeEdit] = useState<ProjecaoFinanceira["probabilidade"]>("media");
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(date));
  };

  const getProbabilidadeBadge = (probabilidade: ProjecaoFinanceira['probabilidade']) => {
    switch (probabilidade) {
      case 'alta':
        return <Badge className="bg-green-500 hover:bg-green-600">Alta</Badge>;
      case 'media':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Média</Badge>;
      case 'baixa':
        return <Badge variant="secondary">Baixa</Badge>;
      default:
        return <Badge variant="outline">{probabilidade}</Badge>;
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Deseja realmente excluir esta projeção?");
    if (!confirmed) return;
    await onDelete(id);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing) return;
    const formData = new FormData(event.currentTarget);
    const descricao = String(formData.get("descricao") || "");
    const cliente = String(formData.get("cliente") || editing.cliente || "");
    const origem = String(formData.get("origem") || editing.origem || "");
    const valorEstimado = Number(formData.get("valorEstimado") || 0);
    const probabilidade = probabilidadeEdit;
    const dataPrevistaStr = String(formData.get("dataPrevista") || "");
    const dataPrevista = dataPrevistaStr ? new Date(dataPrevistaStr) : editing.dataPrevista;

    setSaving(true);
    try {
      await onEdit(editing.id, {
        descricao,
        cliente,
        origem,
        valorEstimado,
        probabilidade,
        dataPrevista
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
          <CardTitle>Projeção de Honorários</CardTitle>
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
        <CardTitle>Projeção de Honorários</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Data Prevista</TableHead>
              <TableHead>Valor Estimado</TableHead>
              <TableHead>Probabilidade</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projecoes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Nenhuma projeção encontrada.
                </TableCell>
              </TableRow>
            ) : (
              projecoes.map((projecao) => (
                <TableRow key={projecao.id}>
                  <TableCell className="font-medium">{projecao.descricao}</TableCell>
                  <TableCell>{formatDate(projecao.dataPrevista)}</TableCell>
                  <TableCell>{formatCurrency(projecao.valorEstimado)}</TableCell>
                  <TableCell>{getProbabilidadeBadge(projecao.probabilidade)}</TableCell>
                  <TableCell className="space-x-2">
                    <Dialog
                      open={!!editing && editing.id === projecao.id}
                      onOpenChange={(open) => {
                        if (open) {
                          setEditing(projecao);
                          setProbabilidadeEdit(projecao.probabilidade);
                        } else {
                          setEditing((current) =>
                            current && current.id === projecao.id ? null : current
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
                          <DialogTitle>Editar Projeção</DialogTitle>
                        </DialogHeader>
                        {editing && editing.id === projecao.id && (
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
                              <Label htmlFor="cliente">Cliente (Opcional)</Label>
                              <Input
                                id="cliente"
                                name="cliente"
                                defaultValue={editing.cliente}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="grid gap-2">
                                <Label htmlFor="valorEstimado">Valor Estimado</Label>
                                <Input
                                  id="valorEstimado"
                                  name="valorEstimado"
                                  type="number"
                                  step="0.01"
                                  defaultValue={editing.valorEstimado}
                                  required
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="probabilidade">Probabilidade</Label>
                                <Select
                                  value={probabilidadeEdit}
                                  onValueChange={(value) =>
                                    setProbabilidadeEdit(
                                      value as ProjecaoFinanceira["probabilidade"]
                                    )
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="alta">Alta</SelectItem>
                                    <SelectItem value="media">Média</SelectItem>
                                    <SelectItem value="baixa">Baixa</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
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
                            <div className="grid gap-2">
                              <Label htmlFor="dataPrevista">Data Prevista</Label>
                              <Input
                                id="dataPrevista"
                                name="dataPrevista"
                                type="date"
                                defaultValue={editing.dataPrevista.toISOString().split("T")[0]}
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
                      onClick={() => handleDelete(projecao.id)}
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
