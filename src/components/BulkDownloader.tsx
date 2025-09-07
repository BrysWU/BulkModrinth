import React, { useState, useEffect, useCallback } from 'react';
import { Search, Download, ArrowLeft, Filter, Grid, List, X, Check, ExternalLink, Package2, ChevronDown } from 'lucide-react';
import { searchMods, getMod, getModVersions, getMinecraftVersions, getCategories } from '../services/modrinthApi';
import type { ModrinthMod, ModrinthVersion } from '../types/modrinth';
import LoadingSpinner from './LoadingSpinner';
import ModCard from './ModCard';
import VersionModal from './VersionModal';

interface BulkDownloaderProps {
  onBack: () => void;
}

export default function BulkDownloader({ onBack }: BulkDownloaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mods, setMods] = useState<ModrinthMod[]>([]);
  const [selectedMods, setSelectedMods] = useState<Map<string, {mod: ModrinthMod, version?: ModrinthVersion}>>(new Map());
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [minecraftVersions, setMinecraftVersions] = useState<string[]>([]);
  const [selectedMinecraftVersion, setSelectedMinecraftVersion] = useState('1.20.1');
  const [categories, setCategories] = useState<Array<{id: string, name: string, icon: string}>>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState<'relevance' | 'downloads' | 'follows' | 'newest' | 'updated'>('relevance');
  const [showFilters, setShowFilters] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState<{mod: ModrinthMod, versions: ModrinthVersion[]} | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<Map<string, number>>(new Map());
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [versionsData, categoriesData] = await Promise.all([
          getMinecraftVersions(),
          getCategories()
        ]);
        setMinecraftVersions(versionsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };
    
    loadInitialData();
  }, []);

  // Load popular mods by default
  useEffect(() => {
    const loadPopularMods = async () => {
      setLoading(true);
      try {
        const results = await searchMods({
          index: 'downloads',
          versions: [selectedMinecraftVersion],
          limit: 20,
          projectType: 'mod'
        });
        setMods(results.hits);
      } catch (error) {
        console.error('Failed to load popular mods:', error);
      } finally {
        setLoading(false);
      }
    };

    if (minecraftVersions.length > 0) {
      loadPopularMods();
    }
  }, [minecraftVersions, selectedMinecraftVersion]);

  // Auto-search when parameters change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedMinecraftVersion, selectedCategory, sortBy]);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await searchMods({
        query: searchQuery,
        versions: [selectedMinecraftVersion],
        categories: selectedCategory ? [selectedCategory] : undefined,
        index: sortBy,
        limit: 20,
        projectType: 'mod'
      });
      setMods(results.hits);
    } catch (error) {
      console.error('Search failed:', error);
      setMods([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModSelect = async (mod: ModrinthMod) => {
    const newSelected = new Map(selectedMods);
    
    if (newSelected.has(mod.project_id)) {
      newSelected.delete(mod.project_id);
      setSelectedMods(newSelected);
      return;
    }

    try {
      const versions = await getModVersions(mod.project_id, {
        gameVersions: [selectedMinecraftVersion]
      });
      
      if (versions.length > 0) {
        setShowVersionModal({ mod, versions });
      }
    } catch (error) {
      console.error('Failed to fetch versions:', error);
    }
  };

  const handleVersionSelect = (mod: ModrinthMod, version: ModrinthVersion) => {
    const newSelected = new Map(selectedMods);
    newSelected.set(mod.project_id, { mod, version });
    setSelectedMods(newSelected);
    setShowVersionModal(null);
  };

  const handleDownloadIndividually = async () => {
    if (selectedMods.size === 0) return;
    
    setShowDownloadOptions(false);
    setShowDownloadModal(true);
    const progress = new Map<string, number>();
    
    for (const [modId, {mod, version}] of selectedMods) {
      if (!version) continue;
      
      try {
        progress.set(modId, 0);
        setDownloadProgress(new Map(progress));
        
        const primaryFile = version.files.find(f => f.primary) || version.files[0];
        
        if (primaryFile) {
          // Simulate download progress
          for (let i = 0; i <= 100; i += 20) {
            progress.set(modId, i);
            setDownloadProgress(new Map(progress));
            await new Promise(resolve => setTimeout(resolve, 200));
          }
          
          // Create download link
          const link = document.createElement('a');
          link.href = primaryFile.url;
          link.download = primaryFile.filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } catch (error) {
        console.error(`Failed to download ${modId}:`, error);
        progress.set(modId, -1);
        setDownloadProgress(new Map(progress));
      }
    }
  };

  const handleDownloadAsZip = async () => {
    if (selectedMods.size === 0) return;
    
    setShowDownloadOptions(false);
    
    // Create a simple ZIP-like structure by downloading all files
    // In a real implementation, you'd use a library like JSZip
    alert('ZIP download functionality would be implemented here. For now, downloading individually...');
    handleDownloadIndividually();
  };

  const selectedModsList = Array.from(selectedMods.values());

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
        <h1 className="text-3xl font-bold text-gray-900">Bulk Mod Downloader</h1>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for mods..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Minecraft Version */}
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

            {/* Category Filter */}
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort By */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="relevance">Relevance</option>
                <option value="downloads">Downloads</option>
                <option value="follows">Popularity</option>
                <option value="newest">Newest</option>
                <option value="updated">Recently Updated</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 ml-auto">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Mods Summary */}
      {selectedMods.size > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 text-white rounded-lg flex items-center justify-center font-semibold text-sm">
                {selectedMods.size}
              </div>
              <span className="text-emerald-800 font-medium">
                {selectedMods.size} mod{selectedMods.size !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="relative">
              <button
                onClick={() => setShowDownloadOptions(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download All
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showDownloadOptions && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={handleDownloadIndividually}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-t-lg transition-colors"
                  >
                    <div className="font-medium text-gray-900">Download Individually</div>
                    <div className="text-sm text-gray-500">Download each mod separately</div>
                  </button>
                  <button
                    onClick={handleDownloadAsZip}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 rounded-b-lg transition-colors border-t border-gray-100"
                  >
                    <div className="font-medium text-gray-900">Download as ZIP</div>
                    <div className="text-sm text-gray-500">Bundle all mods in one file</div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : mods.length > 0 ? (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {mods.map((mod) => (
            <ModCard
              key={mod.project_id}
              mod={mod}
              isSelected={selectedMods.has(mod.project_id)}
              onToggleSelect={() => handleModSelect(mod)}
              viewMode={viewMode}
              minecraftVersion={selectedMinecraftVersion}
            />
          ))}
        </div>
      ) : searchQuery ? (
        <div className="text-center py-12">
          <Package2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No mods found for "{searchQuery}"</p>
          <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="text-center py-12">
          <Package2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Popular Mods for {selectedMinecraftVersion}</p>
          <p className="text-gray-400 text-sm">Use the search bar to find specific mods</p>
        </div>
      )}

      {/* Version Selection Modal */}
      {showVersionModal && (
        <VersionModal
          mod={showVersionModal.mod}
          versions={showVersionModal.versions}
          onVersionSelect={(version) => handleVersionSelect(showVersionModal.mod, version)}
          onClose={() => setShowVersionModal(null)}
        />
      )}

      {/* Download Options Overlay */}
      {showDownloadOptions && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setShowDownloadOptions(false)}
        />
      )}

      {/* Download Progress Modal */}
      {showDownloadModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">Allow Multiple Downloads</h3>
                  <button
                    onClick={() => setShowDownloadModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Browser Permission Required</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Your browser may ask permission to download multiple files. Please click "Allow" when prompted 
                      to ensure all {selectedMods.size} selected mods are downloaded successfully.
                    </p>
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h5 className="font-medium text-gray-900 mb-2">Selected Mods ({selectedMods.size}):</h5>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {selectedModsList.map(({mod, version}) => (
                      <div key={mod.project_id} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={mod.icon_url || '/placeholder-mod.png'}
                            alt={mod.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm truncate">{mod.title}</p>
                          <p className="text-xs text-gray-500">{version?.version_number}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDownloadModal(false)}
                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDownloadIndividually}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                  >
                    Start Downloads
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}