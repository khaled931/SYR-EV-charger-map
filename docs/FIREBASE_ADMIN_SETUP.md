# Firebase Administration Setup

This repository includes a protected administration panel for the Syrian EV Charger Map.

## Architecture

- Public map: reads published records from `GET /api/chargers`.
- Administration panel: available only at `/admin/`; no public link or button is added.
- Authentication: Firebase Authentication with the email/password provider.
- Authorization: every administration API request carries a Firebase ID token. The Vercel backend verifies the token and checks the email against `ADMIN_EMAILS`.
- Database: Cloud Firestore collection `ev_chargers`.
- Audit trail: writes a summary to `ev_charger_audit` for create, import, update, and delete operations.
- Firestore browser access: denied by `firestore.rules`; only server-side Firebase Admin SDK access is used.
- Continuity: until Firestore contains published records, the public map can fall back to `data/chargers.v2.json`.

Hiding `/admin/` is only an additional privacy measure. The actual protection is token verification, the administrator allowlist, email verification, same-origin checks, server-side validation, and server-only Firestore access.

## 1. Create or select the Firebase project

1. Open Firebase Console and create or select the project for the EV charger map.
2. Add a Web App inside the project.
3. Copy the Web App values: API key, Auth domain, Project ID, App ID, and Messaging Sender ID.
4. Do not commit these values to the repository. Add them as Vercel environment variables.

## 2. Enable administrator authentication

1. In Firebase Console, open **Authentication → Sign-in method**.
2. Enable **Email/Password**.
3. Open **Authentication → Users** and create the administrator user.
4. Use an email included in `ADMIN_EMAILS`.
5. Verify the email address before using the panel. The login screen sends a verification email when necessary.
6. Use a unique, strong password.

Default project email in the allowlist code:

```text
khaled.alassad@syrianrenewables.com
```

Set `ADMIN_EMAILS` explicitly in production even when using the default.

## 3. Create Firestore

1. Open **Firestore Database** and create a database in Native mode.
2. Select a region appropriate for the project's users and governance needs.
3. Deploy the restrictive rules in this repository:

```bash
npm install -g firebase-tools
firebase login
firebase use YOUR_FIREBASE_PROJECT_ID
firebase deploy --only firestore:rules
```

The included rule denies all browser reads and writes. The Vercel functions use the Firebase Admin SDK and bypass client security rules.

## 4. Create a Firebase service account

1. Firebase Console → **Project settings → Service accounts**.
2. Generate a new private key.
3. Copy the following values into Vercel environment variables:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
4. Store the private key only in Vercel's encrypted environment settings. Never put the JSON key in GitHub.
5. The private key environment value may contain escaped newlines (`\n`); the backend converts them at runtime.

## 5. Add Vercel environment variables

Use `.env.example` as the source list in Vercel Project Settings → Environment Variables.

Required server variables:

```text
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
```

Required Firebase web-auth variables:

```text
FIREBASE_WEB_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_APP_ID
FIREBASE_MESSAGING_SENDER_ID
```

Access-control variables:

```text
ADMIN_EMAILS=khaled.alassad@syrianrenewables.com
ADMIN_REQUIRE_EMAIL_VERIFIED=true
APP_ORIGINS=https://YOUR_PRODUCTION_DOMAIN
```

Data continuity:

```text
FIREBASE_FALLBACK_TO_JSON=true
```

Use comma-separated values in `ADMIN_EMAILS` or `APP_ORIGINS` when more than one value is required.

## 6. Deploy and initialize data

1. Merge the feature branch and allow Vercel to deploy once.
2. Open the administration URL directly:

```text
https://YOUR_DOMAIN/admin/
```

3. Sign in with the verified administrator account.
4. Import the current `data/chargers.v2.json` file or a new Excel, CSV, or JSON file.
5. Use **Add or update by Suggested_ID** for the first migration if the import may be repeated.
6. Confirm that the dashboard lists the imported records.
7. Open the public map and confirm that `/api/chargers` reports `storage: firebase-firestore` in its JSON metadata.
8. After validation, set `FIREBASE_FALLBACK_TO_JSON=false` when repository fallback is no longer desired.

## Import columns

| Column | Requirement |
|---|---|
| `Suggested_ID` | Required; unique Latin letters, numbers, hyphens, or underscores |
| `Company_AR` / `Company_EN` | Required |
| `Governorate_AR` / `Governorate_EN` | Required |
| `City_AR` / `City_EN` | Required |
| `Site_Name_AR` / `Site_Name_EN` | Required |
| `Charger_Type_AR` / `Charger_Type_EN` | Required |
| `Charger_Numbers` | Required integer, 1–200 |
| `Site_Type_AR` / `Site_Type_EN` | Required |
| `Google_Maps_URL` | Required Google Maps HTTPS link |
| `Latitude` / `Longitude` | Automatically resolved when possible; otherwise required manually |
| `Published` | Optional; defaults to `true` |
| `Rated_Power_kW` | Optional; retained for existing datasets |
| `Guns_Per_Charger` | Optional; retained for existing datasets |
| `Status` / `Data_Quality` | Optional metadata |

The application rejects coordinates outside a conservative Syria bounding box: latitude 32–38 and longitude 35–43. This prevents accidental publication of markers in another country caused by malformed links.

## Google Maps coordinate extraction

The administration backend:

1. Parses coordinates embedded in the URL.
2. Follows approved Google Maps short-link redirects.
3. Parses supported coordinates from the resolved URL or returned page.
4. Rejects non-Google domains to reduce server-side request forgery risk.
5. Requests manual latitude and longitude when coordinates cannot be resolved.

Always visually verify a new marker after publication.

## Security checklist

- Keep the repository free of service-account JSON and private keys.
- Use a dedicated administrator Firebase user, not a shared personal password.
- Keep `ADMIN_REQUIRE_EMAIL_VERIFIED=true`.
- Remove former administrators from both Firebase Authentication and `ADMIN_EMAILS`.
- Review Firebase Authentication logs, Vercel function logs, Firestore usage, and `ev_charger_audit` regularly.
- Rotate the service-account key if exposure is suspected.
- Keep Firebase and other dependencies updated through reviewed pull requests.
- Do not weaken `firestore.rules` unless direct browser access is intentionally designed and separately secured.
- Export periodic JSON or XLSX backups from the administration panel.

## Local tests

```bash
npm test
```

The tests cover Google Maps coordinate formats, Google URL restrictions, bilingual import normalization, and the Syria coordinate boundary.
