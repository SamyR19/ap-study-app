'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';

export default function AssessmentPage() {
  const router = useRouter();

  // For now, just show a placeholder and redirect to dashboard
  const handleContinue = () => {
    // Save placeholder results
    localStorage.setItem('assessmentResults', JSON.stringify({
      completedAt: new Date().toISOString(),
      skipped: true,
    }));
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen gradient-bg-hero flex items-center justify-center p-4">
      <Card className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 md:p-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Sparkles className="w-10 h-10 text-primary-500" />
          </motion.div>

          <h1 className="text-2xl font-bold text-charcoal mb-2">Assessment Coming Soon!</h1>
          <p className="text-charcoal-light mb-8">
            We&apos;re still building the assessment feature. For now, let&apos;s get you to your dashboard!
          </p>

          <Button
            onClick={handleContinue}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-xl h-12"
          >
            Continue to Dashboard
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </Card>
    </div>
  );
}
