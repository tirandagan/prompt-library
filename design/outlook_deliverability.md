# Outlook Email Deliverability Guide

Outlook (and Hotmail/Live/Microsoft 365) has some of the strictest spam filters. If your emails are going to junk, follow this checklist.

## 🚨 Critical Immediate Actions

### 1. Verify a Custom Domain (Essential)
Using `onboarding@resend.dev` **will** go to spam in Outlook. You must use your own domain.
1. Go to [Resend Domains](https://resend.com/domains).
2. Add your domain (e.g., `auth.promptforge.com`).
3. **Wait for verification**.

### 2. Configure DNS Records
You must add these records to your DNS provider (GoDaddy, Cloudflare, etc.).

| Type | Host | Value | Why? |
|------|------|-------|------|
| **TXT** | `@` | `v=spf1 include:resend.com ~all` | **SPF**: Tells Outlook Resend is allowed to send for you. |
| **TXT** | `_dmarc` | `v=DMARC1; p=none; rua=mailto:postmaster@yourdomain.com` | **DMARC**: Proves you own the domain. |
| **MX** | `auth` | *Provided by Resend* | Handles bounces (if using a subdomain). |
| **TXT** | `*._domainkey` | *Provided by Resend* | **DKIM**: Signs emails cryptographically. |

### 3. Update Environment Variables
After verification, update your `.env` file locally and in production (Vercel/Railway/etc.):

```env
FROM_EMAIL=noreply@auth.yourdomain.com
SUPPORT_EMAIL=support@yourdomain.com
```

---

## 💡 Outlook-Specific Tips

### 1. "Safe Senders" List
While testing, if an email goes to Junk:
1. Open the email in Outlook.
2. Click **"Not Junk"** or "It's not spam".
3. Add the `from` address to your **Safe Senders** list.
*This trains the Outlook filter that your emails are legitimate.*

### 2. Warm Up Your Domain
If your domain is brand new (< 30 days old):
- Send emails to colleagues/friends who use Outlook first.
- Ask them to reply to the email (replies signal high trust).
- Don't send 10,000 emails on day 1.

### 3. Avoid "Spammy" Content (We've handled this in code)
We have updated the email template to:
- ✅ Use inline CSS styles (Outlook desktop ignores `<style>` tags often).
- ✅ Include a unique Header ID (`X-Entity-Ref-ID`) to prevent threading issues.
- ✅ Use a clear, non-urgent subject line.
- ✅ Include a valid `Reply-To` address.

### 4. Microsoft SNDS (Advanced)
If you have a dedicated IP (Resend Pro), register with [Microsoft SNDS](https://sendersupport.olc.protection.outlook.com/snds/) to monitor your reputation directly with Microsoft.

