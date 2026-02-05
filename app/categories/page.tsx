import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { fetchCategories } from "@/lib/graphql/server";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse products by category",
};

// Enable ISR with 60 second revalidation
export const revalidate = 60;

export default async function CategoriesPage() {
  // Fetch categories from GraphQL API
  // Response structure: { categories: { roots: [...], totalCount } }
  const data = await fetchCategories();

  const categoryList = data?.categories?.roots || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Categories</h1>
        <p className="mt-2 text-muted-foreground">
          Browse products by category
        </p>
      </div>

      {categoryList.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
          <p className="text-muted-foreground">No categories available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categoryList.map((category) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group"
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {category.image?.url ? (
                    <img
                      src={category.image.url}
                      alt={category.image.altText || category.name}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <span className="text-4xl font-bold opacity-20">
                        {category.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
