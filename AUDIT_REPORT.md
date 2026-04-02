# HackPort Implementation Audit — Second-Opinion Review

**Date**: Apr 2, 2026  
**Scope**: Spec compliance, privacy/public-data separation, feature completeness, edge cases  
**Status**: Read-only assessment; no code changes

---

## VALIDATION MATRIX — FALSE POSITIVES & FALSE NEGATIVES

### ✅ CORRECTLY VALIDATED (NOT FALSE POSITIVES)

| Feature | Status | Evidence |
|---------|--------|----------|
| **Core Hackathon Pages** | ✓ Pass | `/hackathons`, `/hackathons/[slug]` fully route-based with SSG-ready detail pages |
| **Overview Section** | ✓ Pass | Dates, host, subtitle, tags, judging criteria, schedule rendered correctly |
| **Submission Guard** | ✓ Pass | Auto-save via localStorage, validation logic, public/private split verified |
| **Private Memo Isolation** | ✓ Pass | `privateMemo` marked as never-sent in submission dialog; validation warns if "password" detected |
| **Leaderboard Display** | ✓ Pass | Score breakdown, badges, delta arrows, team names all rendered |
| **Camp Matching** | ✓ Pass | Fit score calculation works; profile → team filtering → sorting logic present |
| **Copilot Panel** | ✓ Pass | Sticky sidebar, progress tracking, next-action calculation functional |
| **Rankings (Global)** | ✓ Pass | Weekly/all period toggle, badge count, trend display working |
| **Demo Data** | ✓ Pass | 3 hackathons, 3+ teams, leaderboard entries all seeded in `data/hackathons.ts` |

---

### 🔴 CRITICAL FALSE NEGATIVES (MISSING FEATURES)

#### 1. **Team Invite/Accept/Reject Flows — NOT IMPLEMENTED**
- **Spec Claim**: "팀 구성" (team formation) is marked as core journey step  
- **Reality**: 
  - No invite mechanism exists; only one-directional team posting
  - No "accept/reject team invite" state machine
  - No "pending invites" display in MyPage or Camp
  - Users can only click external contact link; no in-app team join handshake
- **Risk**: Users cannot form teams within HackPort; defeats "연결된 UX" claim
- **Evidence**: Zero references to `teamInvite`, `teamRequest`, `joinTeam` across codebase

#### 2. **Hackathon Detail Page — Missing Required Sections**
- **Spec Claims**: Full "개요", "평가 기준", "일정", "Submission Guard", "Leaderboard", "Copilot"  
- **Reality**: Present but check closures:
  - ✓ Overview: Subtitle, host, deadline — present
  - ✓ Judging criteria: Weight breakdown — present
  - ✓ Schedule: Title, date, detail — present
  - ⚠️ **Submission Rules Detail**: Listed as required/optional/formats, but **no link-validation guidance** for teams unfamiliar with accepted file types
  - ⚠️ **Submission Panel Location**: Appears on detail page, but no "view my draft status across all hackathons" global dashboard
- **Miss**: No hackathon comparison view (if user needs to choose which one to enter)

#### 3. **Team Status Transitions — INCOMPLETE**
- **Spec Claim**: "recruiting: boolean" tracks if team is open  
- **Reality**: 
  - `recruiting` is hardcoded when posting; no UI to toggle recruiting status after posting
  - No "mark team as full" or "close recruitment" button in Camp
  - Demo team "Studio Orbit" shows `recruiting: false`, but no user path to flip it
- **Edge Case**: User posts team, then fills roster → can't mark recruiting closed → UI misleads next viewer

#### 4. **Validation Checklist Assumptions — POSSIBLE FALSE POSITIVE**
- **Current Check**: `privacy: !draft.privateMemo.toLowerCase().includes("password")`
- **Problem**: 
  - Assumes any reference to "password" = privacy risk, but "Password reset link" or "API password in readme" are different cases
  - True positive: detecting literal password in memo ✓
  - False positive: flagging "password manager recommended" or "encrypted password" as privacy breach ✗
- **Recommendation**: Tighter heuristic or user override

#### 5. **Demo Seed / Reset — STUBBED & DANGEROUS**
- **File**: `/src/components/site/demo-seed-controls.tsx` = **empty export**
- **Hook**: `/src/hooks/use-demo-seed.ts` likely exists but not linked to UI
- **Risk**: 
  - No way for admins/mods to reset leaderboard between test runs
  - If seed is triggered via hook, it's silent
  - Could overwrite user submissions without warning
- **Status**: Not live, but half-baked

---

### 🟡 MODERATE FALSE POSITIVES (EDGE CASES & ASSUMPTIONS)

#### 1. **Public Summary vs Private Memo — Privacy Boundary**
- **Assumption**: localStorage-only storage = safety
- **Reality**: 
  - ✓ Correct: `privateMemo` not sent to any API in current code
  - ⚠️ Weakness: No encryption at rest; Chrome DevTools exposes all localStorage
  - ⚠️ Weakness: If user syncs browser, localStorage may sync to cloud (browser-dependent)
  - **Not a bug**, but document the boundary clearly
