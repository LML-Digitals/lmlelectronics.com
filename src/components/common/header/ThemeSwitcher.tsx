'use client';

import { useTheme } from 'next-themes';

import { MoonIcon, SunIcon } from '@radix-ui/react-icons';

export function ThemeSwitcher () {
  const { setTheme, theme } = useTheme();

  return (
    <div>
      {theme === 'light' ? (
        <SunIcon onClick={() => setTheme('dark')} className="cursor-pointer" />
      ) : (
        <MoonIcon
          onClick={() => setTheme('light')}
          className="cursor-pointer"
        />
      )}
    </div>
  );
}
