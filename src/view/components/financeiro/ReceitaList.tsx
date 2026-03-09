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
import { Receita } from "@/model/entities";
import { useState } from "react";

interface ReceitaListProps {
  receitas: Receita[];
  loading: boolean;
  onEdit: (id: string, data: Partial<Receita>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ReceitaList({ receitas, loading, onEdit, onDelete }: ReceitaListProps) {
  const [editing, setEditing] = useState<Receita | null>(null);
  const [saving, setSaving] = useState(false);
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
    const cliente = String(formData.get("cliente") || "");
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
        cliente,
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
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Vencimento</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Valor Pago</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {receitas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  Nenhuma receita encontrada.
                </TableCell>
              </TableRow>
            ) : (
              receitas.map((receita) => (
                <TableRow key={receita.id}>
                  <TableCell className="font-medium">{receita.descricao}</TableCell>
                  <TableCell>{receita.cliente}</TableCell>
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
                              <Label htmlFor="cliente">Cliente</Label>
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


