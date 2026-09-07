export enum CredentialStatus {
  pending = 'pending',
  approved = 'approved',
  rejected = 'rejected'
}

export type RequestCredential = {
  document_url: string
  /** Stable document UUID from Identity (design A+B). Prefer over filename from document_url. */
  document_id?: string
  /** Optional short-lived signed URL from Identity; Emisor still proxies via /api/documents. */
  document_access_url?: string
  id: string
  code: string
  schema_id: string
  status: CredentialStatus
  subject_did: string
  created_at: string
}