- **False Positive**: Claiming "private" without mentioning DevTools risk

#### 2. **Team Fit Scoring — Possible Overweight for Edge Cases**
- **Calculation** (in `camp.ts`):
  ```
  base: 20, role_match: +30, tech_overlap: +25 (min per stack), 
  collab: +15, beginner: +10, advanced_nonbeginner: +8
  ```
- **Edge Cases**:
  - Team needs: `["frontend", "designer"]`, Profile role: `"fullstack"` → **0 points** (not in array)
    - Expected: Partial credit for overlap (fullstack includes frontend)
    - **False Negative**: Strictness may hide good matches
  - Profile has 1 tech, team needs 5 → **+10 max**; profile with 6 common techs → **+25 max** (capped)
    - **False Positive**: Capping ignores deep specialization
- **Status**: Functional but might overprefer beginner teams

#### 3. **URL Validation in Submission — Too Permissive**
- **Current Check**: `isLikelyUrl()` uses `new URL()` constructor
- **Edge Cases**:
  - `"file:///C:/Users/..."` is valid URL but meaningless for demo
  - `"localhost:3000"` fails (no protocol) — correct reject
  - `"http://192.168.1.1"` passes but unreachable from outside networks
- **Status**: Acceptable for MVP; suggest `http(s)://` + domain validation in v2

#### 4. **Leaderboard Delta (up/down/flat) — No Timestamp Tracking**
- **Current**: Hard-coded in demo data; no actual calculation
- **Edge Case**: If leaderboard runs once per hackathon end, delta is meaningless
  - Should track: previous position timestamp → current position
  - **Currently**: No history, so delta is mock data only
- **Status**: Demo-only; real system needs leaderboard snapshot history

#### 5. **Copilot Readiness Formula — Unweighted**
- **Current**: `readiness = (completed.length / 4) * 100`
  - Treats all steps equally: overview ≈ submission ≈ final submit
  - **Better**: Weight by deadline proximity (last week → submission more critical)
- **Edge Case**: User reads overview, ignores team, ignores draft, submits nothing → 25% readiness = OK?
- **Status**: Functional indicator but not predictive of success

---

## PRODUCT/SPEC MISMATCHES

| Gap | Severity | Impact |
|-----|----------|--------|
| **No in-app team formation (invite/accept)** | **CRITICAL** | Breaks "연결된 UX" core promise; users must leave platform to join teams |
| **Camp recruiting toggle missing** | HIGH | Users can't manage team status; recruits can't tell if team is full |
| **No cross-hackathon submission dashboard** | MEDIUM | Users submitting to multiple hackathons must navigate separately |
| **Validation heuristic for privateMemo too broad** | MEDIUM | False positives on legitimate privacy notes |
| **Demo seed controls empty** | MEDIUM | Testing/reset workflows blocked; dangerous if half-wired |
| **Leaderboard delta is static (not calculated)** | LOW | Visual metaphor misleading; no actual rank change tracking |
| **Auth is preview-only, no persistence** | LOW | MyPage cannot show real user history; no cross-session state |
| **No bulk download for submissions** | LOW | Admins can't export team work post-deadline |

---

## COMPLIANCE SUMMARY

### ✅ Privacy/Public Data Separation — **SOUND**
- Private memo stored locally only ✓
- Public summary shown in confirmation before final submit ✓
- Contact link (team posts) is user-provided, not scraped ✓
- No external API calls in current flow ✓

**Caveat**: Assumes users trust browser storage; document clearly.

### ⚠️ Spec Completeness — **75%**
- Routes: ✓ All main pages exist
- Data model: ✓ Types defined correctly
- Core features: ✓ Submission, camp matching, leaderboard, copilot
- **Missing**: In-app team formation, team status management, cross-hackathon views

### 🎯 Edge Cases — **Partial Coverage**
- URL validation: Basic; no protocol check for `file://`
- Fit scoring: Works but unweighted for specialization
- Privacy checks: Overly broad heuristic
- State transitions: No "recruiting" toggle UI

---

## RECOMMENDATIONS FOR FINAL REPORT

**Show as passing:**
1. ✓ Submission Guard separation of public/private works as specced
2. ✓ Leaderboard explanation features present (score breakdown, badges, delta display)
3. ✓ Camp matching calculates fit scores and ranks teams
4. ✓ Copilot guides users through core journey

**Flag as missing or stubbed:**
1. 🔴 Team invite/accept/reject flows (no in-app handshake)
2. 🔴 Recruiting status toggle (users can't close recruitment)
3. 🟡 Demo seed controls (file exists, exports nothing)
4. 🟡 Privacy validation heuristic (too broad, needs tightening)

**Verify before launch:**
1. localStorage is only storage (no backend persistence yet)
2. Contact links open externally; no team join within app
3. MyPage is preview-only (no real user profile)
4. Test URL validation with edge cases (file://, localhost)

---

**Overall**: **75% of core spec implemented, 25% missing or stubbed.**  
Primary gaps are **team formation workflows** and **team management UI**.  
Privacy/public separation is correctly implemented and appropriately scoped.
