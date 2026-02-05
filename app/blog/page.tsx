/**
 * Blog Listing Page
 *
 * Lists all published blog posts with filtering and pagination.
 */

import { Suspense } from 'react';
import { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Skeleton } from '@/components/ui/skeleton';
import { BlogCard } from '@/components/blog/blog-card';
import { BlogSidebar } from '@/components/blog/blog-sidebar';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Przeczytaj nasze najnowsze artykuły i poradniki.',
};

// Mock data - replace with actual GraphQL fetch
const mockPosts = [
  {
    id: '1',
    title: 'Jak wybrać idealny produkt dla siebie',
    slug: 'jak-wybrac-idealny-produkt',
    excerpt: 'Praktyczny poradnik, który pomoże Ci podjąć najlepszą decyzję zakupową.',
    featuredImage: null,
    author: {
      id: '1',
      name: 'Jan Kowalski',
      avatar: null,
    },
    category: {
      id: '1',
      name: 'Poradniki',
      slug: 'poradniki',
    },
    publishedAt: '2024-01-15T10:00:00Z',
    readingTime: 5,
    viewCount: 120,
    isFeatured: true,
  },
  {
    id: '2',
    title: 'Trendy na rok 2024',
    slug: 'trendy-2024',
    excerpt: 'Odkryj, co będzie modne w nadchodzącym roku.',
    featuredImage: null,
    author: {
      id: '1',
      name: 'Jan Kowalski',
      avatar: null,
    },
    category: {
      id: '2',
      name: 'Trendy',
      slug: 'trendy',
    },
    publishedAt: '2024-01-10T10:00:00Z',
    readingTime: 8,
    viewCount: 250,
    isFeatured: false,
  },
];

const mockCategories = [
  { id: '1', name: 'Poradniki', slug: 'poradniki', postCount: 12 },
  { id: '2', name: 'Trendy', slug: 'trendy', postCount: 8 },
  { id: '3', name: 'Nowości', slug: 'nowosci', postCount: 15 },
];

const mockTags = [
  { id: '1', name: 'Tips', slug: 'tips', postCount: 5 },
  { id: '2', name: 'Tutorial', slug: 'tutorial', postCount: 3 },
  { id: '3', name: 'News', slug: 'news', postCount: 7 },
];

export default function BlogPage() {
  const posts = mockPosts;
  const categories = mockCategories;
  const tags = mockTags;
  const featuredPost = posts.find((p) => p.isFeatured);
  const regularPosts = posts.filter((p) => !p.isFeatured);

  return (
    <div className="container py-8">
      <Breadcrumbs
        items={[
          { label: 'Strona główna', href: '/' },
          { label: 'Blog' },
        ]}
      />

      <div className="mt-6 mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="h-8 w-8" />
          Blog
        </h1>
        <p className="text-muted-foreground mt-2">
          Najnowsze artykuły, poradniki i aktualności
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-8">
          {/* Featured Post */}
          {featuredPost && (
            <section>
              <h2 className="text-lg font-semibold mb-4">Wyróżniony artykuł</h2>
              <BlogCard post={featuredPost} variant="featured" />
            </section>
          )}

          {/* Recent Posts Grid */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Ostatnie wpisy</h2>
            {posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {regularPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-12">
                Brak wpisów do wyświetlenia.
              </p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <BlogSidebar
            categories={categories}
            tags={tags}
            recentPosts={posts.slice(0, 3)}
          />
        </div>
      </div>
    </div>
  );
}

function BlogPostsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-[16/10] w-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}
