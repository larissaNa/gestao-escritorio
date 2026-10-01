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
import { CustoServico, ADVOGADOS_HONORARIOS } from "@/model/entities";
import { useState, useMemo } from "react";
import { useConfigListOptions } from "@/viewmodel/configLists/useConfigListOptions";
import { formatDateInput, formatDateOnly, normalizeDateOnly, parseDateInput } from "@/lib/utils";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { drawPdfHeader, loadPdfLogoDataUrl } from "@/lib/pdf";

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
  const [exporting, setExporting] = useState(false);
  const [categoriaEdit, setCategoriaEdit] = useState<CustoServico["categoria"]>("outros");
  const [subcategoriaEdit, setSubcategoriaEdit] = useState<string>("");
  const [advogadoResponsavelEdit, setAdvogadoResponsavelEdit] = useState<string>("");

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

  const filteredSubcategoriasEdit = useMemo(() => {
    if (!categoriaEdit) return [];
    return subcategoriasOptions.filter(s => s.parentId === categoriaEdit);
  }, [categoriaEdit, subcategoriasOptions]);

  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroSubcategoria, setFiltroSubcategoria] = useState<string>("");
  const [filtroAdvogado, setFiltroAdvogado] = useState<string>("todos");
  const [filtroMes, setFiltroMes] = useState<string>("todos");
  const [filtroAno, setFiltroAno] = useState<string>("todos");
  const [filtroDia, setFiltroDia] = useState<string>("");
  const [filtroPago, setFiltroPago] = useState<string>("todos");
  const [filtroRecorrente, setFiltroRecorrente] = useState<string>("todos");

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

  const anosDisponiveis = useMemo(() => {
    const anos = custos.map((c) => normalizeDateOnly(c.data).getFullYear());
    return Array.from(new Set(anos)).sort((a, b) => b - a);
  }, [custos]);

  const custosFiltrados = useMemo(() => {
    return custos.filter((custo) => {
      const data = normalizeDateOnly(custo.data);

      if (filtroCategoria !== "todas" && custo.categoria !== filtroCategoria) return false;
      if (filtroSubcategoria !== "" && custo.subcategoria !== filtroSubcategoria) return false;
      if (isHonorariosAdvocaticiosFiltro && filtroAdvogado !== "todos" && custo.advogadoResponsavel !== filtroAdvogado) return false;
      if (filtroAno !== "todos" && data.getFullYear().toString() !== filtroAno) return false;
      if (filtroMes !== "todos" && data.getMonth().toString() !== filtroMes) return false;
      
      if (filtroDia !== "") {
        const filtroDiaDate = parseDateInput(filtroDia);
        if (formatDateOnly(data) !== formatDateOnly(filtroDiaDate)) return false;
      }
      
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
  }, [custos, filtroCategoria, filtroSubcategoria, isHonorariosAdvocaticiosFiltro, filtroAdvogado, filtroMes, filtroAno, filtroDia, filtroPago, filtroRecorrente]);

  const totalValorCustosFiltrado = useMemo(() => {
    return custosFiltrados.reduce((sum, c) => sum + (c.valor || 0), 0);
  }, [custosFiltrados]);

  const totalPagoCustosFiltrado = useMemo(() => {
    return custosFiltrados.reduce((sum, c) => sum + (c.pago ? c.valor || 0 : 0), 0);
  }, [custosFiltrados]);

  const totalPendenteCustosFiltrado = useMemo(() => {
    return custosFiltrados.reduce((sum, c) => sum + (!c.pago ? c.valor || 0 : 0), 0);
  }, [custosFiltrados]);

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
        `Pago: ${filtroPago === "todos" ? "Todos" : filtroPago === "sim" ? "Sim" : "Não"}`,
        `Recorrente: ${filtroRecorrente === "todos" ? "Todos" : filtroRecorrente === "sim" ? "Sim" : "Não"}`,
        filtroDia ? `Data: ${formatDateOnly(parseDateInput(filtroDia))}` : `Período: ${filtroMes === "todos" ? "Todos" : MESES[Number(filtroMes)]}/${filtroAno === "todos" ? "Todos" : filtroAno}`,
      ].filter(Boolean).join(" • ");

      const { contentStartY, marginX } = drawPdfHeader(doc, {
        title: "Relatório de Custos",
        subtitle: filterSummary,
        rightText: `Gerado em ${new Date().toLocaleDateString("pt-BR")}`,
        logoDataUrl,
      });

      if (custosFiltrados.length === 0) {
        doc.setFontSize(10);
        doc.text("Nenhum custo encontrado para os filtros selecionados.", marginX, contentStartY + 12);
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
            { header: "Data", dataKey: "data" },
            { header: "Valor", dataKey: "valor" },
            { header: "Pago", dataKey: "pago" },
            { header: "Recorrente", dataKey: "recorrente" },
          ],
          body: custosFiltrados.map((custo) => ({
            descricao: custo.descricao,
            categoria: custo.categoria,
            advogado: custo.advogadoResponsavel || "-",
            data: formatDateOnly(custo.data),
            valor: formatCurrency(custo.valor),
            pago: custo.pago ? "Sim" : "Não",
            recorrente: custo.recorrente ? "Sim" : "Não",
          })),
        });

        const finalY = (doc as { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? contentStartY;

        doc.setFontSize(10);
        doc.text(`Total de Custos: ${formatCurrency(totalValorCustosFiltrado)}`, marginX, finalY + 24);
        doc.text(`Custos Pagos: ${formatCurrency(totalPagoCustosFiltrado)}`, marginX, finalY + 40);
        if (totalPendenteCustosFiltrado > 0) {
          doc.text(`Custos Pendentes: ${formatCurrency(totalPendenteCustosFiltrado)}`, marginX, finalY + 56);
        }
      }

      doc.save(`Relatorio_Custos_${new Date().toISOString().split("T")[0]}.pdf`);
    } catch (error) {
      console.error("Erro ao exportar PDF de custos:", error);
      window.alert("Não foi possível gerar o PDF de custos.");
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
    const subcategoria = subcategoriaEdit;
    const categoria = categoriaEdit;
    const valor = Number(formData.get("valor") || 0);
    const dataStr = String(formData.get("data") || "");
    const data = dataStr ? parseDateInput(dataStr) : editing.data;
    const origem = ""; // Campo removido
    const pago = formData.get("pago") === "on";
    const recorrente = formData.get("recorrente") === "on";

    setSaving(true);
    try {
      await onEdit(editing.id, {
        descricao,
        subcategoria,
        categoria,
        advogadoResponsavel: isHonorariosAdvocaticiosEdit ? advogadoResponsavelEdit : undefined,
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
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Custos do Serviço</CardTitle>
          <Button onClick={exportarPdf} disabled={loading || exporting}>
            {exporting ? "Gerando PDF..." : "Exportar PDF"}
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4 mt-4">
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
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
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

        {/* Resumo dos Valores Filtrados */}
        <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-3 sm:p-4 mt-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <span>Resultado do Filtro</span>
              <span className="text-xs bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full font-semibold text-foreground">
                {custosFiltrados.length} {custosFiltrados.length === 1 ? 'custo' : 'custos'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <span className="text-xs text-muted-foreground block">Total Filtrado</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {formatCurrency(totalValorCustosFiltrado)}
                </span>
              </div>
              <div>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 block font-medium">Custos Pagos</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(totalPagoCustosFiltrado)}
                </span>
              </div>
              <div>
                <span className="text-xs text-amber-600 dark:text-amber-400 block font-medium">Custos Pendentes</span>
                <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {formatCurrency(totalPendenteCustosFiltrado)}
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
                  <TableCell className="font-medium">
                    <div>{custo.descricao}</div>
                    {custo.advogadoResponsavel && (
                      <div className="text-xs text-muted-foreground font-normal mt-0.5">
                        Adv: <span className="font-medium text-foreground">{custo.advogadoResponsavel}</span>
                      </div>
                    )}
                  </TableCell>
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
                          setSubcategoriaEdit(custo.subcategoria || "");
                          setAdvogadoResponsavelEdit(custo.advogadoResponsavel || "");
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
                              <Label htmlFor="categoria">Categoria</Label>
                              <Select
                                value={categoriaEdit}
                                onValueChange={(val) => {
                                  setCategoriaEdit(val as CustoServico["categoria"]);
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
                                  defaultValue={formatDateInput(editing.data)}
                                  required
                                />
                              </div>
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
