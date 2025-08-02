'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, CalendarDays, DollarSign, Star, Ticket, CircleDashed } from 'lucide-react';
import { Staff, CommissionRate, Session, Ticket as PrismaTicket } from '@prisma/client';
import { getStaff, getStaffById } from '@/components/dashboard/staff/services/staffCrud';
import { getStaffReviews } from '@/app/dashboard/staff/profile/reviews/services/staffReviewActions';
import { format, subMonths } from 'date-fns';
import EditProfile from './EditProfile';

type StaffWithCommissionRate = Staff & {
  commissionRate?: CommissionRate | null;
  tickets?: PrismaTicket[];
  sessions?: Session[];
};

type StaffProfileTabsProps = {
  staff: StaffWithCommissionRate | null;
  isAdmin: boolean;
};

export default function StaffProfileTabs({ staff, isAdmin }: StaffProfileTabsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState('overview');
  const [reviews, setReviews] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Function to get commission rate safely
  const getCommissionRate = () => {
    if (!staff) return 'N/A';
    if (staff.commissionRate) {
      return `${staff.commissionRate.repairPercentage}%`;
    }
    return 'N/A';
  };

  // Fetch reviews and metrics when staff data is available
  useEffect(() => {
    const fetchData = async () => {
      if (!staff?.id) return;
      
      setLoading(true);
      try {
        // Fetch reviews
        const reviewsData = await getStaffReviews(staff.id);
        setReviews(reviewsData as any[]);

        // Calculate performance metrics
        if (staff.tickets && staff.sessions) {
          const completedTickets = staff.tickets.filter(ticket => ticket.status === 'DONE');
          const avgResolutionTime = completedTickets.length > 0
            ? completedTickets.reduce((sum, ticket) => {
                const resolutionTime = ticket.completionDate
                  ? new Date(ticket.completionDate).getTime() - new Date(ticket.createdAt).getTime()
                  : 0;
                return sum + resolutionTime;
              }, 0) / (completedTickets.length * 3600000)
            : 0;

          const last30Days = subMonths(new Date(), 1);
          const recentSessions = staff.sessions.filter(s => new Date(s.loginTime) >= last30Days);

          setMetrics({
            totalTickets: staff.tickets.length,
            completedTickets: completedTickets.length,
            avgResolutionTime,
            recentSessionsCount: recentSessions.length,
            totalReviews: reviewsData.length,
            averageRating: reviewsData.length > 0 
              ? reviewsData.reduce((sum: number, review: any) => sum + review.rating, 0) / reviewsData.length 
              : 0
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [staff]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500';
      case 'INSPECTING': return 'bg-blue-500';
      case 'REPAIRING': return 'bg-purple-500';
      case 'DONE': return 'bg-green-500';
      case 'CANCELLED': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating
            ? 'fill-yellow-400 text-yellow-400'
            : 'fill-gray-200 text-gray-200'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <CircleDashed className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} />
                Back
              </Button>
            )}
            <h1 className="text-3xl font-bold">
              {isAdmin ? 'Staff Profile' : 'My Profile'}
            </h1>
          </div>
          {/* Edit Profile Button (show for profile owner or admin) */}
          {(isAdmin || (session?.user?.id && session.user.id === staff?.id)) && staff && (
            <EditProfile Staff={staff} />
          )}
        </div>

        {/* Profile Overview Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Profile Image */}
              {staff?.profileImage ? (
                <img
                  src={staff.profileImage}
                  alt="Profile Picture"
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-white flex items-center justify-center text-4xl font-bold text-black shadow-lg">
                  {staff?.firstName?.charAt(0).toUpperCase()}
                </div>
              )}

              {/* Profile Info */}
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-2xl font-bold mb-1">
                  {staff?.firstName} {staff?.lastName}
                </h2>
                <p className="text-lg text-gray-600 font-medium mb-1">
                  {staff?.role ? staff.role.charAt(0).toUpperCase() + staff.role.slice(1) : ''}
                </p>
                <p className="text-sm text-gray-500 mb-4">{staff?.jobTitle}</p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{metrics?.totalTickets || 0}</p>
                    <p className="text-sm text-gray-500">Total Tickets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{metrics?.completedTickets || 0}</p>
                    <p className="text-sm text-gray-500">Completed</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{metrics?.totalReviews || 0}</p>
                    <p className="text-sm text-gray-500">Reviews</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">
                      {metrics?.averageRating ? metrics.averageRating.toFixed(1) : '0.0'}
                    </p>
                    <p className="text-sm text-gray-500">Avg Rating</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Reviews
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{staff?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{staff?.phone || 'N/A'}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Employment Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Employment Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Job Title</p>
                    <p className="font-medium">{staff?.jobTitle || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Payment Type</p>
                    <p className="font-medium">{staff?.paymentType || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Base Salary</p>
                    <p className="font-medium">
                      {staff?.baseSalary ? `$${staff.baseSalary.toLocaleString()}` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Commission Rate</p>
                    <p className="font-medium">{getCommissionRate()}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Work Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Work Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Work Hours</p>
                    <p className="font-medium">{staff?.workHours || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Availability</p>
                    <p className="font-medium">{staff?.availability || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p className="font-medium">{staff?.status || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Start Date</p>
                    <p className="font-medium">
                      {staff?.createdAt?.toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.totalTickets || 0}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.completedTickets || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {metrics?.totalTickets ? Math.round((metrics.completedTickets / metrics.totalTickets) * 100) : 0}% completion rate
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.avgResolutionTime ? metrics.avgResolutionTime.toFixed(1) : '0'}h
                  </div>
                  <p className="text-xs text-muted-foreground">Average time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recent Sessions</CardTitle>
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics?.recentSessionsCount || 0}</div>
                  <p className="text-xs text-muted-foreground">Last 30 days</p>
                </CardContent>
              </Card>
            </div>

            {/* Performance Charts Placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Performance metrics over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  Performance charts will be implemented here
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            {staff?.tickets && staff.tickets.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Total Tickets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{staff.tickets.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Completed</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">
                        {staff.tickets.filter(ticket => ticket.status === 'DONE').length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">In Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">
                        {staff.tickets.filter(ticket => 
                          ['PENDING', 'INSPECTING', 'REPAIRING'].includes(ticket.status)
                        ).length}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Tickets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {staff.tickets.slice(0, 10).map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">Ticket #{ticket.code}</p>
                            <p className="text-sm text-gray-500">
                              {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No tickets found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            {reviews.length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Total Reviews</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{reviews.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Average Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <p className="text-3xl font-bold">
                          {metrics?.averageRating ? metrics.averageRating.toFixed(1) : '0.0'}
                        </p>
                        <div className="flex">{renderStars(Math.round(metrics?.averageRating || 0))}</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium">Approved</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">
                        {reviews.filter(review => review.isApproved).length}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {reviews.slice(0, 10).map((review) => (
                        <div key={review.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{review.reviewerName}</p>
                              <div className="flex">{renderStars(review.rating)}</div>
                            </div>
                            <Badge variant={review.isApproved ? 'default' : 'secondary'}>
                              {review.isApproved ? 'Approved' : 'Pending'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{review.comment}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {format(new Date(review.reviewDate), 'MMM dd, yyyy')}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No reviews found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 