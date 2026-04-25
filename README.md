# Anti-Corruption Reporting Platform

Production-oriented React frontend for anonymous corruption reporting with:

- anonymous citizen reporting without login
- protected admin access only through `/admin`
- structured intake: `region -> city -> organization type -> organization`
- tracking ID based status lookup
- public statistics with drill-down and charts
- Uzbek / English / Russian UI

## Stack

- React + Vite
- Tailwind CSS
- React Router
- i18next
- Axios
- Recharts
- Context API for admin auth state

## Run

1. Install Node.js 18+.
2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

4. Production build:

```bash
npm run build
```

5. Lint:

```bash
npm run lint
```

## Admin Access

- Public navbar does not expose admin navigation.
- Open the protected route manually at `/admin`.
- Mock credentials:
  - `inspector@anticor.uz`
  - `SecureAdmin123!`

## Mock Backend Behavior

- Reports, tracking timelines, and admin auth session are stored in `localStorage`.
- API structure is prepared in `src/services/api.js` with these endpoints:
  - `POST /api/reports`
  - `GET /api/reports/:id`
  - `GET /api/statistics`
  - `POST /api/admin/login`
  - `GET /api/admin/reports`
  - `PATCH /api/admin/reports/:id`
- Replace mock implementations in the service layer with real Axios calls when backend becomes available.

## Project Structure

```text
src/
  components/
  context/
  data/
  features/
    admin/
    report/
    stats/
    status/
  i18n/
  pages/
  routes/
  services/
```
