import React, { useState, useEffect } from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import SegmentedControl from './components/SegmentedControl';
import DistanceSlider from './components/DistanceSlider';
import IdeaCard from './components/IdeaCard';
import ErrorMessage from './components/ErrorMessage';
import LoadingSpinner from './components/LoadingSpinner';
import { generateIdeas, getWeather, ApiError, type EventIdea, type WeatherData } from './lib/api';
const MI_TO_KM = 1.60934;

function App() {
  const [budget, setBudget] = useState('free');
  const [vibe, setVibe] = useState('solo');
  const [when, setWhen] = useState('now');
  const [distance, setDistance] = useState(5);
  const [indoorOutdoor, setIndoorOutdoor] = useState('any');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [ideas, setIdeas] = useState<EventIdea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (location) {
      fetchWeather();
    }
  }, [location]);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationError(null);
      },
      (error) => {
        let message = 'Failed to get your location';
        if (error.code === error.PERMISSION_DENIED) {
          message = 'Location access denied. Please enable location services.';
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = 'Location information is unavailable.';
        } else if (error.code === error.TIMEOUT) {
          message = 'Location request timed out.';
        }
        setLocationError(message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const fetchWeather = async () => {
    if (!location) return;

    try {
      const weatherData = await getWeather(location.lat, location.lng);
      setWeather(weatherData);
    } catch (error) {
      console.warn('Failed to fetch weather:', error);
      // Don't show weather error to user, it's not critical
    }
  };

  const handleGenerateIdeas = async () => {
    if (!location) {
      setError('Location is required to generate ideas');
      return;
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      // convert miles (UI) -> km (API)
      const distanceKm = Math.round(Math.max(1, Math.min(16, distance * MI_TO_KM)));
  
      const res: any = await generateIdeas({
        lat: location.lat,
        lng: location.lng,
        budget,
        vibe,
        window: when,
        distanceKm,
        indoorOutdoor,
      });
  
      // Accept either { ideas: [...] } or [...]
      const rawIdeas = Array.isArray(res) ? res : res?.ideas;
      if (!Array.isArray(rawIdeas)) {
        console.error('Unexpected /api/generate shape:', res);
        throw new Error('Bad response format from /api/generate');
      }
  
      // Normalize to EventIdea[]
      const normalized = rawIdeas.map((i: any, idx: number) => ({
        id: i.id ?? i.placeId ?? `${i.title || 'idea'}-${idx}`,
        title: i.title ?? '',
        category: i.category ?? '',
        cost: i.cost ?? i.costTier ?? '',
        whyToday: i.whyToday ?? '',
        links: Array.isArray(i.links)
          ? i.links.map((l: any) => ({
              name: l.name ?? l.type ?? 'link',
              url: l.url,
            }))
          : [],
      })) as EventIdea[];
  
      setIdeas(normalized);
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Something went wrong. Please try again.');
      }
      setIdeas([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  
  const retryLocationAccess = () => {
    setLocationError(null);
    getCurrentLocation();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Frosted Top Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="pt-safe px-4 pb-4">
          <div className="pt-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Local Events
            </h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              <span>
                {location ? 'Location detected' : 'Getting location...'}
              </span>
              {weather && (
                <span className="text-blue-600">
                  • {weather.temperature}° {weather.condition}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 pb-24 space-y-6">
        {locationError && (
          <ErrorMessage 
            message={locationError} 
            onRetry={retryLocationAccess}
          />
        )}

        {error && !locationError && (
          <ErrorMessage 
            message={error} 
            onRetry={handleGenerateIdeas}
          />
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-5">
          <SegmentedControl
            label="Budget"
            options={['free', '<$20', '$20-50', '$50+']}
            value={budget}
            onChange={setBudget}
          />

          <SegmentedControl
            label="Vibe"
            options={['solo', 'date', 'friends', 'family']}
            value={vibe}
            onChange={setVibe}
          />

          <SegmentedControl
            label="When"
            options={['now', 'tonight', 'weekend']}
            value={when}
            onChange={setWhen}
          />

          <DistanceSlider
            value={distance}
            onChange={setDistance}
          />

          <SegmentedControl
            label="Setting"
            options={['any', 'indoor', 'outdoor']}
            value={indoorOutdoor}
            onChange={setIndoorOutdoor}
          />
        </div>

        {/* Loading State */}
        {isLoading && <LoadingSpinner />}

        {/* Ideas List */}
        {ideas.length > 0 && !isLoading && (
  <div className="space-y-4">
    <h2 className="text-lg font-semibold text-gray-900 px-1">
      Ideas for You
    </h2>
    {ideas.map((idea, i) => (
      <IdeaCard key={idea.id || `${idea.title}-${i}`} idea={idea} />
    ))}
  </div>
)}


        {/* Empty State */}
        {ideas.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to Discover?
            </h3>
            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
              Set your preferences and tap "Generate ideas" to find amazing local events and activities.
            </p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-gray-200/50 pb-safe">
        <div className="px-4 py-4">
          <button
            onClick={handleGenerateIdeas}
            disabled={!location || isLoading}
            className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 transform active:scale-95"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                Generating...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                Generate Ideas
              </div>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .pt-safe {
          padding-top: env(safe-area-inset-top);
        }
        .pb-safe {
          padding-bottom: env(safe-area-inset-bottom);
        }
      `}</style>
    </div>
  );
}

export default App;