export const siteConfig = {
  name: 'AutoLeadss',
  tagline: 'The complete growth system for UAE businesses.',
  url: 'https://autoleadss.com',
  // TODO: operator to provide final WhatsApp number in international format (e.g. 971XXXXXXXXX for UAE)
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '201100054278',
  get whatsappUrl() {
    return `https://wa.me/${this.whatsappNumber}`;
  },
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'info@autoleadss.com',
  // TODO: operator to confirm booking URL
  bookingUrl: process.env.NEXT_PUBLIC_BOOKING_URL ?? 'https://calendly.com/autoleadss-info/30min',
  location: 'Dubai, UAE',
  social: {
    // TODO: operator to provide real social handles
    instagram: 'https://instagram.com/autoleadss',
    linkedin: 'https://linkedin.com/company/autoleadss',
    tiktok: 'https://tiktok.com/@autoleadss',
  },
} as const;
