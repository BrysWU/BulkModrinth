import React from 'react';
import { Download, ExternalLink, Users, Calendar, Check, Plus } from 'lucide-react';
import type { ModrinthMod } from '../types/modrinth';

interface ModCardProps {
  mod: ModrinthMod;
  isSelected: boolean;
  onToggleSelect: () => void;
  viewMode: 'grid' | 'list';
  minecraftVersion: string;
}

export default function ModCard({ mod, isSelected, onToggleSelect, viewMode, minecraftVersion }: ModCardProps) {
  const formatNumber = (num: number) => {
    if (num == null || typeof num !== 'number' || isNaN(num)) {
      return '0';
    }
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (viewMode === 'list') {
    return (
      <div className={`bg-white rounded-xl border-2 transition-all duration-200 p-4 hover:shadow-md ${
        isSelected ? 'border-emerald-500 shadow-lg' : 'border-gray-200'
      }`}>
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleSelect}
            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
              isSelected 
                ? 'bg-emerald-500 border-emerald-500 text-white' 
                : 'border-gray-300 hover:border-emerald-400'
            }`}
          >
            {isSelected && <Check className="w-4 h-4" />}
          </button>
          
          <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={mod.icon_url || '/placeholder-mod.png'}
              alt={mod.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{mod.title}</h3>
            <p className="text-sm text-gray-600 truncate">{mod.description}</p>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Download className="w-3 h-3" />
                {formatNumber(mod.downloads)}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {formatNumber(mod.followers)}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(mod.date_modified)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <a
              href={`https://modrinth.com/mod/${mod.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
      isSelected ? 'border-emerald-500 shadow-lg' : 'border-gray-200'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
            <img
              src={mod.icon_url || '/placeholder-mod.png'}
              alt={mod.title}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={onToggleSelect}
            className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-colors ${
              isSelected 
                ? 'bg-emerald-500 border-emerald-500 text-white' 
                : 'border-gray-300 hover:border-emerald-400 hover:bg-emerald-50'
            }`}
          >
            {isSelected ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
          </button>
        </div>
        
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{mod.title}</h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{mod.description}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Download className="w-3 h-3" />
              {formatNumber(mod.downloads)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {formatNumber(mod.followers)}
            </span>
          </div>
          <span className="text-emerald-600 font-medium">
            {minecraftVersion}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <a
            href={`https://modrinth.com/mod/${mod.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-600 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View on Modrinth
          </a>
        </div>
      </div>
    </div>
  );
}