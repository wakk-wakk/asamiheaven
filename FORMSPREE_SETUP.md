# Formspree Contact Form Setup Guide

This guide will help you set up the contact form to actually send emails using Formspree.

## Step 1: Create a Formspree Account

1. Go to [Formspree.io](https://formspree.io)
2. Sign up for a free account
3. Create a new form in your dashboard
4. Copy your unique form endpoint URL (it looks like: `https://formspree.io/f/xbjqlqzw`)

## Step 2: Configure Environment Variables

1. Copy the `.env.local.example` file to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Formspree endpoint to `.env.local`:
   ```
   NEXT_PUBLIC_FORMSPREE_ENDPOINT=https://formspree.io/f/your-form-id
   ```

   Replace `your-form-id` with your actual Formspree form ID.

## Step 3: Test the Form

1. Start your development server (if not already running):
   ```bash
   npm run dev
   ```

2. Go to the contact page: http://localhost:3000/contact

3. Fill out the form and submit it

4. Check your email - you should receive the form submission

## Formspree Features (Free Plan)

- **50 submissions per month** (free)
- Email notifications
- Spam protection
- Auto-responder (optional)
- Redirect to custom page after submission

## Upgrading Formspree

If you need more than 50 submissions per month, you can upgrade to a paid plan:
- **Bronze**: $12/month - 1000 submissions
- **Silver**: $29/month - 2500 submissions
- **Gold**: $79/month - 10000 submissions

## Alternative: EmailJS

If you prefer a different service, you can also use [EmailJS](https://www.emailjs.com/) which offers:
- 200 free emails per month
- More customization options
- Direct integration with email providers

## Troubleshooting

### Form not sending?
1. Check that your Formspree endpoint is correct in `.env.local`
2. Make sure you've activated your Formspree form (check your email for confirmation)
3. Check browser console for any errors

### Getting spam?
Formspree has built-in spam protection. You can also enable reCAPTCHA in your Formspree dashboard.

### Need to customize the email template?
Formspree allows you to customize the email template in your dashboard settings.

## Security Note

The Formspree endpoint is public (it's in the frontend code), but that's okay because:
1. Formspree handles spam protection
2. You can enable reCAPTCHA
3. You can set up email notifications only to your verified email
4. Formspree has rate limiting to prevent abuse

---

**Need help?** Contact Formspree support at support@formspree.io