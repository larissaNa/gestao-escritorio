import React from 'react';
import { ArrowLeft, Pencil, CheckCircle2, Circle, ChevronRight, Clock } from 'lucide-react';
import { PageHeader } from '@/view/components/layout/PageHeader';
import { Button } from '@/view/components/ui/button';
import { Card, CardContent } from '@/view/components/ui/card';
import { Badge } from '@/view/components/ui/badge';
import { Input } from '@/view/components/ui/input';
import { Label } from '@/view/components/ui/label';
import { Textarea } from '@/view/components/ui/textarea';
import { Progress } from '@/view/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { useCaminhoClienteTimelineViewModel } from '@/viewmodel/caminhoCliente/useCaminhoClienteTimelineViewModel';
import {
  ETAPAS_CAMINHO,
  SITUACOES_CAMINHO,
  EtapaCaminho,
  SituacaoCaminho,
} from '@/model/entities';

const CaminhoClienteTimeline = () => {
  const {
    caminho,
    loading,
    avancando,
    novaEtapa,
    setNovaEtapa,
    novaSituacao,
    setNovaSituacao,
    observacao,
    setObservacao,
    proximaAcao,
    setProximaAcao,
    prazo,
    setPrazo,
    avancar,
    progresso,
    diasParado,
    voltar,
    editar,
  } = useCaminhoClienteTimelineViewModel();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!caminho) return null;

  const etapaAtualMeta = ETAPAS_CAMINHO.find((e) => e.key === caminho.etapaAtual);
  const situacaoMeta = SITUACOES_CAMINHO.find((s) => s.key === caminho.situacao);
  const ordemAtual = etapaAtualMeta?.ordem ?? 0;

  // Histórico ordenado do mais recente para o mais antigo
  const historicoOrdenado = [...(caminho.historico || [])].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={caminho.clienteNome}
        description={`CPF: ${caminho.clienteCpf || '-'} • Cadastro: ${caminho.dataCadastro?.toLocaleDateString('pt-BR')}`}
      >
        <Button variant="outline" onClick={voltar} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <Button variant="outline" onClick={editar} className="gap-2">
          <Pencil className="w-4 h-4" />
          Editar
        </Button>
      </PageHeader>

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna principal (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resumo */}
          <Card className="shadow-card border-0">
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {situacaoMeta && (
                  <Badge variant="outline" className={situacaoMeta.color}>
                    {situacaoMeta.emoji} {situacaoMeta.label}
                  </Badge>
                )}
                <Badge variant="secondary">Setor: {caminho.setorResponsavel}</Badge>
                {caminho.responsavelAtual && (
                  <Badge variant="secondary">Resp.: {caminho.responsavelAtual}</Badge>
                )}
                <Badge variant="outline" className="gap-1">
                  <Clock className="w-3 h-3" />
                  {diasParado}d parado
                </Badge>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-muted-foreground">
                    Etapa {ordemAtual} de {ETAPAS_CAMINHO.length}: {etapaAtualMeta?.label}
                  </span>
                  <span className="text-sm font-semibold">{progresso}%</span>
                </div>
                <Progress value={progresso} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Próxima Ação</Label>
                  <div className="text-sm mt-1">{caminho.proximaAcao || '-'}</div>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Prazo</Label>
                  <div className="text-sm mt-1">
                    {caminho.prazoProximaAcao
                      ? new Date(caminho.prazoProximaAcao).toLocaleDateString('pt-BR')
                      : '-'}
                  </div>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Processo Adm.</Label>
                  <div className="text-sm mt-1">{caminho.numeroProcessoAdm || '-'}</div>
                </div>
                <div>
                  <Label className="text-xs uppercase text-muted-foreground">Processo Jud.</Label>
                  <div className="text-sm mt-1">{caminho.numeroProcessoJud || '-'}</div>
                </div>
                {caminho.tipoBeneficio && (
                  <div className="md:col-span-2">
                    <Label className="text-xs uppercase text-muted-foreground">Tipo de Benefício</Label>
                    <div className="text-sm mt-1">{caminho.tipoBeneficio}</div>
                  </div>
                )}
                {caminho.observacoes && (
                  <div className="md:col-span-2">
                    <Label className="text-xs uppercase text-muted-foreground">Observações</Label>
                    <div className="text-sm mt-1 whitespace-pre-line">{caminho.observacoes}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Linha do tempo (30 etapas) */}
          <Card className="shadow-card border-0">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Linha do Tempo</h2>
              <ol className="relative border-l border-muted-foreground/20 ml-3">
                {ETAPAS_CAMINHO.map((etapa) => {
                  const registroHist = historicoOrdenado.find((h) => h.etapa === etapa.key);
                  const concluida = etapa.ordem < ordemAtual || !!registroHist;
                  const atual = etapa.key === caminho.etapaAtual;

                  const dotClass = atual
                    ? 'bg-primary border-primary text-primary-foreground'
                    : concluida
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'bg-background border-muted-foreground/30 text-muted-foreground';

                  return (
                    <li key={etapa.key} className="mb-5 ml-6">
                      <span
                        className={`absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full border-2 ${dotClass}`}
                      >
                        {concluida || atual ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Circle className="w-3 h-3" />
                        )}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`font-medium text-sm ${
                            atual ? 'text-primary' : concluida ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {etapa.ordem}. {etapa.label}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          {etapa.setorSugerido}
                        </Badge>
                        {atual && <Badge className="text-[10px]">Atual</Badge>}
                      </div>
                      {registroHist && (
                        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                          <div>
                            {new Date(registroHist.data).toLocaleString('pt-BR')} —{' '}
                            {registroHist.responsavel}
                          </div>
                          {registroHist.observacao && (
                            <div className="italic">"{registroHist.observacao}"</div>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </CardContent>
          </Card>
        </div>

        {/* Coluna lateral: Avançar etapa (1/3) */}
        <div className="space-y-6">
          <Card className="shadow-card border-0 sticky top-4">
            <CardContent className="p-6 space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <ChevronRight className="w-5 h-5" />
                Avançar Etapa
              </h3>

              <div className="space-y-2">
                <Label>Nova Etapa *</Label>
                <Select value={novaEtapa} onValueChange={(v) => {
                  setNovaEtapa(v as EtapaCaminho);
                  const meta = ETAPAS_CAMINHO.find((e) => e.key === v);
                  if (meta) setProximaAcao(meta.proximaAcaoSugerida);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {ETAPAS_CAMINHO.map((e) => (
                      <SelectItem key={e.key} value={e.key}>
                        {e.ordem}. {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Nova Situação (opcional)</Label>
                <Select
                  value={novaSituacao}
                  onValueChange={(v) => setNovaSituacao(v as SituacaoCaminho)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Manter atual" />
                  </SelectTrigger>
                  <SelectContent>
                    {SITUACOES_CAMINHO.map((s) => (
                      <SelectItem key={s.key} value={s.key}>
                        {s.emoji} {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Próxima Ação</Label>
                <Input
                  value={proximaAcao}
                  onChange={(e) => setProximaAcao(e.target.value)}
                  placeholder="Ex: Cobrar cliente"
                />
              </div>

              <div className="space-y-2">
                <Label>Prazo</Label>
                <Input type="date" value={prazo} onChange={(e) => setPrazo(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Observação</Label>
                <Textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  rows={3}
                  placeholder="Registre o que foi feito..."
                />
              </div>

              <Button onClick={avancar} disabled={avancando || !novaEtapa} className="w-full">
                {avancando ? 'Salvando...' : 'Avançar Etapa'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CaminhoClienteTimeline;
