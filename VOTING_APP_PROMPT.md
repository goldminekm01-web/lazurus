# Development Prompt: Voting Website for Artists, DJs, Photographers, Producers & Dance Crews

## Project Context

You are building a **real-time SMS + M-Pesa powered voting platform** that integrates into the existing Next.js 16 / Firebase / Vercel project at `/Users/mac/Desktop/reddit/antigravity` (Lazarus CMS, domain `lazurusgroup.com`). This is NOT a standalone app — it must be **additive**: it layers a new `/vote` section on top of the existing codebase without breaking any current features (blog, scam-checker, wallet integration, admin panel, etc.).

### Tech Stack Ground Rules (from existing project)
- **Framework**: Next.js 16 (App Router, `app/` directory)
- **Data layer**: Firebase Firestore via `firebase-admin` (`lib/firebase-admin.ts`) on the server, client SDK (`lib/firebase.ts`) for real-time reads
- **Auth**: `x-admin-token` header verified against `ADMIN_PASSWORD` env var — reuse this pattern exactly
- **Styling**: TailwindCSS with the existing color palette (`--color-dark: #0a0a0a`, `--color-accent: #e8a020`, `--color-blue: #0066ff`) and font families (`"Space Grotesk"` for display, `"Inter"` for body)
- **Image handling**: The existing `/api/upload-image` route returns data URIs — reuse it for uploading candidate images (no extra storage bucket needed)
- **Deployment**: Vercel serverless functions, so keep API route execution < 10s; use `revalidatePath` for ISR invalidation
- **Vercel env vars**: Set via `vercel env add` / dashboard; production password is `antigravity2024`, local is `Yusto2025@`

---

## Requirements Summary

### 1. Admin Panel — Category & Candidate Management
The admin must be able to:

