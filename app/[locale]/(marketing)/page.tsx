import Hero from '@/components/sections/Hero';
import Problem from '@/components/sections/Problem';
import Pillars from '@/components/sections/Pillars';
import Process from '@/components/sections/Process';
import Pricing from '@/components/sections/Pricing';
import Results from '@/components/sections/Results';
import WhyUs from '@/components/sections/WhyUs';
import CaseStudies from '@/components/sections/CaseStudies';
import FAQ from '@/components/sections/FAQ';
import CTA from '@/components/sections/CTA';
import Contact from '@/components/sections/Contact';

/* Phase F: Sub-pages (case studies, privacy, terms, 404, thank-you) */

export default function HomePage() {
  return (
    <>
      <Hero />
      <Problem />
      <Pillars />
      <Process />
      <Pricing />
      <Results />
      <WhyUs />
      <CaseStudies />
      <FAQ />
      <Contact />
      <CTA />
    </>
  );
}
