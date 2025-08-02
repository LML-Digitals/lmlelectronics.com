'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { redirect, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AddStaff from './AddStaff';
import DeleteStaff from './DeleteStaff';
import EditStaff from './EditStaff';
import Link from 'next/link';
import { CommissionRate, Staff } from '@prisma/client';

interface StaffTableProps {
  staffs: (Staff & { commissionRate: CommissionRate | null })[];
}

export default function StaffTable({ staffs }: StaffTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearch(inputValue);
  };

  const filteredStaffs = staffs.filter((staff) => {
    const matchesSearch = search.toLowerCase() === '' || 
      (staff.firstName && staff.firstName.toLowerCase().includes(search.toLowerCase())) ||
      (staff.lastName && staff.lastName.toLowerCase().includes(search.toLowerCase())) ||
      (staff.email && staff.email.toLowerCase().includes(search.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || staff.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleCount = (role: string) => {
    return staffs.filter(staff => role === 'all' || staff.role === role).length;
  };

  const getStatusCount = (status: string) => {
    return staffs.filter(staff => status === 'all' || staff.status === status).length;
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 px-2 gap-3">
        <h1 className="text-2xl sm:text-3xl mb-2 sm:mb-0">Staff Directory</h1>
      </div>

      <Card className="mb-4">
        <div className="flex flex-col gap-4 px-3 sm:px-4 py-4 sm:py-6">
          {/* Search Bar */}
          <div className="flex items-center border border-gray-200 dark:border-gray-700 px-3 sm:px-4 py-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow duration-200 w-full">
            <Search className="text-muted-foreground w-4 h-4 mr-2 sm:mr-3 flex-shrink-0" />
            <Input
              placeholder="Search staff by name or email..."
              className="w-full border-none focus-visible:outline-none focus-visible:ring-0 text-sm sm:text-base bg-transparent placeholder:text-muted-foreground"
              onChange={handleInputChange}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48 text-sm sm:text-base min-h-[44px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles ({getRoleCount('all')})</SelectItem>
                  <SelectItem value="admin">Admin ({getRoleCount('admin')})</SelectItem>
                  <SelectItem value="developer">Developer ({getRoleCount('developer')})</SelectItem>
                  <SelectItem value="technician">Technician ({getRoleCount('technician')})</SelectItem>
                  <SelectItem value="manager">Manager ({getRoleCount('manager')})</SelectItem>
                  <SelectItem value="receptionist">Receptionist ({getRoleCount('receptionist')})</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 text-sm sm:text-base min-h-[44px] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status ({getStatusCount('all')})</SelectItem>
                  <SelectItem value="active">Active ({getStatusCount('active')})</SelectItem>
                  <SelectItem value="inactive">Inactive ({getStatusCount('inactive')})</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              <AddStaff />
              <Button
                type="button"
                onClick={() => router.push('/dashboard/staff/hash-key')}
                className="min-h-[44px] w-full sm:w-auto"
              >
                Hash Keys
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs sm:text-sm">Name</TableHead>
              <TableHead className="text-xs sm:text-sm">Mobile #</TableHead>
              <TableHead className="text-xs sm:text-sm">Email</TableHead>
              <TableHead className="text-xs sm:text-sm">Title</TableHead>
              <TableHead className="text-xs sm:text-sm">Role</TableHead>
              <TableHead className="text-xs sm:text-sm">Status</TableHead>
              <TableHead className="text-xs sm:text-sm">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStaffs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center gap-3 py-8">
                    <div className="text-center">
                      <p className="text-base sm:text-lg font-medium">No staff found</p>
                      <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                        {staffs.length === 0
                          ? "Start by adding your first staff member"
                          : "No results matching your search or filters"}
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredStaffs.map((staff) => (
                <TableRow key={staff.id} className={staff.status === 'inactive' ? 'opacity-60 bg-gray-50 dark:bg-gray-900' : ''}>
                  <TableCell className="text-xs sm:text-sm">
                    <Link
                      href={`/dashboard/staff/profile/${staff.id}`}
                      className="hover:underline hover:underline-offset-1 font-medium"
                    >
                      {staff.firstName} {staff.lastName}
                    </Link>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">{staff.phone}</TableCell>
                  <TableCell className="text-xs sm:text-sm">{staff.email}</TableCell>
                  <TableCell>
                    <Badge variant={'secondary'} className="text-xs">
                      {staff.jobTitle}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs sm:text-sm">{staff.role}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={staff.status === 'active' ? 'default' : 'secondary'} 
                      className="text-xs"
                    >
                      {staff.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <EditStaff
                        id={staff.id}
                        firstName={staff.firstName || ''}
                        lastName={staff.lastName || ''}
                        phone={staff.phone || ''}
                        email={staff.email}
                        jobTitle={staff.jobTitle || ''}
                        role={staff.role}
                        paymentType={staff.paymentType}
                        baseSalary={staff.baseSalary ?? undefined}
                        commissionRate={staff.commissionRate?.repairPercentage}
                      />
                      <DeleteStaff id={staff.id} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
