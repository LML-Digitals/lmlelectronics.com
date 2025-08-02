'use client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Staff } from '@prisma/client';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import GenerateHashKey from './GenerateHashKey';
import DeleteStaff from '../directory/DeleteStaff';

interface StaffTableProps {
  staffs: Staff[];
}

function HashKeyTable({ staffs }: StaffTableProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setSearch(inputValue);
  };
  const inactiveStaffs = staffs.filter((staff) => staff.isActive === false);

  const filteredStaffs = inactiveStaffs.filter((staff) => {
    return (
      search.toLowerCase() === '' || staff.email.toLowerCase().includes(search)
    );
  });

  return (
    <div>
      <h1 className="text-3xl px-2 mb-4">Staff</h1>
      <Card className="mb-4">
        <div className="flex justify-between items-center gap-5 px-3 py-6">
          <div className="flex items-center border border-primary-foreground px-3 rounded-md ">
            <Search />
            <Input
              placeholder="Search staff..."
              className="w-96 border-none focus-visible:outline-none "
              onChange={handleInputChange}
            />
          </div>

          <div className="flex items-center gap-3">
            <GenerateHashKey />
            <Button onClick={() => router.back()}>Go Back</Button>
          </div>
        </div>
      </Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Hash Key</TableHead>
            <TableHead>Expires At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStaffs.map((staff) => (
            <TableRow key={staff.id}>
              <TableCell>{staff.email}</TableCell>
              <TableCell>{staff.role}</TableCell>
              <TableCell>{staff.hashKey}</TableCell>
              <TableCell>
                {staff.hashKeyExpires
                  ? staff.hashKeyExpires.toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                      hour12: true,
                    })
                  : 'N/A'}
              </TableCell>
              <TableCell>
                {/* <Button
                  onClick={() =>
                    router.push(`/dashboard/staff/hash-key/${staff.id}`)
                  }
                >
                  Edit
                </Button> */}
                <DeleteStaff id={staff.id} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
export default HashKeyTable;
