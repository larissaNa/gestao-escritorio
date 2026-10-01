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
import { Receita, ADVOGADOS_HONORARIOS } from "@/model/entities";
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
  const [advogadoResponsavelEdit, setAdvogadoResponsavelEdit] = useState<string>("");

  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState<string>("");
  const [filtroAdvogado, setFiltroAdvogado] = useState<string>("todos");
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

  const isHonorariosAdvocaticiosEdit = useMemo(() => {
    const norm = (str?: string) =>
      (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const foundLabel = categoriasOptions.find(c => c.value === categoriaEdit)?.label || categoriaEdit;
    return norm(categoriaEdit).includes('honorario') || norm(foundLabel).includes('honorario');
  }, [categoriaEdit, categoriasOptions]);

  const isHonorariosAdvocaticiosFiltro = useMemo(() => {
    if (filtroCategoria === "todas") return false;
    const norm = (str?: string) =>
      (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const foundLabel = categoriasOptions.find(c => c.value === filtroCategoria)?.label || filtroCategoria;
    return norm(filtroCategoria).includes('honorario') || norm(foundLabel).includes('honorario');
  }, [filtroCategoria, categoriasOptions]);

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
      if (isHonorariosAdvocaticiosFiltro && filtroAdvogado !== "todos" && receita.advogadoResponsavel !== filtroAdvogado) return false;
      if (filtroStatus !== "todos" && receita.status !== filtroStatus) return false;
      if (filtroAno !== "todos" && data.getFullYear().toString() !== filtroAno) return false;
      if (filtroMes !== "todos" && data.getMonth().toString() !== filtroMes) return false;
      
      if (filtroDia !== "") {
        const filtroDiaDate = parseDateInput(filtroDia);
        if (formatDateOnly(data) !== formatDateOnly(filtroDiaDate)) return false;
      }
      
      return true;
    });
  }, [receitas, filtroCategoria, filtroSubcategoria, isHonorariosAdvocaticiosFiltro, filtroAdvogado, filtroStatus, filtroAno, filtroMes, filtroDia]);

  const totalValorFiltrado = useMemo(() => {
    return receitasFiltradas.reduce((sum, r) => sum + (r.valorTotal || 0), 0);
  }, [receitasFiltradas]);

  const totalPagoFiltrado = useMemo(() => {
    return receitasFiltradas.reduce((sum, r) => sum + (r.valorPago || 0), 0);
  }, [receitasFiltradas]);

  const totalAbertoFiltrado = useMemo(() => {
    return receitasFiltradas.reduce((sum, r) => sum + (r.valorAberto ?? Math.max(0, (r.valorTotal || 0) - (r.valorPago || 0))), 0);
  }, [receitasFiltradas]);

  const selectedEscritorioLabel = escritoriosOptions.find((opt) => opt.value === escritorio)?.label ?? escritorio;

  const exportarPdf = async () => {
    setExporting(true);
    try {
      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const logoDataUrl = await loadPdfLogoDataUrl();
      const subcategoriaLabel = filtroSubcategoria ? subcategoriasOptions.find(s => s.value === filtroSubcategoria)?.label : null;
      const categoriaLabel = filtroCategoria === "todas" ? "Todas" : (categoriasOptions.find(c => c.value === filtroCategoria)?.label || filtroCategoria);
      const filterSummary = [
        `Escritório: ${selectedEscritorioLabel || "Todos"}`,
        `Categoria: ${categoriaLabel}`,
        filtroSubcategoria ? `Subcategoria: ${subcategoriaLabel}` : null,
        (isHonorariosAdvocaticiosFiltro && filtroAdvogado !== "todos") ? `Advogado: ${filtroAdvogado}` : null,
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
            { header: "Advogado", dataKey: "advogado" },
            { header: "Vencimento", dataKey: "data" },
            { header: "Valor Total", dataKey: "valorTotal" },
            { header: "Valor Pago", dataKey: "valorPago" },
            { header: "Status", dataKey: "status" },
          ],
          body: receitasFiltradas.map((receita) => ({
            descricao: receita.descricao,
            categoria: receita.categoria,
            advogado: receita.advogadoResponsavel || "-",
            data: formatDateOnly(receita.dataVencimento),
            valorTotal: formatCurrency(receita.valorTotal),
            valorPago: formatCurrency(receita.valorPago),
            status: receita.status,
          })),
        });

        const finalY = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? contentStartY;

        doc.setFontSize(10);
        doc.text(`Total de Receitas: ${formatCurrency(totalValorFiltrado)}`, marginX, finalY + 24);
        doc.text(`Total Recebido: ${formatCurrency(totalPagoFiltrado)}`, marginX, finalY + 40);
        if (totalAbertoFiltrado > 0) {
          doc.text(`Total em Aberto: ${formatCurrency(totalAbertoFiltrado)}`, marginX, finalY + 56);
        }
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
        advogadoResponsavel: isHonorariosAdvocaticiosEdit ? advogadoResponsavelEdit : undefined,
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4 mt-4">
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
                setFiltroAdvogado("todos");
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

          {isHonorariosAdvocaticiosFiltro && (
            <div>
              <Label>Advogado</Label>
              <Select value={filtroAdvogado} onValueChange={setFiltroAdvogado}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Advogados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Advogados</SelectItem>
                  {ADVOGADOS_HONORARIOS.map((adv) => (
                    <SelectItem key={adv} value={adv}>
                      {adv}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

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

        {/* Resumo dos Valores Filtrados */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 sm:p-4 mt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span>Resultado do Filtro</span>
              <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full font-semibold text-foreground">
                {receitasFiltradas.length} {receitasFiltradas.length === 1 ? 'receita' : 'receitas'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="text-xs text-muted-foreground block">Total Filtrado</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(totalValorFiltrado)}
                </span>
              </div>
              <div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-medium">Total Recebido</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalPagoFiltrado)}
                </span>
              </div>
              <div>
                <span className="text-xs text-amber-600 dark:text-amber-400 block font-medium">Em Aberto</span>
                <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(totalAbertoFiltrado)}
                </span>
              </div>
            </div>
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
                  <TableCell className="font-medium">
                    <div>{receita.descricao}</div>
                    {receita.advogadoResponsavel && (
                      <div className="text-xs text-muted-foreground font-normal mt-0.5">
                        Adv: <span className="font-medium text-foreground">{receita.advogadoResponsavel}</span>
                      </div>
                    )}
                  </TableCell>
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
                        setAdvogadoResponsavelEdit(receita.advogadoResponsavel || "");
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
                            {isHonorariosAdvocaticiosEdit && (
                              <div className="grid gap-2">
                                <Label htmlFor="advogadoResponsavelEdit">Advogado Responsável</Label>
                                <Select 
                                  value={advogadoResponsavelEdit} 
                                  onValueChange={setAdvogadoResponsavelEdit}
                                >
                                  <SelectTrigger id="advogadoResponsavelEdit">
                                    <SelectValue placeholder="Selecione o advogado" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ADVOGADOS_HONORARIOS.map((adv) => (
                                      <SelectItem key={adv} value={adv}>
                                        {adv}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
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
