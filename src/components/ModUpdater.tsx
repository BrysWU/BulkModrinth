import React, { useState, useCallback, useEffect } from 'react';
import { Upload, ArrowLeft, FileText, Download, AlertCircle, CheckCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { analyzeModFile, getModVersions, getMinecraftVersions } from '../services/modrinthApi';
import LoadingSpinner from './LoadingSpinner';

interface ModUpdaterProps {
  onBack: () => void;
}

interface AnalyzedMod {
  filename: string;
  projectId?: string;
  currentVersion?: string;
  latestVersion?: string;
  updateAvailable: boolean;
  downloadUrl?: string;
  compatibleVersions?: string[];
}

export default function ModUpdater({ onBack }: ModUpdaterProps) {
  const [dragActive, setDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzedMods, setAnalyzedMods] = useState<AnalyzedMod[]>([]);
  const [minecraftVersions, setMinecraftVersions] = useState<string[]>([]);
  const [selectedMinecraftVersion, setSelectedMinecraftVersion] = useState('1.20.1');

  useEffect(() => {
    const loadVersions = async () => {
      try {
        const versions = await getMinecraftVersions();
        setMinecraftVersions(versions);
      } catch (error) {
        console.error('Failed to load Minecraft versions:', error);
        // Fallback versions
        setMinecraftVersions([
          '1.20.4',
          '1.20.1',
          '1.19.4',
          '1.19.2',
          '1.18.2',
          '1.17.1',
          '1.16.5'
        ]);
      }
    };

    loadVersions();
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const items = Array.from(e.dataTransfer.items);
    const files: File[] = [];
    
    items.forEach(item => {
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file && file.name.endsWith('.jar')) {
          files.push(file);
        }
      }
    });
    
    if (files.length > 0) {
      analyzeFiles(files);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const jarFiles = files.filter(file => file.name.endsWith('.jar'));
    
    if (jarFiles.length > 0) {
      analyzeFiles(jarFiles);
    }
  };

  const analyzeFiles = async (files: File[]) => {
    setAnalyzing(true);
    const results: AnalyzedMod[] = [];
    
    for (const file of files) {
      try {
        // Simulate mod analysis with more realistic data
        const hasUpdate = Math.random() > 0.3;
        const modInfo: AnalyzedMod = {
          filename: file.name,
          updateAvailable: hasUpdate,
          currentVersion: hasUpdate ? '1.0.0' : '1.2.0',
          latestVersion: hasUpdate ? '1.2.0' : '1.2.0',
          compatibleVersions: [selectedMinecraftVersion, '1.19.4', '1.18.2']
        };
        
        results.push(modInfo);
        
        // Add some delay to simulate processing
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to analyze ${file.name}:`, error);
        results.push({
          filename: file.name,
          updateAvailable: false
        });
      }
    }
    
    setAnalyzedMods(results);
    setAnalyzing(false);
  };

  const handleBulkUpdate = async () => {
    const updatableMods = analyzedMods.filter(mod => mod.updateAvailable);
    
    for (const mod of updatableMods) {
      try {
        // Simulate download
        const link = document.createElement('a');
        link.href = `#download-${mod.filename}`;
        link.download = mod.filename.replace(/\.jar$/, `-${mod.latestVersion}.jar`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error(`Failed to update ${mod.filename}:`, error);
      }
    }
  };

  const updatableMods = analyzedMods.filter(mod => mod.updateAvailable);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Modpack Updater</h1>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
            dragActive 
              ? 'border-emerald-400 bg-emerald-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="max-w-sm mx-auto">
            <Upload className={`w-12 h-12 mx-auto mb-4 ${
              dragActive ? 'text-emerald-600' : 'text-gray-400'
            }`} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Upload Your Mod Files
            </h3>
            <p className="text-gray-500 mb-6">
              Drop your .jar mod files here or click to browse
            </p>
            <input
              type="file"
              multiple
              accept=".jar"
              onChange={handleFileInput}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer transition-colors"
            >
              <FileText className="w-5 h-5" />
              Choose Files
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-200">
          <label className="text-sm font-medium text-gray-700">
            Target Minecraft Version:
          </label>
          <div className="relative">
            <select
              value={selectedMinecraftVersion}
              onChange={(e) => setSelectedMinecraftVersion(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {minecraftVersions.map((version) => (
                <option key={version} value={version}>
                  {version}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analyzing ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="text-gray-600 mt-4">Analyzing mod files and checking for updates...</p>
          </div>
        </div>
      ) : analyzedMods.length > 0 ? (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{analyzedMods.length}</p>
                <p className="text-sm text-gray-500">Total Mods Analyzed</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{analyzedMods.length - updatableMods.length}</p>
                <p className="text-sm text-gray-500">Up to Date</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <RefreshCw className="w-6 h-6" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{updatableMods.length}</p>
                <p className="text-sm text-gray-500">Updates Available</p>
              </div>
            </div>
            
            {updatableMods.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={handleBulkUpdate}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Download className="w-5 h-5" />
                  Download All Updates ({updatableMods.length})
                </button>
              </div>
            )}
          </div>

          {/* Mod List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Mod Analysis Results</h3>
              <p className="text-sm text-gray-500 mt-1">
                Checking compatibility with Minecraft {selectedMinecraftVersion}
              </p>
            </div>
            
            <div className="divide-y divide-gray-200">
              {analyzedMods.map((mod, index) => (
                <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        mod.updateAvailable 
                          ? 'bg-orange-100 text-orange-600' 
                          : 'bg-emerald-100 text-emerald-600'
                      }`}>
                        {mod.updateAvailable ? (
                          <RefreshCw className="w-5 h-5" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{mod.filename}</h4>
                        <div className="text-sm text-gray-500">
                          {mod.updateAvailable ? (
                            <div>
                              <p>Update available: {mod.currentVersion} → {mod.latestVersion}</p>
                              {mod.compatibleVersions && (
                                <p className="text-xs">
                                  Compatible with: {mod.compatibleVersions.join(', ')}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div>
                              <p>Up to date ({mod.currentVersion})</p>
                              {mod.compatibleVersions && (
                                <p className="text-xs">
                                  Compatible with: {mod.compatibleVersions.join(', ')}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {mod.updateAvailable && (
                      <button className="flex items-center gap-2 px-4 py-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors">
                        <Download className="w-4 h-4" />
                        Update
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}