import { authOptions } from '@/lib/config/authOptions';
import { Session, getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import StaffDashboard from '@/components/dashboard/staff/StaffDashboard';
import {
  BarChart3,
  TrendingUp,
  Activity,
  Sparkles,
  Clock,
  Calendar,
  Users,
  Package,
  Wrench,
  DollarSign,
  Target,
  Award,
} from 'lucide-react';

export default async function Dashboard () {
  const staffInSession: Session | null = await getServerSession(authOptions);

  if (!staffInSession) {
    redirect('/');

    return;
  }
  const user = staffInSession.user;

  // Get current time for greeting
  const currentHour = new Date().getHours();
  const getGreeting = () => {
    if (currentHour < 12) { return 'Good morning'; }
    if (currentHour < 17) { return 'Good afternoon'; }

    return 'Good evening';
  };

  // Get current date for display
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:60px_60px]" />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-primary/5" />

        <div className="relative px-4 sm:px-6 lg:px-8 pt-6 pb-8">
          {/* Welcome Section */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <BarChart3 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    {getGreeting()},{' '}
                    {user.name?.split(' ')[0]
                      || user.email?.split('@')[0]
                      || 'User'}
                  </h1>
                  <p className="text-sm sm:text-base text-muted-foreground flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {currentDate}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Stats Preview */}
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
                  <Activity className="h-3 w-3 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    System Active
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border">
                  <TrendingUp className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">
                    +12% Growth
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Quick Actions:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                <Wrench className="h-3 w-3" />
                New Ticket
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                <Users className="h-3 w-3" />
                Add Customer
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                <Package className="h-3 w-3" />
                Add Inventory
              </button>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
                <DollarSign className="h-3 w-3" />
                New Sale
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="space-y-6">
          <StaffDashboard />
        </div>
      </div>
    </div>
  );
}
