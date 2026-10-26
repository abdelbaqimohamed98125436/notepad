import React, { useState } from 'react';
import { X, Send, Check, AlertCircle } from 'lucide-react';

interface GoogleChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentText: string;
  selectedText: string;
  darkMode: boolean;
}

export const GoogleChatModal: React.FC<GoogleChatModalProps> = ({
  isOpen,
  onClose,
  documentText,
  selectedText,
  darkMode,
}) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [targetScope, setTargetScope] = useState<'selection' | 'document'>(
    selectedText.trim() ? 'selection' : 'document'
  );
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const textToSend = targetScope === 'selection' ? selectedText : documentText;

  const handleSend = async () => {
    if (!webhookUrl.trim()) {
      setStatus('error');
      setMessage('Please enter a valid Google Chat incoming webhook URL.');
      return;
    }
    if (!textToSend.trim()) {
      setStatus('error');
      setMessage('Document or selection is empty.');
      return;
    }

    setStatus('sending');
    setMessage('');

    try {
      const res = await fetch('/api/google-chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: webhookUrl.trim(),
          text: `📄 **From Quiet Notepad**:\n\n${textToSend}`,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to dispatch message to Google Chat.');
      }

      setStatus('success');
      setMessage('Message successfully sent to Google Chat!');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Error communicating with Google Chat.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-2xs"
      role="dialog"
      aria-modal="true"
      aria-label="Share to Google Chat"
    >
      <div
        className={`w-full max-w-md rounded-sm border shadow-xl flex flex-col ${
          darkMode ? 'bg-[#252526] border-[#3e3e42] text-white' : 'bg-[#f0f0f0] border-[#999999] text-black'
        }`}
      >
        <div
          className={`flex items-center justify-between px-3 py-1.5 border-b select-none text-xs ${
            darkMode ? 'bg-[#1f1f1f] border-[#333333]' : 'bg-[#e5e5e5] border-[#cccccc]'
          }`}
        >
          <span className="font-semibold">Share to Google Chat</span>
          <button
            onClick={onClose}
            className="hover:bg-red-600 hover:text-white p-0.5 rounded-xs"
            aria-label="Close dialog"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="p-4 space-y-3 text-xs">
          <div>
            <label className="font-medium block mb-1">Google Chat Incoming Webhook URL:</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://chat.googleapis.com/v1/spaces/.../messages?key=..."
              className={`w-full p-1.5 border rounded-xs font-mono text-[11px] outline-none focus:border-sky-500 ${
                darkMode ? 'bg-[#1e1e1e] border-[#383838]' : 'bg-white border-[#cccccc]'
              }`}
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="font-medium">Send:</span>
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="radio"
                name="chatScope"
                checked={targetScope === 'selection'}
                disabled={!selectedText.trim()}
                onChange={() => setTargetScope('selection')}
              />
              <span>Selection ({selectedText.length} chars)</span>
            </label>
            <label className="flex items-center space-x-1 cursor-pointer">
              <input
                type="radio"
                name="chatScope"
                checked={targetScope === 'document'}
                onChange={() => setTargetScope('document')}
              />
              <span>Entire Document</span>
            </label>
          </div>

          <div className="p-2 border rounded-xs bg-black/5 dark:bg-white/5 font-mono text-[10px] max-h-24 overflow-y-auto">
            {textToSend ? textToSend.slice(0, 300) + (textToSend.length > 300 ? '...' : '') : '(Empty)'}
          </div>

          {status === 'success' && (
            <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <Check className="w-3.5 h-3.5" />
              <span>{message}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center space-x-1.5 text-red-600 dark:text-red-400 font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{message}</span>
            </div>
          )}
        </div>

        <div
          className={`flex items-center justify-end px-3 py-2 border-t space-x-2 text-xs ${
            darkMode ? 'bg-[#1f1f1f] border-[#333333]' : 'bg-[#e5e5e5] border-[#cccccc]'
          }`}
        >
          <button
            onClick={handleSend}
            disabled={status === 'sending'}
            className="px-3 py-1 rounded-xs bg-sky-600 text-white font-medium hover:bg-sky-700 disabled:opacity-50"
          >
            {status === 'sending' ? 'Sending...' : 'Send to Space'}
          </button>
          <button
            onClick={onClose}
            className={`px-3 py-1 rounded-xs border font-medium ${
              darkMode ? 'bg-[#333333] border-[#444444] hover:bg-[#444444]' : 'bg-white border-[#999999] hover:bg-gray-100'
            }`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
