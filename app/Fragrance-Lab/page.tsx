import SiteHeader from "@/components/site-header"
import SiteFooter from "@/components/site-footer"
import { FragranceChat } from '@/components/fragrance-chat'
import { BackButton } from '@/components/back-button'

export default async function FragranceLabPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const initialQuery = searchParams?.query as string | undefined;

  return (
    <div className="min-h-screen bg-secondary flex flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <BackButton />
          </div>
          <div className="bg-background rounded-lg shadow-lg p-6">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-4">Fragrance Lab 🧪</h1>
              <p className="text-muted-foreground">
                あなただけの特別な香りを一緒に作りましょう
              </p>
            </div>
            <FragranceChat initialQuery={initialQuery} />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
} 