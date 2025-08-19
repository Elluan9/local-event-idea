import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mx-4 my-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-red-800 leading-relaxed">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-800 transition-colors duration-200"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}