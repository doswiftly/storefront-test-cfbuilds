import { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { fetchCollections } from "@/lib/graphql/server";

export const metadata: Metadata = {
  title: "Collections",
  description: "Browse our curated collections of products",
};

// Enable ISR with 60 second revalidation
export const revalidate = 60;

export default async function CollectionsPage() {
  // Fetch collections from GraphQL API (already normalized to flat array)
  const { collections } = await fetchCollections({ first: 20 });

  // Defensive check for empty/undefined response
  const collectionList = collections || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Collections</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our curated collections of products
        </p>
      </div>

      {collectionList.length === 0 ? (
        <div className="rounded-lg border border-border bg-muted/50 p-12 text-center">
          <p className="text-muted-foreground">No collections available yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {collectionList.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="group"
            >
              <Card className="overflow-hidden transition-shadow hover:shadow-lg">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {collection.image?.url ? (
                    <img
                      src={collection.image.url}
                      alt={collection.image.altText || collection.title}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <span className="text-4xl font-bold opacity-20">
                        {collection.title.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                    {collection.title}
                  </h2>
                  {collection.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {collection.description}
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
