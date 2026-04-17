import { NavLink, Outlet } from 'react-router';
import { ShieldAlert, Layers3, Building2 } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { useCurrentUser } from '@/lib/auth';

const NAV = [
  { to: '/admin/tiers', label: 'Tiers', icon: Layers3 },
  { to: '/admin/tenants', label: 'Tenants', icon: Building2 },
];

/**
 * Platform admin chrome — separate from the tenant Layout so it reads as a
 * different surface. Gated on `isSuperAdmin`; non-staff see a stop screen
 * rather than being redirected (keeps the URL visible for debugging).
 */
export function AdminLayout() {
  const user = useCurrentUser();

  if (!user.isSuperAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-8">
        <div className="max-w-md rounded-lg border border-red-900/40 bg-slate-900 p-8 text-center">
          <ShieldAlert className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <h1 className="text-xl font-semibold text-white">Platform admin only</h1>
          <p className="mt-2 text-sm text-slate-400">
            This console is restricted to MirrorWorks staff. If you believe you should have access, contact your platform administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-3">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-amber-400" />
          <div>
            <div className="text-sm font-semibold">MirrorWorks platform admin</div>
            <div className="text-xs text-slate-400">Staff-only · actions affect all tenants</div>
          </div>
        </div>
        <div className="text-xs text-slate-400">
          Signed in as <span className="text-slate-200">{user.displayName}</span>
        </div>
      </header>
      <div className="flex flex-1">
        <nav className="w-56 border-r border-slate-800 p-4">
          <ul className="space-y-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) => cn(
                    'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition',
                    isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800/60',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
