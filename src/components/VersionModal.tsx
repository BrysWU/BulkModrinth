import React from 'react';
import { X, Download, Calendar, Tag, Shield } from 'lucide-react';
import type { ModrinthMod, ModrinthVersion } from '../types/modrinth';

interface VersionModalProps {
  mod: ModrinthMod;
  versions: ModrinthVersion[];
  onVersionSelect: (version: ModrinthVersion) => void;
  onClose: () => void;
}

export default function VersionModal({ mod, versions, onVersionSelect, onClose }: VersionModalProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getVersionTypeColor = (type: string) => {
    switch (type) {
      case 'release': return 'bg-green-100 text-green-800';
      case 'beta': return 'bg-yellow-100 text-yellow-800';
      case 'alpha': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={mod.icon_url || '/placeholder-mod.png'}
                  alt={mod.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{mod.title}</h3>
                <p className="text-sm text-gray-500">Select a version to download</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Versions List */}
        <div className="overflow-y-auto max-h-96">
          {versions.map((version) => {
            const primaryFile = version.files.find(f => f.primary) || version.files[0];
            
            return (
              <div
                key={version.id}
                className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onVersionSelect(version)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{version.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getVersionTypeColor(version.version_type)}`}>
                        {version.version_type}
                      </span>
                      {version.featured && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Featured
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                      <span className="flex items-center gap-1">
                        <Tag className="w-4 h-4" />
                        {version.version_number}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(version.date_published)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        {version.downloads.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>Minecraft: {version.game_versions.join(', ')}</span>
                      <span>Loaders: {version.loaders.join(', ')}</span>
                      {primaryFile && (
                        <span>{formatFileSize(primaryFile.size)}</span>
                      )}
                    </div>

                    {version.changelog && (
                      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                        {version.changelog}
                      </p>
                    )}
                  </div>
                  
                  <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors">
                    <Download className="w-4 h-4" />
                    Select
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {versions.length === 0 && (
          <div className="p-12 text-center">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No versions available for the selected Minecraft version</p>
          </div>
        )}
      </div>
    </div>
  );
}