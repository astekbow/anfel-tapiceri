# Anfel Tapiceri — Website

Website i plotë për punishten e tapicerisë **Anfel Tapiceri** në Tiranë: faqe publike elegante
(produkte, galeri me foto "para / pas", kontakt me WhatsApp) dhe **panel administrimi** ku
ndryshohet gjithçka — foto, produkte, çmime, kategori, tekste, kontakte — pa prekur kodin.

**Teknologjitë:** Next.js 15 (App Router) · TypeScript · Tailwind CSS 4 · Prisma + SQLite ·
iron-session · sharp (optimizim fotosh) · react-hook-form + zod

---

## 1. Kërkesat

- **Node.js 20 ose më i ri** (rekomandohet 22+) — shkarkohet nga [nodejs.org](https://nodejs.org)
- npm (vjen bashkë me Node)

## 2. Instalimi (hera e parë)

```bash
# 1. Instaloni varësitë
npm install

# 2. Krijoni skedarin e konfigurimit
#    Kopjoni .env.example në .env dhe plotësoni vlerat:
#    - SESSION_SECRET: një varg i rastësishëm min. 32 karaktere
#      (gjenerojeni me:  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
#    - ADMIN_EMAIL dhe ADMIN_PASSWORD: llogaria juaj e adminit
cp .env.example .env

# 3. Krijoni databazën
npm run db:migrate

# 4. Mbushni databazën me përmbajtjen fillestare (kategori, produkte shembull, tekste, admini)
npm run db:seed
```

## 3. Nisja

```bash
# Në zhvillim (me rifreskim automatik):
npm run dev

# Në prodhim:
npm run build
npm run start
```

Faqja hapet në **http://localhost:3000**.

## 4. Hyrja në panelin e administrimit

Hapni **http://localhost:3000/admin** dhe hyni me email-in dhe fjalëkalimin nga `.env`
(`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

Nga paneli mund të:

- **Produktet** — krijoni/editoni/fshini produkte, ngarkoni shumë foto me tërheqje (drag & drop),
  rirenditini me zvarritje, zgjidhni foton kryesore, vendosni çmim fiks ose "me kërkesë",
  draft/publikuar, të zgjedhura për ballinë.
- **Kategoritë** — krijoni, editoni, rirenditni, foto për secilën.
- **Galeria** — punime të realizuara, me foto opsionale "para" për krahasimin para/pas.
- **Tekstet e faqes** — çdo titull, paragraf, buton dhe foto e faqes publike (hero, shërbimet,
  rreth nesh, SEO etj.).
- **Mesazhet** — kërkesat nga forma e kontaktit, me shënim si të lexuara.
- **Cilësimet** — logo, telefon/WhatsApp, email, adresë, orar, rrjetet sociale, fjalëkalimi.

> Fotot që ngarkoni optimizohen automatikisht (zvogëlohen në max 1920px, konvertohen në WebP
> dhe krijohet një miniaturë), prandaj mund të ngarkoni foto direkt nga telefoni.

## 5. Si të ndryshoni fjalëkalimin e adminit

**Mënyra 1 (nga paneli):** Cilësimet → "Fjalëkalimi i adminit" → shkruani të vjetrin dhe të riun.

**Mënyra 2 (nëse e keni harruar):** ndryshoni `ADMIN_PASSWORD` në `.env` dhe ekzekutoni:

```bash
npm run db:seed
```

Seed-i e përditëson fjalëkalimin e llogarisë sipas `.env`, pa prekur produktet dhe tekstet
që keni ndryshuar.

## 6. Ku ruhen të dhënat

| Çfarë | Ku |
| --- | --- |
| Databaza (produkte, tekste, mesazhe) | `prisma/dev.db` |
| Fotot e ngarkuara | folderi `uploads/` (ndryshohet me `UPLOAD_DIR` në `.env`) |

**Backup:** kopjoni rregullisht `prisma/dev.db` dhe folderin `uploads/` — kaq mjafton për të
rikthyer gjithçka.

## 7. Deploy në një VPS (Ubuntu/Debian)

```bash
# Në server (një herë):
sudo apt update && sudo apt install -y nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
sudo npm install -g pm2

# Kopjoni projektin në server (p.sh. me git ose scp), pastaj brenda folderit:
npm install
cp .env.example .env && nano .env
#   - vendosni SESSION_SECRET të ri të rastësishëm
#   - NEXT_PUBLIC_SITE_URL="https://domeni-juaj.al"
#   - ADMIN_EMAIL / ADMIN_PASSWORD tuajat
npm run db:deploy     # aplikon migrimet pa pyetje (për prodhim)
npm run db:seed
npm run build

# Nisja me PM2 (rinis vetë pas restart-it të serverit):
pm2 start npm --name anfel -- start
pm2 save && pm2 startup
```

Shembull konfigurimi **nginx** (`/etc/nginx/sites-available/anfel`):

```nginx
server {
    listen 80;
    server_name domeni-juaj.al;
    client_max_body_size 20M;   # e nevojshme për ngarkimin e fotove

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/anfel /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
# HTTPS falas me Let's Encrypt:
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d domeni-juaj.al
```

**Përditësim i faqes pas ndryshimeve në kod:**

```bash
git pull            # ose kopjoni skedarët e rinj
npm install
npm run db:deploy
npm run build
pm2 restart anfel
```

### Deploy në Vercel (alternativë)

Vercel **nuk ka disk të përhershëm**, prandaj SQLite dhe fotot lokale nuk mjaftojnë aty —
duhen dy shërbime (të dyja me plan falas): një databazë **Postgres** dhe **Vercel Blob**
për fotot e reja. Kodi është i përgatitur tashmë; hapat:

1. **Databaza**: krijoni një Postgres falas te [supabase.com](https://supabase.com) (ose
   neon.tech / Vercel Postgres). Te Supabase: butoni **Connect** lart → tab-i **ORMs** →
   kopjoni të dyja: `DATABASE_URL` (porta 6543, pooler) dhe `DIRECT_URL` (porta 5432),
   duke zëvendësuar `[YOUR-PASSWORD]` me fjalëkalimin e databazës.
2. **Lokal, një herë**: te `prisma/schema.prisma` ndryshoni `provider = "sqlite"` →
   `provider = "postgresql"`; fshini folderin `prisma/migrations`; vendosni `DATABASE_URL`-në
   e re te `.env`; pastaj:

   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

   Kjo e mbush databazën e cloud-it me përmbajtjen nga kompjuteri juaj.
3. **Fotot e reja**: në projektin Vercel → Storage → krijoni një **Blob store**;
   `BLOB_READ_WRITE_TOKEN` shtohet vetë te variablat. Kodi e njeh automatikisht dhe i
   ruan aty fotot që ngarkon admini.
4. **Variablat** (Vercel → Settings → Environment Variables): `DATABASE_URL`,
   `SESSION_SECRET` (i ri, min. 32 karaktere), `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
   `NEXT_PUBLIC_SITE_URL` (p.sh. `https://anfel-tapiceri.vercel.app`).
5. **Fotot ekzistuese**: folderi `uploads/` tani COMMIT-ohet në git (nuk injorohet më)
   dhe futet automatikisht në deploy — sigurohuni që e keni bërë commit para push-it.

Pa këto dy shërbime, faqja në Vercel hapet por s'ka të dhëna (databaza `file:./dev.db`
nuk ekziston në serverat e tyre). **Rruga më e thjeshtë mbetet VPS-ja e mësipërme** (ose
Railway/Render me disk), ku gjithçka punon pa asnjë shërbim shtesë.

## 8. Kalimi në PostgreSQL më vonë (opsionale)

Kodi është i strukturuar që databaza të ndërrohet lehtë:

1. Në `prisma/schema.prisma` ndryshoni `provider = "sqlite"` → `provider = "postgresql"`.
2. Në `.env` vendosni `DATABASE_URL="postgresql://user:pass@localhost:5432/anfel"`.
3. Fshini folderin `prisma/migrations` dhe ekzekutoni `npm run db:migrate` + `npm run db:seed`.

## 9. Komandat e dobishme

| Komanda | Çfarë bën |
| --- | --- |
| `npm run dev` | Nis serverin e zhvillimit |
| `npm run build` | Ndërton versionin e prodhimit |
| `npm run start` | Nis serverin e prodhimit |
| `npm run db:migrate` | Krijon/aplikon migrimet (zhvillim) |
| `npm run db:deploy` | Aplikon migrimet (prodhim) |
| `npm run db:seed` | Mbush databazën me përmbajtjen fillestare / rikthen fjalëkalimin |
| `npm run db:studio` | Hap Prisma Studio për të parë databazën |

## 10. Zgjidhja e problemeve

**`npm run dev` shfaq gabime të çuditshme** (p.sh. `Cannot find module './586.js'`,
`SegmentViewNode`, `__webpack_modules__[moduleId] is not a function`) — kjo ndodh kur
`npm run dev` niset pas një `npm run build`, sepse të dy shkruajnë në folderin `.next`.
Zgjidhja:

```powershell
# Mbyllni serverin (Ctrl+C), pastaj:
Remove-Item -Recurse -Force .next
npm run dev
```

**"Port 3000 is in use"** — një proces i vjetër node ka mbetur hapur. Mbylleni me:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

## 11. Struktura e projektit

```
prisma/           skema e databazës, migrimet, seed-i
uploads/          fotot e ngarkuara (krijohet vetë)
src/
  app/(public)/   faqet publike (ballina, produktet, galeria, rreth nesh, kontakt)
  app/admin/      paneli i administrimit (i mbrojtur me login)
  app/api/        upload i fotove dhe forma e kontaktit
  app/uploads/    servirja e fotove të ngarkuara
  actions/        veprimet e serverit (CRUD me kontroll autentikimi)
  components/     komponentët publikë dhe të adminit
  lib/            databaza, sesionet, cilësimet, optimizimi i fotove
  middleware.ts   mbrojtja e rrugëve /admin
```
