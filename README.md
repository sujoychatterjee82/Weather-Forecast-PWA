# Weather Forecast PWA

A premium, static-first weather forecasting Progressive Web App that runs entirely in the browser.

Built specifically for **GitHub Pages** — with **no backend, no build step, and no server required**.

## Overview

**Weather Forecast PWA** delivers real-time weather conditions, hourly forecasts, 7-day forecasts, weather maps, air-quality information, and practical weather guidance through a responsive browser-based interface.

The application works across:

* 📱 Mobile phones
* 📲 Tablets
* 💻 Laptops
* 🖥️ Desktops
* 🖥️ Large displays

When browser geolocation is unavailable or denied, the application automatically falls back to **Asansol, West Bengal, India**.

The interface is available in **English and Bengali (বাংলা)**.

## Features

### 🌤️ Current Weather

Detailed current conditions including:

* Temperature
* Feels-like temperature
* Humidity
* Wind speed and direction
* Atmospheric pressure
* Visibility
* Precipitation
* Rain probability
* UV index
* Air Quality Index
* Sunrise
* Sunset

### 🕐 Hourly Forecast

A horizontally scrollable hourly forecast covering approximately the next **24 hours**, including relevant weather conditions and precipitation information.

### 📅 7-Day Forecast

Daily forecast information including:

* High / low temperatures
* Rain probability
* Precipitation
* Wind
* UV index
* Weather conditions

### 📝 Weekly Summary

Generates a natural-language weekly weather summary directly from the actual forecast data.

### 🌾 Farmer Forecast

Practical weather guidance designed around outdoor and agricultural planning:

* Expected rain windows
* Dry periods
* Windy periods
* Suggested outdoor periods

### 👕 Clothing Suggestions

Provides practical clothing recommendations based on:

* Temperature
* Feels-like temperature
* Humidity
* Wind
* Rain conditions

### 🗺️ Interactive Weather Map

Powered by **Leaflet.js** and **OpenStreetMap**.

Available overlays include:

* Rain
* Clouds
* Wind
* Temperature
* Pressure

### 🔎 Location Search

Search for locations using:

* City names
* Indian PIN codes
* Search suggestions
* Keyboard navigation
* Recent searches

### 🎙️ Voice Search

Uses the browser's **Web Speech API** for voice-based location searches.

Unsupported browsers receive a graceful fallback to normal text search.

### ⭐ Favourites & Recent Searches

Favourite locations and recent searches are stored locally using `localStorage`.

No account or server-side profile is required.

### 🌐 English & Bengali

The application includes dedicated:

* English interface
* Bengali interface (বাংলা)

Translations are maintained through a central translation system.

### 🌓 Light & Dark Mode

Supports:

* Light mode
* Dark mode
* Automatic system preference detection
* Persistent theme preference

### 📊 Client-Side Reports

Export weather information directly from the browser as:

* Excel (`.xlsx`)
* CSV
* PDF

No server-side processing is required.

### 📲 Progressive Web App

The application includes a real service worker and supports:

* Installation
* Offline application-shell access
* Cached weather data
* Responsive layouts
* HTTPS deployment through GitHub Pages

### 🔄 Multi-Provider Weather Fallback

Weather requests use an automatic fallback chain:

```text
Open-Meteo
    ↓
WeatherAPI.com
    ↓
OpenWeatherMap
    ↓
Cached weather data
```

Open-Meteo is the default provider and does not require an API key.

The application also maintains a **30-minute application-level weather cache** and can display stale cached data when live providers are unavailable.

### ♿ Accessibility

The interface is designed to support:

* Keyboard navigation
* Semantic HTML
* Accessible controls
* Visible focus states
* ARIA where appropriate
* Reduced-motion preferences
* Responsive touch interaction

---

## Technology Stack

| Technology         | Purpose                                    |
| ------------------ | ------------------------------------------ |
| HTML5              | Application structure                      |
| Modern CSS         | Interface and responsive styling           |
| Tailwind CSS       | Utility styling via CDN                    |
| Vanilla JavaScript | Application logic                          |
| ES Modules         | Modular JavaScript architecture            |
| Chart.js           | Weather charts                             |
| Leaflet.js         | Interactive maps                           |
| OpenStreetMap      | Map data                                   |
| SheetJS / XLSX     | Excel export                               |
| jsPDF              | PDF generation                             |
| html2canvas        | PDF rendering                              |
| Web Speech API     | Voice search                               |
| Geolocation API    | Location detection                         |
| Service Worker API | PWA and offline support                    |
| localStorage       | Preferences, favourites, recents and cache |

### Architecture

The project intentionally avoids:

* React
* Vue
* Angular
* Frontend frameworks
* Build tools
* Bundlers
* Backend services

The application can therefore be deployed directly as static files.

---

## Local Development

Service workers and ES modules require a proper HTTP origin.

Opening `index.html` directly through `file://` can prevent module imports and PWA functionality from working correctly.

Run a static server from the project root.

### Python

```bash
python -m http.server 8000
```

### Node.js

```bash
npx serve .
```

### PHP

```bash
php -S localhost:8000
```

Then open:

```text
http://localhost:8000
```

---

## GitHub Pages Deployment

### 1. Create a repository

