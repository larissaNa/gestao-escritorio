import { useLocation, Link, useNavigate } from 'react-router-dom';
import {LayoutDashboard,Users,Clock,Search,UserCog,FileText,UserPlus,FileBarChart,Table,Gift,ArrowUpDown,Gavel,LogOut,X,Menu,Landmark,DollarSign,} from 'lucide-react';
import {Sidebar,SidebarContent,SidebarFooter,SidebarGroup,SidebarGroupContent,SidebarHeader,SidebarMenu,SidebarMenuButton,SidebarMenuItem,SidebarProvider,SidebarSeparator,useSidebar,} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface MenuItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  adminOnly?: boolean;
}

const menuItems: MenuItem[] = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/atendimentos', icon: Users, label: 'Atendimentos' },
  { path: '/admin-colaboradores', icon: UserCog, label: 'Admin Colaboradores', adminOnly: true },
  { path: '/formulario', icon: FileText, label: 'Formulário' },
  // { path: '/pre-cadastro', icon: UserPlus, label: 'Pré-cadastro' },
  { path: '/relatorio', icon: FileBarChart, label: 'Relatório' },
  { path: '/servicos', icon: Table, label: 'Tabela Serviços' },
  { path: '/beneficios', icon: Gift, label: 'Cadastrar Benefícios' },
  { path: '/acoes-advogados', icon: ArrowUpDown, label: 'Ações Advogados' },
  { path: '/processos-advogados', icon: Gavel, label: 'Processos/Advogados' },
  { path: '/financeiro', icon: DollarSign, label: 'Financeiro', adminOnly: true },
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
  const { isAdmin } = useAuth();
  const isCollapsed = state === 'collapsed';

  const filteredItems = menuItems.filter(
    (item) => !item.adminOnly || isAdmin
  );

  return (
    <SidebarMenu>
      {filteredItems.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;

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
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
};
