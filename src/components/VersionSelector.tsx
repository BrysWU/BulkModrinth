import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { getMinecraftVersions } from '../services/modrinthApi';

interface VersionSelectorProps {
  selectedVersion: string;
  onVersionChange: (version: string) => void;
}

export default function VersionSelector({ selectedVersion, onVersionChange }: VersionSelectorProps) {
  const [versions, setVersions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadVersions = async () => {
      try {
        const versionData = await getMinecraftVersions();
        setVersions(versionData);
      } catch (error) {
        console.error('Failed to load Minecraft versions:', error);
        // Fallback to common versions
        setVersions([
          '1.20.4',
          '1.20.1',
          '1.19.4',
          '1.19.2',
          '1.18.2',
          '1.17.1',
          '1.16.5'
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadVersions();
  }, []);

  if (loading) {
    return (
      <div className="relative">
        <div className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 text-gray-400">
          Loading versions...
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <select
        value={selectedVersion}
        onChange={(e) => onVersionChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
      >
        {versions.map((version) => (
          <option key={version} value={version}>
            Minecraft {version}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
    </div>
  );
}