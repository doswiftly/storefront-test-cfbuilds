'use client';

/**
 * BlogSidebar Component
 *
 * Sidebar with categories, tags, recent posts, and search.
 */

import Link from 'next/link';
import { Search, FolderOpen, Tag, TrendingUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { BlogCard } from './blog-card';

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

interface RecentPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featuredImage?: {
    url: string;
    altText?: string | null;
  } | null;
  author: {
    id: string;
    name: string;
    avatar?: {
      url: string;
    } | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  publishedAt?: string;
  readingTime: number;
  viewCount: number;
  isFeatured: boolean;
}

interface BlogSidebarProps {
  categories?: BlogCategory[];
  tags?: BlogTag[];
  recentPosts?: RecentPost[];
  currentCategorySlug?: string;
  currentTagSlug?: string;
  onSearch?: (query: string) => void;
  searchQuery?: string;
  className?: string;
}

export function BlogSidebar({
  categories = [],
  tags = [],
  recentPosts = [],
  currentCategorySlug,
  currentTagSlug,
  onSearch,
  searchQuery = '',
  className,
}: BlogSidebarProps) {
  return (
    <aside className={cn('space-y-6', className)}>
      {/* Search */}
      {onSearch && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4" />
              Szukaj
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              type="search"
              placeholder="Szukaj artykułów..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
            />
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FolderOpen className="h-4 w-4" />
              Kategorie
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-1">
              {categories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/blog/category/${category.slug}`}
                    className={cn(
                      'flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted transition-colors',
                      currentCategorySlug === category.slug && 'bg-muted font-medium'
                    )}
                  >
                    <span>{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.postCount}
                    </Badge>
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Tagi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                  <Badge
                    variant={currentTagSlug === tag.slug ? 'default' : 'outline'}
                    className="cursor-pointer hover:bg-muted"
                  >
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ostatnie wpisy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {recentPosts.map((post) => (
              <BlogCard key={post.id} post={post} variant="compact" />
            ))}
          </CardContent>
        </Card>
      )}
    </aside>
  );
}
