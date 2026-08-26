# Roomi — deploy (Vercel + Supabase)

Başqa istifadəçilər `https://….vercel.app` linkindən aça bilər. Backend ayrıca deploy olunmur: Supabase artıq buluddadır.

## 1. GitHub

1. Repo yarat (private olar).
2. `.env.local` commit olunmur (`.gitignore`-da var).
3. Push:

```bash
git add .
git status
git commit -m "chore: prepare for Vercel deploy"
git push -u origin main
```

## 2. Vercel

1. [vercel.com](https://vercel.com) → GitHub ilə giriş.
2. **Add New… → Project** → bu repo.
3. Framework: **Next.js** (avtomatik tapılmalıdır).
4. **Environment Variables** (Production + Preview):

| Ad | Dəyər |
|----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable / anon açar (`eyJ…`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Eyni anon açar (ehtiyat; biri kifayətdir) |
| `CRON_SECRET` | Uzun təsadüfi string (məs. `openssl rand -hex 24`) |

5. **Deploy**.

Nəticə: `https://<project>.vercel.app`

## 3. Supabase Auth URL-lər

Supabase Dashboard → **Authentication** → **URL Configuration**:

- **Site URL:** `https://<project>.vercel.app`
- **Redirect URLs** (əlavə et):
  - `https://<project>.vercel.app/**`
  - lokal test üçün: `http://localhost:3000/**` (və ya `3001`)

**Save**.

Email təsdiqi açıqdırsa, məktubdakı link prod domain-ə getməlidir.

## 4. SQL (bir dəfə, Dashboard → SQL Editor)

Sıra ilə **Run** (əvvəl run etməmisənsə):

1. `supabase/migrations/20260825000000_init.sql`
2. `…000001_profile_trigger.sql`
3. `…000002_grants.sql`
4. `…000003_chat.sql`
5. `…000004_chat_read.sql`
6. `…000005_listing_photos.sql`
7. `…000006_archive_expired.sql` ← cron üçün lazımdır
8. `…000007_profile_name.sql`
9. `…000008_backfill_profile_names.sql`
10. `…000009_sync_own_profile_name.sql`

Storage: `listing-photos` bucket + migration-dakı policy-lər.

## 5. Cron (elan müddəti)

`vercel.json` hər gün **03:00 UTC**-də çağırır:

`GET /api/cron/expire-listings`

Vercel avtomatik `Authorization: Bearer <CRON_SECRET>` göndərir. `CRON_SECRET` env-də olmalıdır.

Yoxlama (əvəzinə öz secret-ini yaz):

```bash
curl -s -H "Authorization: Bearer SƏNİN_CRON_SECRET" \
  https://<project>.vercel.app/api/cron/expire-listings
```

Gözlənilən: `{"archived":0}` və ya arxivlənən say.

## 6. Deploy sonrası checklist

- [ ] Ana səhifə açılır, elanlar görünür
- [ ] Qeydiyyat / giriş işləyir
- [ ] Elan yerləşdir + şəkil (offer)
- [ ] Mesaj yaz / Realtime
- [ ] Profil adı görünür
- [ ] Cron cavabı 401 deyil (`CRON_SECRET` + `archive_expired_listings`)

## 7. Tez problemlər

| Problem | Həll |
|---------|------|
| Login localhost-a atır | Site URL / Redirect URLs prod domain |
| `Invalid API key` | Legacy **anon** (`eyJ…`) açarını env-ə qoy |
| Şəkil yüklənmir | Storage bucket + policy |
| Cron 401 | `CRON_SECRET` Vercel env + Redeploy |
| Cron 500 arxiv | `20260825000006_archive_expired.sql` Run et |
| Build fail | Lokal: `npm run build` |

## Qeyd

- Eyni Supabase project lokal + prod üçün olar; ayrı “staging” project daha təmizdir.
- Custom domain: Vercel → Project → Domains, sonra Auth URL-ləri yenilə.
