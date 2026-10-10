export type ModuleId =
  | '01' | '02' | '03' | '04' | '05'
  | '06' | '07' | '08' | '09' | '10'
  | '11' | '12' | '13' | '14' | '15'
  | '16' | '17' | '18' | '19' | '20';

export interface CaseData {
  caseId: string;
  title: string;
  investigator: string;
  agency: string;
  department: string;
  badgeNumber: string;
  description: string;
  status: 'OPEN' | 'UNDER_REVIEW' | 'ADMISSIBLE' | 'CLOSED' | 'ARCHIVED';
  tags: string[];
  createdAtUtc: string;
  authorizationRef: string;
}

export interface EvidenceItem {
  evidenceId: string;
  caseId: string;
  filename: string;
  originalPath: string;
  sourceDescription: string;
  category: 'MOBILE' | 'SQLITE' | 'DISK_IMAGE' | 'BROWSER' | 'LOGS' | 'MEDIA' | 'ARCHIVE' | 'FILESYSTEM' | 'UNKNOWN';
  byteSize: number;
  sha256: string;
  sha1: string;
  md5: string;
  expectedSha256?: string;
  isVerified: boolean;
  mismatchAlert: boolean;
  magicType: string;
  acquiredAtUtc: string;
  examiner: string;
  readOnlyEnforced: boolean;
  notes?: string;
}

export interface CustodyRecord {
  eventId: string;
  caseId: string;
  evidenceId: string;
  action: 'INTAKE' | 'HASH_VERIFY' | 'TRANSFER' | 'EXTRACTION' | 'ANALYSIS' | 'EXPORT' | 'SECURE_VAULT';
  examiner: string;
  timestampUtc: string;
  notes: string;
  prevHash: string;
  entryHash: string;
}

export interface MessageRecord {
  id: string;
  evidenceId: string;
  platform: 'WhatsApp' | 'SMS' | 'Signal' | 'Telegram';
  sender: string;
  recipient: string;
  timestampUtc: string;
  body: string;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'DELETED_RECOVERED';
  sourceTable: string;
  rowId: number;
  isDeletedFragment?: boolean;
}

export interface CallRecord {
  id: string;
  evidenceId: string;
  type: 'INCOMING' | 'OUTGOING' | 'MISSED' | 'VOICEMAIL';
  phoneNumber: string;
  contactName?: string;
  timestampUtc: string;
  durationSeconds: number;
  carrier?: string;
}

export interface SQLiteTableInfo {
  name: string;
  rowCount: number;
  columns: { name: string; type: string }[];
  sql: string;
  sampleRows?: Record<string, any>[];
}

export interface SQLiteArtifact {
  evidenceId: string;
  filename: string;
  pageSize: number;
  freelistCount: number;
  walPresent: boolean;
  shmPresent: boolean;
  tables: SQLiteTableInfo[];
  integrityStatus: string;
  deletedFragments: {
    pageNumber: number;
    offset: number;
    classification: 'CONFIRMED_LIVE' | 'RECOVERABLE_HISTORICAL' | 'PARTIAL_FRAGMENT';
    rawHexSnippet: string;
    interpretedData: string;
  }[];
}

export interface BrowserHistoryItem {
  id: string;
  browser: 'Chrome' | 'Firefox' | 'Safari' | 'Edge';
  url: string;
  title: string;
  visitCount: number;
  lastVisitUtc: string;
  typedCount: number;
}

export interface SystemLogItem {
  id: string;
  system: 'Windows EVTX' | 'Linux Syslog' | 'macOS Unified Log';
  eventId: string;
  level: 'CRITICAL' | 'WARNING' | 'INFO';
  timestampUtc: string;
  source: string;
  message: string;
}

export interface MediaForensicItem {
  id: string;
  evidenceId: string;
  filename: string;
  mimeType: string;
  byteSize: number;
  cameraMake?: string;
  cameraModel?: string;
  software?: string;
  softwareEditedAlert?: boolean;
  dateTimeOriginalUtc?: string;
  dateTimeDigitizedUtc?: string;
  gpsLatitude?: number;
  gpsLongitude?: number;
  gpsAltitude?: string;
  sha256: string;
  exifPresent: boolean;
  inconsistencyNotes?: string;
}

export interface TimelineEventItem {
  eventId: string;
  caseId: string;
  evidenceId: string;
  category: 'MESSAGE' | 'CALL' | 'BROWSER' | 'SYSTEM' | 'MEDIA' | 'FILESYSTEM';
  sourceArtifact: string;
  originalTimestamp: string;
  utcTimestamp: string;
  originalTz: string;
  description: string;
  confidenceScore: number; // 0 - 100
  confidenceNotes: string;
  rawRecordRef: Record<string, any>;
}

export interface CorrelationLink {
  id: string;
  entityType: 'PHONE' | 'IP_ADDRESS' | 'EMAIL' | 'FILE_HASH' | 'LOCATION';
  value: string;
  associatedArtifactsCount: number;
  evidenceIds: string[];
  supportingRecords: string[];
  investigativeNote: string;
}

export interface BatchJob {
  jobId: string;
  evidenceName: string;
  totalBytes: number;
  status: 'PENDING' | 'HASHING' | 'PARSING' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
  progressPercent: number;
  logs: string[];
}

export interface ExaminerProfile {
  name: string;
  agency: string;
  department: string;
  badgeNumber: string;
  defaultTimezone: 'UTC' | 'LOCAL';
  language: 'en' | 'ar';
  theme: 'dark' | 'light';
  autoVerifyHashes: boolean;
}
