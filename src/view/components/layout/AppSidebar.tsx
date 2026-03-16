import { useLocation, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCog,
  FileText,
  FileBarChart,
  Table,
  Gift,
  ArrowUpDown,
  Gavel,
  LogOut,
  X,
  Menu,
  Landmark,
  DollarSign,
  ChevronRight,
  Briefcase,
  Award,
  UserPlus,
  FileDown,
  ListChecks,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  useSidebar,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/view/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/view/components/ui/collapsible"
import { Button } from '@/view/components/ui/button';
import { Badge } from '@/view/components/ui/badge';
import { Avatar, AvatarFallback } from '@/view/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface SubMenuItem {
  path: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  adminOnly?: boolean;
}

interface MenuItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  adminOnly?: boolean;
  items?: SubMenuItem[];
}

const menuItems: MenuItem[] = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/atendimentos', icon: Users, label: 'Atendimentos' },
  { path: '/admin-colaboradores', icon: UserCog, label: 'Admin Colaboradores', adminOnly: true },
  { path: '/admin-listas', icon: ListChecks, label: 'Configurações Admin', adminOnly: true },
  { path: '/formulario', icon: FileText, label: 'Formulário' },
  // { path: '/pre-cadastro', icon: UserPlus, label: 'Pré-cadastro' },
  { path: '/relatorio', icon: FileBarChart, label: 'Relatório' },
  { path: '/relatorio/mensal', icon: FileBarChart, label: 'Relatório Mensal', adminOnly: true },
  { path: '/servicos', icon: Table, label: 'Tabela Serviços' },
  {
    path: '#',
    icon: Briefcase,
    label: 'Cadastro',
    items: [
      { path: '/beneficios', label: 'Benefícios', icon: Gift },
      { path: '/beneficios/exportar', label: 'Exportar Benefícios', icon: FileDown },
      { path: '/concessoes', label: 'Concessões', icon: Award },
      { path: '/concessoes/exportar', label: 'Exportar Concessões', icon: FileDown },
    ]
  },
  { path: '/acoes-advogados', icon: ArrowUpDown, label: 'Ações Advogados' },
  { path: '/processos-advogados', icon: Gavel, label: 'Processos/Advogados' },
  { 
    path: '#', 
    icon: DollarSign, 
    label: 'Financeiro',
    items: [
      { path: '/financeiro/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { path: '/financeiro', label: 'Lançamentos', icon: DollarSign },
      { path: '/financeiro/fluxo-caixa', label: 'Fluxo de Caixa', icon: FileBarChart },
    ]
  },
  { path: '/idas-banco', icon: Landmark, label: 'Idas ao Banco' },
];

const SidebarLogo = () => {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  return (
    <div className="flex items-center gap-3 px-2">
      <img 
        src="/images/logotipo.png" 
        alt="Logo" 
        className="h-10 w-auto object-contain"
      />
      {!isCollapsed && (
        <span className="font-bold text-lg text-sidebar-foreground">Escritório Dr. Phortus Leoardo</span>
      )}
    </div>
  );
};

const SidebarUserInfo = () => {
  const { state } = useSidebar();
  const { user, colaboradorName, isAdmin } = useAuth();
  const isCollapsed = state === 'collapsed';

  if (isCollapsed) return null;

  const displayName = colaboradorName || user?.displayName || user?.email || 'Usuário';
  const displayEmail = user?.email || '';

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="px-2 py-4">
      <Link 
        to="/perfil" 
        className="flex items-center gap-3 hover:bg-sidebar-accent rounded-md p-2 transition-colors group"
        title="Ver meu perfil"
      >
        <Avatar className="h-12 w-12 border-2 border-primary group-hover:border-primary/80 transition-colors">
          <AvatarFallback className="bg-primary text-primary-foreground font-semibold group-hover:bg-primary/90">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0 text-left">
          <span className="font-bold text-sm truncate group-hover:text-primary transition-colors">{displayName}</span>
          <span className="text-xs text-muted-foreground truncate" title={displayEmail}>
            {displayEmail}
          </span>
          {isAdmin && (
            <Badge className="mt-1 w-fit bg-green-500 text-white text-[10px] px-2 py-0 hover:bg-green-600">
              Admin
            </Badge>
          )}
        </div>
      </Link>
    </div>
  );
};

