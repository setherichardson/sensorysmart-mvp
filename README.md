# Sensory Smart MVP

A comprehensive sensory processing assessment and activity recommendation platform for children with sensory needs.

## 🚀 Latest Deployment
**Deployment triggered**: $(date) - Environment variables updated

## Features

- **Sensory Assessment**: Comprehensive evaluation of 8 sensory systems
- **Personalized Recommendations**: AI-powered activity suggestions
- **Progress Tracking**: Monitor sensory development over time
- **Activity Library**: 100+ curated sensory activities
- **Subscription Management**: Stripe-powered billing system
- **PWA Support**: Installable web app experience

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Styling**: Tailwind CSS
- **Payments**: Stripe
- **AI**: OpenAI GPT-4
- **Deployment**: Vercel

## Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`

Optional (for enhanced features):
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_DOMAIN`

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`

## Billing Integration

The app includes a complete Stripe billing system with:
- Monthly ($9.99) and Yearly ($99.99) subscription plans
- Customer portal for subscription management
- Webhook handling for subscription events
- Live mode integration ready for production
