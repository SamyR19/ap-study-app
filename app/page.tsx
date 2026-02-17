import { Header, Hero, Features, Pricing, FAQ, Footer } from '@/components/landing';

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />
      <Hero />
      <Features />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
