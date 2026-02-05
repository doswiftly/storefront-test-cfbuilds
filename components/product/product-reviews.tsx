'use client';

/**
 * ProductReviews Component
 *
 * Complete reviews section with summary, list, and form.
 */

import { useState } from 'react';
import { MessageSquare, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/empty-state';
import { Spinner } from '@/components/ui/spinner';
import { ReviewSummary } from './review-summary';
import { ReviewCard } from './review-card';
import { ReviewForm, type ReviewFormData } from './review-form';
import { cn } from '@/lib/utils';

interface ProductReview {
  id: string;
  productId: string;
  rating: number;
  title?: string;
  content: string;
  pros: string[];
  cons: string[];
  images: string[];
  authorName: string;
  isVerifiedPurchase: boolean;
  helpfulCount: number;
  response?: string;
  responseAt?: Date;
  createdAt: Date;
}

interface ReviewStats {
  totalCount: number;
  averageRating: number;
  fiveStarCount: number;
  fourStarCount: number;
  threeStarCount: number;
  twoStarCount: number;
  oneStarCount: number;
}

type SortKey = 'CREATED_AT' | 'RATING' | 'HELPFUL_COUNT';

interface ProductReviewsProps {
  productId: string;
  productTitle: string;
  reviews: ProductReview[];
  stats: ReviewStats;
  isLoading?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onSortChange?: (sortKey: SortKey, reverse: boolean) => void;
  onFilterChange?: (filters: { verifiedOnly?: boolean; withPhotosOnly?: boolean }) => void;
  onSubmitReview?: (data: ReviewFormData) => Promise<void>;
  onVoteHelpful?: (reviewId: string) => void;
  className?: string;
}

export function ProductReviews({
  productId,
  productTitle,
  reviews,
  stats,
  isLoading = false,
  hasMore = false,
  onLoadMore,
  onSortChange,
  onFilterChange,
  onSubmitReview,
  onVoteHelpful,
  className,
}: ProductReviewsProps) {
  const [sortKey, setSortKey] = useState<SortKey>('CREATED_AT');
  const [sortReverse, setSortReverse] = useState(true);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [withPhotosOnly, setWithPhotosOnly] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSortChange = (value: string) => {
    const [key, direction] = value.split(':') as [SortKey, 'asc' | 'desc'];
    setSortKey(key);
    setSortReverse(direction === 'desc');
    onSortChange?.(key, direction === 'desc');
  };

  const handleFilterChange = (type: 'verified' | 'photos', checked: boolean) => {
    const newVerified = type === 'verified' ? checked : verifiedOnly;
    const newPhotos = type === 'photos' ? checked : withPhotosOnly;

    if (type === 'verified') setVerifiedOnly(checked);
    if (type === 'photos') setWithPhotosOnly(checked);

    onFilterChange?.({
      verifiedOnly: newVerified || undefined,
      withPhotosOnly: newPhotos || undefined,
    });
  };

  const handleSubmitReview = async (data: ReviewFormData) => {
    await onSubmitReview?.(data);
    setShowForm(false);
  };

  return (
    <section className={cn('space-y-8', className)} id="reviews">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="h-6 w-6" />
          Opinie klientów
        </h2>
        {onSubmitReview && (
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Anuluj' : 'Napisz opinię'}
          </Button>
        )}
      </div>

      {/* Review Form */}
      {showForm && onSubmitReview && (
        <ReviewForm
          productId={productId}
          productTitle={productTitle}
          onSubmit={handleSubmitReview}
        />
      )}

      {/* Summary */}
      {stats.totalCount > 0 && (
        <ReviewSummary stats={stats} />
      )}

      {/* Filters & Sort */}
      {reviews.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Checkbox
                id="verified"
                checked={verifiedOnly}
                onCheckedChange={(checked) => handleFilterChange('verified', checked as boolean)}
              />
              <Label htmlFor="verified" className="text-sm cursor-pointer">
                Tylko zweryfikowane zakupy
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="photos"
                checked={withPhotosOnly}
                onCheckedChange={(checked) => handleFilterChange('photos', checked as boolean)}
              />
              <Label htmlFor="photos" className="text-sm cursor-pointer">
                Ze zdjęciami
              </Label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            <Select
              value={`${sortKey}:${sortReverse ? 'desc' : 'asc'}`}
              onValueChange={handleSortChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sortuj" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CREATED_AT:desc">Najnowsze</SelectItem>
                <SelectItem value="CREATED_AT:asc">Najstarsze</SelectItem>
                <SelectItem value="RATING:desc">Najwyższa ocena</SelectItem>
                <SelectItem value="RATING:asc">Najniższa ocena</SelectItem>
                <SelectItem value="HELPFUL_COUNT:desc">Najbardziej pomocne</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {isLoading && reviews.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="h-12 w-12" />}
          title="Brak opinii"
          description="Bądź pierwszą osobą, która podzieli się opinią o tym produkcie."
          action={onSubmitReview ? {
            label: 'Napisz opinię',
            onClick: () => setShowForm(true),
          } : undefined}
        />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onVoteHelpful={onVoteHelpful}
            />
          ))}

          {/* Load More */}
          {hasMore && onLoadMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={onLoadMore}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2" />
                )}
                Załaduj więcej opinii
              </Button>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
