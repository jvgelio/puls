// Strava API Types

export interface StravaAthlete {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  bio: string;
  city: string;
  state: string;
  country: string;
  sex: "M" | "F";
  premium: boolean;
  summit: boolean;
  created_at: string;
  updated_at: string;
  profile_medium: string;
  profile: string;
  email?: string;
}

export interface StravaTokenResponse {
  token_type: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
  access_token: string;
  athlete: StravaAthlete;
}

export interface StravaRefreshResponse {
  token_type: string;
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
}

export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  utc_offset: number;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  map: {
    id: string;
    summary_polyline: string;
    polyline?: string;
    resource_state: number;
  };
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  visibility: string;
  flagged: boolean;
  gear_id: string | null;
  start_latlng: [number, number] | null;
  end_latlng: [number, number] | null;
  average_speed: number;
  max_speed: number;
  average_cadence?: number;
  average_watts?: number;
  weighted_average_watts?: number;
  kilojoules?: number;
  device_watts?: boolean;
  has_heartrate: boolean;
  average_heartrate?: number;
  max_heartrate?: number;
  heartrate_opt_out?: boolean;
  display_hide_heartrate_option?: boolean;
  elev_high?: number;
  elev_low?: number;
  upload_id?: number;
  upload_id_str?: string;
  external_id?: string;
  from_accepted_tag?: boolean;
  pr_count?: number;
  total_photo_count?: number;
  has_kudoed?: boolean;
  suffer_score?: number;
  calories?: number;
  // Detailed activity fields (when fetching single activity)
  description?: string;
  splits_metric?: StravaSplit[];
  splits_standard?: StravaSplit[];
  laps?: StravaLap[];
  segment_efforts?: StravaSegmentEffort[];
  best_efforts?: StravaBestEffort[];
  device_name?: string;
  embed_token?: string;
}

export interface StravaSplit {
  distance: number;
  elapsed_time: number;
  elevation_difference: number;
  moving_time: number;
  split: number;
  average_speed: number;
  average_heartrate?: number;
  pace_zone?: number;
}

export interface StravaLap {
  id: number;
  activity: { id: number };
  athlete: { id: number };
  average_cadence: number;
  average_speed: number;
  distance: number;
  elapsed_time: number;
  start_index: number;
  end_index: number;
  lap_index: number;
  max_speed: number;
  moving_time: number;
  name: string;
  pace_zone: number;
  split: number;
  start_date: string;
  start_date_local: string;
  total_elevation_gain: number;
  average_heartrate?: number;
  max_heartrate?: number;
}

export interface StravaSegmentEffort {
  id: number;
  name: string;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  start_index: number;
  end_index: number;
  average_cadence?: number;
  average_watts?: number;
  average_heartrate?: number;
  max_heartrate?: number;
  segment: {
    id: number;
    name: string;
    activity_type: string;
    distance: number;
    average_grade: number;
    maximum_grade: number;
    elevation_high: number;
    elevation_low: number;
    city: string;
    state: string;
    country: string;
    private: boolean;
    hazardous: boolean;
  };
  pr_rank?: number | null;
  achievements?: Array<{
    type_id: number;
    type: string;
    rank: number;
  }>;
}

export interface StravaBestEffort {
  id: number;
  name: string;
  elapsed_time: number;
  moving_time: number;
  start_date: string;
  start_date_local: string;
  distance: number;
  start_index: number;
  end_index: number;
  pr_rank?: number | null;
}

export interface StravaStream {
  type: string;
  data: number[];
  series_type: string;
  original_size: number;
  resolution: string;
}

export interface StravaStreamsResponse {
  time?: StravaStream;
  distance?: StravaStream;
  latlng?: { type: string; data: [number, number][]; series_type: string; original_size: number; resolution: string };
  altitude?: StravaStream;
  velocity_smooth?: StravaStream;
  heartrate?: StravaStream;
  cadence?: StravaStream;
  watts?: StravaStream;
  temp?: StravaStream;
  moving?: { type: string; data: boolean[]; series_type: string; original_size: number; resolution: string };
  grade_smooth?: StravaStream;
}

export interface StravaWebhookEvent {
  object_type: "activity" | "athlete";
  object_id: number;
  aspect_type: "create" | "update" | "delete";
  owner_id: number;
  subscription_id: number;
  event_time: number;
  updates?: Record<string, unknown>;
}

export interface StravaWebhookValidation {
  "hub.mode": string;
  "hub.challenge": string;
  "hub.verify_token": string;
}
