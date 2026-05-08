'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { siteConfig } from '@/config/site';
import FadeUp from '@/components/shared/FadeUp';
import { cn } from '@/lib/utils';

const contactSchema = z.object({
  name: z.string().min(1),
  businessName: z.string().min(1),
  phone: z.string().min(7),
  email: z.string().email(),
  industry: z.string().min(1),
  budget: z.string().min(1),
  message: z.string().optional(),
  whatsappOptIn: z.boolean(),
  _honeypot: z.string(),
});

type ContactData = z.infer<typeof contactSchema>;

const inputBase =
  'w-full px-4 py-3 rounded-lg border bg-background text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors';
const inputNormal = 'border-border';
const inputError = 'border-red-400 focus:border-red-400 focus:ring-red-400/20';
const labelClass = 'block text-sm font-medium text-foreground/80 mb-1.5';
const errorMsgClass = 'mt-1.5 text-xs text-red-500';

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="flex-shrink-0">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
    </svg>
  );
}

function SuccessState({ t }: { t: ReturnType<typeof useTranslations<'contact'>> }) {
  return (
    <div className="py-8 text-center">
      <div className="flex justify-center mb-5">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
            <path d="M5 11l4 4 8-8" stroke="#FF5C2A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <h3 className="font-display font-semibold text-xl text-foreground mb-3">
        {t('success.heading')}
      </h3>
      <p className="text-muted-foreground text-[15px] leading-relaxed max-w-sm mx-auto">
        {t('success.body')}
      </p>
      <a
        href={siteConfig.whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-full border border-border text-sm font-medium text-foreground/70 hover:text-foreground hover:border-accent/40 transition-colors"
      >
        <WhatsAppIcon />
        WhatsApp
      </a>
    </div>
  );
}

export default function Contact() {
  const t = useTranslations('contact');
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      whatsappOptIn: false,
      _honeypot: '',
      industry: '',
      budget: '',
    },
  });

  const onSubmit = async (data: ContactData) => {
    setServerError(false);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed');
      setSubmitted(true);
    } catch {
      setServerError(true);
    }
  };

  return (
    <section id="contact" className="py-24 sm:py-32 bg-muted/40">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">

          {/* Left — header + context */}
          <div className="lg:col-span-5">
            <FadeUp>
              <p className="text-xs font-medium uppercase tracking-widest text-accent mb-3">
                {t('eyebrow')}
              </p>
            </FadeUp>
            <FadeUp delay={0.08}>
              <h2
                className="font-display font-semibold tracking-tight text-foreground mb-4"
                style={{ fontSize: 'clamp(1.85rem, 3.5vw, 2.75rem)', letterSpacing: '-0.025em' }}
              >
                {t('heading')}
              </h2>
            </FadeUp>
            <FadeUp delay={0.12}>
              <p className="text-muted-foreground text-[15px] leading-relaxed mb-8">
                {t('subheading')}
              </p>
            </FadeUp>
            <FadeUp delay={0.16}>
              <a
                href={siteConfig.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors group"
              >
                <span className="w-8 h-8 rounded-full bg-[#25D366]/10 flex items-center justify-center group-hover:bg-[#25D366]/20 transition-colors">
                  <WhatsAppIcon />
                </span>
                {t('whatsappCta')}
              </a>
            </FadeUp>
          </div>

          {/* Right — form card */}
          <div className="lg:col-span-7">
            <FadeUp delay={0.1}>
              <div className="bg-card border border-border rounded-xl p-7 sm:p-9">
                {submitted ? (
                  <SuccessState t={t} />
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* Honeypot — hidden from real users, must remain empty */}
                    <div className="absolute opacity-0 pointer-events-none h-0 overflow-hidden" aria-hidden="true">
                      <input
                        {...register('_honeypot')}
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Name */}
                      <div>
                        <label className={labelClass}>{t('fields.name')}</label>
                        <input
                          {...register('name')}
                          type="text"
                          autoComplete="name"
                          placeholder="Ahmed Al-Rashid"
                          className={cn(inputBase, errors.name ? inputError : inputNormal)}
                        />
                        {errors.name && <p className={errorMsgClass}>{t('errors.required')}</p>}
                      </div>

                      {/* Business name */}
                      <div>
                        <label className={labelClass}>{t('fields.businessName')}</label>
                        <input
                          {...register('businessName')}
                          type="text"
                          autoComplete="organization"
                          placeholder="Al-Rashid Properties"
                          className={cn(inputBase, errors.businessName ? inputError : inputNormal)}
                        />
                        {errors.businessName && <p className={errorMsgClass}>{t('errors.required')}</p>}
                      </div>

                      {/* Phone */}
                      <div>
                        <label className={labelClass}>{t('fields.phone')}</label>
                        <input
                          {...register('phone')}
                          type="tel"
                          autoComplete="tel"
                          placeholder="+971 50 123 4567"
                          className={cn(inputBase, errors.phone ? inputError : inputNormal)}
                        />
                        {errors.phone && <p className={errorMsgClass}>{t('errors.invalidPhone')}</p>}
                      </div>

                      {/* Email */}
                      <div>
                        <label className={labelClass}>{t('fields.email')}</label>
                        <input
                          {...register('email')}
                          type="email"
                          autoComplete="email"
                          placeholder="ahmed@company.ae"
                          className={cn(inputBase, errors.email ? inputError : inputNormal)}
                        />
                        {errors.email && <p className={errorMsgClass}>{t('errors.invalidEmail')}</p>}
                      </div>

                      {/* Industry */}
                      <div>
                        <label className={labelClass}>{t('fields.industry')}</label>
                        <select
                          {...register('industry')}
                          className={cn(inputBase, errors.industry ? inputError : inputNormal)}
                        >
                          <option value="" disabled>—</option>
                          <option value="ecommerce">{t('fields.industryOptions.ecommerce')}</option>
                          <option value="realEstate">{t('fields.industryOptions.realEstate')}</option>
                          <option value="other">{t('fields.industryOptions.other')}</option>
                        </select>
                        {errors.industry && <p className={errorMsgClass}>{t('errors.required')}</p>}
                      </div>

                      {/* Budget */}
                      <div>
                        <label className={labelClass}>{t('fields.budget')}</label>
                        <select
                          {...register('budget')}
                          className={cn(inputBase, errors.budget ? inputError : inputNormal)}
                        >
                          <option value="" disabled>—</option>
                          <option value="under5k">{t('fields.budgetOptions.under5k')}</option>
                          <option value="5kTo15k">{t('fields.budgetOptions.5kTo15k')}</option>
                          <option value="15kTo30k">{t('fields.budgetOptions.15kTo30k')}</option>
                          <option value="over30k">{t('fields.budgetOptions.over30k')}</option>
                        </select>
                        {errors.budget && <p className={errorMsgClass}>{t('errors.required')}</p>}
                      </div>

                      {/* Message — full width */}
                      <div className="sm:col-span-2">
                        <label className={labelClass}>{t('fields.message')}</label>
                        <textarea
                          {...register('message')}
                          rows={4}
                          placeholder="…"
                          className={cn(inputBase, inputNormal, 'resize-none')}
                        />
                      </div>

                      {/* WhatsApp opt-in — full width */}
                      <div className="sm:col-span-2">
                        <label className="flex items-start gap-3 cursor-pointer group">
                          <input
                            {...register('whatsappOptIn')}
                            type="checkbox"
                            className="mt-0.5 h-4 w-4 rounded border-border accent-accent flex-shrink-0"
                          />
                          <span className="text-sm text-muted-foreground group-hover:text-foreground/80 transition-colors leading-snug">
                            {t('fields.whatsappOptIn')}
                          </span>
                        </label>
                      </div>
                    </div>

                    {serverError && (
                      <p className="mt-4 text-sm text-red-500">{t('errors.generic')}</p>
                    )}

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-accent text-white font-medium text-sm hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-150"
                      >
                        {isSubmitting && (
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        )}
                        {isSubmitting ? t('submitting') : t('submit')}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </FadeUp>
          </div>

        </div>
      </div>
    </section>
  );
}
