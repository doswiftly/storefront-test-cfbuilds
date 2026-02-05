'use client';

/**
 * BlogCard Component
 *
 * Card preview for blog posts with featured image, title, excerpt, and metadata.
 */

import Image from 'next/image';
import Link from 'next/link';
import { Calendar, Clock, Eye, User } from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface BlogPost {
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

interface BlogCardProps {
  post: BlogPost;
  variant?: 'default' | 'compact' | 'featured';
  className?: string;
}

export function BlogCard({ post, variant = 'default', className }: BlogCardProps) {
  const {
    title,
    slug,
    excerpt,
    featuredImage,
    author,
    category,
    publishedAt,
    readingTime,
    viewCount,
    isFeatured,
  } = post;

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  if (variant === 'compact') {
    return (
      <Link
        href={`/blog/${slug}`}
        className={cn(
          'flex gap-4 group hover:bg-muted/50 rounded-lg p-2 transition-colors',
          className
        )}
      >
        {featuredImage && (
          <div className="relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
            <Image
              src={featuredImage.url}
              alt={featuredImage.altText || title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="80px"
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {publishedAt && (
            <time className="text-xs text-muted-foreground mt-1 block">
              {formatDate(publishedAt)}
            </time>
          )}
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Card className={cn('overflow-hidden h-full', className)}>
        <Link href={`/blog/${slug}`} className="block group">
          <div className="relative aspect-[16/9] bg-muted">
            {featuredImage ? (
              <Image
                src={featuredImage.url}
                alt={featuredImage.altText || title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                Brak zdjęcia
              </div>
            )}
            {isFeatured && (
              <Badge className="absolute top-4 left-4">Wyróżniony</Badge>
            )}
          </div>
          <CardContent className="p-6">
            {category && (
              <Badge variant="secondary" className="mb-3">
                {category.name}
              </Badge>
            )}
            <h2 className="text-2xl font-bold mb-3 group-hover:text-primary transition-colors line-clamp-2">
              {title}
            </h2>
            {excerpt && (
              <p className="text-muted-foreground line-clamp-3">{excerpt}</p>
            )}
          </CardContent>
        </Link>
        <CardFooter className="px-6 pb-6 pt-0">
          <div className="flex items-center gap-4 text-sm text-muted-foreground w-full">
            <div className="flex items-center gap-2">
              {author.avatar ? (
                <Image
                  src={author.avatar.url}
                  alt={author.name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
              <span>{author.name}</span>
            </div>
            <div className="flex items-center gap-1 ml-auto">
              <Clock className="h-4 w-4" />
              <span>{readingTime} min</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn('overflow-hidden h-full flex flex-col', className)}>
      <Link href={`/blog/${slug}`} className="block group">
        <div className="relative aspect-[16/10] bg-muted">
          {featuredImage ? (
            <Image
              src={featuredImage.url}
              alt={featuredImage.altText || title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              Brak zdjęcia
            </div>
          )}
        </div>
      </Link>
      <CardContent className="p-4 flex-1">
        {category && (
          <Link
            href={`/blog/category/${category.slug}`}
            className="inline-block mb-2"
          >
            <Badge variant="secondary" className="hover:bg-secondary/80">
              {category.name}
            </Badge>
          </Link>
        )}
        <Link href={`/blog/${slug}`} className="block group">
          <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        {excerpt && (
          <p className="text-sm text-muted-foreground line-clamp-2">{excerpt}</p>
        )}
      </CardContent>
      <CardFooter className="px-4 pb-4 pt-0">
        <div className="flex items-center justify-between text-xs text-muted-foreground w-full">
          <div className="flex items-center gap-2">
            {author.avatar ? (
              <Image
                src={author.avatar.url}
                alt={author.name}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <User className="h-3.5 w-3.5" />
            )}
            <span>{author.name}</span>
          </div>
          <div className="flex items-center gap-3">
            {publishedAt && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(publishedAt)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>{readingTime} min</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
