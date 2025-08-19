import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { EventIdea } from '../lib/api';

interface IdeaCardProps {
  idea: EventIdea;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
      <div className="space-y-2">
        <h3 className="font-semibold text-lg text-gray-900 leading-tight">
          {idea.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {idea.category}
          </span>
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {idea.cost}
          </span>
        </div>
      </div>
      
      <p className="text-sm text-gray-600 leading-relaxed">
        {idea.whyToday}
      </p>
      
      {idea.links && idea.links.length > 0 && (
        <div className="pt-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {idea.links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                {link.name}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}