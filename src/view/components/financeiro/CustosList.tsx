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
import { useState } from "react";

interface CustosListProps {
  custos: CustoServico[];
  loading: boolean;
  onEdit: (id: string, data: Partial<CustoServico>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function CustosList({ custos, loading, onEdit, onDelete }: CustosListProps) {
  const [editing, setEditing] = useState<CustoServico | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoriaEdit, setCategoriaEdit] = useState<CustoServico["categoria"]>("outros");
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
    const cliente = String(formData.get("cliente") || editing.cliente || "");
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
        cliente,
        categoria: categoria as CustoServico["categoria"],
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
            {custos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  Nenhum custo registrado.
                </TableCell>
              </TableRow>
            ) : (
              custos.map((custo) => (
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
                                onValueChange={(value) =>
                                  setCategoriaEdit(value as CustoServico["categoria"])
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="taxa">Taxa</SelectItem>
                                  <SelectItem value="deslocamento">Deslocamento</SelectItem>
                                  <SelectItem value="terceiros">Terceiros</SelectItem>
                                  <SelectItem value="outros">Outros</SelectItem>
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
                          <Label htmlFor="cliente">Cliente (Opcional)</Label>
                          <Input
                            id="cliente"
                            name="cliente"
                            defaultValue={editing.cliente}
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

