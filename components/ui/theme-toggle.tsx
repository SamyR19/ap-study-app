'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Switch } from '@/components/ui/switch';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  const handleToggle = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-3">
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Sun className="w-4 h-4 text-muted-foreground" />
        )}
        <span>Dark mode</span>
      </div>
      <Switch
        checked={resolvedTheme === 'dark'}
        onCheckedChange={handleToggle}
        aria-label="Toggle dark mode"
      />
    </div>
  );
}
