import type { StravaActivity, StravaStreamsResponse, StravaLap } from "./types";

const STRAVA_API_BASE = "https://www.strava.com/api/v3";

export class StravaAPI {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${STRAVA_API_BASE}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Strava API error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  /**
   * Get a single activity with full details
   */
  async getActivity(activityId: number): Promise<StravaActivity> {
    return this.request<StravaActivity>(`/activities/${activityId}`);
  }

  /**
   * Get activity streams (time series data)
   */
  async getActivityStreams(
    activityId: number,
    types: string[] = [
      "time",
      "distance",
      "latlng",
      "altitude",
      "velocity_smooth",
      "heartrate",
      "cadence",
      "watts",
      "temp",
      "moving",
      "grade_smooth",
    ]
  ): Promise<StravaStreamsResponse> {
    const params = new URLSearchParams({
      keys: types.join(","),
      key_by_type: "true",
    });

    return this.request<StravaStreamsResponse>(
      `/activities/${activityId}/streams?${params}`
    );
  }

  /**
   * Get activity laps
   */
  async getActivityLaps(activityId: number): Promise<StravaLap[]> {
    return this.request<StravaLap[]>(`/activities/${activityId}/laps`);
  }

  /**
   * Get list of activities (for historical import)
   */
  async getActivities(options: {
    before?: number;
    after?: number;
    page?: number;
    per_page?: number;
  } = {}): Promise<StravaActivity[]> {
    const params = new URLSearchParams();

    if (options.before) params.append("before", options.before.toString());
    if (options.after) params.append("after", options.after.toString());
    if (options.page) params.append("page", options.page.toString());
    if (options.per_page) params.append("per_page", options.per_page.toString());

    return this.request<StravaActivity[]>(`/athlete/activities?${params}`);
  }

  /**
   * Get authenticated athlete profile
   */
  async getAthlete(): Promise<{
    id: number;
    firstname: string;
    lastname: string;
    profile: string;
    email?: string;
  }> {
    return this.request(`/athlete`);
  }
}

/**
 * Create a Strava API client instance
 */
export function createStravaClient(accessToken: string): StravaAPI {
  return new StravaAPI(accessToken);
}
