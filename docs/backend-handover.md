# Backend Handover: Frontend Integration Readiness

## 1) Executive Summary
This repo has been restructured into an npm-workspaces layout and is now prepared for backend integration through typed frontend seams rather than direct endpoint coupling.  
The web app currently runs in mock mode by default, with remote adapter placeholders intentionally left as insertion points for the backend implementation.

The immediate backend objective is to wire Convex + WorkOS into existing frontend contracts and adapters, without rewriting screen code.

## 2) Current Repo and Runtime Snapshot
- Workspace layout:
  - `apps/web` = React + Vite frontend app
  - `packages/contracts` = shared contracts used by frontend/auth/services
  - `packages/config` = shared config package (workspace)
- Root scripts forward to the web workspace (`@mirrorworks/web`) for `dev`, `build`, `lint`, `typecheck`, and `test`.
- Netlify build/publish:
  - Build command: `npm run build --workspace @mirrorworks/web`
  - Publish dir: `apps/web/build`
  - SPA redirect is configured in `netlify.toml`.
- Runtime source switch:
  - `VITE_DATA_SOURCE=mock|remote` (defaults to `mock` when unset/unknown).
  - The remote path is intentionally scaffolded but not connected yet.

## 3) Frontend Architecture and Backend Seams
### Service boundary
- Central import surface is `@/services` (via `apps/web/src/services/index.ts`).
- Active implementation is selected by `apps/web/src/services/runtime.ts`.
- Domain services are grouped by module (`sell`, `plan`, `make`, `ship`, `book`, `buy`, `control`) plus `bridge`.
- `apps/web/src/services/remote.ts` currently returns placeholder methods that throw:
  - `"Remote adapter \"<service>.<method>\" is not configured yet."`
- Expected backend insertion point: replace placeholder behavior with real Convex-backed implementations behind the same service shape.

### Auth boundary
- `apps/web/src/lib/auth/auth-adapter.ts` defines frontend auth entrypoints:
  - `getAuthState`
  - `refresh`
  - `signOut`
- Current implementation is `mockAuthAdapter`, backed by Control/People mappers.
- Expected backend insertion point: replace/extend with WorkOS + backend session bootstrap source while preserving `AuthState` contract.

### Shared contracts boundary
- Shared source of truth is `packages/contracts/src`.
- Frontend screens should consume contract-aligned service outputs and avoid transport-specific assumptions.

## 4) Contract Model the Backend Should Target
Key contracts to align backend payloads with:
- Auth/session:
  - `AuthState`
  - `Viewer`
- Organization/access:
  - `OrganizationSummary`
  - `OrganizationMembership`
  - `OrgRole`
  - `ModuleAssignment`
- Access and permissions:
  - `PermissionSet`
  - `EffectivePermissionGrant`
- Invitations:
  - `InvitationSummary`

Important authorization semantics already encoded in contracts:
- App authorization is derived from:
  - `orgRole` + `moduleAssignments` + `groupIds` + resolved `effectivePermissions`
- `OrgRole` is only:
  - `'super_admin' | 'team'`
- Cross-module access is explicit only (via assignment in the target module), not automatic.
- WorkOS role slugs are optional metadata only:
  - `Viewer.workosRoleSlugs?`
  - `OrganizationMembership.workosRoleSlugs?`

## 5) Convex Integration Nodes (Frontend-Expected Function Groups)
The frontend is prepared for backend-neutral async operations and should map cleanly to Convex query/mutation/action patterns:

### Viewer/auth/session
- `viewer.getCurrent`
- `viewer.listOrganizations`
- `viewer.switchOrganization`
- `auth.getSession`
- `auth.signOut`
- `impersonation.getContext`

### Organization/membership/invitation
- `organizations.listAvailable`
- `organizations.create`
- `organizations.updateMetadata`
- `memberships.list`
- `memberships.invite`
- `memberships.updateRole`
- `memberships.deactivate`
- `memberships.reactivate`
- `roles.listAvailable`
- `roles.assign`

### Bridge import-session workflow
- `bridgeImports.createSession`
- `bridgeImports.attachUpload`
- `bridgeImports.saveMappings`
- `bridgeImports.start`
- `bridgeImports.getStatus`
- `bridgeImports.listPreviewRows`
- `bridgeImports.cancel`
- `bridgeImports.getSummary`

### Files/documents
- `files.createUploadUrl`
- `files.getFileUrl`
- `files.delete`
- `documents.listByEntity`

## 6) WorkOS Lifecycle and Claims Expectations in UI
Frontend state handling already expects these lifecycle unions:
- Auth:
  - `loading | signed_out | signed_in`
- Membership:
  - `pending | active | inactive`
- Invitation:
  - `pending | accepted | revoked | expired`
- Impersonation:
  - `inactive | active`

Expected bootstrap payload shape at app startup:
- `viewer`
- `activeOrgId`
- `activeMembership`
- `organizations`
- resolved `effectivePermissions`
- `tierFeatures`
- `impersonator` context (nullable)

Notes:
- Do not make WorkOS role slugs authoritative for app authorization.
- Use WorkOS as identity/lifecycle source; keep app permission resolution aligned to contracts.

## 7) Recent Changes Backend Engineer Should Know
- Frontend moved physically to `apps/web`.
- Shared contracts extracted to `packages/contracts`.
- Screen data access is now routed through centralized services (`@/services`).
- CI now has separate gates for `typecheck`, `lint`, `test`, and `build`.
- Smoke tests added for:
  - routes
  - auth
  - storage
  - bridge

## 8) Backend-Ready Validation Checklist
Use this checklist before switching default runtime to `remote`:
- Signed-in bootstrap fully populates `AuthState` and org/membership contracts.
- Org switch updates scoped state cleanly (no tenant bleed across persisted state).
- Membership/invitation lifecycle states render correctly in UI.
- Bridge import-session status flow maps to UI states without REST-coupled assumptions.
- CI passes:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
  - `npm run build`

## 9) Handover Essentials (What Else You Need to Know)
- Ownership boundary:
  - Frontend team has prepared contract and adapter seams.
  - Backend engineer owns Convex schema/functions, WorkOS integration, and webhook/event ingress.
- Integration strategy:
  - Replace adapters incrementally; avoid screen rewrites.
  - Keep return shapes contract-first and transport-agnostic.
- Tenant safety:
  - Verify org-switch behavior and per-org/per-viewer scoping for persisted state paths.
- Error model:
  - Remote adapters should return deterministic loading/error/success outcomes expected by existing UI states.
- Current env/config reality:
  - `VITE_DATA_SOURCE` switch exists today.
  - Additional remote/workos/convex env wiring is expected to be introduced during backend integration.

## 10) Suggested First Backend Tasks (Order)
1. Implement remote auth/session adapter returning contract-valid `AuthState`.
2. Implement remote organization/membership/invitation adapter methods.
3. Implement bridge import-session remote adapter flow.
4. Wire file upload URL + retrieval methods.
5. Run smoke tests and CI gates before enabling `VITE_DATA_SOURCE=remote` in shared environments.
