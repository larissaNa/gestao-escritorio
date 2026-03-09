import { ClipboardList, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/view/components/ui/button';
import { Input } from '@/view/components/ui/input';
import { Label } from '@/view/components/ui/label';
import { Textarea } from '@/view/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/view/components/ui/card';
import { useNovoAtendimento } from '@/viewmodel/atendimentos/useNovoAtendimentoViewModel';

import { PageHeader } from '@/view/components/layout/PageHeader';

const NovoAtendimento = () => {
  const {
    formData,
    setFormData,
    handleSubmit,
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
    responsaveis,
    cidades,
    advogados,
  } = useNovoAtendimento();

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditing ? 'Editar Atendimento' : 'Novo Atendimento'}
        description="Preencha os dados abaixo"
      >
        <Button variant="outline" onClick={handleCancel} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
      </PageHeader>

      <div className="max-w-3xl mx-auto w-full">
        <Card className="border-0 shadow-card">
          <CardHeader>
            <CardTitle>Dados do Atendimento</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1: Nome e CPF */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {searchingClient && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                  {showNomeSuggestions && nomeSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-popover text-popover-foreground border rounded-md shadow-md mt-1 max-h-40 overflow-y-auto">
                      {nomeSuggestions.map(cliente => (
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
                    {searchingClient && <Loader2 className="absolute right-2 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ao preencher o CPF, se o cliente já existir, os dados serão carregados automaticamente.
                  </p>
                  {showCpfSuggestions && cpfSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full bg-popover text-popover-foreground border rounded-md shadow-md mt-1 max-h-40 overflow-y-auto">
                      {cpfSuggestions.map(cliente => (
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
              </div>

              {/* Row 2: Telefone, Procedimento, Data */}
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
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, tipoProcedimento: e.target.value }))
                    }
                    placeholder="Ex: Consulta Inicial"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dataAtendimento">Data do Atendimento *</Label>
                  <Input
                    id="dataAtendimento"
                    type="date"
                    value={formData.dataAtendimento}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, dataAtendimento: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              {/* Row 3: Tipo Ação e Responsável */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Ação *</Label>
                  <Select
                    value={formData.tipoAcao}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, tipoAcao: value }))}
                  >
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
                  <Select
                    value={formData.responsavel}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, responsavel: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {responsaveis.map((resp) => (
                        <SelectItem key={resp} value={resp}>
                          {resp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Row 4: Cidade, Modalidade, Advogado */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Cidade *</Label>
                  <Select
                    value={formData.cidade}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, cidade: value }))}
                  >
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
                  <Select
                    value={formData.modalidade}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, modalidade: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Presencial">Presencial</SelectItem>
                      <SelectItem value="Online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Repassar para Advogado</Label>
                  <Select
                    value={formData.advogadoResponsavel}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, advogadoResponsavel: value }))
                    }
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
              </div>

              {/* Row 5: Observações */}
              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, observacoes: e.target.value }))
                  }
                  placeholder="Observações adicionais..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                >
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
      </div>
    </div>
  );
};

export default NovoAtendimento;
