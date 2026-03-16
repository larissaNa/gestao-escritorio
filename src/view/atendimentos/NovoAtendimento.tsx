import { ClipboardList, Loader2, ArrowLeft, Gavel, Landmark, FileText } from 'lucide-react';
import { Button } from '@/view/components/ui/button';
import { Input } from '@/view/components/ui/input';
import { Label } from '@/view/components/ui/label';
import { Textarea } from '@/view/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { useNovoAtendimento } from '@/viewmodel/atendimentos/useNovoAtendimentoViewModel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/view/components/ui/tabs';
import { Checkbox } from '@/view/components/ui/checkbox';
import { useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';

import { PageHeader } from '@/view/components/layout/PageHeader';

const NovoAtendimento = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam === 'fechamento' ? 'fechamento' : 'dados';

  const {
    formData,
    setFormData,
    handleSubmit,
    handleSalvarFechamento,
    handleConcluirFechamento,
    handleNomeChange,
    handleCpfChange,
    handleCancel,
    selectSuggestion,
    cpfSuggestions,
    nomeSuggestions,
    showCpfSuggestions,
    showNomeSuggestions,
    searchingClient,
    loading,
    isEditing,
    tiposAcao,
    cidades,
    advogados,
    responsavelAuto,
  } = useNovoAtendimento();

  const processTypes = [
    { value: 'Administrativo', label: 'Administrativo', icon: Landmark },
    { value: 'Judicial', label: 'Judicial', icon: Gavel },
    { value: 'Recurso', label: 'Recurso', icon: FileText },
  ] as const;

  const statusOptions = [
    { value: 'em_andamento', label: 'Em andamento' },
    { value: 'aguardando_documentacao', label: 'Aguardando documentação' },
    { value: 'repassado', label: 'Repassado' },
    { value: 'fechado_com_contrato', label: 'Fechado com contrato' },
    { value: 'encerrado_sem_contrato', label: 'Encerrado sem contrato' },
    { value: 'finalizado', label: 'Finalizado (legado)' },
  ] as const;

  const canShowFechamento = isEditing;
  const checklistOk = Boolean(
    formData.fechamento?.checklist?.pasta_drive &&
      formData.fechamento?.checklist?.procuracao_especifica &&
      formData.fechamento?.checklist?.contrato
  );
  const canConcluirFechamento = Boolean(
    canShowFechamento &&
      formData.fechamento?.tipoProcesso?.trim() &&
      checklistOk &&
      formData.fechamento?.driveLink?.trim() &&
      formData.fechamento?.contratoLink?.trim()
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Editar Atendimento' : 'Novo Atendimento'}
        description="Preencha os dados abaixo"
      >
        {canShowFechamento && (
          <Button
            variant="secondary"
            onClick={() => setSearchParams({ tab: 'fechamento' })}
            className="gap-2"
          >
            <ClipboardList className="w-4 h-4" />
            Fechamento de Contrato
          </Button>
        )}
        <Button variant="outline" onClick={handleCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </PageHeader>

      <div className="max-w-3xl mx-auto w-full">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setSearchParams(value === 'fechamento' ? { tab: 'fechamento' } : {})}
          className="space-y-4"
        >
          <TabsList className="w-full justify-start">
            <TabsTrigger value="dados">Dados</TabsTrigger>
            <TabsTrigger value="fechamento" disabled={!canShowFechamento}>
              Fechamento de Contrato
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dados">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>Dados do Atendimento</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2 relative">
                      <Label htmlFor="cpf">CPF *</Label>
                      <div className="relative">
                        <Input
                          id="cpf"
                          value={formData.cpf}
                          onChange={handleCpfChange}
                          placeholder="000.000.000-00"
                          required
                          autoComplete="off"
                        />
                        {searchingClient && (
                          <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Ao preencher o CPF, se o cliente já existir, os dados serão carregados automaticamente.
                      </p>
                      {showCpfSuggestions && cpfSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-popover text-popover-foreground border rounded-md shadow-md mt-1 max-h-40 overflow-y-auto">
                          {cpfSuggestions.map((cliente) => (
                            <div
                              key={cliente.id}
                              className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                              onClick={() => selectSuggestion(cliente)}
                            >
                              {cliente.cpf} - {cliente.nome}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2 relative">
                      <Label htmlFor="nome">Nome *</Label>
                      <div className="relative">
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={handleNomeChange}
                          placeholder="Nome completo"
                          required
                          autoComplete="off"
                        />
                        {searchingClient && (
                          <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                      {showNomeSuggestions && nomeSuggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-popover text-popover-foreground border rounded-md shadow-md mt-1 max-h-40 overflow-y-auto">
                          {nomeSuggestions.map((cliente) => (
                            <div
                              key={cliente.id}
                              className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                              onClick={() => selectSuggestion(cliente)}
                            >
                              {cliente.nome} ({cliente.cpf})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        value={formData.telefone}
                        onChange={(e) => setFormData((prev) => ({ ...prev, telefone: e.target.value }))}
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tipoProcedimento">Tipo de Procedimento</Label>
                      <Input
                        id="tipoProcedimento"
                        value={formData.tipoProcedimento}
                        onChange={(e) => setFormData((prev) => ({ ...prev, tipoProcedimento: e.target.value }))}
                        placeholder="Ex: Consulta Inicial"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dataAtendimento">Data do Atendimento *</Label>
                      <Input
                        id="dataAtendimento"
                        type="date"
                        value={formData.dataAtendimento}
                        onChange={(e) => setFormData((prev) => ({ ...prev, dataAtendimento: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tipo de Ação *</Label>
                      <Select value={formData.tipoAcao} onValueChange={(value) => setFormData((prev) => ({ ...prev, tipoAcao: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a ação" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposAcao.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Responsável *</Label>
                      <Input value={formData.responsavel || responsavelAuto} disabled className="bg-muted" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Status *</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, status: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Cidade *</Label>
                      <Select value={formData.cidade} onValueChange={(value) => setFormData((prev) => ({ ...prev, cidade: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a cidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {cidades.map((cidade) => (
                            <SelectItem key={cidade} value={cidade}>
                              {cidade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Modalidade *</Label>
                      <Select value={formData.modalidade} onValueChange={(value) => setFormData((prev) => ({ ...prev, modalidade: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Presencial">Presencial</SelectItem>
                          <SelectItem value="Online">Online</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Repassar para Advogado</Label>
                    <Select
                      value={formData.advogadoResponsavel}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, advogadoResponsavel: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Não repassar" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nenhum">Não repassar</SelectItem>
                        {advogados.map((adv) => (
                          <SelectItem key={adv} value={adv}>
                            {adv}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea
                      id="observacoes"
                      value={formData.observacoes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, observacoes: e.target.value }))}
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={handleCancel}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {isEditing ? 'Atualizar' : 'Salvar'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fechamento">
            <Card className="border-0 shadow-card">
              <CardHeader>
                <CardTitle>Fechamento de Contrato</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Tipo de Processo *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {processTypes.map((t) => {
                      const Icon = t.icon;
                      const selected = formData.fechamento.tipoProcesso === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              fechamento: { ...prev.fechamento, tipoProcesso: t.value },
                            }))
                          }
                          className={cn(
                            'border rounded-lg p-4 text-left flex items-center gap-3 hover:bg-muted/30 transition-colors',
                            selected ? 'border-primary bg-primary/5' : 'border-border',
                          )}
                        >
                          <div className={cn('rounded-md p-2', selected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium">{t.label}</p>
                            <p className="text-xs text-muted-foreground">Selecionar</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Checklist de documentos obrigatórios *</Label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.fechamento.checklist.pasta_drive}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            fechamento: {
                              ...prev.fechamento,
                              checklist: { ...prev.fechamento.checklist, pasta_drive: Boolean(checked) },
                            },
                          }))
                        }
                      />
                      <span className="text-sm">Fazer pasta no Drive</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.fechamento.checklist.procuracao_especifica}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            fechamento: {
                              ...prev.fechamento,
                              checklist: { ...prev.fechamento.checklist, procuracao_especifica: Boolean(checked) },
                            },
                          }))
                        }
                      />
                      <span className="text-sm">Procuração específica</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={formData.fechamento.checklist.contrato}
                        onCheckedChange={(checked) =>
                          setFormData((prev) => ({
                            ...prev,
                            fechamento: {
                              ...prev.fechamento,
                              checklist: { ...prev.fechamento.checklist, contrato: Boolean(checked) },
                            },
                          }))
                        }
                      />
                      <span className="text-sm">Contrato</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="driveLink">Link da pasta no Drive *</Label>
                    <Input
                      id="driveLink"
                      value={formData.fechamento.driveLink}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fechamento: { ...prev.fechamento, driveLink: e.target.value },
                        }))
                      }
                      placeholder="https://drive.google.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contratoLink">Link do contrato digitalizado *</Label>
                    <Input
                      id="contratoLink"
                      value={formData.fechamento.contratoLink}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          fechamento: { ...prev.fechamento, contratoLink: e.target.value },
                        }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={formData.fechamento.documentacaoCompleta}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        fechamento: { ...prev.fechamento, documentacaoCompleta: Boolean(checked) },
                      }))
                    }
                  />
                  <span className="text-sm">Documentação Completa</span>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleSalvarFechamento} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Salvar fechamento
                  </Button>
                  <Button type="button" onClick={handleConcluirFechamento} disabled={loading || !canConcluirFechamento}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Concluir fechamento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NovoAtendimento;
