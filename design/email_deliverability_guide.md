# Email Deliverability Guide

## Why are my emails going to spam?
If your verification emails are landing in Outlook's spam folder, it's usually because:
1. **Missing Authentication**: You haven't set up SPF, DKIM, and DMARC records.
2. **Shared Domain**: You're sending from `onboarding@resend.dev` (shared reputation).
3. **New Domain**: Your domain is new and hasn't built a reputation yet.

## 🛠️ Critical Fixes

### 1. Set Up a Custom Domain (Most Important)
Do not use the default `resend.dev` domain for production.
1. Go to [Resend Domains](https://resend.com/domains).
2. Add your domain (e.g., `auth.yourdomain.com`).
3. Resend will provide DNS records (MX, TXT, CNAME).
4. Add these records to your DNS provider (GoDaddy, Cloudflare, AWS, etc.).
5. Wait for verification (usually minutes, up to 24h).

### 2. Configure DNS Records
Ensure you have these three records set up correctly:

#### SPF (Sender Policy Framework)
Prevents spammers from sending email on your behalf.
- **Type**: TXT
- **Host**: `@` (or subdomain)
- **Value**: `v=spf1 include:resend.com ~all`

#### DKIM (DomainKeys Identified Mail)
Cryptographically signs your emails to prove they haven't been tampered with.
- Resend provides this automatically when you verify your domain.

#### DMARC (Domain-based Message Authentication, Reporting, and Conformance)
Tells email providers what to do if SPF/DKIM fail.
- **Type**: TXT
- **Host**: `_dmarc`
- **Value**: `v=DMARC1; p=none; rua=mailto:dmarc-reports@yourdomain.com`
  - Start with `p=none` (monitor mode).
  - Move to `p=quarantine` or `p=reject` once you're confident.

### 3. Update Environment Variables
Once your domain is verified, update your `.env.local`:

```env
FROM_EMAIL=noreply@auth.yourdomain.com
```

## 📝 Best Practices Implemented
We have already updated the code to follow these best practices:
- ✅ **Plain Text Version**: Emails now include a plain text alternative for better accessibility and spam score.
- ✅ **Clean HTML**: Using a simple, table-based layout that renders well in Outlook.
- ✅ **Unsubscribe/Ignore Link**: Added text saying "safely ignore this email" to reduce spam complaints.

## 💡 Outlook Specifics
Outlook is notoriously strict. If you're still having issues:
1. **Warm Up**: Don't send 1000s of emails immediately. Start slow.
2. **Safe Senders**: Ask users to add your email to their "Safe Senders" list.
3. **Microsoft SNDS**: Register your IP with [Microsoft's Smart Network Data Services](https://sendersupport.olc.protection.outlook.com/snds/) if you have a dedicated IP (Pro plan).
