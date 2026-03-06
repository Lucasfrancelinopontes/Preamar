import { Home, Anchor, Ship, Fish, Users, LogOut, Waves } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Sidebar({ currentPage = 'inicio' }) {
  const router = useRouter();

  const menuItems = [
    { id: 'inicio', label: 'Dashboard', icon: Home, path: '/inicio' },
    { id: 'desembarque', label: 'Novo Desembarque', icon: Anchor, path: '/desembarque' },
    { id: 'meus-desembarques', label: 'Meus Desembarques', icon: Anchor, path: '/meus-desembarques' },
    { id: 'embarcacoes', label: 'Embarcações', icon: Ship, path: '/embarcacoes' },
    { id: 'especies', label: 'Espécies', icon: Fish, path: '/especies' },
    { id: 'usuarios', label: 'Usuários', icon: Users, path: '/usuarios' },
  ];

  const handleNavigate = (path) => {
    router.push(path);
  };

  const handleLogout = () => {
    // Implementar logout
    router.push('/login');
  };

  return (
    <div className="bg-[#0B3B60] text-white h-screen w-64 flex flex-col shadow-lg fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Waves className="w-8 h-8 text-[#00A896]" />
          <h1 className="text-white font-semibold">Preamar</h1>
        </div>
        <p className="text-sm text-white/70 mt-1">Gestão Pesqueira</p>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    isActive
                      ? 'bg-[#00A896] text-white'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left text-white/80 hover:bg-white/10 hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          <span>Sair</span>
        </button>
      </div>
    </div>
  );
}