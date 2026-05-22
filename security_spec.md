# Security Specification (Operational Hardening for CFO Ops Suite)

## 1. Data Invariants
- **Lead Access**: Any registered team member can create, view, or update incoming sales leads. Leads cannot have synthetic priority flags unless assigned.
- **Client Access**: Client Master database holds legal company information (GSTIN, PAN). Only validated staff can modify clients.
- **Task Integrity**: `ProjectTask` updates must start with current status. Only assignees can log updates or change the task stages.
- **Billing / Invoices**: Retainer invoices represent payments which cannot have negative amounts.
- **temporal Integrity**: All timestamp records are checked against `request.time`.

## 2. The "Dirty Dozen" Target Attack Payloads (PERMISSION_DENIED)
1. Injecting custom admin role into user documents.
2. Altering `createdAt` timestamp of a task after creation.
3. Modifying `ownerId` or `assignedTo` to escalate permissions.
4. Setting a negative bill amount inside an invoice.
5. Ingesting oversized string records (>1MB) into simple input texts.
6. Deleting client records as an unauthenticated external visitor.
7. Modifying a completed task's priority or parameters (Terminal state lock).
8. Creating a document under a collection with an invalid random symbol ID.
9. Reading other clients' high-value details without valid authentication.
10. Spoofing user authentication emails without email verification.
11. Bypassing client-side query bounds to read out complete company secrets in bulk.
12. Creating orphaned tasks relating to a non-existent client.

## 3. Test Verification Rules
All rules enforces strict `get(/databases/$(database)/documents/x)` verification or resource ownership.
`rules_version = '2';` is declared with default-deny at the root level.