1. **Add/edit/delete categories** — predefined defaults are: `Artist`, `DJ`, `Photographer`, `Producer`, `Dance Crew`. The admin can also add custom categories.
2. **Add/edit/delete candidates** within each category. Each candidate has:
   - **Name** (string)
   - **Image** (uploaded via existing `/api/upload-image` → data URI stored in Firestore)
   - **Bio / description** (string, optional)
   - **Unique vote code** (auto-generated from name — see §3 below)
   - **Category** (select from categories)
   - **Active toggle** (boolean — inactive candidates don't appear on the voting page)
3. A **new tab** in the existing `/admin` page (alongside "Content Manager", "Wallet Activity", "Visitor Log") labeled **"🗳️ Voting Console"**.

### 2. Public Voting Page (`/vote`)
A responsive, mobile-first page at `app/vote/page.tsx` that:

1. **Displays all active categories** as tabs or collapsible sections.
2. For each category, shows a **grid of active candidates** with their image, name, bio, and their unique code displayed prominently.
3. **Voting form** at the top (sticky on mobile):
   - Phone number input (with auto-formatting for Kenyan numbers: `07XX XXX XXX` → `+2547XXXXXXXX`)
   - Number of votes input (integer, minimum 1, default 1)
   - Selected candidate code (auto-filled when user clicks a candidate card, or a dropdown)
4. A **"Vote Now" button** that triggers the payment flow.

### 3. Payment Flow — M-Pesa STK Push + SMS Gateway

#### 3a. M-Pesa STK Push (Safaricom)
Use **Safaricom's Daraja API** to send an STK Push prompt to the user's phone. Each vote costs **10 KSH**, so total amount = `10 × number_of_votes`.

**Key details:**
- **Till number**: `5002399`
- **Transaction type**: `CustomerPayBillOnline` (since this is a till/paybill)
- **Phone format**: Normalize all inputs to `2547XXXXXXXX` (Safaricom) — the Daraja API requires this format
- **Amount**: Must be an integer (KES). `10 × votes`
- **Account Reference**: The candidate code (max 12 chars — truncate if needed)
- **Transaction Description**: e.g. `"Vote for [CODE]"` (max 13 chars)
- **Callback URL**: `/api/mpesa/callback` — must be publicly reachable on Vercel (HTTPS)

**Environment variables needed (set in Vercel dashboard):**
```bash
MPESA_ENV=sandbox          # or production after go-live
MPESA_CONSUMER_KEY=<from Daraja portal>
MPESA_CONSUMER_SECRET=<from Daraja portal>
MPESA_PASS_KEY=<from Daraja portal>
MPESA_SHORT_CODE=5002399   # the till number
MPESA_CALLBACK_URL=https://lazurusgroup.com/api/mpesa/callback
```

**Implementation:**
- `lib/mpesa.ts` — server-side module with `getAccessToken()`, `initiateSTKPush(phone, amount, accountRef)`, and `querySTKPushStatus(checkoutRequestId)`
- Cache the OAuth token (1 hour expiry, shared in-memory with timestamp check)
- After STK Push is initiated, store the `CheckoutRequestID` in Firestore (collection: `vote_payments`) with status `"pending"`, mapping it to the candidate code and voter phone
- Handle the callback at `/api/mpesa/callback` — parse `Body.stkCallback`, verify `ResultCode === 0`, then **only then** record the votes
- **Verify the result is legitimate** — never trust the callback alone; cross-check via STK Push query API as a fallback
- **Deduplicate** by `CheckoutRequestID` / `MpesaReceiptNumber` to prevent double-counting

#### 3b. SMS Gateway (Airtel Support)
Since M-Pesa STK Push only works for **Safaricom** lines, you need an **SMS fallback** for **Airtel** users.

**Recommended provider: Africa's Talking** (most established, best Node.js SDK, covers both networks via a single API, pay-as-you-go at ~KES 1/SMS for low volumes).

**How it works:**
1. Each candidate has a **unique code** generated from their name (see §4).
2. For Airtel users (detected by number prefix `01` or `+2547`) who cannot use STK Push, show them an **SMS instruction**:
   - "Send CODE to 5002399 via Airtel Money or SMS" (or use Africa's Talking to send them a confirmation SMS after payment)
3. Actually — since the till number `5002399` is an **M-Pesa till**, Airtel users pay via **Airtel Money** to the same business number. But Airtel doesn't support STK push to a Safaricom till.

**Refined approach (recommended for MVP):**

For the initial version, use **M-Pesa STK Push for Safaricom** and an **SMS verification fallback** for Airtel:

1. **Safaricom users** (numbers starting with `07` and NOT `01`): Full STK Push flow. After payment confirmation, record votes.
2. **Airtel users** (numbers starting with `01` or `+2547` prefix that routes to Airtel): Show a screen with instructions:
   - "Please send an SMS with your candidate's code to **5002399**" (this works because the till is also a registered SMS shortcode on Airtel via the SMS gateway).
   - OR: Use **Africa's Talking SMS gateway** to send a confirmation SMS to the user's number. The user sends their vote code via SMS to the Africa's Talking long code. Your backend receives the inbound SMS webhook, verifies the user sent an SMS (which costs them 10 KSH via the telco's premium SMS charging), and then records the vote.

**Simplified recommended approach (build this first):**

Use **Africa's Talking** for SMS and **pay-as-you-go**:
- `AT_API_KEY` and `AT_USERNAME` (from Africa's Talking dashboard)
- Each candidate code is 6 characters (derived from name, see §4)
- Users send an SMS like `VOTE CODE` to a shortcode or long code
- Africa's Talking webhook receives the inbound SMS
- Your `/api/sms/receive` route parses it, looks up the code, and records the vote
- The **10 KSH cost** is handled by the telco's premium SMS billing (Africa's Talking supports this), OR by integrating with M-Pesa on the backend

**For V1 of this implementation, do BOTH paths:**

| Network | Flow |
|---------|------|
| Safaricom | STK Push → Daraja callback → record vote(s) |
| Airtel | Show instructions: "Send your candidate code via SMS to 5002399" — OR use Africa's Talking inbound SMS webhook |

**Practical decision for this build:**
- Implement **M-Pesa STK Push** as the primary path (all networks — Safaricom users get the push; Airtel users who have M-Pesa can also receive STK if they're on Safaricom's network, but most Airtel users won't get the push)
- Implement **Africa's Talking SMS receive webhook** as the secondary path for Airtel users: they send `CODE` via SMS to the Africa's Talking shortcode, webhook fires, you record the vote. The 10 KSH is charged by the telco on the outbound SMS from the user.
- On the frontend, **auto-detect** the network from the phone number prefix and show the appropriate flow.

### 4. Unique Code Generation

Each candidate gets a unique 6-character code derived from their name:

**Algorithm** (`lib/vote-code.ts`):
```typescript
function generateVoteCode(name: string): string {
  // 1. Take first 3 letters of first word + first 3 letters of last word
  // 2. Convert to uppercase
  // 3. If name is short, pad with "X"
  // 4. Ensure uniqueness by appending a number if collision detected
}
```

**Examples:**
- `Trevor` → `TREV01` (if "TREVOR" is too long) → actually: first name first 3 = `TRE`, last name first 3 = first available. If single name, use first 3 + "0" + first letter → `TRE0T`
- Better approach: Use first 3 chars of first name + last 3 chars of last name → `TREVOR Doe` → `TREVoe` → `TREDOE`
- Single name: `TREVOR` → `TREVOR` → truncate to 6 → `TREVO` + pad → `TREVO0`
- Ensure uniqueness: query Firestore for existing codes, append `01`, `02` etc. if collision

**Refined algorithm:**
```typescript
function generateVoteCode(name: string): string {
  const clean = name.toUpperCase().replace(/[^A-Z]/g, '');
  if (clean.length <= 6) {
    return clean.padEnd(6, '0');
  }
  // Take first 3 + last 3
  return clean.substring(0, 3) + clean.substring(clean.length - 3);
}
```

Then check Firestore for collisions and append a number suffix if needed.

### 5. Firestore Data Model

All data lives in Firestore. Use `firebase-admin`'s `db` from `lib/firebase-admin.ts`.

**Collections:**

```
categories (collection)
  └── {id} (auto ID)
       ├── name: string          e.g. "Artist"
       ├── slug: string           e.g. "artist" (lowercase, hyphenated)
       ├── description: string
       ├── color: string          e.g. "#0066ff" (from the palette)
       ├── active: boolean        (whether this category is visible)
       └── createdAt: Timestamp

candidates (collection)
  └── {id} (auto ID)
       ├── name: string           e.g. "DJ Fresh Beats"
       ├── slug: string           URL-safe slug
       ├── code: string           unique 6-char vote code (indexed!)
       ├── categoryId: string     → categories.id
       ├── image: string          data URI or URL
       ├── bio: string            (optional)
       ├── active: boolean
       ├── voteCount: number      (denormalized total — increment atomically)
       └── createdAt: Timestamp

votes (collection — the immutable log of every vote)
  └── {id} (auto ID)
       ├── candidateId: string    → candidates.id
       ├── candidateCode: string
       ├── phoneNumber: string    e.g. "254712XXXXXX"
       ├── amount: number         e.g. 10 (KSH per vote)
       ├── voteCount: number      how many votes purchased (e.g. 3)
       ├── mpesaReceipt: string   from STK callback
       ├── checkoutRequestId: string
       ├── paymentStatus: string  "pending" | "completed" | "failed"
       ├── network: string        "safaricom" | "airtel" (detected)
       └── createdAt: Timestamp

vote_payments (collection — tracks pending STK pushes)
  └── {id} (auto ID)
       ├── checkoutRequestId: string  (unique — use as doc ID)
       ├── candidateCode: string
       ├── phoneNumber: string
       ├── amount: number
       ├── voteCount: number
       ├── status: string  "pending" | "completed" | "failed"
       └── createdAt: Timestamp
```

**Security Rules** (in `firebase.json` or Firestore rules):
- `categories`: read public, write admin-only (`x-admin-token`)
- `candidates`: read public (only active ones), write admin-only
- `votes`: read admin-only, create from authenticated API only
- `vote_payments`: read/write from API routes only

### 6. API Routes

Create these under `app/api/`:

1. **`POST /api/mpesa/stkpush`** — Initiates STK Push
   - Body: `{ phone, candidateCode, voteCount }`
   - Verifies candidate code exists in Firestore
   - Calculates amount = `10 * voteCount`
   - Calls `lib/mpesa.ts` → `initiateSTKPush()`
   - On success: store `CheckoutRequestID` in `vote_payments` with status `"pending"`
   - Returns `{ success: true, checkoutRequestId, message: "..." }`

2. **`POST /api/mpesa/callback`** — M-Pesa webhook (public, called by Safaricom)
   - Parses `Body.stkCallback`
   - Checks `ResultCode === 0` (success)
   - Looks up `checkoutRequestId` → `vote_payments` doc
   - If found and status is `"pending"`:
     - Update `vote_payments` → `"completed"`
     - Increment candidate's `voteCount` by `voteCount` (atomic increment)
     - Create entries in `votes` collection (one per vote, or one entry with `voteCount`)
   - Returns `{ ResultCode: 0, ResultDesc: "Success" }` (must acknowledge within 2s)

3. **`GET /api/mpesa/status/:checkoutRequestId`** — Optional: frontend can poll this to check payment status
   - Checks Firestore `vote_payments` for the CheckoutRequestID
   - Falls back to `lib/mpesa.ts` → `querySTKPushStatus()` if still pending

4. **`POST /api/sms/receive`** — Africa's Talking inbound SMS webhook (for Airtel fallback)
   - Parses `smsFrom`, `smsMessage` (the code), `smsText` from AT webhook
   - Looks up candidate by code
   - Records vote in `votes` collection
   - Returns 200 OK

5. **`GET /api/vote/categories`** — Public endpoint for the voting page
   - Returns all active categories with their active candidates
   - No auth required (public voting)

6. **Admin CRUD: `GET|POST|PUT|DELETE /api/vote/categories`** — protected by `x-admin-token`
   - Same pattern as existing `/api/posts`

7. **Admin CRUD: `GET|POST|PUT|DELETE /api/vote/candidates`** — protected by `x-admin-token`
   - Supports `categoryId` filter query param

8. **`GET /api/vote/results`** — Public results page (real-time via Firestore or ISR)
   - Returns vote counts per candidate, optionally with live updates

### 7. Frontend Pages & Components

**Public:**
- `app/vote/page.tsx` — Main voting page (client component, `"use client"`)
  - Tabbed category selector (or accordion on mobile)
  - Candidate cards with image, name, code, bio, vote button
  - Sticky voting form: phone input + vote count + "Vote Now" (STK Push) or "Send SMS" instructions
  - Real-time vote counts (optional: use Firestore real-time listeners from client SDK)
  - Responsive, mobile-first, uses existing Tailwind classes

- `app/vote/results/page.tsx` — Live results page
  - Shows all candidates sorted by vote count
  - Bar charts or progress bars per candidate
  - Updated via ISR (revalidate: 30s) or Firestore real-time

**Admin (add tab to existing `app/admin/page.tsx`):**
- New tab: "🗳️ Voting Console"
- Sub-sections:
  - **Categories**: list/edit/delete, "Add Category" form
  - **Candidates**: filter by category, list/edit/delete, "Add Candidate" form (with image upload, code auto-generation)
  - **Results**: real-time vote tallies per candidate
  - **Payments**: list of `vote_payments` with status filtering

**Components:**
- `components/vote/CandidateCard.tsx` — candidate display with image, code, bio, vote button
- `components/vote/VoteForm.tsx` — phone input + vote count + network detection + submit
- `components/vote/CategoryTabs.tsx` — tabbed navigation for categories
- `components/vote/RealTimeResults.tsx` — live results display
- `components/vote/NetworkSelector.tsx` — detects network from phone number, shows STK or SMS path

### 8. Network Detection (Client-Side)

```typescript
function detectNetwork(phone: string): 'safaricom' | 'airtel' | 'other' {
  // Remove non-digits
  const digits = phone.replace(/\D/g, '');
  // Check prefix
  if (digits.startsWith('2547') || digits.startsWith('07')) {
    // Could be either — Safaricom 07XX or Airtel 01XX
    // Safaricom prefixes: 0700, 0701, 0702, 0703, 0704, 0705, 0707, 0708, 0711, 0722, 0723, etc.
    // Airtel prefixes: 0100, 0101, 0102, 0103, 0104, 0105, 0106, 0107, 0108, 0109, 0110, 0111, etc.
  }
  // Simplified: check known prefixes
  // ...implementation details
}
```

### 9. Environment Variables (Local `.env.local` + Vercel)

```bash
# Existing (from project)
ADMIN_PASSWORD=Yusto2025@

# M-Pesa (Daraja API)
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=<get-from-Daraja>
MPESA_CONSUMER_SECRET=<get-from-Daraja>
MPESA_PASS_KEY=<get-from-Daraja>
MPESA_SHORT_CODE=5002399
MPESA_CALLBACK_URL=https://lazurusgroup.com/api/mpesa/callback

# Africa's Talking SMS
AT_USERNAME=<get-from-AT>
AT_API_KEY=<get-from-AT>
AT_SHORTCODE=<get-from-AT>  # or long code for inbound SMS

# New: voting-specific
VOTE_COST_KSH=10
```

### 10. Security Considerations

1. **M-Pesa callback verification**: Never trust the callback alone. Cross-check with `querySTKPushStatus()` using the `CheckoutRequestID`. Verify the `MpesaReceiptNumber` is unique.
2. **Idempotency**: Use `CheckoutRequestID` as the Firestore document ID in `vote_payments` to prevent double-processing.
3. **Admin auth**: All admin write operations require `x-admin-token === ADMIN_PASSWORD` (reuse existing pattern).
4. **Rate limiting**: Add basic rate limiting on `/api/mpesa/stkpush` — max 5 STK pushes per phone number per hour.
5. **Input validation**: Validate phone numbers strictly (must match `2547XXXXXXXX` after normalization). Validate candidate code exists before initiating payment.
6. **No raw secrets in client**: All M-Pesa and SMS gateway secrets must be server-side only (in API routes using `firebase-admin`, never exposed to the browser).
7. **CSRF protection**: Use POST methods with JSON bodies for all mutations; add a simple CSRF token mechanism if needed.

### 11. Build Sequence (TDD Approach)

Follow the existing project's TDD-style workflow:

**Phase 1: Data Model & Admin**
1. Create types in `lib/types.ts` (extend with `Category`, `Candidate`, `Vote`, `VotePayment` interfaces)
2. Create `lib/vote-code.ts` — code generation algorithm with tests
3. Create `lib/mpesa.ts` — STK push functions (token caching, initiate, query)
4. Create `lib/sms.ts` — Africa's Talking SMS functions
5. Create API routes: `/api/vote/categories`, `/api/vote/candidates`
6. Add "Voting Console" tab to `app/admin/page.tsx` with full CRUD for categories & candidates

**Phase 2: Public Voting Page**
7. Create `app/vote/page.tsx` with candidate display and voting form
8. Create `app/vote/results/page.tsx` with live results
9. Create components: `CandidateCard`, `VoteForm`, `CategoryTabs`, `NetworkSelector`

**Phase 3: Payment Integration**
10. Create `/api/mpesa/stkpush` route
11. Create `/api/mpesa/callback` route
12. Create `/api/sms/receive` route (Africa's Talking webhook)
13. Wire up the VoteForm to call STK Push and handle callbacks

**Phase 4: Testing & Deployment**
14. Test admin flow locally — add categories, add candidates with images
15. Test STK Push in Daraja sandbox (use test number `254708374149`, PIN `1234`)
16. Test SMS webhook locally with ngrok
17. Deploy to Vercel, set all env vars, switch `MPESA_ENV=production`
18. Verify `revalidatePath("/vote")` is called on candidate updates

### 12. Design Guidelines

Match the existing Lazarus aesthetic:
- Dark accent: `#0a0a0a`
- Amber accent: `#e8a020`
- Blue accent: `#0066ff`
- Font: `Space Grotesk` for headings, `Inter` for body
- Card-based layout with subtle shadows (`shadow-sm`, `border border-gray-100`)
- Mobile-first responsive grid
- Use `lucide-react` icons (already a dependency: `Vote`, `User`, `Phone`, `Send`, `CheckCircle2`, `BarChart3`)
- Candidate cards: image on top, name + code badge, bio, vote button
- Vote codes displayed as badges/pills in `bg-[#e8a020]/10 text-[#e8a020]`
- Loading states with spinners (use `animate-spin`)
- Success/error toasts after voting

### 13. Testing with curl (for verification)

```bash
# Add a category (admin)
curl -X POST https://lazurusgroup.com/api/vote/categories \
  -H "x-admin-token: Yusto2025@ (or antigravity2024 on Vercel)" \
  -H "Content-Type: application/json" \
  -d '{"name": "DJ", "slug": "dj", "description": "Best DJ", "color": "#0066ff"}'

# Add a candidate
curl -X POST https://lazurusgroup.com/api/vote/candidates \
  -H "x-admin-token: ..." \
  -H "Content-Type: application/json" \
  -d '{"name": "DJ Fresh", "categoryId": "<id>", "bio": "House music legend", "image": "data:image/png;base64,..."}'

# Initiate STK Push
curl -X POST https://lazurusgroup.com/api/mpesa/stkpush \
  -H "Content-Type: application/json" \
  -d '{"phone": "254708XXXYYY", "candidateCode": "FRESH1", "voteCount": 3}'
  # Amount = 30 KSH

# Check results (public)
curl https://lazurusgroup.com/api/vote/results
```

### 14. Acceptance Criteria

- [ ] Admin can add/edit/delete categories and candidates with images
- [ ] Each candidate auto-gets a unique vote code
- [ ] Voting page displays all active candidates grouped by category
- [ ] Safaricom users: STK Push flow works (initiate → callback → votes recorded)
- [ ] Airtel users: SMS fallback path works (or instructions shown)
- [ ] Vote totals are incremented correctly and atomically
- [ ] Results page shows real-time vote counts
- [ ] All admin endpoints require `x-admin-token`
- [ ] No existing features are broken (homepage, blog, scam-checker, wallet still work)
- [ ] Works on Vercel serverless (STK callback URL is publicly reachable)
- [ ] Can be tested with `curl` + Daraja sandbox
