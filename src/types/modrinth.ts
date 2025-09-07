export interface ModrinthMod {
  slug: string;
  title: string;
  description: string;
  categories: string[];
  client_side: 'required' | 'optional' | 'unsupported';
  server_side: 'required' | 'optional' | 'unsupported';
  body: string;
  additional_categories: string[];
  issues_url?: string;
  source_url?: string;
  wiki_url?: string;
  discord_url?: string;
  donation_urls: DonationUrl[];
  project_type: 'mod' | 'modpack' | 'resourcepack' | 'shader';
  downloads: number;
  icon_url?: string;
  color?: number;
  thread_id?: string;
  monetization_status: string;
  id: string;
  project_id: string;
  team: string;
  body_url?: string;
  moderator_message?: string;
  published: string;
  updated: string;
  approved?: string;
  queued?: string;
  followers: number;
  status: 'approved' | 'archived' | 'rejected' | 'draft' | 'unlisted' | 'processing' | 'withheld' | 'scheduled' | 'private' | 'unknown';
  requested_status?: string;
  license: License;
  versions: string[];
  game_versions: string[];
  loaders: string[];
  gallery: GalleryImage[];
  featured_gallery?: string;
  date_created: string;
  date_modified: string;
}

export interface DonationUrl {
  id: string;
  platform: string;
  url: string;
}

export interface License {
  id: string;
  name: string;
  url?: string;
}

export interface GalleryImage {
  url: string;
  featured: boolean;
  title?: string;
  description?: string;
  created: string;
  ordering: number;
}

export interface ModrinthVersion {
  name: string;
  version_number: string;
  changelog?: string;
  dependencies: Dependency[];
  game_versions: string[];
  version_type: 'release' | 'beta' | 'alpha';
  loaders: string[];
  featured: boolean;
  status: 'listed' | 'archived' | 'draft' | 'unlisted' | 'scheduled' | 'unknown';
  requested_status?: string;
  id: string;
  project_id: string;
  author_id: string;
  date_published: string;
  downloads: number;
  changelog_url?: string;
  files: ModrinthFile[];
}

export interface Dependency {
  version_id?: string;
  project_id?: string;
  file_name?: string;
  dependency_type: 'required' | 'optional' | 'incompatible' | 'embedded';
}

export interface ModrinthFile {
  hashes: {
    sha512: string;
    sha1: string;
  };
  url: string;
  filename: string;
  primary: boolean;
  size: number;
  file_type?: 'required-resource-pack' | 'optional-resource-pack';
}

export interface ModrinthSearchResponse {
  hits: ModrinthMod[];
  offset: number;
  limit: number;
  total_hits: number;
}

export interface SearchParams {
  query?: string;
  facets?: string[][];
  categories?: string[];
  versions?: string[];
  projectType?: 'mod' | 'modpack' | 'resourcepack' | 'shader';
  limit?: number;
  offset?: number;
  index?: 'relevance' | 'downloads' | 'follows' | 'newest' | 'updated';
}