const SidebarNavigation = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const { isAdmin, canAccessPath } = useAuth();
  const isCollapsed = state === 'collapsed';

  const filteredItems = menuItems
    .map((item) => {
      if (item.items && item.items.length > 0) {
        const items = item.items.filter((subItem) => (!subItem.adminOnly || isAdmin) && canAccessPath(subItem.path));
        return { ...item, items };
      }
      return item;
    })
    .filter((item) => {
      if (item.adminOnly && !isAdmin) return false;
      if (item.items && item.items.length > 0) return item.items.length > 0;
      return canAccessPath(item.path);
    });

  const items = filteredItems
    .filter((item) => item.path !== '/relatorio' && item.path !== '/relatorio/mensal');

  const insertionIndex = items.findIndex((i) => i.path === '/formulario');
  const insertPos = insertionIndex >= 0 ? insertionIndex + 1 : items.length;

  if (canAccessPath('/relatorio')) {
    if (isAdmin) {
      items.splice(insertPos, 0, {
        path: '#',
        icon: FileBarChart,
        label: 'Relatórios',
        items: [
          { path: '/relatorio', label: 'Lista de Relatórios' },
          { path: '/relatorio/mensal', label: 'Relatórios Mensais', adminOnly: true },
        ],
      });
    } else {
      items.splice(insertPos, 0, {
        path: '/relatorio',
        icon: FileBarChart,
        label: 'Relatórios',
      });
    }
  }

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

        if (item.items && item.items.length > 0) {
          const isChildActive = item.items.some(subItem => location.pathname === subItem.path);
          
          return (
            <Collapsible
              key={item.label}
              asChild
              defaultOpen={isChildActive}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip={item.label}>
                    <Icon className="w-5 h-5 shrink-0" />
                    <span>{item.label}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const isSubActive = location.pathname === subItem.path;
                      const SubIcon = subItem.icon;
                      
                      if (subItem.adminOnly && !isAdmin) return null;

                      return (
                        <SidebarMenuSubItem key={subItem.path}>
                          <SidebarMenuSubButton asChild isActive={isSubActive}>
                            <Link to={subItem.path}>
                              {SubIcon && <SubIcon className="w-4 h-4 mr-2" />}
                              <span>{subItem.label}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        }

        return (
          <SidebarMenuItem key={item.path}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              tooltip={isCollapsed ? item.label : undefined}
            >
              <Link to={item.path} className="flex items-center gap-3">
                <Icon className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
};

const SidebarLogoutButton = () => {
  const { state } = useSidebar();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const isCollapsed = state === 'collapsed';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleLogout}
      className={cn(
        'w-full justify-start gap-3 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10',
        isCollapsed && 'justify-center px-2'
      )}
    >
      <LogOut className="w-5 h-5 shrink-0" />
      {!isCollapsed && <span>Sair</span>}
    </Button>
  );
};

const MobileTrigger = () => {
  const { openMobile, setOpenMobile, isMobile } = useSidebar();

  if (!isMobile) return null;

  return (
    <Button
      variant="outline"
      size="icon"
      className="fixed top-4 left-4 z-50 md:hidden"
      onClick={() => setOpenMobile(!openMobile)}
    >
      {openMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
    </Button>
  );
};

const CloseTrigger = () => {
  const { setOpenMobile, isMobile, state, toggleSidebar } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 text-sidebar-foreground/70 hover:text-sidebar-foreground"
      onClick={() => (isMobile ? setOpenMobile(false) : toggleSidebar())}
    >
      <X className="w-4 h-4" />
    </Button>
  );
};

export const AppSidebar = () => {
  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <SidebarLogo />
          <CloseTrigger />
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarUserInfo />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarNavigation />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <SidebarLogoutButton />
      </SidebarFooter>
    </Sidebar>
  );
};

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <MobileTrigger />
        <main className="flex-1 overflow-auto">
          <div className="container py-6 px-4 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};
