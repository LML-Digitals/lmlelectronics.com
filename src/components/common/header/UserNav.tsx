'use client';
import { useSession } from 'next-auth/react';
import { LogoutButton } from '../auth/auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { Badge } from '../../ui/badge';
import { 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Crown,
  Building2,
  Sparkles 
} from 'lucide-react';

export function UserNav() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  const userName = session?.user?.name || 'User';
  const userInitial = userName.charAt(0).toUpperCase();
  const userType = session?.user?.userType || 'user';

  const getUserTypeIcon = () => {
    switch (userType) {
      case 'user':
        return <Crown className="h-3 w-3 text-amber-500" />;
      case 'staff':
        return <Shield className="h-3 w-3 text-blue-500" />;
      case 'customer':
        return <User className="h-3 w-3 text-green-500" />;
      default:
        return <User className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getUserTypeLabel = () => {
    switch (userType) {
      case 'user':
        return 'Administrator';
      case 'staff':
        return 'Staff Member';
      case 'customer':
        return 'Customer';
      default:
        return 'User';
    }
  };

  const getUserTypeColor = () => {
    switch (userType) {
      case 'user':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/30';
      case 'staff':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800/30';
      case 'customer':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-muted/60 transition-colors duration-200 group">
          <Avatar className="h-8 w-8 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-200">
            <AvatarImage
              src={session?.user?.profileImage || ''}
              alt={session?.user?.name || ''}
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-semibold border border-primary/20">
              {userInitial}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start">
            <span className="text-sm font-medium text-foreground line-clamp-1">
              {loading ? 'Loading...' : session?.user?.name || 'User'}
            </span>
            <div className="flex items-center gap-1">
              {getUserTypeIcon()}
              <span className="text-xs text-muted-foreground">
                {getUserTypeLabel()}
              </span>
            </div>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-64 p-2 shadow-xl border-0 bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/95" 
        align="end"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={session?.user?.profileImage || ''}
                alt={session?.user?.name || ''}
              />
              <AvatarFallback className="bg-gradient-to-br from-primary/10 to-primary/20 text-primary font-semibold">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-semibold leading-none">
                {loading ? 'Loading...' : session?.user?.name || 'User'}
              </p>
              <p className="text-xs text-muted-foreground leading-none">
                {loading ? 'Loading...' : session?.user?.email || '...'}
              </p>
              <Badge 
                variant="outline" 
                className={`mt-1 w-fit text-xs px-2 py-0.5 ${getUserTypeColor()}`}
              >
                <div className="flex items-center gap-1">
                  {getUserTypeIcon()}
                  {getUserTypeLabel()}
                </div>
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-muted/60 transition-colors duration-200">
          <Link
            href={`/dashboard/${session?.user?.userType || 'customer'}/profile`}
            className="flex items-center gap-3 w-full"
          >
            <div className="p-1.5 rounded-md bg-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">My Profile</span>
              <span className="text-xs text-muted-foreground">View and edit your profile</span>
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer p-3 rounded-lg hover:bg-muted/60 transition-colors duration-200">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 w-full"
          >
            <div className="p-1.5 rounded-md bg-blue-500/10">
              <Settings className="h-4 w-4 text-blue-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Settings</span>
              <span className="text-xs text-muted-foreground">Manage your preferences</span>
            </div>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem className="cursor-pointer p-3 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors duration-200">
          <div className="flex items-center gap-3 w-full">
            <div className="p-1.5 rounded-md bg-destructive/10">
              <LogOut className="h-4 w-4 text-destructive" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">Sign Out</span>
              <span className="text-xs text-muted-foreground">Log out of your account</span>
            </div>
          </div>
          <LogoutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
