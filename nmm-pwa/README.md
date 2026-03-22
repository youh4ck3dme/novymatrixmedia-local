# nmm-pwa

Next.js 16 PWA frontend pre `novymatrixmedia.sk`, napojený na WordPress ako headless CMS.

## Local Development

Spustenie development servera z adresára `nmm-pwa`:

```bash
npm install
npm run dev
```

Lokálny frontend beží na:

```text
http://localhost:3000
```

## Build

Produkčný build:

```bash
npm run build
```

## Headless Environment Variables

Používané premenné:

- `NEXT_PUBLIC_WP_URL`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_GRAPHQL_URL`
- `NEXT_PUBLIC_SITE_URL`

Ukážka hodnôt je v `.env.example`.

## Vercel Deployment

Vercel projekt `nmm-pwa` používa:

- `Root Directory = nmm-pwa`

Preto sa manuálny deploy **nespúšťa z tohto adresára**, ale z rootu celého repozitára.

### Správny manuálny production deploy

```powershell
Push-Location "C:\Users\42195\Desktop\work-2projects\novymatrixmedia-local\novymatrixmedia-local"
vercel --prod
```

### Čomu sa vyhnúť

Nespúšťaj z `nmm-pwa`:

```powershell
Push-Location "C:\Users\42195\Desktop\work-2projects\novymatrixmedia-local\novymatrixmedia-local\nmm-pwa"
vercel --prod
```

S `Root Directory = nmm-pwa` to vedie k chybnej zdvojenej ceste `nmm-pwa\nmm-pwa`.

### Stiahnutie cloud env premenných bez prepisu `.env.local`

```powershell
Push-Location "C:\Users\42195\Desktop\work-2projects\novymatrixmedia-local\novymatrixmedia-local\nmm-pwa"
vercel env pull .env.vercel
```

To je vhodné na kontrolu cloud konfigurácie. Nie je to povinný krok pre produkčný deploy.
