// TypeScript interfaces matching Django models

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  is_student: boolean;
  is_alumni: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  is_active?: boolean;
  date_joined?: string;
  last_login?: string;
  profile?: Profile;
}

export interface Profile {
  id: number;
  student_id: string;
  other_names: string;
  gender: 'M' | 'F';
  college: 'CoS' | 'CoE' | 'CoHS' | 'CABE' | 'CoHSS' | 'CANR';
  program_of_study: string;
  hall_of_residence: 'Katanga' | 'Conti' | 'Indece' | 'Republic' | 'Queens' | 'Africa' | 'Off-Campus';
  year_group: number;
  hometown: string;
  profile_picture: string | null;
  profile_picture_url?: string | null; // Absolute URL from serializer
}

export interface Election {
  id: number;
  title: string;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  is_active: boolean;
  is_open: boolean; // computed property from backend
  is_published: boolean;
  status: 'LIVE' | 'UPCOMING' | 'CLOSED' | 'PAUSED'; // computed status from backend
  should_display: boolean; // whether to show on public UI
}

export interface Position {
  id: number;
  election: number;
  election_title: string;
  name: string;
  rank: number;
  max_votes_per_user: number;
}

export interface Candidate {
  id: number;
  position: number;
  position_name: string;
  election_title: string;
  user: number;
  user_details: User;
  manifesto: string;
  photo: string;
  total_votes: number; // Computed field from backend
}

export interface Vote {
  id: number;
  voter: number;
  voter_username: string;
  position: number;
  position_name: string;
  candidate: number;
  candidate_name: string;
  timestamp: string; // ISO date string
}

// Request/Response types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  username: string;
  email: string; // Must end with @st.knust.edu.gh
  password: string;
  password_confirm: string; // Must match password
  first_name?: string;
  last_name?: string;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface CreateVoteRequest {
  position: number;
  candidate: number;
}

export interface CreateProfileRequest {
  student_id: string;
  other_names?: string;
  gender: 'M' | 'F';
  college: string;
  program_of_study: string;
  hall_of_residence: string;
  year_group: number;
  hometown: string;
  profile_picture?: File;
}

// Leadership/Executive types
export interface Executive {
  id: number;
  user: number;
  user_details?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    avatar: string | null;
  };
  title: string;
  rank: number;
  bio: string;
  academic_year: string;
  is_current: boolean;
  official_photo: string | null;
  image_url: string | null; // Smart URL with fallback logic
  full_name: string;
  profile_picture: string | null;
  username: string;
  email: string;
  social_links?: {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  facebook_url?: string | null;
  twitter_url?: string | null;
  instagram_url?: string | null;
  linkedin_url?: string | null;
}

// Gallery types
export interface GalleryItem {
  id: number;
  title: string;
  category: 'General' | 'Sports' | 'Cultural' | 'Politics' | 'Excursion';
  media_type: 'Image' | 'Video';
  image: string | null;
  video: string | null;
  video_thumbnail: string | null;
  thumbnail_url: string | null; // Smart URL with fallback
  image_url: string | null;
  video_url: string | null;
  created_at: string;
}

// Events types
export interface Event {
  id: number;
  title: string;
  description: string;
  date: string; // ISO date string (YYYY-MM-DD)
  start_time: string; // Time string (HH:MM:SS)
  end_time: string; // Time string (HH:MM:SS)
  time_display: string; // Formatted time range
  location: string;
  event_image: string | null;
  event_image_url: string | null; // Absolute URL
  is_featured: boolean;
  registration_required: boolean;
  registration_link: string | null;
  is_upcoming: boolean;
  created_at: string;
  updated_at: string;
}

// Announcements types
export interface Announcement {
  id: number;
  title: string;
  message: string;
  priority: 'Normal' | 'High';
  related_link: string | null;
  is_active: boolean;
  created_at: string;
}

// Resources types
export interface AcademicResource {
  id: number;
  title: string;
  course_code: string;
  file: string;
  file_url: string | null;
  college: 'CoS' | 'CoE' | 'CoHS' | 'CABE' | 'CoHSS' | 'CANR';
  college_display: string;
  level: 100 | 200 | 300 | 400 | 500 | 600;
  level_display: string;
  semester: 1 | 2;
  semester_display: string;
  uploaded_at: string;
  downloads: number;
}

// Career Opportunities types
export interface CareerOpportunity {
  id: number;
  title: string;
  organization: string;
  location: string;
  type: 'Job' | 'Internship' | 'NSS' | 'Research' | 'Undergarduate' | 'Postgraduate' | 'Masters' | 'PhD' | 'Workshop' | 'Conference' | 'Scholarship' | 'Other';
  type_display?: string;
  description: string;
  application_link: string;
  deadline: string;
  posted_at: string;
  is_active: boolean;
}

// Constitution types
export interface Article {
  id: number;
  article_number: string;
  title: string;
  content: string;
  chapter: number;
}

export interface Chapter {
  id: number;
  number: number;
  title: string;
  articles: Article[];
  article_count: number;
}

// Welfare types
export interface WelfareReport {
  id: number;
  category: 'Harassment' | 'Academic' | 'Accommodation' | 'Financial' | 'Other';
  description: string;
  location?: string;
  is_anonymous: boolean;
  contact_info?: string;
  reporter_details?: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name: string;
    avatar: string | null;
  } | null;
  status?: 'Pending' | 'Investigating' | 'Resolved';
  created_at?: string;
  updated_at?: string;
}

// Market types
export interface Product {
  id: number;
  seller: number;
  seller_name: string;
  seller_details?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    avatar: string | null;
  } | null;
  title: string;
  price: string;
  category: 'Electronics' | 'Hostel Essentials' | 'Books' | 'Fashion' | 'Other';
  category_display: string;
  condition: 'New' | 'Used - Like New' | 'Used - Good';
  condition_display: string;
  image: string;
  image_url: string | null;
  description: string;
  whatsapp_number: string;
  contact_phone?: string | null;
  is_sold: boolean;
  created_at: string;
}

// Lost & Found types
export interface LostItem {
  id?: number;
  reporter?: number;
  reporter_name?: string;
  reporter_details?: {
    id: number;
    username: string;
    email: string;
    full_name: string;
    avatar: string | null;
  } | null;
  type: 'Lost' | 'Found';
  type_display?: string;
  category: 'Student ID' | 'Keys' | 'Wallet' | 'Gadget' | 'Other';
  category_display?: string;
  student_name?: string;
  image?: string | File;
  image_url?: string | null;
  description: string;
  contact_info: string;
  is_resolved?: boolean;
  created_at?: string;
}

// API Error Response
export interface ApiError {
  detail?: string;
  [key: string]: string | string[] | undefined;
}

// Opportunity types
export interface Opportunity {
  id: number;
  title: string;
  organization: string;
  location: string;
  type: 'Job' | 'Internship' | 'NSS' | 'Masters' | 'PhD' | 'Workshop' | 'Postgraduate' | 'Undergarduate' | 'Research' | 'Conference' | 'Scholarship' | 'Other';
  description: string;
  application_link: string;
  deadline: string;
  posted_at: string;
  is_active: boolean;
}

// System Configuration types
export interface SystemConfig {
  id: number;
  maintenance_mode: boolean;
  allow_registration: boolean;
  current_academic_year: string;
  current_semester: 1 | 2;
  updated_at: string;
}
