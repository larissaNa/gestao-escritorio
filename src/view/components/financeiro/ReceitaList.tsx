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
import { formatDateInput, formatDateOnly, normalizeDateOnly, parseDateInput } from "@/lib/utils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { drawPdfHeader, loadPdfLogoDataUrl } from "@/lib/pdf";

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

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

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
  const [exporting, setExporting] = useState(false);
  const [categoriaEdit, setCategoriaEdit] = useState<string>("");
  const [subcategoriaEdit, setSubcategoriaEdit] = useState<string>("");

  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState<string>("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroMes, setFiltroMes] = useState<string>("todos");
  const [filtroAno, setFiltroAno] = useState<string>("todos");
  const [filtroDia, setFiltroDia] = useState<string>("");

  const anosDisponiveis = useMemo(() => {
    const anos = receitas.map((r) => normalizeDateOnly(r.dataVencimento).getFullYear());
    return Array.from(new Set(anos)).sort((a, b) => b - a);
  }, [receitas]);

  const { options: categoriasOptions } = useConfigListOptions("categoria", { activeOnly: true });
  const { options: subcategoriasOptions } = useConfigListOptions("subcategoria", { activeOnly: true });

  const filteredSubcategoriasFiltro = useMemo(() => {
    if (filtroCategoria === "todas") return [];
    return subcategoriasOptions.filter(s => s.parentId === filtroCategoria);
  }, [filtroCategoria, subcategoriasOptions]);

  const filteredSubcategoriasEdit = useMemo(() => {
    if (!categoriaEdit) return [];
    return subcategoriasOptions.filter(s => s.parentId === categoriaEdit);
  }, [categoriaEdit, subcategoriasOptions]);

  const receitasFiltradas = useMemo(() => {
    return receitas.filter((receita) => {
      const data = normalizeDateOnly(receita.dataVencimento);
      
      if (filtroCategoria !== "todas" && receita.categoria !== filtroCategoria) return false;
      if (filtroSubcategoria !== "" && receita.subcategoria !== filtroSubcategoria) return false;
      if (filtroStatus !== "todos" && receita.status !== filtroStatus) return false;
      if (filtroAno !== "todos" && data.getFullYear().toString() !== filtroAno) return false;
      if (filtroMes !== "todos" && data.getMonth().toString() !== filtroMes) return false;
      
      if (filtroDia !== "") {
        const filtroDiaDate = parseDateInput(filtroDia);
        if (formatDateOnly(data) !== formatDateOnly(filtroDiaDate)) return false;
      }
      
      return true;
    });
  }, [receitas, filtroCategoria, filtroSubcategoria, filtroStatus, filtroAno, filtroMes, filtroDia]);

  const selectedEscritorioLabel = escritoriosOptions.find((opt) => opt.value === escritorio)?.label ?? escritorio;

  const exportarPdf = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const logoDataUrl = await loadPdfLogoDataUrl();
      const subcategoriaLabel = filtroSubcategoria ? subcategoriasOptions.find(s => s.value === filtroSubcategoria)?.label : null;
      const filterSummary = [
        `Escritório: ${selectedEscritorioLabel || "Todos"}`,
        `Categoria: ${filtroCategoria === "todas" ? "Todas" : filtroCategoria}`,
        filtroSubcategoria ? `Subcategoria: ${subcategoriaLabel}` : null,
        `Status: ${filtroStatus === "todos" ? "Todos" : filtroStatus}`,
        filtroDia ? `Data: ${formatDateOnly(parseDateInput(filtroDia))}` : `Período: ${filtroMes === "todos" ? "Todos" : MESES[Number(filtroMes)]}/${filtroAno === "todos" ? "Todos" : filtroAno}`,
      ].filter(Boolean).join(" • ");

      const { contentStartY, marginX } = drawPdfHeader(doc, {
        title: "Relatório de Receitas",
        subtitle: filterSummary,
        rightText: `Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
        logoDataUrl,
      });

      if (receitasFiltradas.length === 0) {
        doc.setFontSize(10);
        doc.text("Nenhuma receita encontrada para os filtros selecionados.", marginX, contentStartY + 12);
      } else {
        autoTable(doc, {
          startY: contentStartY,
          theme: "grid",
          headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold" },
          styles: { cellPadding: 6, fontSize: 9 },
          columns: [
            { header: "Descrição", dataKey: "descricao" },
            { header: "Categoria", dataKey: "categoria" },
            { header: "Vencimento", dataKey: "data" },
            { header: "Valor Total", dataKey: "valorTotal" },
            { header: "Valor Pago", dataKey: "valorPago" },
            { header: "Status", dataKey: "status" },
          ],
          body: receitasFiltradas.map((receita) => ({
            descricao: receita.descricao,
            categoria: receita.categoria,
            data: formatDateOnly(receita.dataVencimento),
            valorTotal: formatCurrency(receita.valorTotal),
            valorPago: formatCurrency(receita.valorPago),
            status: receita.status,
          })),
        });

        const finalY = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? contentStartY;
        const totalValor = receitasFiltradas.reduce((sum, receita) => sum + receita.valorTotal, 0);
        const totalPago = receitasFiltradas.reduce((sum, receita) => sum + receita.valorPago, 0);

        doc.setFontSize(10);
        doc.text(`Total de Receitas: ${formatCurrency(totalValor)}`, marginX, finalY + 24);
        doc.text(`Total Recebido: ${formatCurrency(totalPago)}`, marginX, finalY + 40);
      }

      doc.save(`Relatorio_Receitas_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Erro ao exportar PDF de receitas:", error);
      window.alert("Não foi possível gerar o PDF de receitas.");
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return formatDateOnly(date);
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
    const categoria = categoriaEdit;
    const subcategoria = subcategoriaEdit;
    const origem = ""; // Campo removido
    const valorTotal = Number(formData.get("valorTotal") || 0);
    const valorPago = Number(formData.get("valorPago") || 0);
    const dataVencimentoStr = String(formData.get("dataVencimento") || "");
    const dataVencimento = dataVencimentoStr ? parseDateInput(dataVencimentoStr) : editing.dataVencimento;
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
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Receitas</CardTitle>
          <Button onClick={exportarPdf} disabled={loading || exporting}>
            {exporting ? "Gerando PDF..." : "Exportar PDF"}
          </Button>
        </div>
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
            <Select 
              value={filtroCategoria} 
              onValueChange={(val) => {
                setFiltroCategoria(val);
                setFiltroSubcategoria("");
              }}
            >
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
            <Label>Subcategoria</Label>
            <Select 
              value={filtroSubcategoria} 
              onValueChange={setFiltroSubcategoria}
              disabled={filtroCategoria === "todas" || filteredSubcategoriasFiltro.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={filtroCategoria === "todas" ? "Selecione uma categoria" : "Subcategoria"} />
              </SelectTrigger>
              <SelectContent>
                {filteredSubcategoriasFiltro.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
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
            <Label>Dia</Label>
            <Input
              type="date"
              value={filtroDia}
              onChange={(e) => setFiltroDia(e.target.value)}
              placeholder="Filtrar por dia"
            />
          </div>

          <div>
            <Label>Mês</Label>
            <Select value={filtroMes} onValueChange={setFiltroMes} disabled={filtroDia !== ""}>
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
            <Select value={filtroAno} onValueChange={setFiltroAno} disabled={filtroDia !== ""}>
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
                        setCategoriaEdit(receita.categoria);
                        setSubcategoriaEdit(receita.subcategoria || "");
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
                              <Label htmlFor="categoria">Categoria</Label>
                              <Select 
                                value={categoriaEdit} 
                                onValueChange={(val) => {
                                  setCategoriaEdit(val);
                                  setSubcategoriaEdit("");
                                }}
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
                            <div className="grid gap-2">
                              <Label htmlFor="subcategoria">Subcategoria</Label>
                              <Select 
                                value={subcategoriaEdit} 
                                onValueChange={setSubcategoriaEdit}
                                disabled={!categoriaEdit}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder={categoriaEdit ? "Selecione" : "Selecione uma categoria primeiro"} />
                                </SelectTrigger>
                                <SelectContent>
                                  {filteredSubcategoriasEdit.map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label htmlFor="descricao">Descrição</Label>
                              <Input
                                id="descricao"
                                name="descricao"
                                defaultValue={editing.descricao}
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
                                defaultValue={formatDateInput(editing.dataVencimento)}
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
