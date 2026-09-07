/**
 * Location & GIS Service for SamadhanSetu (समाधानसेतु)
 * Responsibility: Coordinates processing, GeoJSON formatting, district mapping, and spatial distance.
 * Simple, beginner-readable implementation for SIH 2026.
 */

// Known coordinates for major Jharkhand districts [longitude, latitude]
export const JHARKHAND_DISTRICTS = {
  Ranchi: { center: [85.3240, 23.3441], state: 'Jharkhand' },
  Bokaro: { center: [86.1511, 23.6693], state: 'Jharkhand' },
  Dhanbad: { center: [86.4304, 23.7957], state: 'Jharkhand' },
  Khunti: { center: [85.2789, 23.0740], state: 'Jharkhand' },
  Hazaribagh: { center: [85.3647, 23.9925], state: 'Jharkhand' },
  'East Singhbhum': { center: [86.2029, 22.8046], state: 'Jharkhand' },
  Deoghar: { center: [86.6975, 24.4826], state: 'Jharkhand' },
  Dumka: { center: [87.2486, 24.2677], state: 'Jharkhand' },
  Palamu: { center: [84.0734, 24.0416], state: 'Jharkhand' },
  Giridih: { center: [86.3042, 24.1856], state: 'Jharkhand' },
};

/**
 * Format longitude and latitude into a valid MongoDB GeoJSON Point
 * 
 * @param {number} longitude 
 * @param {number} latitude 
 * @returns {object} - MongoDB 2dsphere GeoJSON object
 */
export function formatGeoPoint(longitude, latitude) {
  const lng = Number(longitude) || 85.3240;
  const lat = Number(latitude) || 23.3441;
  return {
    type: 'Point',
    coordinates: [lng, lat],
  };
}

/**
 * Calculate the distance between two coordinate pairs in kilometers using the Haversine formula.
 * 
 * @param {Array<number>} coordA - [longitude, latitude]
 * @param {Array<number>} coordB - [longitude, latitude]
 * @returns {number} - Distance in kilometers
 */
export function calculateDistanceKm(coordA, coordB) {
  if (!coordA || !coordB || coordA.length < 2 || coordB.length < 2) {
    return 0;
  }

  const [lng1, lat1] = coordA;
  const [lng2, lat2] = coordB;

  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((earthRadiusKm * c).toFixed(2));
}

/**
 * Resolve the district name based on location text or geographic coordinates.
 * 
 * @param {Array<number>} coordinates - [longitude, latitude]
 * @param {string} locationName - Free text entered by user or reverse geocoded
 * @returns {object} - { district: string, state: string, coordinates: [lng, lat] }
 */
export function resolveDistrict(coordinates, locationName = '') {
  const text = (locationName || '').toLowerCase();

  // Check text first for known Jharkhand district mentions
  for (const districtName of Object.keys(JHARKHAND_DISTRICTS)) {
    if (text.includes(districtName.toLowerCase())) {
      return {
        district: districtName,
        state: 'Jharkhand',
        coordinates: coordinates && coordinates.length === 2 ? coordinates : JHARKHAND_DISTRICTS[districtName].center,
      };
    }
  }

  // If coordinates provided, find closest known district center
  if (coordinates && coordinates.length === 2) {
    let closestDistrict = 'Ranchi';
    let shortestDistance = Infinity;

    for (const [name, data] of Object.entries(JHARKHAND_DISTRICTS)) {
      const distance = calculateDistanceKm(coordinates, data.center);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        closestDistrict = name;
      }
    }

    return {
      district: closestDistrict,
      state: 'Jharkhand',
      coordinates,
    };
  }

  // Default fallback to capital city
  return {
    district: 'Ranchi',
    state: 'Jharkhand',
    coordinates: [85.3240, 23.3441],
  };
}

/**
 * Aggregate challenges into district clusters for the Government War Room map.
 * 
 * @param {Array<object>} challenges - List of challenge objects
 * @returns {Array<object>} - District summaries with report count and priority
 */
export function aggregateDistrictHotspots(challenges = []) {
  const districtMap = {};

  // Initialize with known Jharkhand districts
  for (const [district, data] of Object.entries(JHARKHAND_DISTRICTS)) {
    districtMap[district] = {
      district,
      center: data.center,
      totalChallenges: 0,
      totalReports: 0,
      highPriorityCount: 0,
      domains: {},
      status: 'Normal',
    };
  }

  // Aggregate active challenges
  for (const item of challenges) {
    const d = item.district || 'Ranchi';
    if (!districtMap[d]) {
      districtMap[d] = {
        district: d,
        center: [85.3240, 23.3441],
        totalChallenges: 0,
        totalReports: 0,
        highPriorityCount: 0,
        domains: {},
        status: 'Normal',
      };
    }

    districtMap[d].totalChallenges += 1;
    districtMap[d].totalReports += item.reportCount || 1;
    if (item.priority === 'High') {
      districtMap[d].highPriorityCount += 1;
    }

    const domain = item.domain || 'Other';
    districtMap[d].domains[domain] = (districtMap[d].domains[domain] || 0) + 1;
  }

  // Assign alert status
  return Object.values(districtMap).map((d) => {
    let status = 'Normal';
    if (d.highPriorityCount >= 2 || d.totalReports >= 20) {
      status = 'Critical';
    } else if (d.totalChallenges >= 1) {
      status = 'Active';
    }
    return {
      ...d,
      status,
    };
  });
}
