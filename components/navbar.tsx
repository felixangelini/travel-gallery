import Link from 'next/link';
import { AuthButton } from './auth/auth-button';
import { EnvVarWarning } from './env-var-warning';
import { hasEnvVars } from '@/lib/utils';
import { NextLogo } from './next-logo';
import { ReactNode } from 'react';
import { ThemeSwitcher } from './theme-switcher';

interface NavbarProps {
  leftComponents?: ReactNode;
  rightComponents?: ReactNode;
}

export function Navbar({ leftComponents, rightComponents }: NavbarProps) {
  return (
    <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
      <div className="w-full flex justify-between items-center p-3 px-5 text-sm">
        <div className="flex gap-5 items-center font-semibold">
          <Link href={"/"}><NextLogo /></Link>
          {leftComponents}
        </div>
        <div className="flex gap-2 items-center">
          {rightComponents}
          {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
} 