Create a new GitHub repository and push or upload the project files.

### 2. Open Pages settings

Navigate to:

**Settings → Pages**

### 3. Configure the deployment source

Select:

```text
Source: Deploy from a branch
Branch: main
Folder: / (root)
```

Click **Save**.

### 4. Open the published application

After GitHub Pages finishes deploying, the application will be available at:

```text
https://<username>.github.io/<repository>/
```

The project uses relative asset paths such as:

```text
./assets/...
./manifest.json
./service-worker.js
```

This allows the application to work correctly when hosted under a GitHub repository subpath.

---

## API Configuration

API configuration is located in:

```text
assets/js/config.js
```

Example:

```javascript
API_KEYS: {
    WEATHER_API: "",
    OPENWEATHER_MAP: "",
    GOOGLE_MAPS: ""
}
```

### Open-Meteo

Open-Meteo is the default weather provider and requires **no API key**.

The application can therefore operate without any configured credentials.

### Optional Providers

The following providers can be configured as fallback services:

* WeatherAPI.com
* OpenWeatherMap

OpenWeatherMap may also be used for supported map tile/weather-layer functionality.

---

## ⚠️ GitHub Pages API-Key Warning

This is a **static client-side application**.

Any API key included in browser JavaScript is potentially visible to users through:

* Page source
* Developer tools
* Network requests
* Downloaded application assets

**Never place private credentials or secrets in `config.js`.**

Do not commit credentials that must remain confidential.

If private API access is required in the future, a server-side proxy can be introduced to protect secret credentials.

The static application should continue to support keyless providers such as Open-Meteo wherever possible.

---

## PWA & Offline Support

When deployed over HTTPS — including GitHub Pages — the application can be installed as a Progressive Web App.

The PWA provides:

* Install support
* Service-worker registration
* Application-shell caching
* Offline access to cached resources
* Cached weather fallback

When the browser exposes `beforeinstallprompt`, the application can present an installation control.

The weather layer uses a **30-minute application cache** and can fall back to the most recently available weather data when live requests fail.

---

## Troubleshooting

### Geolocation isn't working

Browser geolocation generally requires:

* HTTPS, or
* `localhost`

The user must grant location permission.

If permission is denied or geolocation fails, the application automatically falls back to:

**Asansol, West Bengal, India**

Use the **Use my location** control to retry location detection.

### API key is missing

Open-Meteo does not require a key.

If WeatherAPI.com or OpenWeatherMap credentials are not configured, those providers are simply skipped by the fallback system.

### CORS or API restrictions

The application is designed around browser-accessible providers and services.

If a provider becomes unavailable or begins rejecting browser requests, the fallback manager attempts the next configured provider.

### Service worker isn't updating

The service worker uses a cache version:

```javascript
CACHE_VERSION
```

Increment the cache version in:

```text
service-worker.js
```

when you need to force a fresh application shell.

You may also need to:

1. Hard refresh the page.
2. Unregister the existing service worker.
3. Clear the site's stored data.
4. Reload the application.

### GitHub Pages path problems

The project uses relative paths.

If the repository name changes, application asset paths should continue to work without modification.

Make sure GitHub Pages is publishing the directory containing:

```text
index.html
```

### No weather data is displayed

Open the browser's developer console and inspect provider errors.

If live weather providers fail, the application should attempt its fallback chain and display cached weather data when available.

---

## Privacy

Weather Forecast PWA is designed around a **local-first architecture**.

Where practical, application functionality is performed directly inside the browser.

The application does not require:

* User accounts
* A backend
* Advertising trackers
* Analytics infrastructure
* Server-side storage for favourites
* Server-side storage for recent searches

User preferences, favourites, recent searches and cached application data are stored locally in the browser.

External services may receive information necessary to perform the requested operation, such as a weather location or map request.

---

## Browser Support

The application relies on modern browser capabilities including:

* ES Modules
* Service Workers
* Fetch API
* Geolocation API
* Web Speech API
* localStorage
* modern CSS

Some features, particularly voice search and installation prompts, depend on browser-specific support.

Unsupported capabilities should degrade gracefully where possible.

---

## Project Structure

A typical deployment structure is:

```text
weather-forecast-pwa/
├── index.html
├── manifest.json
├── service-worker.js
├── assets/
│   ├── css/
│   ├── js/
│   │   └── config.js
│   ├── images/
│   └── ...
└── ...
```

The application is designed so that the static project can be deployed directly without a compilation or bundling stage.

---

## Design Principles

The interface is built around several core principles:

**Static-first**
Deploy directly to static hosting without infrastructure.

**Local-first**
Process and persist user data locally whenever practical.

**Resilient**
Use provider fallbacks and cached weather data when live services fail.

**Responsive**
Provide a consistent experience from mobile screens to large desktop displays.

**Accessible**
Keep navigation, controls and information usable with keyboard and assistive technologies.

**Installable**
Provide a proper PWA experience rather than treating offline support as an afterthought.

**Privacy-conscious**
Avoid unnecessary accounts, tracking and server-side data collection.

---

## License

Add your project's license information here.

For example:

```text
MIT License
```

If this project uses third-party libraries or APIs, review and comply with their respective licenses and attribution requirements.
