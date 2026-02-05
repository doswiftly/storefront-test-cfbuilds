import { Breadcrumbs } from "@/components/layout/breadcrumbs";

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Breadcrumbs className="mb-6" />
      
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-4xl font-bold text-foreground">About Us</h1>
        
        <div className="prose prose-gray max-w-none">
          <p className="text-lg text-muted-foreground">
            Welcome to our store! We are dedicated to providing you with the best products and exceptional customer service.
          </p>
          
          <h2 className="mt-8 text-2xl font-semibold text-foreground">Our Story</h2>
          <p className="text-muted-foreground">
            Founded with a passion for quality and customer satisfaction, we've been serving customers worldwide with carefully curated products.
          </p>
          
          <h2 className="mt-8 text-2xl font-semibold text-foreground">Our Mission</h2>
          <p className="text-muted-foreground">
            To provide high-quality products at competitive prices while delivering an exceptional shopping experience.
          </p>
          
          <h2 className="mt-8 text-2xl font-semibold text-foreground">Contact Us</h2>
          <p className="text-muted-foreground">
            Have questions? Feel free to reach out to our customer support team.
          </p>
        </div>
      </div>
    </div>
  );
}
