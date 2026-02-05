/**
 * Blog Post Detail Page
 *
 * Displays full blog post content with author info and related posts.
 */

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, Eye, User, ChevronLeft, Share2 } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { BlogCard } from '@/components/blog/blog-card';
import { BlogSidebar } from '@/components/blog/blog-sidebar';

// Mock data - replace with actual GraphQL fetch
const mockPost = {
  id: '1',
  title: 'Jak wybrać idealny produkt dla siebie',
  slug: 'jak-wybrac-idealny-produkt',
  excerpt: 'Praktyczny poradnik, który pomoże Ci podjąć najlepszą decyzję zakupową.',
  content: `
    <h2>Wprowadzenie</h2>
    <p>Wybór odpowiedniego produktu może być trudny, szczególnie gdy rynek oferuje tak wiele opcji. W tym artykule przedstawimy praktyczne wskazówki, które pomogą Ci podjąć najlepszą decyzję.</p>

    <h2>Krok 1: Określ swoje potrzeby</h2>
    <p>Zanim zaczniesz przeglądać oferty, zastanów się, czego naprawdę potrzebujesz. Sporządź listę funkcji, które są dla Ciebie niezbędne.</p>

    <h2>Krok 2: Ustal budżet</h2>
    <p>Określenie górnego limitu wydatków pomoże Ci zawęzić wybór i uniknąć impulsywnych zakupów.</p>

    <h2>Krok 3: Przeczytaj opinie</h2>
    <p>Opinie innych klientów to cenne źródło informacji. Zwróć uwagę zarówno na pozytywne, jak i negatywne recenzje.</p>

    <h2>Podsumowanie</h2>
    <p>Świadomy wybór produktu wymaga czasu i researchu, ale dzięki temu unikniesz rozczarowania i będziesz zadowolony z zakupu.</p>
  `,
  contentType: 'html',
  featuredImage: null,
  author: {
    id: '1',
    name: 'Jan Kowalski',
    bio: 'Ekspert ds. produktów z 10-letnim doświadczeniem w branży.',
    avatar: null,
  },
  category: {
    id: '1',
    name: 'Poradniki',
    slug: 'poradniki',
  },
  tags: [
    { id: '1', name: 'Tips', slug: 'tips', postCount: 5 },
    { id: '2', name: 'Tutorial', slug: 'tutorial', postCount: 3 },
  ],
  status: 'PUBLISHED',
  publishedAt: '2024-01-15T10:00:00Z',
  readingTime: 5,
  viewCount: 120,
  commentCount: 8,
  allowComments: true,
  isFeatured: true,
  seo: {
    title: 'Jak wybrać idealny produkt - Poradnik',
    description: 'Praktyczny poradnik zakupowy. Dowiedz się, jak wybrać najlepszy produkt.',
  },
  createdAt: '2024-01-10T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
};

const mockRelatedPosts = [
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

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  // In production, fetch post data here
  const post = mockPost;

  if (!post) {
    return {
      title: 'Nie znaleziono wpisu',
    };
  }

  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;

  // In production, fetch post data here
  const post = mockPost;
  const relatedPosts = mockRelatedPosts;

  if (!post || post.slug !== slug) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <article className="container py-8">
      <Breadcrumbs
        items={[
          { label: 'Strona główna', href: '/' },
          { label: 'Blog', href: '/blog' },
          ...(post.category
            ? [{ label: post.category.name, href: `/blog/category/${post.category.slug}` }]
            : []),
          { label: post.title },
        ]}
      />

      {/* Back Link */}
      <Link
        href="/blog"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mt-4 mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Wróć do bloga
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Header */}
          <header className="mb-8">
            {post.category && (
              <Link
                href={`/blog/category/${post.category.slug}`}
                className="inline-block mb-4"
              >
                <Badge variant="secondary">{post.category.name}</Badge>
              </Link>
            )}

            <h1 className="text-4xl font-bold tracking-tight mb-4">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="text-xl text-muted-foreground mb-6">{post.excerpt}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar.url}
                    alt={post.author.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4" />
                  </div>
                )}
                <span className="font-medium text-foreground">
                  {post.author.name}
                </span>
              </div>
              {post.publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{post.readingTime} min czytania</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{post.viewCount} wyświetleń</span>
              </div>
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative aspect-[16/9] mb-8 rounded-lg overflow-hidden bg-muted">
              <Image
                src={post.featuredImage.url}
                alt={post.featuredImage.altText || post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none dark:prose-invert mb-8"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/blog/tag/${tag.slug}`}>
                  <Badge variant="outline" className="hover:bg-muted">
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          <Separator className="my-8" />

          {/* Author Box */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {post.author.avatar ? (
                  <Image
                    src={post.author.avatar.url}
                    alt={post.author.name}
                    width={64}
                    height={64}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">O autorze</h3>
                  <p className="font-medium text-lg">{post.author.name}</p>
                  {post.author.bio && (
                    <p className="text-muted-foreground mt-2">{post.author.bio}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-6">Powiązane artykuły</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <BlogCard key={relatedPost.id} post={relatedPost} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            {/* Share */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Udostępnij
                </h3>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Facebook
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Twitter
                  </Button>
                </div>
              </CardContent>
            </Card>

            <BlogSidebar recentPosts={relatedPosts.slice(0, 3)} />
          </div>
        </div>
      </div>
    </article>
  );
}
