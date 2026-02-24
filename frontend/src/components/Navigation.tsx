import { Link, useLocation } from '@tanstack/react-router';
import { Home, User } from 'lucide-react';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useActor } from '../hooks/useActor';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const location = useLocation();
  const { currentUser } = useCurrentUser();
  const { actor } = useActor();
  const [principalStr, setPrincipalStr] = useState<string | null>(null);

  useEffect(() => {
    if (!actor) return;
    const fetchPrincipal = async () => {
      try {
        const agent = (actor as any)._agent;
        if (agent) {
          const principal = await agent.getPrincipal();
          setPrincipalStr(principal.toString());
        }
      } catch {
        // ignore
      }
    };
    fetchPrincipal();
  }, [actor]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 w-full bg-nav border-b border-nav-border shadow-nav">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/feed" className="flex items-center gap-2 group">
          <img
            src="/assets/generated/banana-logo.dim_256x256.png"
            alt="Banana Social"
            className="w-9 h-9 object-contain group-hover:scale-110 transition-transform duration-200"
          />
          <span className="font-display font-extrabold text-xl text-banana-dark tracking-tight hidden sm:block">
            BananaSocial
          </span>
        </Link>

        {/* Nav Links */}
        <nav className="flex items-center gap-1">
          <Link
            to="/feed"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
              isActive('/feed')
                ? 'bg-banana text-banana-dark shadow-sm'
                : 'text-muted-foreground hover:bg-banana/30 hover:text-banana-dark'
            }`}
          >
            <Home size={16} />
            <span className="hidden sm:inline">Feed</span>
          </Link>

          {principalStr && (
            <Link
              to="/profile/$userId"
              params={{ userId: principalStr }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive('/profile')
                  ? 'bg-banana text-banana-dark shadow-sm'
                  : 'text-muted-foreground hover:bg-banana/30 hover:text-banana-dark'
              }`}
            >
              <User size={16} />
              <span className="hidden sm:inline">
                {currentUser ? currentUser.avatarEmoji : 'Profile'}
              </span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
