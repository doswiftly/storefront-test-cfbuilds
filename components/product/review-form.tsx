'use client';

/**
 * ReviewForm Component
 *
 * Form for submitting product reviews with rating, pros/cons, and images.
 */

import { useState } from 'react';
import { Star, Plus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Ensure Textarea exists or create a simple version
const TextareaComponent = typeof Textarea === 'undefined'
  ? ({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
      <textarea className={cn('flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className)} {...props} />
    )
  : Textarea;

interface ReviewFormProps {
  productId: string;
  productTitle: string;
  onSubmit: (data: ReviewFormData) => Promise<void>;
  orderId?: string;
  className?: string;
}

export interface ReviewFormData {
  productId: string;
  rating: number;
  title?: string;
  content: string;
  pros?: string[];
  cons?: string[];
  images?: string[];
  authorName: string;
  authorEmail?: string;
  orderId?: string;
}

export function ReviewForm({
  productId,
  productTitle,
  onSubmit,
  orderId,
  className,
}: ReviewFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');

  const handleAddPro = () => {
    if (newPro.trim() && pros.length < 5) {
      setPros([...pros, newPro.trim()]);
      setNewPro('');
    }
  };

  const handleAddCon = () => {
    if (newCon.trim() && cons.length < 5) {
      setCons([...cons, newCon.trim()]);
      setNewCon('');
    }
  };

  const handleRemovePro = (index: number) => {
    setPros(pros.filter((_, i) => i !== index));
  };

  const handleRemoveCon = (index: number) => {
    setCons(cons.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Wybierz ocenę');
      return;
    }

    if (!content.trim()) {
      toast.error('Napisz treść opinii');
      return;
    }

    if (!authorName.trim()) {
      toast.error('Podaj swoje imię');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit({
        productId,
        rating,
        title: title.trim() || undefined,
        content: content.trim(),
        pros: pros.length > 0 ? pros : undefined,
        cons: cons.length > 0 ? cons : undefined,
        authorName: authorName.trim(),
        authorEmail: authorEmail.trim() || undefined,
        orderId,
      });

      // Reset form
      setRating(0);
      setTitle('');
      setContent('');
      setPros([]);
      setCons([]);
      setAuthorName('');
      setAuthorEmail('');

      toast.success('Dziękujemy za opinię!');
    } catch (error) {
      toast.error('Nie udało się dodać opinii. Spróbuj ponownie.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Dodaj opinię</CardTitle>
        <p className="text-sm text-muted-foreground">
          Podziel się swoją opinią o produkcie: {productTitle}
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <Label className="mb-2 block">Ocena *</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  <Star
                    className={cn(
                      'h-8 w-8 transition-colors',
                      (hoverRating || rating) >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating === 1 && 'Bardzo słabo'}
                  {rating === 2 && 'Słabo'}
                  {rating === 3 && 'Średnio'}
                  {rating === 4 && 'Dobrze'}
                  {rating === 5 && 'Doskonale'}
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Tytuł opinii</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Krótkie podsumowanie..."
              maxLength={100}
              className="mt-1.5"
            />
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Treść opinii *</Label>
            <TextareaComponent
              id="content"
              value={content}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
              placeholder="Opisz swoje doświadczenia z produktem..."
              rows={4}
              className="mt-1.5"
              required
            />
          </div>

          {/* Pros */}
          <div>
            <Label>Zalety</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                value={newPro}
                onChange={(e) => setNewPro(e.target.value)}
                placeholder="Dodaj zaletę..."
                maxLength={50}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPro())}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddPro}
                disabled={!newPro.trim() || pros.length >= 5}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {pros.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {pros.map((pro, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-sm"
                  >
                    + {pro}
                    <button
                      type="button"
                      onClick={() => handleRemovePro(i)}
                      className="hover:text-green-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Cons */}
          <div>
            <Label>Wady</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                value={newCon}
                onChange={(e) => setNewCon(e.target.value)}
                placeholder="Dodaj wadę..."
                maxLength={50}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCon())}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddCon}
                disabled={!newCon.trim() || cons.length >= 5}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {cons.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {cons.map((con, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-sm"
                  >
                    - {con}
                    <button
                      type="button"
                      onClick={() => handleRemoveCon(i)}
                      className="hover:text-red-900"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Author Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="authorName">Twoje imię *</Label>
              <Input
                id="authorName"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Jan"
                className="mt-1.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="authorEmail">Email (opcjonalnie)</Label>
              <Input
                id="authorEmail"
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="jan@email.com"
                className="mt-1.5"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Nie będzie widoczny publicznie
              </p>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wysyłanie...
              </>
            ) : (
              'Dodaj opinię'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
