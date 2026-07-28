import {
  CaminhoCliente,
  EtapaCaminho,
  ETAPAS_CAMINHO,
  HistoricoEtapa,
  SituacaoCaminho,
} from '@/model/entities';
import { caminhoClienteRepository } from '@/model/repositories/caminhoClienteRepository';

interface AvancarEtapaInput {
  novaEtapa: EtapaCaminho;
  situacao?: SituacaoCaminho;
  responsavel: string;
  responsavelUid?: string;
  observacao?: string;
  proximaAcao?: string;
  prazoProximaAcao?: Date | null;
}

class CaminhoClienteService {
  async list(pageSize = 500): Promise<CaminhoCliente[]> {
    return await caminhoClienteRepository.list(pageSize);
  }

  async getById(id: string): Promise<CaminhoCliente | null> {
    return await caminhoClienteRepository.getById(id);
  }

  async create(payload: Omit<CaminhoCliente, 'id'>): Promise<string> {
    return await caminhoClienteRepository.create(payload);
  }

  async update(id: string, payload: Partial<CaminhoCliente>): Promise<void> {
    return await caminhoClienteRepository.update(id, payload);
  }

  async delete(id: string): Promise<void> {
    return await caminhoClienteRepository.delete(id);
  }

  /**
   * Avança o cliente para uma nova etapa e registra o histórico.
   * Preserva o histórico anterior e atualiza campos de responsável/situação
   * com base nos metadados da etapa (permitindo sobreposição manual).
   */
  async avancarEtapa(id: string, input: AvancarEtapaInput): Promise<void> {
    const atual = await caminhoClienteRepository.getById(id);
    if (!atual) throw new Error('Registro do Caminho do Cliente não encontrado');

    const meta = ETAPAS_CAMINHO.find((e) => e.key === input.novaEtapa);
    const agora = new Date();

    // Firestore não aceita undefined — omitimos as chaves opcionais quando vazias.
    const novoRegistro: HistoricoEtapa = {
      etapa: input.novaEtapa,
      data: agora,
      responsavel: input.responsavel || 'Sistema',
      ...(input.responsavelUid ? { responsavelUid: input.responsavelUid } : {}),
      ...(input.observacao ? { observacao: input.observacao } : {}),
    };

    const historico = [...(atual.historico || []), novoRegistro];

    await caminhoClienteRepository.update(id, {
      etapaAtual: input.novaEtapa,
      situacao: input.situacao ?? this.inferirSituacao(input.novaEtapa, atual.situacao),
      setorResponsavel: meta ? meta.setorSugerido : atual.setorResponsavel,
      responsavelAtual: input.responsavel || atual.responsavelAtual || '',
      proximaAcao: input.proximaAcao ?? meta?.proximaAcaoSugerida ?? atual.proximaAcao ?? '',
      prazoProximaAcao: input.prazoProximaAcao ?? atual.prazoProximaAcao ?? null,
      historico,
      dataUltimaMovimentacao: agora,
    });
  }

  /**
   * Inferência simples da situação a partir da etapa. Não é uma regra rígida:
   * o usuário pode sobrescrever ao avançar a etapa.
   */
  private inferirSituacao(etapa: EtapaCaminho, situacaoAtual: SituacaoCaminho): SituacaoCaminho {
    if (etapa === 'processo_encerrado' || etapa === 'honorarios_recebidos') return 'concluido';
    if (etapa === 'documentacao_pendente' || etapa === 'documentos_solicitados') return 'aguardando_cliente';
    if (etapa === 'aguardando_analise_inss' || etapa === 'exigencia_inss' || etapa === 'aguardando_decisao') return 'aguardando_inss';
    if (
      etapa === 'acao_judicial_protocolada' ||
      etapa === 'citacao_contestacao' ||
      etapa === 'pericia_agendada' ||
      etapa === 'pericia_realizada' ||
      etapa === 'sentenca' ||
      etapa === 'recurso_judicial' ||
      etapa === 'transito_julgado' ||
      etapa === 'cumprimento_decisao' ||
      etapa === 'rpv_precatorio'
    ) {
      return 'aguardando_justica';
    }
    return situacaoAtual || 'em_andamento';
  }

  /**
   * Retorna quantos dias o registro está parado desde a última movimentação.
   */
  diasParado(caminho: CaminhoCliente, referencia: Date = new Date()): number {
    const ultima = caminho.dataUltimaMovimentacao instanceof Date
      ? caminho.dataUltimaMovimentacao
      : new Date(caminho.dataUltimaMovimentacao);
    const diffMs = referencia.getTime() - ultima.getTime();
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  /**
   * Percentual de progresso (etapa atual / total de etapas).
   */
  progresso(caminho: CaminhoCliente): number {
    const meta = ETAPAS_CAMINHO.find((e) => e.key === caminho.etapaAtual);
    if (!meta) return 0;
    return Math.round((meta.ordem / ETAPAS_CAMINHO.length) * 100);
  }
}

export const caminhoClienteService = new CaminhoClienteService();
