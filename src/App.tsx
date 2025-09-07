import React, { useState } from 'react';
import { Download, Upload, Search, Package, ArrowRight, Github, ExternalLink } from 'lucide-react';
import Header from './components/Header';
import BulkDownloader from './components/BulkDownloader';
import ModUpdater from './components/ModUpdater';

export type AppMode = 'home' | 'bulk-download' | 'mod-updater';

function App() {
  const [currentMode, setCurrentMode] = useState<AppMode>('home');

  const renderContent = () => {
    switch (currentMode) {
      case 'bulk-download':
        return <BulkDownloader onBack={() => setCurrentMode('home')} />;
      case 'mod-updater':
        return <ModUpdater onBack={() => setCurrentMode('home')} />;
      default:
        return <HomePage onModeSelect={setCurrentMode} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      {renderContent()}
    </div>
  );
}

function HomePage({ onModeSelect }: { onModeSelect: (mode: AppMode) => void }) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl mb-8">
          <Package className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Modrinth Bulk Manager
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Download multiple mods at once or update your existing modpack with the latest versions. 
          Powered by the Modrinth API for reliable and fast mod management.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <ModeCard
          icon={Download}
          title="Bulk Mod Downloader"
          description="Search and select multiple mods to download all at once. Perfect for building new modpacks or adding multiple mods to your collection."
          features={[
            "Search Modrinth's extensive mod database",
            "Multi-select interface for bulk operations",
            "Version filtering by Minecraft version",
            "Progress tracking for large downloads"
          ]}
          onClick={() => onModeSelect('bulk-download')}
          gradient="from-blue-500 to-indigo-600"
        />
        
        <ModeCard
          icon={Upload}
          title="Modpack Updater"
          description="Upload your mods folder to check for available updates. Keep your modpack current with the latest mod versions."
          features={[
            "Analyze existing mod files",
            "Detect available updates automatically",
            "Version compatibility checking",
            "Bulk update recommendations"
          ]}
          onClick={() => onModeSelect('mod-updater')}
          gradient="from-emerald-500 to-green-600"
        />
      </div>

      <div className="mt-16 text-center">
        <div className="inline-flex items-center gap-2 text-gray-500 text-sm">
          <span>Powered by</span>
          <a 
            href="https://modrinth.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            Modrinth API
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}

interface ModeCardProps {
  icon: React.ElementType;
  title: string;
  description: string;
  features: string[];
  onClick: () => void;
  gradient: string;
}

function ModeCard({ icon: Icon, title, description, features, onClick, gradient }: ModeCardProps) {
  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-gray-200 p-8 hover:shadow-xl transition-all duration-300 cursor-pointer"
         onClick={onClick}>
      <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${gradient} rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-8 h-8 text-white" />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-gray-700 transition-colors">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6 leading-relaxed">
        {description}
      </p>
      
      <ul className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
      
      <div className="flex items-center text-emerald-600 font-semibold group-hover:text-emerald-700 transition-colors">
        Get Started
        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}

export default App;