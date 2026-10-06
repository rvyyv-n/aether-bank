import React, { useRef, useState } from 'react';

interface InlineTextProps {
  value: string;
  onCommit: (next: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  ariaLabel: string;
  /** Called after an Enter commit, e.g. to clear an "add" field. */
  clearOnCommit?: boolean;
  autoFocus?: boolean;
  /** id of a <datalist> with suggestions (single-line only). */
  list?: string;
}

/**
 * Text that reads like plain text and edits in place. Saves on blur or Enter
 * (Ctrl+Enter when multiline); Esc puts the old value back.
 */
export const InlineText: React.FC<InlineTextProps> = ({
  value,
  onCommit,
  placeholder,
  multiline = false,
  className = '',
  ariaLabel,
  clearOnCommit = false,
  autoFocus = false,
  list,
}) => {
  const [draft, setDraft] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  const cancelled = useRef(false);

  // Follow outside changes (e.g. another field saved the project)
  if (value !== lastValue) {
    setLastValue(value);
    setDraft(value);
  }

  const commit = () => {
    if (cancelled.current) {
      cancelled.current = false;
      return;
    }
    const next = multiline ? draft.replace(/\s+$/, '') : draft.trim();
    if (next !== value) onCommit(next);
    if (clearOnCommit) setDraft('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      cancelled.current = true;
      setDraft(value);
      e.currentTarget.blur();
    } else if (e.key === 'Enter' && (!multiline || e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (clearOnCommit) commit();
      else e.currentTarget.blur();
    }
  };

  const shared = {
    value: draft,
    placeholder,
    'aria-label': ariaLabel,
    autoFocus,
    onKeyDown,
    onBlur: commit,
    className: `inline-input ${className}`,
  };

  return multiline ? (
    <textarea {...shared} rows={1} onChange={(e) => setDraft(e.target.value)} />
  ) : (
    <input {...shared} type="text" list={list} onChange={(e) => setDraft(e.target.value)} />
  );
};
