interface Location {
  id: number;
  accuracy: number;
  altitude?: number;
  altitudeAccuracy?: number;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  timestamp: number;
  fullAddress: string;
  shortAddress: string;
  locality: string;
}
