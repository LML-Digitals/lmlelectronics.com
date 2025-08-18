'use client';
import {
  AlertCircle,
  MoreHorizontal,
  Search,
  Send,
  CircleCheck,
  CircleCheckIcon,
  Trash2,
  Star,
} from 'lucide-react';
import { useState, useTransition } from 'react';
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
import {
  deleteBlog,
  publishBlog,
  unpublishBlog,
} from '@/components/blog/services/blogCrud';
import Link from 'next/link';
import EditBlogDialog from './EditBlogDialog';
import { Button } from '../../ui/button';
import { toast } from '../../ui/use-toast';
import { BlogWithDetailsType } from '@/components/blog/types/blogTypes';
import { Badge } from '@/components/ui/badge';
import CreateBlogDialog from './CreateBlogDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { DateRange } from 'react-day-picker';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type PostsTableProps = {
  posts: BlogWithDetailsType[];
};
function BlogsTable ({ posts }: PostsTableProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState<
    DateRange | undefined
  >(undefined);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Calculate counts for tabs before other filters are applied
  const totalPostsCount = posts.length;
  const publishedPostsCount = posts.filter((post) => post.isPublished).length;
  const draftPostsCount = posts.filter((post) => !post.isPublished).length;
  const featuredPostsCount = posts.filter((post) => post.isFeatured).length;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    setSearch(inputValue);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleDateChange = (dateRange: DateRange | undefined) => {
    setSelectedDateRange(dateRange);
  };

  const uniqueCategories = Array.from(new Set(posts.map((post) => post.category.name)));

  const filteredPosts = posts.filter((post) => {
    const matchesSearch
      = search.toLowerCase() === '' || post.title.toLowerCase().includes(search);
    const matchesCategory
      = selectedCategory === 'all' || post.category.name === selectedCategory;
    const matchesDate
      = !selectedDateRange?.from
      || !selectedDateRange.to
      || (new Date(post.createdAt) >= selectedDateRange.from
        && new Date(post.createdAt) <= selectedDateRange.to);
    const matchesStatus
      = selectedStatus === 'all'
      || (selectedStatus === 'published' && post.isPublished)
      || (selectedStatus === 'drafts' && !post.isPublished)
      || (selectedStatus === 'featured' && post.isFeatured);

    return matchesSearch && matchesCategory && matchesDate && matchesStatus;
  });

  const handleDeletePost = (postId: number) => {
    startTransition(async () => {
      try {
        await deleteBlog(postId);
        toast({
          title: 'Successfully Deleted',
          description: 'Successfully Deleted Your Post',
        });
        // onRefresh();
        router.refresh();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Error Deleting Post',
        });
      }
    });
  };

  function handlePublishPost (id: number): void {
    startTransition(async () => {
      try {
        await publishBlog(id);
        toast({
          title: 'Successfully Published',
          description: 'Successfully Published Your Post',
        });
        // onRefresh();
        router.refresh();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Error Publishing Post',
        });
      }
    });
  }

  function handleUnpublishPost (id: number): void {
    startTransition(async () => {
      try {
        await unpublishBlog(id);
        toast({
          title: 'Successfully Unpublished',
          description: 'Successfully Unpublished Your Post',
        });
        // onRefresh();
        router.refresh();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Error Unpublishing Post',
        });
      }
    });
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-5 px-2 sm:px-3 py-4 sm:py-6">
        <h1 className="text-2xl sm:text-3xl px-2 mb-2 sm:mb-4">Posts</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* <Link href={'/dashboard/blogs/post'}>
              <Button>Add New</Button>
            </Link> */}
          <CreateBlogDialog />
          <Link href={'/blogs'}>
            <Button className="min-h-[44px]">View Blogs</Button>
          </Link>
          <Link href={'/dashboard/blogs/categories'}>
            <Button className="min-h-[44px]">Manage Categories</Button>
          </Link>
        </div>
      </div>

      <Tabs
        value={selectedStatus}
        onValueChange={setSelectedStatus}
        className=""
      >
        <TabsList className="mb-4 overflow-x-auto">
          <TabsTrigger
            value="all"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            All Posts ({totalPostsCount})
          </TabsTrigger>
          <TabsTrigger
            value="published"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            Published ({publishedPostsCount})
          </TabsTrigger>
          <TabsTrigger
            value="drafts"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            Drafts ({draftPostsCount})
          </TabsTrigger>
          <TabsTrigger
            value="featured"
            className="text-xs sm:text-sm whitespace-nowrap"
          >
            <Star className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Featured (
            {featuredPostsCount})
          </TabsTrigger>
        </TabsList>

        <Card className="mb-4">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 px-3 py-4 sm:py-6">
            <div className="flex items-center border border-primary-foreground px-3 rounded-md w-full lg:w-auto">
              <Search className="w-4 h-4" />
              <Input
                placeholder="Search posts"
                className="w-full lg:w-96 border-none focus-visible:outline-none text-sm sm:text-base"
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-8">
              <DateRangePicker
                dateRange={selectedDateRange}
                onDateRangeChange={handleDateChange}
                className="w-full sm:w-[280px]"
              />
              <Select
                onValueChange={handleCategoryChange}
                value={selectedCategory}
              >
                <SelectTrigger className="w-full sm:w-[180px] text-sm sm:text-base">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-48 sm:w-72 text-xs sm:text-sm">
                  Title
                </TableHead>
                <TableHead className="w-48 sm:w-80 text-xs sm:text-sm">
                  Excerpt
                </TableHead>
                <TableHead className="w-32 sm:w-80 text-xs sm:text-sm">
                  Author
                </TableHead>
                <TableHead className="w-24 sm:w-80 text-xs sm:text-sm">
                  Status
                </TableHead>
                <TableHead className="w-32 sm:w-80 text-xs sm:text-sm">
                  Category
                </TableHead>
                <TableHead className="w-32 sm:w-80 text-xs sm:text-sm">
                  Tags
                </TableHead>
                <TableHead className="w-20 sm:w-40 text-xs sm:text-sm">
                  Featured
                </TableHead>
                <TableHead className="w-32 sm:w-80 text-xs sm:text-sm">
                  Created At
                </TableHead>
                {/* <TableHead className="w-80">Updated At</TableHead> */}
                <TableHead className="text-xs sm:text-sm">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-3 py-8">
                      <AlertCircle className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground" />
                      <div className="text-center">
                        <p className="text-base sm:text-lg font-medium">
                          No posts found
                        </p>
                        <p className="text-muted-foreground mt-1 text-sm sm:text-base">
                          {posts.length === 0
                            ? 'Start by creating your first blog post'
                            : 'No results matching your filters'}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="w-48 sm:w-72 text-xs sm:text-sm font-medium">
                      {post.title}
                    </TableCell>
                    <TableCell className="w-48 sm:w-80 text-xs sm:text-sm">
                      {post.description
                        ? `${post.description.slice(0, 60)}...`
                        : 'No description'}
                    </TableCell>
                    <TableCell className="w-32 sm:w-80 text-xs sm:text-sm">
                      Staff
                    </TableCell>
                    <TableCell className="w-24 sm:w-80">
                      {post.isPublished ? (
                        <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs">
                          Published
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-500 hover:bg-gray-600 text-white text-xs">
                          Draft
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="w-32 sm:w-80 text-xs sm:text-sm">
                      {post.category.name}
                    </TableCell>
                    <TableCell className="w-32 sm:w-80 text-xs sm:text-sm">
                      {post.tags && post.tags.length > 0 ? (
                        <>
                          {post.tags.slice(0, 2).map((tag, index) => (
                            <span key={tag.id}>
                              {tag.name}
                              {post.tags
                                && index < Math.min(1, post.tags.length - 1)
                                && ', '}
                            </span>
                          ))}
                          {post.tags.length > 2 && (
                            <span className="text-gray-500 ml-2">
                              +{post.tags.length - 2} more
                            </span>
                          )}
                        </>
                      ) : (
                        'No tags'
                      )}
                    </TableCell>
                    <TableCell className="w-20 sm:w-40">
                      {post.isFeatured && (
                        <Star
                          className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400"
                          fill="currentColor"
                        />
                      )}
                    </TableCell>
                    <TableCell className="w-32 sm:w-80 text-xs sm:text-sm">
                      {new Date(post.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </TableCell>
                    {/* <TableCell className="w-80">
                      {post.updatedAt
                        ? new Date(post.updatedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "N/A"}
                    </TableCell> */}
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 min-h-[44px] min-w-[44px]"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="min-w-[200px]"
                        >
                          <DropdownMenuItem
                            className="cursor-pointer text-sm"
                            onClick={(e) => e.preventDefault()}
                          >
                            <EditBlogDialog blog={post} />
                          </DropdownMenuItem>
                          {!post.isPublished ? (
                            <DropdownMenuItem
                              className="cursor-pointer text-sm"
                              onClick={(e) => e.preventDefault()}
                            >
                              <div
                                className="w-full flex items-center min-h-[44px]"
                                onClick={() => handlePublishPost(post.id)}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Publish
                              </div>
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              className="cursor-pointer text-sm"
                              onClick={(e) => e.preventDefault()}
                            >
                              <div
                                className="w-full flex items-center min-h-[44px]"
                                onClick={() => handleUnpublishPost(post.id)}
                              >
                                <Send className="h-4 w-4 mr-2" />
                                Unpublish
                              </div>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            className="cursor-pointer text-sm"
                            onClick={(e) => e.preventDefault()}
                          >
                            <div
                              className="w-full text-red-500 flex items-center min-h-[44px]"
                              onClick={() => handleDeletePost(post.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </div>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Tabs>
    </div>
  );
}

export default BlogsTable;
