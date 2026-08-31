# Project Architecture & Stack Configuration

## Tech Stack
- **Version Control**: Git & GitHub (`https://github.com/newvillages/new-villages.git`)
- **Frontend Hosting**: Vercel (`https://newvillages.ca` & `https://www.newvillages.ca`)
- **Backend Hosting**: Render (`https://new-villages.onrender.com`)
- **Database**: Supabase PostgreSQL (`jdbc:postgresql://aws-0-ca-central-1.pooler.supabase.com:6543/postgres`)
- **Transactional Email**: Brevo SMTP (`smtp-relay.brevo.com:587`, STARTTLS required, user `b3ee76001@smtp-brevo.com`)
- **Domain Registrar**: GoDaddy (`newvillages.ca`)
- **Canadian Payments**: Interac e-Transfer Auto-Deposit (`payments@newvillages.ca`) + Credit/Debit Card

## Key Environment Configurations
- **Backend Environment Variables on Render**:
  - `MAIL_HOST`: `smtp-relay.brevo.com`
  - `MAIL_PORT`: `587`
  - `MAIL_USERNAME`: `b3ee76001@smtp-brevo.com`
  - `MAIL_PASSWORD`: `xsmtpsib-f7ef856628d09839c94f5e0a469cc0302de3cda00f9dc8f9271eb5a2bbab`
  - `MAIL_FROM`: `contact@newvillages.ca`
  - `MAIL_SMTP_STARTTLS_REQUIRED`: `true`
  - `FRONTEND_BASE_URL`: `https://newvillages.ca`
- **Vercel DNS Settings on GoDaddy**:
  - `A` Record `@` -> `216.198.79.1`
  - `CNAME` Record `www` -> `c35eb2cc05cbc0bf.vercel-dns-017.com.`
