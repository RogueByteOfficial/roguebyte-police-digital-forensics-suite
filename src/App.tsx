/**
 * RogueByte Police Digital Forensics Suite (RBP-DFS) v1.0.4
 * Subtitle: Law Enforcement Digital Evidence Analysis Platform
 * Developer / Author: SidoDev-Dz
 * Organization / Brand: RogueByte
 * 
 * Main Application Orchestrator & View Switcher
 */

import React, { useState, useEffect } from 'react';
import { ModuleId, CaseData, ExaminerProfile, EvidenceItem, CustodyRecord } from './types/forensics';
import {
  syntheticCase,
  syntheticEvidence,
  syntheticCustody,
  syntheticMessages,
  syntheticCalls,
  syntheticSQLiteArtifact,
  syntheticBrowserHistory,
  syntheticSystemLogs,
  syntheticMediaForensics,
  syntheticTimeline,
  syntheticCorrelations,
  syntheticBatchJobs,
} from './data/syntheticCase';
import { TopBar } from './components/TopBar';
import { Navigation } from './components/Navigation';

// Modular view components
import { CaseManagementView } from './components/modules/CaseManagementView';
import { EvidenceIntakeView } from './components/modules/EvidenceIntakeView';
import { IntegrityVerificationView } from './components/modules/IntegrityVerificationView';
import { MobileBackupView } from './components/modules/MobileBackupView';
import { MessagesCallView } from './components/modules/MessagesCallView';
import { SQLiteAnalyzerView } from './components/modules/SQLiteAnalyzerView';
import { FileSystemView } from './components/modules/FileSystemView';
import { MediaForensicsView } from './components/modules/MediaForensicsView';
import { TimelineView } from './components/modules/TimelineView';
import { CorrelationView } from './components/modules/CorrelationView';
import { AIReviewView } from './components/modules/AIReviewView';
import { CustodyLedgerView } from './components/modules/CustodyLedgerView';
import { ReportGeneratorView } from './components/modules/ReportGeneratorView';
import { BatchProcessingView } from './components/modules/BatchProcessingView';
import { ValidationCenterView } from './components/modules/ValidationCenterView';
import { SettingsAboutView } from './components/modules/SettingsAboutView';
import { ForensicTerminalModal } from './components/ForensicTerminalModal';

