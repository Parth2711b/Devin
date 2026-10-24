import React, { useState } from 'react';
import {
  GitCommit,
  Terminal,
  FolderTree,
  FileCode,
  Copy,
  CheckCheck,
  Globe,
  ExternalLink,
  RotateCw,
  Smartphone,
  Tablet,
  Monitor,
  Lock,
} from 'lucide-react';
import type { FileChange, Message } from '../api/client';

interface WorkspacePanelProps {
  fileChanges: FileChange[];
  messages: Message[];
  sessionId: string;
}

export const WorkspacePanel: React.FC<WorkspacePanelProps> = ({
  fileChanges,
  messages,
  sessionId,
}) => {
  const [activeTab, setActiveTab] = useState<'diff' | 'terminal' | 'preview' | 'files'>('preview');
  const [selectedFileChange, setSelectedFileChange] = useState<FileChange | null>(null);
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(Date.now());
  const [viewportMode, setViewportMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  // Default to first file change if none selected
  const activeChange = selectedFileChange || fileChanges[fileChanges.length - 1] || null;

  // Extract commands run by agent from message traces
  const commandTraces: Array<{
    command: string;
    stdout?: string;
    stderr?: string;
    exitCode?: number;
    time: string;
  }> = [];

  messages.forEach((msg) => {
    if (msg.rawTrace?.toolCalls) {
      msg.rawTrace.toolCalls.forEach((call: any, idx: number) => {
        if (call.toolName === 'run_command' && call.args?.command) {
          const result = msg.rawTrace?.toolResults?.[idx]?.result;
          commandTraces.push({
            command: call.args.command,
            stdout: result?.stdout,
            stderr: result?.stderr,
            exitCode: result?.exitCode ?? 0,
            time: new Date(msg.createdAt).toLocaleTimeString(),
          });
        }
      });
    }
  });

  const handleCopyDiff = () => {
    if (activeChange?.diff) {
      navigator.clipboard.writeText(activeChange.diff);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReloadPreview = () => {
    setPreviewKey(Date.now());
  };

  const previewUrl = sessionId
    ? `http://localhost:3000/sessions/${sessionId}/sandbox/preview/index.html`
    : '';

  const renderDiffLine = (line: string, index: number) => {
    let lineClass = 'diff-line-normal';
    if (line.startsWith('+') && !line.startsWith('+++')) {
      lineClass = 'diff-line-add';
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      lineClass = 'diff-line-del';
    } else if (line.startsWith('@@') || line.startsWith('Index:') || line.startsWith('===')) {
      lineClass = 'diff-line-meta';
    }

    return (
      <div key={index} className={`diff-line ${lineClass}`}>
        <span className="diff-line-number">{index + 1}</span>
        <span className="diff-line-content">{line || ' '}</span>
      </div>
    );
  };

  return (
    <div className="workspace-panel">
      {/* Workspace Tabs Header */}
      <div className="workspace-tabs-header">
        <button
          className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
          onClick={() => setActiveTab('preview')}
        >
          <Globe size={15} className="text-emerald" />
          <span>Live Preview</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'diff' ? 'active' : ''}`}
          onClick={() => setActiveTab('diff')}
        >
          <GitCommit size={15} />
          <span>Code Changes</span>
          {fileChanges.length > 0 && <span className="tab-counter">{fileChanges.length}</span>}
        </button>

        <button
          className={`tab-btn ${activeTab === 'terminal' ? 'active' : ''}`}
          onClick={() => setActiveTab('terminal')}
        >
          <Terminal size={15} />
          <span>Terminal</span>
          {commandTraces.length > 0 && <span className="tab-counter">{commandTraces.length}</span>}
        </button>

        <button
          className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          <FolderTree size={15} />
          <span>Workspace Files</span>
        </button>
      </div>

      {/* Tab Content: Live Browser Preview */}
      {activeTab === 'preview' && (
        <div className="tab-content preview-tab-content">
          <div className="browser-mockup">
            {/* Browser Window Address Bar */}
            <div className="browser-address-bar">
              <div className="browser-nav-buttons">
                <button
                  className="browser-btn"
                  onClick={handleReloadPreview}
                  title="Reload Live Preview"
                >
                  <RotateCw size={13} />
                </button>
              </div>

              <div className="browser-url-input">
                <Lock size={12} className="url-lock-icon" />
                <span className="url-protocol">http://</span>
                <span className="url-domain">sandbox.local</span>
                <span className="url-path">/index.html</span>
              </div>

              <div className="browser-viewport-toggles">
                <button
                  className={`viewport-btn ${viewportMode === 'desktop' ? 'active' : ''}`}
                  onClick={() => setViewportMode('desktop')}
                  title="Desktop View (100%)"
                >
                  <Monitor size={14} />
                </button>
                <button
                  className={`viewport-btn ${viewportMode === 'tablet' ? 'active' : ''}`}
                  onClick={() => setViewportMode('tablet')}
                  title="Tablet View (768px)"
                >
                  <Tablet size={14} />
                </button>
                <button
                  className={`viewport-btn ${viewportMode === 'mobile' ? 'active' : ''}`}
                  onClick={() => setViewportMode('mobile')}
                  title="Mobile View (375px)"
                >
                  <Smartphone size={14} />
                </button>

                {previewUrl && (
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="browser-btn btn-external"
                    title="Open in new browser tab"
                  >
                    <ExternalLink size={13} />
                  </a>
                )}
              </div>
            </div>

            {/* Iframe Viewport Area */}
            <div className={`browser-viewport-container viewport-${viewportMode}`}>
              {sessionId ? (
                <iframe
                  key={previewKey}
                  src={previewUrl}
                  title="Live Sandbox Preview"
                  className="preview-iframe"
                  sandbox="allow-scripts allow-forms allow-same-origin allow-modals"
                />
              ) : (
                <div className="tab-empty-state">
                  <Globe size={36} className="empty-tab-icon" />
                  <h4>No active session</h4>
                  <p>Start a session to preview live web applications.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Code Diff */}
      {activeTab === 'diff' && (
        <div className="tab-content diff-tab-content">
          {fileChanges.length === 0 ? (
            <div className="tab-empty-state">
              <FileCode size={36} className="empty-tab-icon" />
              <h4>No file changes yet</h4>
              <p>When Devin edits or creates code in the sandbox, diffs will appear here in real-time.</p>
            </div>
          ) : (
            <div className="diff-split-view">
              {/* Files sidebar list */}
              <div className="diff-files-sidebar">
                <div className="sidebar-header">
                  <span>Modified Files</span>
                  <span className="files-count">{fileChanges.length} files</span>
                </div>
                <div className="files-scroll-list">
                  {fileChanges.map((change) => {
                    const isSelected = activeChange?.id === change.id;
                    return (
                      <button
                        key={change.id}
                        className={`file-list-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedFileChange(change)}
                      >
                        <FileCode size={14} className="file-icon" />
                        <span className="file-path">{change.filePath}</span>
                        <span className="status-tag committed">Committed</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Diff Viewer */}
              <div className="diff-viewer">
                {activeChange ? (
                  <>
                    <div className="diff-viewer-header">
                      <div className="diff-file-title">
                        <FileCode size={15} />
                        <span className="font-mono">{activeChange.filePath}</span>
                        <span className="status-tag committed">{activeChange.status}</span>
                      </div>
                      <button className="btn-copy-diff" onClick={handleCopyDiff} title="Copy Diff">
                        {copied ? <CheckCheck size={14} className="text-emerald" /> : <Copy size={14} />}
                        <span>{copied ? 'Copied!' : 'Copy Diff'}</span>
                      </button>
                    </div>

                    <div className="diff-body font-mono">
                      {activeChange.diff.split('\n').map((line, idx) => renderDiffLine(line, idx))}
                    </div>
                  </>
                ) : (
                  <div className="tab-empty-state">
                    <p>Select a file to inspect diff</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Content: Terminal Console */}
      {activeTab === 'terminal' && (
        <div className="tab-content terminal-tab-content font-mono">
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="term-dot dot-red"></span>
              <span className="term-dot dot-yellow"></span>
              <span className="term-dot dot-green"></span>
            </div>
            <span className="terminal-title">Devin Sandbox Console — bash</span>
          </div>

          <div className="terminal-output-body">
            {commandTraces.length === 0 ? (
              <div className="terminal-empty">
                <span className="term-prompt">$</span>
                <span className="term-dim">Terminal ready. Waiting for Devin to run sandbox commands...</span>
              </div>
            ) : (
              commandTraces.map((cmd, idx) => (
                <div key={idx} className="terminal-command-entry">
                  <div className="term-cmd-header">
                    <div className="cmd-left">
                      <span className="term-prompt">$</span>
                      <span className="term-cmd-text">{cmd.command}</span>
                    </div>
                    <div className="cmd-right">
                      <span className={`exit-badge ${cmd.exitCode === 0 ? 'exit-ok' : 'exit-fail'}`}>
                        exit {cmd.exitCode}
                      </span>
                      <span className="cmd-timestamp">{cmd.time}</span>
                    </div>
                  </div>

                  {cmd.stdout && <pre className="term-stdout">{cmd.stdout}</pre>}
                  {cmd.stderr && <pre className="term-stderr">{cmd.stderr}</pre>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab Content: Workspace Files */}
      {activeTab === 'files' && (
        <div className="tab-content files-tab-content">
          <div className="files-tree-container">
            <div className="files-tree-header">
              <FolderTree size={16} />
              <span>Project Sandbox: /workspaces/{sessionId?.slice(0, 8)}...</span>
            </div>

            <div className="files-tree-list">
              {fileChanges.length === 0 ? (
                <div className="tab-empty-state">
                  <FolderTree size={36} className="empty-tab-icon" />
                  <h4>Sandbox workspace empty</h4>
                  <p>Send a prompt to Devin to create and manage project files.</p>
                </div>
              ) : (
                Array.from(new Set(fileChanges.map((f) => f.filePath))).map((path, idx) => (
                  <div key={idx} className="tree-file-node">
                    <FileCode size={16} className="tree-icon" />
                    <span className="tree-name font-mono">{path}</span>
                    <span className="tree-meta">Created in sandbox</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
