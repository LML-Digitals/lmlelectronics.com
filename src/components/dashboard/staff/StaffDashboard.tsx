'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { getComprehensiveAnalytics } from '../analytics/services/analytics';
import { DateRange } from 'react-day-picker';
import {
  subDays,
  format,
  startOfDay,
  endOfDay,
  subMonths,
  subYears,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import {
  ArrowUpRight,
  ClipboardList,
  Users,
  Package,
  FileText,
  MessageSquare,
  DollarSign,
  Map,
  Settings,
  ChevronRight,
  BarChart3,
  PhoneCall,
  ShieldCheck,
  Clock,
  CreditCard,
  Wrench,
  Smartphone,
  Calendar,
  PlusCircle,
  Bell,
  CheckSquare,
  Megaphone,
  Plus,
  Search,
  AlertTriangle,
  Layers,
  UserPlus,
  BarChart,
  Tag,
  ShoppingCart,
  Truck,
  Printer,
  ArrowDownCircle,
  Flag,
  ListFilter,
  ExternalLink,
  Eye,
  CircleDashed,
  Activity,
  Target,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getDashboardData,
  getRecentSales,
  getRecentTickets,
  getLowStockItems,
  getSystemAnnouncements,
} from './services/dashboardActions';

import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { useSession } from 'next-auth/react';

// Types for our fetched data
type DashboardData = {
  totalRevenue: number;
  activeRepairs: number;
  repairCompletionRate: number;
  inventoryCount: number;
  lowStockCount: number;
  activeCustomers: number;
  newCustomers: number;
  repairDivisionPercent: number;
  serviceDivisionPercent: number;
  salesDivisionPercent: number;
  revenueChange: number;
  pendingTickets: number;
  activeTickets: number;
  openNotifications: number;
  bookingCount: number;
  bookingSchedule: number;
  quoteCount: number;
  inventoryValue: number;
};

type LowStockItem = {
  id: string;
  name: string;
  sku: string;
  stock: number;
  minThreshold: number;
  locationName: string;
};

type RecentSale = {
  id: string;
  date: string;
  customerName: string;
  total: number;
  paymentMethod: string;
  status: string;
  items?: string;
};

type RecentTicket = {
  id: string;
  code: string;
  customer: string;
  status: string;
  createdAt: string;
  service: string;
  deviceInfo: string;
  priority: boolean;
};

type Announcement = {
  id: number;
  title: string;
  message: string;
  date: string;
};

export default function StaffDashboard () {
  const [period, setPeriod] = useState<string>('monthly');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [recentSales, setRecentSales] = useState<RecentSale[]>([]);
  const [recentTickets, setRecentTickets] = useState<RecentTicket[]>([]);
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { data: session } = useSession();
  const user = session?.user;

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Get start and end dates based on period
        let startDate: Date;
        let endDate = new Date();

        if (period === 'custom' && dateRange.from) {
          startDate = dateRange.from;
          endDate = dateRange.to || endDate;
        } else {
          switch (period) {
          case 'weekly':
            startDate = subDays(endDate, 7);
            break;
          case 'monthly':
            startDate = startOfMonth(endDate);
            endDate = endOfMonth(endDate);
            break;
          case 'quarterly':
            startDate = subMonths(endDate, 3);
            break;
          case 'yearly':
            startDate = subYears(endDate, 1);
            break;
          default:
            startDate = startOfMonth(endDate);
            endDate = endOfMonth(endDate);
          }
        }

        // Fetch all required data
        const data = await getDashboardData(startDate, endDate);
        const sales = await getRecentSales();
        const tickets = await getRecentTickets();
        const stockItems = await getLowStockItems();
        const systemAnnouncements = await getSystemAnnouncements();

        setDashboardData(data);
        setRecentSales(sales);
        setRecentTickets(tickets);
        setLowStockItems(stockItems);
        setAnnouncements(systemAnnouncements);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [period, dateRange]);

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (range?.from) {
      setDateRange(range);
      setPeriod('custom');
    }
  };

  // Quick action buttons
  const quickActions = [
    {
      name: 'New Ticket',
      icon: <Wrench className="h-4 w-4" />,
      href: '/dashboard/tickets',
    },
    // {
    //   name: "New Sale",
    //   icon: <CreditCard className="h-4 w-4" />,
    //   href: "/dashboard/sales",
    // },
    {
      name: 'Add Customer',
      icon: <UserPlus className="h-4 w-4" />,
      href: '/dashboard/customers',
    },
    {
      name: 'Add Inventory',
      icon: <Package className="h-4 w-4" />,
      href: '/dashboard/inventory/items',
    },
    {
      name: 'New Order',
      icon: <FileText className="h-4 w-4" />,
      href: '/dashboard/orders',
    },
    {
      name: 'Clock In',
      icon: <Clock className="h-4 w-4" />,
      href: '/dashboard/workforce/my-workforce',
    },
  ];

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <CircleDashed className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
    case 'DONE':
      return 'default';
    case 'PENDING':
      return 'secondary';
    case 'INSPECTING':
      return 'outline';
    case 'REPAIRING':
      return 'destructive';
    default:
      return 'destructive';
    }
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header with Quick Actions and Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        {/* Quick Action Buttons */}
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.name}
              variant="outline"
              size="sm"
              className="text-xs flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => (window.location.href = action.href)}
            >
              <span className="h-4 w-4">{action.icon}</span>
              <span className="hidden sm:inline">{action.name}</span>
            </Button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
          {/* <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <NotesDashboardWidget currentUserId={user?.id ?? ""} />
          </div> */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Select
              value={period}
              onValueChange={setPeriod}
              defaultValue="monthly"
            >
              <SelectTrigger className="w-full sm:w-[200px] bg-background/50 backdrop-blur border-border/50">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly (Last 7 days)</SelectItem>
                <SelectItem value="monthly">Monthly (Last 30 days)</SelectItem>
                <SelectItem value="quarterly">
                  Quarterly (Last 90 days)
                </SelectItem>
                <SelectItem value="yearly">Yearly (Last 12 months)</SelectItem>
                <SelectItem value="custom">Custom (Select Dates)</SelectItem>
              </SelectContent>
            </Select>

            {period === 'custom' && (
              <DateRangePicker
                dateRange={dateRange}
                onDateRangeChange={handleDateRangeChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* KPI Cards & Business Overview - Takes 2 columns on XL screens */}
        <div className="space-y-8 xl:col-span-2">
          {/* Business Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Revenue
                </CardTitle>
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">
                  ${dashboardData?.totalRevenue.toFixed(2) || '0.00'}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className={`flex items-center gap-1 text-xs ${
                    dashboardData && dashboardData.revenueChange > 0
                      ? 'text-primary'
                      : 'text-destructive'
                  }`}>
                    {dashboardData && dashboardData.revenueChange > 0 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownCircle className="h-3 w-3" />
                    )}
                    {dashboardData && dashboardData.revenueChange > 0 ? '+' : ''}
                    {dashboardData?.revenueChange.toFixed(1) || 0}%
                  </div>
                  <span className="text-xs text-muted-foreground">from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Tickets
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted group-hover:bg-muted/80 transition-colors">
                  <Wrench className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">
                  {dashboardData?.activeTickets || 0}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Activity className="h-3 w-3" />
                    {dashboardData?.pendingTickets || 0} pending
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Inventory Value
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted group-hover:bg-muted/80 transition-colors">
                  <Package className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">
                  ${dashboardData?.inventoryValue.toFixed(2) || '0.00'}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Layers className="h-3 w-3" />
                    {dashboardData?.inventoryCount || 0} items
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Customers
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted group-hover:bg-muted/80 transition-colors">
                  <Users className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">
                  {dashboardData?.activeCustomers || 0}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <UserPlus className="h-3 w-3" />
                    {dashboardData?.newCustomers || 0} new this period
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Bookings
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted group-hover:bg-muted/80 transition-colors">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">
                  {dashboardData?.bookingCount || 0}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {dashboardData && dashboardData.bookingSchedule > 0 ? '+' : ''}
                    {dashboardData?.bookingSchedule || 0} scheduled
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Quotes
                </CardTitle>
                <div className="p-2 rounded-lg bg-muted group-hover:bg-muted/80 transition-colors">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl sm:text-3xl font-bold">
                  {dashboardData?.quoteCount || 0}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Target className="h-3 w-3" />
                    Active quotes
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Business Performance Breakdown */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Revenue Breakdown
              </CardTitle>
              <CardDescription>
                Performance across business divisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-6 bg-gradient-to-br from-muted to-muted/80 rounded-xl border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Wrench className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Repair Division
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {dashboardData?.repairDivisionPercent.toFixed(1) || 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    of total revenue
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-muted to-muted/80 rounded-xl border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Settings className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Service Division
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {dashboardData?.serviceDivisionPercent.toFixed(1) || 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    of total revenue
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-muted to-muted/80 rounded-xl border border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ShoppingCart className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Sales Division
                      </p>
                    </div>
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">
                    {dashboardData?.salesDivisionPercent.toFixed(1) || 0}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    of total revenue
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Low Stock Items - Third Column */}
        <div className="space-y-8">
          <Card className="h-full flex flex-col group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-destructive/10">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  </div>
                    Low Stock Items
                </CardTitle>
                <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive border-destructive/20">
                  {lowStockItems.length}
                </Badge>
              </div>
              <CardDescription>Items that need to be restocked</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow p-0">
              {lowStockItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border/50">
                        <TableHead className="text-muted-foreground">Item</TableHead>
                        <TableHead className="text-right text-muted-foreground">Stock</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lowStockItems.slice(0, 5).map((item) => (
                        <TableRow key={item.id} className="hover:bg-muted/30 transition-colors border-border/30">
                          <TableCell>
                            <div className="font-medium text-sm">
                              {item.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {item.sku}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              variant={
                                item.stock <= 2 ? 'destructive' : 'outline'
                              }
                              className={`ml-auto ${
                                item.stock <= 2
                                  ? 'bg-destructive/10 text-destructive border-destructive/20'
                                  : 'bg-muted text-muted-foreground border-border'
                              }`}
                            >
                              {item.stock} left
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="p-3 rounded-full bg-muted/50 w-fit mx-auto mb-3">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No low stock items detected
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    All inventory levels are healthy
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="border-t border-border/50 pt-4">
              <Button
                variant="outline"
                size="sm"
                className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20 transition-all duration-200"
                onClick={() => (window.location.href = '/dashboard/inventory')}
              >
                <Truck className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">
                  View All Low Stock Items
                </span>
                <span className="sm:hidden">View All</span>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Tickets */}
        <Card className="h-full flex flex-col group hover:shadow-lg transition-all duration-300 border-border/50 bg-card/50 backdrop-blur">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-muted">
                    <ClipboardList className="h-5 w-5 text-muted-foreground" />
                  </div>
                    Recent Tickets
                </CardTitle>
                <Badge variant="outline" className="text-xs bg-muted text-muted-foreground border-border">
                  {recentTickets.length}
                </Badge>
              </div>
            </div>
            <CardDescription>Latest repair tickets</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50">
                    <TableHead className="text-muted-foreground">Ticket</TableHead>
                    <TableHead className="hidden sm:table-cell text-muted-foreground">Customer</TableHead>
                    <TableHead className="hidden md:table-cell text-muted-foreground">Device</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTickets.length > 0 ? (
                    recentTickets.slice(0, 5).map((ticket) => (
                      <TableRow
                        key={ticket.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => (window.location.href = `/dashboard/tickets/${ticket.id}`)
                        }
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="font-medium text-sm">{ticket.code}</div>
                            <div className="text-xs text-muted-foreground sm:hidden">
                              {ticket.customer}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {ticket.customer.split(' ').length > 1 ? (
                            <>
                              <div className="font-medium text-sm">
                                {ticket.customer.split(' ')[0]}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {ticket.customer.split(' ').slice(1).join(' ')}
                              </div>
                            </>
                          ) : (
                            <div className="font-medium text-sm">{ticket.customer}</div>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm">{ticket.deviceInfo}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(ticket.status)} className="text-xs">
                            {ticket.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <ClipboardList className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm">No recent tickets found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => (window.location.href = '/dashboard/tickets')}
            >
              <span className="hidden sm:inline">View All Tickets</span>
              <span className="sm:hidden">View All</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>

        {/* Recent Sales */}
        <Card className="h-full flex flex-col hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  Recent Sales
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {recentSales.length}
                </Badge>
              </div>
            </div>
            <CardDescription>Latest sales transactions</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="hidden sm:table-cell">Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Item</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.length > 0 ? (
                    recentSales.slice(0, 5).map((sale) => (
                      <TableRow
                        key={sale.id}
                        className="hover:bg-muted/50 cursor-pointer"
                        onClick={() => (window.location.href = `/dashboard/pos/sale/${sale.id}`)
                        }
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <div className="text-sm font-medium">{sale.date}</div>
                            <div className="text-xs text-muted-foreground sm:hidden">
                              {sale.customerName}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {sale.customerName.split(' ').length > 1 ? (
                            <>
                              <div className="font-medium text-sm">
                                {sale.customerName.split(' ')[0]}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {sale.customerName.split(' ').slice(1).join(' ')}
                              </div>
                            </>
                          ) : (
                            <div className="font-medium text-sm">{sale.customerName}</div>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm text-muted-foreground">
                            {sale.items || '—'}
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${sale.total.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        <DollarSign className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm">No recent sales found</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => (window.location.href = '/dashboard/reports/sales')
              }
            >
              <span className="hidden sm:inline">View Sales Report</span>
              <span className="sm:hidden">View Report</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Bank Balance Overview */}
      {/* <Card className="hover:shadow-md transition-all">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div className="flex items-center gap-2">
              <CardTitle className="flex items-center gap-2">
                <span className="inline-block bg-muted text-primary rounded-full px-2 py-1 text-base">🏦</span>
                Bank Balance Overview
              </CardTitle>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => (window.location.href = "/dashboard/accounting/balance")}
            >
              <span className="hidden sm:inline">View Full Details</span>
              <span className="sm:hidden">Details</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <CardDescription>Current balances for all connected bank accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <BankAccountsOverview showFetchButton={false} />
        </CardContent>
      </Card> */}

      {/* System Announcements */}
      {announcements.length > 0 && (
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-orange-500" />
                  System Announcements
                </CardTitle>
                <Badge variant="secondary" className="text-xs">
                  {announcements.length}
                </Badge>
              </div>
            </div>
            <CardDescription>Latest updates and notices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.slice(0, 5).map((announcement) => (
                <div key={announcement.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                  <div className="flex items-start gap-2 mb-1">
                    <Megaphone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                        <p className="font-medium text-sm">{announcement.title}</p>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {announcement.date}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {announcement.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="border-t pt-3">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => (window.location.href = '/dashboard/announcements')
              }
            >
              <span className="hidden sm:inline">View All Announcements</span>
              <span className="sm:hidden">View All</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