export default function App() {
  const [currentModule, setCurrentModule] = useState<ModuleId>('01');
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  // Case & Forensic State
  const [currentCase, setCurrentCase] = useState<CaseData>(syntheticCase);
  const [evidenceList, setEvidenceList] = useState<EvidenceItem[]>(syntheticEvidence);
  const [custodyEntries, setCustodyEntries] = useState<CustodyRecord[]>(syntheticCustody);
  const [hasSyntheticLoaded, setHasSyntheticLoaded] = useState(true);

  // Examiner Profile
  const [examiner, setExaminer] = useState<ExaminerProfile>({
    name: 'Special Agent SidoDev-Dz',
    agency: 'RogueByte Police Forensics Division',
    department: 'High-Tech Crimes & Counter-Cyber Unit',
    badgeNumber: 'DZ-8819',
    defaultTimezone: 'UTC',
    language: 'en',
    theme: 'dark',
    autoVerifyHashes: true,
  });

  // Sync RTL and language attribute on document root
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  // Global Keyboard Navigation Shortcuts (Alt+1 .. Alt+9, Ctrl+K, Ctrl+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Hotkey Alt+1 to Alt+9
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        const keyNum = parseInt(e.key, 10);
        if (!isNaN(keyNum) && keyNum >= 1 && keyNum <= 9) {
          e.preventDefault();
          setCurrentModule(`0${keyNum}` as ModuleId);
        }
      }
      // Ctrl+K for Global Search
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCurrentModule('13');
      }
      // Ctrl+P for Print Docket
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        // Allow standard print or route to report generator
        setCurrentModule('16');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleLang = () => {
    setLang((prev) => (prev === 'en' ? 'ar' : 'en'));
  };

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLoadSyntheticCase = () => {
    setCurrentCase(syntheticCase);
    setEvidenceList(syntheticEvidence);
    setCustodyEntries(syntheticCustody);
    setHasSyntheticLoaded(true);
  };

  const handleNewCase = () => {
    const randomId = `RBP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCaseItem: CaseData = {
      caseId: randomId,
      title: 'New Digital Evidence Examination Docket',
      investigator: examiner.name,
      agency: examiner.agency,
      department: examiner.department,
      badgeNumber: examiner.badgeNumber,
      description: 'Newly registered forensic case awaiting evidence acquisition.',
      status: 'OPEN',
      tags: ['New-Intake'],
      createdAtUtc: new Date().toISOString(),
      authorizationRef: 'Warrant Pending',
    };
    setCurrentCase(newCaseItem);
    setEvidenceList([]);
    setCustodyEntries([]);
    setHasSyntheticLoaded(false);
    setCurrentModule('01');
  };

  const handleFlushSession = () => {
    if (window.confirm('Confirm safe session exit and memory cache flush? All unsaved working buffers will be safely cleared.')) {
      handleLoadSyntheticCase();
      setCurrentModule('01');
    }
  };

  const handleAddEvidence = (item: EvidenceItem) => {
    setEvidenceList((prev) => [item, ...prev]);

    // Append custody record
    const lastRec = custodyEntries[custodyEntries.length - 1];
    const prevHash = lastRec ? lastRec.entryHash : '0000000000000000000000000000000000000000000000000000000000000000';
    const newCustody: CustodyRecord = {
      eventId: `COC-2026-${String(custodyEntries.length + 1).padStart(4, '0')}`,
      caseId: currentCase.caseId,
      evidenceId: item.evidenceId,
      action: 'INTAKE',
      examiner: examiner.name,
      timestampUtc: new Date().toISOString(),
      notes: `Registered evidence ${item.filename} (SHA-256: ${item.sha256.substring(0, 16)}...).`,
      prevHash,
      entryHash: item.sha256,
    };
    setCustodyEntries((prev) => [...prev, newCustody]);
  };

  const handleAddCustody = (entry: CustodyRecord) => {
    setCustodyEntries((prev) => [...prev, entry]);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Top Application Bar */}
      <TopBar
        currentCase={currentCase}
        examiner={examiner}
        lang={lang}
        onToggleLang={handleToggleLang}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onLoadSynthetic={handleLoadSyntheticCase}
        onNewCase={handleNewCase}
        onPrint={() => {
          setCurrentModule('16');
          setTimeout(() => window.print(), 100);
        }}
        onOpenTerminal={() => setIsTerminalOpen(true)}
        hasSyntheticLoaded={hasSyntheticLoaded}
      />

      {/* Main Forensic Workstation Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Numbered Navigation Sidebar [01-20] */}
        <Navigation
          currentModule={currentModule}
          onSelectModule={setCurrentModule}
          lang={lang}
          counts={{
            evidence: evidenceList.length,
            messages: syntheticMessages.length,
            timeline: syntheticTimeline.length,
            custody: custodyEntries.length,
            correlations: syntheticCorrelations.length,
          }}
        />

        {/* Viewport Content Panel */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-950/40">
          <div className="max-w-7xl mx-auto">
            {currentModule === '01' && (
              <CaseManagementView
                currentCase={currentCase}
                onUpdateCase={setCurrentCase}
                onNewCase={handleNewCase}
                lang={lang}
              />
            )}

            {currentModule === '02' && (
              <EvidenceIntakeView
                evidenceList={evidenceList}
                onAddEvidence={handleAddEvidence}
                lang={lang}
              />
            )}

            {currentModule === '03' && (
              <IntegrityVerificationView
                evidenceList={evidenceList}
                lang={lang}
              />
            )}

            {currentModule === '04' && (
              <MobileBackupView lang={lang} />
            )}

            {currentModule === '05' && (
              <MessagesCallView
                messages={syntheticMessages}
                calls={syntheticCalls}
                lang={lang}
              />
            )}

            {(currentModule === '06' || currentModule === '07') && (
              <SQLiteAnalyzerView
                sqliteData={syntheticSQLiteArtifact}
                lang={lang}
              />
            )}

            {(currentModule === '08' || currentModule === '09') && (
              <FileSystemView
                evidenceList={evidenceList}
                browserHistory={syntheticBrowserHistory}
                systemLogs={syntheticSystemLogs}
                lang={lang}
              />
            )}

            {currentModule === '10' && (
              <MediaForensicsView
                mediaItems={syntheticMediaForensics}
                lang={lang}
              />
            )}

            {currentModule === '11' && (
              <TimelineView
                timelineEvents={syntheticTimeline}
                lang={lang}
              />
            )}

            {(currentModule === '12' || currentModule === '13') && (
              <CorrelationView
                correlations={syntheticCorrelations}
                evidenceList={evidenceList}
                messages={syntheticMessages}
                browserHistory={syntheticBrowserHistory}
                systemLogs={syntheticSystemLogs}
                lang={lang}
              />
            )}

            {currentModule === '14' && (
              <AIReviewView
                timelineEvents={syntheticTimeline}
                evidenceList={evidenceList}
                caseId={currentCase.caseId}
                lang={lang}
              />
            )}

            {currentModule === '15' && (
              <CustodyLedgerView
                custodyEntries={custodyEntries}
                onAddEntry={handleAddCustody}
                lang={lang}
              />
            )}

            {currentModule === '16' && (
              <ReportGeneratorView
                currentCase={currentCase}
                evidenceList={evidenceList}
                custodyEntries={custodyEntries}
                timelineEvents={syntheticTimeline}
                lang={lang}
              />
            )}

            {currentModule === '17' && (
              <BatchProcessingView
                batchJobs={syntheticBatchJobs}
                lang={lang}
              />
            )}

            {currentModule === '18' && (
              <ValidationCenterView lang={lang} />
            )}

            {(currentModule === '19' || currentModule === '20') && (
              <SettingsAboutView
                examiner={examiner}
                onUpdateExaminer={setExaminer}
                lang={lang}
                onToggleLang={handleToggleLang}
                onFlushSession={handleFlushSession}
              />
            )}
          </div>
        </main>
      </div>

      {/* Interactive Tactical Forensic Terminal Console */}
      <ForensicTerminalModal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
        currentCase={currentCase}
        evidenceList={evidenceList}
        custodyEntries={custodyEntries}
        messages={syntheticMessages}
        timelineEvents={syntheticTimeline}
        lang={lang}
      />
    </div>
  );
}
