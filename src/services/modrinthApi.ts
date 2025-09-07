import type { ModrinthSearchResponse, ModrinthMod, ModrinthVersion, SearchParams } from '../types/modrinth';

const BASE_URL = 'https://api.modrinth.com/v2';

export async function searchMods(params: SearchParams): Promise<ModrinthSearchResponse> {
  const url = new URL(`${BASE_URL}/search`);
  
  if (params.query) url.searchParams.set('query', params.query);
  if (params.limit) url.searchParams.set('limit', params.limit.toString());
  if (params.offset) url.searchParams.set('offset', params.offset.toString());
  if (params.index) url.searchParams.set('index', params.index);
  
  // Build facets array for filtering
  const facets: string[][] = [];
  
  if (params.categories && params.categories.length > 0) {
    facets.push([`categories:${params.categories.join('","categories:')}`]);
  }
  
  if (params.versions && params.versions.length > 0) {
    facets.push([`versions:${params.versions.join('","versions:')}`]);
  }
  
  if (params.projectType) {
    facets.push([`project_type:${params.projectType}`]);
  }
  
  if (facets.length > 0) {
    url.searchParams.set('facets', JSON.stringify(facets));
  }

  console.log('Searching with URL:', url.toString());
  
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getMod(projectId: string): Promise<ModrinthMod> {
  const response = await fetch(`${BASE_URL}/project/${projectId}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch mod: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getModVersions(
  projectId: string, 
  filters?: {
    gameVersions?: string[];
    loaders?: string[];
    featured?: boolean;
  }
): Promise<ModrinthVersion[]> {
  const url = new URL(`${BASE_URL}/project/${projectId}/version`);
  
  if (filters?.gameVersions && filters.gameVersions.length > 0) {
    url.searchParams.set('game_versions', JSON.stringify(filters.gameVersions));
  }
  if (filters?.loaders && filters.loaders.length > 0) {
    url.searchParams.set('loaders', JSON.stringify(filters.loaders));
  }
  if (filters?.featured !== undefined) {
    url.searchParams.set('featured', filters.featured.toString());
  }

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Failed to fetch versions: ${response.statusText}`);
  }
  
  return response.json();
}

export async function getMinecraftVersions(): Promise<string[]> {
  const response = await fetch(`${BASE_URL}/tag/game_version`);
  if (!response.ok) {
    throw new Error(`Failed to fetch Minecraft versions: ${response.statusText}`);
  }
  
  const versions = await response.json();
  return versions
    .filter((v: any) => v.version_type === 'release')
    .map((v: any) => v.version)
    .sort((a: string, b: string) => {
      // Sort versions in descending order (newest first)
      const aNum = a.split('.').map(n => parseInt(n));
      const bNum = b.split('.').map(n => parseInt(n));
      
      for (let i = 0; i < Math.max(aNum.length, bNum.length); i++) {
        const aPart = aNum[i] || 0;
        const bPart = bNum[i] || 0;
        if (aPart !== bPart) return bPart - aPart;
      }
      return 0;
    });
}

export async function getCategories(): Promise<Array<{id: string, name: string, icon: string}>> {
  const response = await fetch(`${BASE_URL}/tag/category`);
  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.statusText}`);
  }
  
  return response.json();
}

export async function analyzeModFile(file: File): Promise<any> {
  // This would typically involve reading the mod's metadata from the JAR file
  // For now, we'll simulate this functionality
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        filename: file.name,
        projectId: null, // Would be extracted from mod metadata
        currentVersion: '1.0.0',
        updateAvailable: Math.random() > 0.5
      });
    }, 1000);
  });
}