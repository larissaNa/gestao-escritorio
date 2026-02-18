import { Users, CalendarCheck, TrendingUp, BarChart3, PieChart as PieChartIcon,} from 'lucide-react';
import {BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,LineChart,Line,PieChart,Pie,Cell,Legend,} from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select';
import { StatCard } from '@/view/components/dashboard/StatCard';
import { StatusBadgeCard } from '@/view/components/dashboard/StatusBadge';
import { ChartCard } from '@/view/components/dashboard/ChartCard';
import { DataTable, StatusBadge } from '@/view/components/dashboard/DataTable';
import { Cliente, Atendimento, PreCadastro } from '@/model/entities';
import { useDashboard } from '@/viewmodel/useDashboardViewModel';

import { PageHeader } from '@/view/components/layout/PageHeader';

const Dashboard = () => {
  const {
    loading,
    error,
    // clientesAguardando,
    atendimentosHoje,
    totalAtendimentos,
    selectedYear,
    setSelectedYear,
    anosDisponiveis,
    atendimentosPorMes,
    beneficiosPorAno,
    concessoesPorMes,
    tiposBeneficio,
    CHART_COLORS
  } = useDashboard();

  if (loading && !atendimentosPorMes.length) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erro: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Visão geral e métricas do escritório"
      >
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32 bg-card border-border">
            <SelectValue placeholder="Ano" />
          </SelectTrigger>
          <SelectContent>
            {anosDisponiveis.map((ano) => (
              <SelectItem key={ano} value={String(ano)}>
                {ano}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </PageHeader>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {/* <StatCard
            title="Clientes Aguardando"
            value={clientesAguardando.length}
            icon={Users}
            variant="primary"
            delay={0}
          /> */}
          <StatCard
            title="Atendimentos Hoje"
            value={atendimentosHoje.length}
            icon={CalendarCheck}
            variant="success"
            delay={100}
            orientation="horizontal"
          />
          <StatCard
            title="Total de Atendimentos"
            value={totalAtendimentos}
            icon={TrendingUp}
            variant="info"
            delay={200}
            orientation="horizontal"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ChartCard
            title="Concessões por Mês"
            icon={TrendingUp}
            iconColor="bg-green-500/10 text-green-500"
            delay={500}
          >
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={concessoesPorMes} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="mes" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="valor" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Benefícios por Ano"
            icon={TrendingUp}
            iconColor="bg-accent/10 text-accent"
            delay={500}
          >
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={beneficiosPorAno} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis 
                    dataKey="mes" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="valor" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--accent))', strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: 'hsl(var(--accent))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Tipos de Benefícios"
            icon={PieChartIcon}
            iconColor="bg-chart-1/10 text-chart-1"
            delay={600}
          >
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={tiposBeneficio}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {tiposBeneficio.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value) => <span className="text-sm text-muted-foreground">{value}</span>}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Main Bar Chart */}
        <ChartCard
          title={`Atendimentos por Mês (${selectedYear})`}
          icon={BarChart3}
          iconColor="bg-primary/10 text-primary"
          delay={400}
        >
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={atendimentosPorMes} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis 
                  dataKey="mes" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {atendimentosPorMes.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Tables */}
        <div className="space-y-6">
          {/* <DataTable<PreCadastro>
            title="Clientes Aguardando"
            icon={Users}
            data={clientesAguardando}
            count={clientesAguardando.length}
            emptyMessage="Nenhum cliente aguardando"
            delay={700}
            columns={[
              { key: 'nome', header: 'Nome' },
              { key: 'cpf', header: 'CPF' },
              { key: 'telefone', header: 'Telefone' },
              { 
                key: 'dataCadastro', 
                header: 'Data Cadastro',
                render: (item) => item.dataCadastro ? new Date(item.dataCadastro).toLocaleDateString('pt-BR') : '-'
              },
              { 
                key: 'responsavel', 
                header: 'Responsável',
                render: (item) => item.responsavel ? (
                  <StatusBadge status={item.responsavel} type="info" />
                ) : (
                  <StatusBadge status="Não atribuído" type="warning" />
                )
              },
            ]}
          /> */}

          <DataTable<Atendimento>
            title="Atendimentos de Hoje"
            icon={CalendarCheck}
            data={atendimentosHoje}
            count={atendimentosHoje.length}
            emptyMessage="Nenhum atendimento registrado hoje"
            delay={800}
            columns={[
              { key: 'clienteNome', header: 'Cliente' },
              { key: 'clienteCpf', header: 'CPF' },
              { key: 'tipoProcedimento', header: 'Tipo Procedimento' },
              { key: 'responsavel', header: 'Responsável' },
              // { 
              //   key: 'dataAtendimento', 
              //   header: 'Hora',
              //   render: (item) => item.dataAtendimento ? new Date(item.dataAtendimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '-'
              // },
              { 
                key: 'status', 
                header: 'Status',
                render: (item) => (
                  <StatusBadge 
                    status={item.status === 'finalizado' ? 'Finalizado' : 'Em Andamento'} 
                    type={item.status === 'finalizado' ? 'success' : 'warning'} 
                  />
                )
              },
            ]}
          />
        </div>
    </div>
  );
};

export default Dashboard;



