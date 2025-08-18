'use client';

import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Badge } from '@/components/ui/badge';

// Colors for the charts
const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
];

// Helper function to capitalize first letter of each word
const capitalizeWords = (str: string) => {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// TypeScript interfaces for analytics data
interface RoleDistribution {
  role: string;
  _count: {
    role: number;
  };
}

interface PaymentTypeDistribution {
  paymentType: string;
  _count: {
    paymentType: number;
  };
}

interface AvailabilityDistribution {
  availability: string;
  _count: number;
}

interface PerformanceMetric {
  id: string;
  name: string;
  ticketsHandled: number;
  ticketsCompleted: number;
  avgResolutionTime: string;
  comments: number;
}

interface SalaryMetric {
  id: string;
  name: string;
  paymentType: string;
  baseSalary: number;
  commissionRate: number;
  recentEarnings: number;
  recentCommission: number;
  recentPayrollCount: number;
}

interface ActivityData {
  name: string;
  lastActive: string;
  activeTickets: number;
}

interface ExperienceMetric {
  name: string;
  experienceYears: number;
  notesCount: number;
}

interface StaffAnalyticsData {
  totalStaff: number;
  roleDistribution: RoleDistribution[];
  paymentTypeDistribution: PaymentTypeDistribution[];
  availabilityDistribution: AvailabilityDistribution[];
  performanceMetrics: PerformanceMetric[];
  salaryMetrics: SalaryMetric[];
  activeSessions: number;
  documentationCoverage: string;
  averageResponseTime: string;
  activityTimeline?: ActivityData[];
  experienceMetrics?: ExperienceMetric[];
}

interface ChartDataItem {
  name: string;
  value: number;
}

export default function StaffAnalytics ({
  analytics,
}: {
  analytics: StaffAnalyticsData;
}) {
  // Format data for pie chart
  const roleData: ChartDataItem[] = analytics.roleDistribution.map((item) => ({
    name: capitalizeWords(item.role),
    value: item._count.role,
  }));

  // Format data for bar chart
  const performanceData = analytics.performanceMetrics.map((staff) => ({
    name: staff.name,
    tickets: staff.ticketsHandled,
    comments: staff.comments,
  }));

  // Format data for availability chart
  const availabilityData: ChartDataItem[]
    = analytics.availabilityDistribution?.map((item) => ({
      name: capitalizeWords(item.availability || ''),
      value: item._count || 0,
    })) || [
      { name: 'Full-time', value: 0 },
      { name: 'Part-time', value: 0 },
      { name: 'Contract', value: 0 },
    ];

  // Format data for activity timeline
  const activityData
    = analytics.activityTimeline?.map((staff) => ({
      name: staff.name,
      lastActive: staff.lastActive,
      activeTickets: staff.activeTickets,
    })) || [];

  // Format data for experience distribution
  const experienceData
    = analytics.experienceMetrics?.map((staff) => ({
      name: staff.name,
      experience: staff.experienceYears,
      notesCreated: staff.notesCount,
    })) || [];

  // Format data for payment type distribution
  const paymentTypeData: ChartDataItem[]
    = analytics.paymentTypeDistribution?.map((item) => ({
      name: capitalizeWords(item.paymentType || ''),
      value: item._count.paymentType || 0,
    })) || [];

  // Filter commission data for commission performance chart
  const commissionData = analytics.salaryMetrics
    .filter((staff) => staff.paymentType === 'COMMISSION' && staff.recentCommission > 0)
    .map((staff) => ({
      name: staff.name,
      recentCommission: staff.recentCommission,
      recentEarnings: staff.recentEarnings,
    }));

  // Calculate total tickets and comments for summary cards
  const totalTickets = analytics.performanceMetrics.reduce(
    (acc, curr) => acc + curr.ticketsHandled,
    0,
  );

  const totalComments = analytics.performanceMetrics.reduce(
    (acc, curr) => acc + curr.comments,
    0,
  );

  // Calculate average ticket completion rate
  const avgCompletionRate
    = analytics.performanceMetrics.length > 0
      ? (analytics.performanceMetrics.reduce(
        (acc, curr) => acc + curr.ticketsCompleted / (curr.ticketsHandled || 1),
        0,
      )
          / analytics.performanceMetrics.length)
        * 100
      : 0;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Staff Overview</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Active Staff
          </h3>
          <p className="text-2xl font-bold">{analytics.totalStaff}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Tickets Handled
          </h3>
          <p className="text-2xl font-bold">{totalTickets}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Total Ticket Comments
          </h3>
          <p className="text-2xl font-bold">{totalComments}</p>
        </Card>
      </div>

      {/* Additional Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Average Response Time
          </h3>
          <p className="text-2xl font-bold">{analytics.averageResponseTime}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Active Sessions Today
          </h3>
          <p className="text-2xl font-bold">{analytics.activeSessions}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">
            Avg Ticket Completion Rate
          </h3>
          <p className="text-2xl font-bold">{avgCompletionRate.toFixed(1)}%</p>
        </Card>
      </div>

      {/* Role Distribution with Pie Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">
            Staff Role Distribution
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Staff Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Staff Performance Bar Chart */}
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Staff Performance</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tickets" fill="#0088FE" name="Tickets Handled" />
                <Bar dataKey="comments" fill="#00C49F" name="Comments Made" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Staff Availability and Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Staff Availability</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={availabilityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {availabilityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [value, 'Staff Count']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">
            Experience & Documentation
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={experienceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="experience"
                  fill="#8884d8"
                  name="Years Experience"
                />
                <Bar
                  dataKey="notesCreated"
                  fill="#82ca9d"
                  name="Notes Created"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Payment Type Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">
            Payment Type Distribution
          </h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentTypeData.map((entry, index) => (
                    <Cell
                      key={`payment-cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Staff Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Commission Performance</h2>
          <div className="h-[300px]">
            {commissionData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={commissionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => {
                      // Using type assertion to handle ReCharts ValueType
                      return [`$${(value).toFixed(2)}`, 'Amount'];
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="recentCommission"
                    fill="#8884d8"
                    name="Recent Commission"
                  />
                  <Bar
                    dataKey="recentEarnings"
                    fill="#82ca9d"
                    name="Recent Earnings"
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No commission data available
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Staff Salary Table */}
      <Card className="p-4 mt-4">
        <h2 className="text-xl font-semibold mb-4">Staff Compensation</h2>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>Base Rate/Salary</TableHead>
                <TableHead>Commission Rate</TableHead>
                <TableHead>Recent Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.salaryMetrics.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{staff.paymentType}</Badge>
                  </TableCell>
                  <TableCell>${staff.baseSalary.toFixed(2)}</TableCell>
                  <TableCell>
                    {staff.paymentType === 'COMMISSION'
                      ? `${staff.commissionRate}%`
                      : 'N/A'}
                  </TableCell>
                  <TableCell>${staff.recentEarnings.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Staff Activity Timeline */}
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Recent Staff Activity</h2>
        {activityData.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Active Tickets</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activityData.map((staff) => (
                <TableRow key={staff.name}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>{staff.lastActive}</TableCell>
                  <TableCell>{staff.activeTickets}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        new Date(staff.lastActive)
                        > new Date(Date.now() - 24 * 60 * 60 * 1000)
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {new Date(staff.lastActive)
                      > new Date(Date.now() - 24 * 60 * 60 * 1000)
                        ? 'Active Today'
                        : 'Inactive'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No activity data available
          </div>
        )}
      </Card>

      {/* Detailed Tables */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Performance Metrics</h2>
        <Card className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Tickets Handled</TableHead>
                <TableHead>Tickets Completed</TableHead>
                <TableHead>Avg Resolution Time</TableHead>
                <TableHead>Comments Made</TableHead>
                <TableHead>Efficiency Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analytics.performanceMetrics.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">{staff.name}</TableCell>
                  <TableCell>{staff.ticketsHandled}</TableCell>
                  <TableCell>{staff.ticketsCompleted}</TableCell>
                  <TableCell>{staff.avgResolutionTime} hrs</TableCell>
                  <TableCell>{staff.comments}</TableCell>
                  <TableCell>
                    {staff.ticketsHandled > 0
                      ? `${(
                        (staff.comments / staff.ticketsHandled)
                          * 100
                      ).toFixed(1)}%`
                      : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
