'use client';

import React, { useState } from 'react';
import { useDocumentInfo } from '@payloadcms/ui';

import { updateTransactionDetails } from '../actions';

export const UpdateDetailsButton: React.FC = () => {
  const { id } = useDocumentInfo();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUpdate = async () => {
    if (!id) return;

    setIsLoading(true);
    setMessage(null);

    const result = await updateTransactionDetails(id as string);

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Details updated!' });
      // Refresh the page to show updated data
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } else {
      setMessage({ type: 'error', text: result.error.message });
    }

    setIsLoading(false);
  };

  return (
    <div style={{ marginBottom: '1rem' }}>
      <button
        type="button"
        onClick={handleUpdate}
        disabled={isLoading}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: isLoading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: isLoading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
        }}
      >
        {isLoading ? 'Updating...' : 'Update Payment Details from Vipps'}
      </button>
      {message && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            borderRadius: '4px',
            fontSize: '14px',
            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
            color: message.type === 'success' ? '#155724' : '#721c24',
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};
