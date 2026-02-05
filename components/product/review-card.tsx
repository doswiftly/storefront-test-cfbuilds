'use client';

/**
 * ReviewCard Component
 *
 * Displays a single product review with author info, rating, and content.
 */

import { useState } from 'react';
import Image from 'next/image';
import { Check, ThumbsUp, ChevronDown, ChevronUp, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { StarRating } from './review-summary';

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

interface ReviewCardProps {
  review: ProductReview;
  onVoteHelpful?: (reviewId: string) => void;
  className?: string;
}

export function ReviewCard({ review, onVoteHelpful, className }: ReviewCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [voted, setVoted] = useState(false);

  const {
    id,
    rating,
    title,
    content,
    pros,
    cons,
    images,
    authorName,
    isVerifiedPurchase,
    helpfulCount,
    response,
    responseAt,
    createdAt,
  } = review;

  const shouldTruncate = content.length > 300;
  const displayContent = expanded || !shouldTruncate
    ? content
    : content.slice(0, 300) + '...';

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  };

  const handleVote = () => {
    if (!voted && onVoteHelpful) {
      setVoted(true);
      onVoteHelpful(id);
    }
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <StarRating rating={rating} size="sm" />
              {title && (
                <span className="font-semibold text-foreground">{title}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <span className="font-medium">{authorName}</span>
              {isVerifiedPurchase && (
                <Badge variant="secondary" className="text-xs gap-1">
                  <Check className="h-3 w-3" />
                  Zweryfikowany zakup
                </Badge>
              )}
            </div>
          </div>
          <time className="text-sm text-muted-foreground whitespace-nowrap">
            {formatDate(createdAt)}
          </time>
        </div>

        {/* Content */}
        <div className="mt-4">
          <p className="text-foreground whitespace-pre-line">{displayContent}</p>
          {shouldTruncate && (
            <Button
              variant="link"
              size="sm"
              className="p-0 h-auto mt-1"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Zwiń
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Czytaj więcej
                </>
              )}
            </Button>
          )}
        </div>

        {/* Pros & Cons */}
        {(pros.length > 0 || cons.length > 0) && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {pros.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-green-600 mb-1">Zalety</h4>
                <ul className="text-sm space-y-0.5">
                  {pros.map((pro, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-green-600">+</span>
                      <span>{pro}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {cons.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-600 mb-1">Wady</h4>
                <ul className="text-sm space-y-0.5">
                  {cons.map((con, i) => (
                    <li key={i} className="flex items-start gap-1">
                      <span className="text-red-600">-</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Images */}
        {images.length > 0 && (
          <div className="mt-4 flex gap-2 flex-wrap">
            {images.map((image, i) => (
              <button
                key={i}
                className="relative w-16 h-16 rounded-md overflow-hidden bg-muted hover:opacity-80 transition-opacity"
              >
                <Image
                  src={image}
                  alt={`Zdjęcie recenzji ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}

        {/* Store Response */}
        {response && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
            <div className="flex items-center gap-2 text-sm font-medium mb-1">
              <Store className="h-4 w-4" />
              Odpowiedź sklepu
              {responseAt && (
                <span className="text-muted-foreground font-normal">
                  · {formatDate(responseAt)}
                </span>
              )}
            </div>
            <p className="text-sm text-foreground">{response}</p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'text-muted-foreground',
              voted && 'text-primary'
            )}
            onClick={handleVote}
            disabled={voted}
          >
            <ThumbsUp className={cn('h-4 w-4 mr-1.5', voted && 'fill-current')} />
            Pomocna ({helpfulCount + (voted ? 1 : 0)})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
