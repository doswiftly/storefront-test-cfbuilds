import { Suspense } from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Spinner } from "@/components/ui/spinner";
import { SearchClient } from "./search-client";

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs className="mb-6" />

      <Suspense fallback={<Spinner />}>
        <SearchClient />
      </Suspense>
    </div>
  );
}
