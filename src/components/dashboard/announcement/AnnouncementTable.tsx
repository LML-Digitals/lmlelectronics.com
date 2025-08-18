'use client';
import { Search } from 'lucide-react';
import { Card } from '../../ui/card';
import { Input } from '../../ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { useState, useEffect } from 'react';
import { Announcement } from '@prisma/client';
import EditAnnouncement from './EditAnnouncement';
import AddAnnouncement from './AddAnnouncement';
import DeleteAnnouncement from './DeleteAnnoucement';

interface AnnouncementsTableProps {
  announcements: Announcement[];
}

function AnnouncementsTable ({
  announcements: initialAnnouncements,
}: AnnouncementsTableProps) {
  const [search, setSearch] = useState('');
  const [announcements, setAnnouncements] = useState(initialAnnouncements);

  // Update local state when props change
  useEffect(() => {
    setAnnouncements(initialAnnouncements);
  }, [initialAnnouncements]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    setSearch(inputValue);
  };

  const handleAnnouncementUpdate = (updatedAnnouncements: Announcement[]) => {
    // Update with the full array of announcements returned from the server
    setAnnouncements(updatedAnnouncements);
  };

  const filteredAnnouncements = announcements.filter((announcement) => {
    return (
      search.toLowerCase() === ''
      || announcement.content.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div>
      <h1 className="text-2xl sm:text-3xl px-2 mb-4">Announcements</h1>
      <Card className="mb-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-5 px-3 py-4 sm:py-6">
          <div className="flex items-center border border-primary-foreground px-3 rounded-md w-full sm:w-auto">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search announcements"
              className="lg:w-96 border-none focus-visible:outline-none text-sm sm:text-base"
              onChange={handleInputChange}
            />
          </div>
          <AddAnnouncement />
        </div>
      </Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-72 text-xs sm:text-sm">Content</TableHead>
              <TableHead className="w-80 text-xs sm:text-sm">Button Text</TableHead>
              <TableHead className="w-80 text-xs sm:text-sm">Button Link</TableHead>
              <TableHead className="w-80 text-xs sm:text-sm">Active</TableHead>
              <TableHead className="w-80 text-xs sm:text-sm">Created At</TableHead>
              <TableHead className="text-xs sm:text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAnnouncements.map((announcement) => (
              <TableRow key={announcement.id}>
                <TableCell className="text-xs sm:text-sm max-w-[200px] sm:max-w-none truncate">
                  {announcement.content}
                </TableCell>
                <TableCell className="text-xs sm:text-sm max-w-[150px] sm:max-w-none truncate">
                  {announcement.buttonText || '-'}
                </TableCell>
                <TableCell className="text-xs sm:text-sm max-w-[150px] sm:max-w-none truncate">
                  {announcement.buttonLink || '-'}
                </TableCell>
                <TableCell className="text-xs sm:text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    announcement.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {announcement.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="text-xs sm:text-sm">
                  {new Date(announcement.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="flex gap-1 sm:gap-2">
                  <EditAnnouncement
                    key={`${announcement.id}-${announcement.isActive}`}
                    announcementId={announcement.id}
                    content={announcement.content}
                    buttonText={announcement.buttonText}
                    buttonLink={announcement.buttonLink}
                    isActive={announcement.isActive}
                    onUpdate={handleAnnouncementUpdate}
                  />
                  <DeleteAnnouncement announcementId={announcement.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default AnnouncementsTable;
