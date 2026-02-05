import Link from "next/link";
import { FileQuestion, Home, ShoppingBag, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

/**
 * 404 Not Found Page
 *
 * Displayed when a page or resource is not found.
 * Provides helpful navigation back to the site.
 *
 * Requirements: 11.1
 */
export default function NotFound() {
  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-6xl font-bold">404</CardTitle>
          <CardDescription className="text-lg">
            Strona nie została znaleziona
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            Przepraszamy, nie mogliśmy znaleźć strony, której szukasz.
            Mogła zostać przeniesiona lub usunięta.
          </p>

          {/* Navigation options */}
          <div className="flex flex-col gap-3">
            <Button asChild size="lg" className="w-full">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Strona główna
              </Link>
            </Button>
            <div className="flex gap-3">
              <Button asChild variant="outline" size="lg" className="flex-1">
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Produkty
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="flex-1">
                <Link href="/collections">
                  <Search className="mr-2 h-4 w-4" />
                  Kolekcje
                </Link>
              </Button>
            </div>
          </div>

          {/* Help text */}
          <p className="text-sm text-muted-foreground">
            Potrzebujesz pomocy?{" "}
            <Link href="/contact" className="text-primary underline underline-offset-4">
              Skontaktuj się z nami
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
