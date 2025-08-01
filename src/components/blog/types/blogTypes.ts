import { Blog, Tag, BlogCategory } from "@prisma/client";
import { Prisma } from "@prisma/client";

export type BlogWithDetailsType = Prisma.BlogGetPayload<{
  include: {
    author: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
      };
    };
    tags: true;
    category: true;
  };
}>;

export type BlogWithAuthorType = Blog & {
  author: {
    id: string;
    name: string;
  };
};

export type BlogWithTagsType = Blog & {
  tags: Tag[];
  category: BlogCategory;
};

export type BlogWithOnlyTagsType = Blog & {
  tags: Tag[];
};

export type BlogWithFullTagsType = Blog & {
  tags: Tag[];
};

export type BlogWithAuthorAndTagsType = Blog & {
  author: {
    id: string;
    firstName: string | null;
    lastName: string | null;
  };
  tags: Tag[];
  category: BlogCategory;
};

export type TagData = {
  name: string;
  description?: string;
};

export type BlogPreviewType = {
  id: number;
  title: string;
  description: string;
  slug: string;
  tags: { id: number; name: string }[];
  createdAt: number;
  image?: string;
};

export type DataToBlog = {
  title: string;
  content: string;
  description: string;
  image: string;
  categoryId: string;
  link?: string | null;
  tagIds?: string[];
  isFeatured?: boolean;
  metaTitle?: string;
  metaDesc?: string;
};

export type DataToUpdate = {
  title?: string;
  content?: string;
  image?: string;
  description?: string;
  slug?: string;
  categoryId?: string;
  link?: string | null;
  tagIds?: string[];
  isFeatured?: boolean;
  metaTitle?: string;
  metaDesc?: string;
};
