/**
 * All UI strings for English and Bengali.
 * Keep translation strings here — do not scatter them across modules.
 */

export const translations = {
  en: {
    'app.title': 'Weather Forecast',
    'app.tagline': 'Live forecast & tools',

    'nav.home': 'Home',
    'nav.hourly': 'Hourly',
    'nav.forecast': '7-Day',
    'nav.air': 'Air Quality',
    'nav.map': 'Map',
    'nav.farmer': 'Farmer',
    'nav.more': 'Export',

    'search.label': 'Search for a city or pincode',
    'search.placeholder': 'Search city or pincode…',
    'search.clear': 'Clear search',
    'search.voice': 'Voice search',
    'search.useMyLocation': 'Use my location',
    'search.addFavorite': 'Save location',
    'search.clearRecent': 'Clear',
    'search.noResults': "We couldn't find that location. Please try a city or another pincode.",
    'search.typeMore': 'Type at least 2 characters…',
    'search.searching': 'Searching…',

    'action.install': 'Install',
    'action.dismiss': 'Dismiss',
    'action.refresh': 'Refresh',
    'action.retry': 'Try again',
    'action.scrollLeft': 'Scroll forecast left',
    'action.scrollRight': 'Scroll forecast right',

    'theme.toggle': 'Toggle dark mode',

    'status.offline': "You're offline. Showing the latest saved weather data.",
    'status.cached': 'Showing saved weather data',
    'status.updated': 'Updated',
    'status.fresh': 'Live data',
    'status.backup': 'Backup provider',
    'status.loading': 'Loading weather data…',

    'loading.weather': 'Loading weather data…',

    'error.title': 'Weather service temporarily unavailable',
    'error.network': "We couldn't reach the weather service. Please check your connection.",
    'error.allFailed': 'Weather service temporarily unavailable. Trying another provider…',
    'error.noData': 'No weather data is available right now.',
    'error.export': 'Export failed. Please try again.',

    'section.current': 'Current weather',
    'section.metrics': 'Current conditions',
    'section.airQuality': 'Air quality',
    'section.hourly': 'Next 24 hours',
    'section.charts': 'Trends',
    'section.daily': '7-day forecast',
    'section.summary': 'Weekly summary',
    'section.farmer': 'Farmer forecast',
    'section.clothing': 'What should I wear?',
    'section.astronomy': 'Sun',
    'section.map': 'Where is it raining?',
    'section.favorites': 'Favourite locations',
    'section.recents': 'Recent searches',
    'section.export': 'Export weather data',

    'metrics.humidity': 'Humidity',
    'metrics.wind': 'Wind',
    'metrics.windDir': 'Direction',
    'metrics.pressure': 'Pressure',
    'metrics.visibility': 'Visibility',
    'metrics.precipitation': 'Precipitation',
    'metrics.rainChance': 'Rain chance',
    'metrics.uv': 'UV index',
    'metrics.aqi': 'Air quality',
    'metrics.feelsLike': 'Feels like',
    'metrics.sunrise': 'Sunrise',
    'metrics.sunset': 'Sunset',
    'metrics.daylight': 'Daylight',

    'aqi.unavailable': 'AQI data unavailable',
    'aqi.source': 'Source',
    'aqi.pm25': 'PM2.5',
    'aqi.pm10': 'PM10',
    'aqi.co': 'CO',
    'aqi.no2': 'NO₂',
    'aqi.so2': 'SO₂',
    'aqi.o3': 'O₃',

    'uv.title': 'UV Index',
    'uv.advice': 'Advice',

    'charts.temperature24': 'Temperature — next 24 hours',
    'charts.rain24': 'Rain probability — next 24 hours',
    'charts.temperature7': 'High and low temperature — 7 days',
    'charts.temp': 'Temperature',
    'charts.rain': 'Rain %',
    'charts.high': 'High',
    'charts.low': 'Low',

    'daily.high': 'High',
    'daily.low': 'Low',
    'daily.rain': 'Rain',
    'daily.wind': 'Wind',
    'daily.uv': 'UV',

    'summary.rain': 'Rain is expected on',
    'summary.dry': 'No significant rain is expected in the coming days.',
    'summary.hot': 'The hottest day is expected to be',
    'summary.cold': 'The coolest day is expected to be',
    'summary.wind': 'Windy conditions are possible on',
    'summary.warming': 'Temperatures are trending warmer over the week.',
    'summary.cooling': 'Temperatures are trending cooler over the week.',
    'summary.stable': 'Temperatures remain fairly steady through the week.',

    'farmer.rainToday': 'Rain today?',
    'farmer.rainChance': 'Rain probability',
    'farmer.rainAmount': 'Expected rain amount',
    'farmer.tomorrow': "Tomorrow's rain chance",
    'farmer.wind': 'Strong wind possibility',
    'farmer.dry': 'Dry periods',
    'farmer.wet': 'Wet periods',
    'farmer.suggested': 'Suggested outdoor periods',
    'farmer.advisory': 'This is advisory information only and not a guarantee.',

    'clothing.title': 'What should I wear?',
    'clothing.hot': 'Lightweight and breathable clothing may be more comfortable.',
    'clothing.warm': 'Light clothing is likely to be comfortable.',
    'clothing.mild': 'A light layer may be comfortable.',
    'clothing.cool': 'A light jacket or sweatshirt may be comfortable.',
    'clothing.cold': 'A warm jacket is recommended.',
    'clothing.freezing': 'Warm, insulated clothing is recommended.',
    'clothing.rain': 'Consider carrying an umbrella or rain jacket.',
    'clothing.windy': 'A windproof layer may help.',
    'clothing.humid': 'Choose breathable fabrics — humidity is high.',

    'astro.sunrise': 'Sunrise',
    'astro.sunset': 'Sunset',
    'astro.daylight': 'Daylight',

    'map.rain': 'Rain',
    'map.clouds': 'Clouds',
    'map.wind': 'Wind',
    'map.temperature': 'Temperature',
    'map.pressure': 'Pressure',
    'map.none': 'None',
    'map.noKey': 'Weather map layers need an OpenWeatherMap API key. Base map is still available.',
    'map.unavailable': 'Map layer unavailable. Base map remains usable.',

    'export.description': 'Download the current forecast for this location. Files are generated entirely in your browser.',
    'export.excel': 'Excel (.xlsx)',
    'export.csv': 'CSV',
    'export.pdf': 'PDF report',
    'export.done': 'Export completed.',
    'export.failed': 'Export failed. Please try again.',

    'install.prompt': 'Install Weather App — get faster access and offline weather.',

    'footer.dataBy': 'Weather data by',
    'footer.mapBy': 'Maps by',
    'footer.and': 'and',
    'footer.advisory': 'Forecasts are advisory. Always check official sources before making critical decisions.',

    'toast.locationDetected': 'Location detected.',
    'toast.locationDenied': 'Location permission denied. Using default location.',
    'toast.usingCache': 'Using cached weather data.',
    'toast.weatherUpdated': 'Weather updated successfully.',
    'toast.voiceListening': 'Voice search is listening…',
    'toast.voiceUnsupported': 'Voice search is not supported in this browser.',
    'toast.favAdded': 'Added to favourites.',
    'toast.favRemoved': 'Removed from favourites.',
    'toast.favExists': 'This location is already in your favourites.',
    'toast.recentsCleared': 'Recent searches cleared.',
    'toast.invalidLocation': "We couldn't find that location.",

    'list.emptyFav': 'No favourite locations yet. Save one using the star button.',
    'list.emptyRecents': 'No recent searches yet.',

    'unit.kmh': 'km/h',
    'unit.hpa': 'hPa',
    'unit.km': 'km',
    'unit.mm': 'mm',
    'unit.percent': '%',
    'unit.deg': '°',

    'day.today': 'Today',
    'day.tomorrow': 'Tomorrow',

    'provider.open-meteo': 'Open-Meteo',
    'provider.weatherapi': 'WeatherAPI',
    'provider.openweather': 'OpenWeather',
    'provider.cache': 'Saved data'
  },

  bn: {
    'app.title': 'আবহাওয়ার পূর্বাভাস',
    'app.tagline': 'লাইভ পূর্বাভাস ও সরঞ্জাম',

    'nav.home': 'হোম',
    'nav.hourly': 'ঘণ্টাভিত্তিক',
    'nav.forecast': '৭ দিন',
    'nav.air': 'বায়ু গুণমান',
    'nav.map': 'মানচিত্র',
    'nav.farmer': 'কৃষক',
    'nav.more': 'এক্সপোর্ট',

    'search.label': 'শহর বা পিনকোড খুঁজুন',
    'search.placeholder': 'শহর বা পিনকোড খুঁজুন…',
    'search.clear': 'অনুসন্ধান মুছুন',
    'search.voice': 'ভয়েস অনুসন্ধান',
    'search.useMyLocation': 'আমার অবস্থান ব্যবহার করুন',
    'search.addFavorite': 'অবস্থান সংরক্ষণ',
    'search.clearRecent': 'মুছুন',
    'search.noResults': 'আমরা এই অবস্থান খুঁজে পাইনি। অনুগ্রহ করে একটি শহর বা অন্য পিনকোড চেষ্টা করুন।',
    'search.typeMore': 'কমপক্ষে ২ অক্ষর লিখুন…',
    'search.searching': 'খোঁজা হচ্ছে…',

    'action.install': 'ইনস্টল',
    'action.dismiss': 'বন্ধ করুন',
    'action.refresh': 'রিফ্রেশ',
    'action.retry': 'আবার চেষ্টা',
    'action.scrollLeft': 'বামে স্ক্রল',
    'action.scrollRight': 'ডানে স্ক্রল',

    'theme.toggle': 'ডার্ক মোড টগল',

    'status.offline': 'আপনি অফলাইনে আছেন। সর্বশেষ সংরক্ষিত আবহাওয়ার তথ্য দেখানো হচ্ছে।',
    'status.cached': 'সংরক্ষিত আবহাওয়ার তথ্য দেখানো হচ্ছে',
    'status.updated': 'হালনাগাদ',
    'status.fresh': 'লাইভ তথ্য',
    'status.backup': 'ব্যাকআপ সেবা',
    'status.loading': 'আবহাওয়ার তথ্য লোড হচ্ছে…',

    'loading.weather': 'আবহাওয়ার তথ্য লোড হচ্ছে…',

    'error.title': 'আবহাওয়া সেবা সাময়িকভাবে অনুপলব্ধ',
    'error.network': 'আমরা আবহাওয়া সেবার সাথে সংযোগ করতে পারিনি। আপনার সংযোগ পরীক্ষা করুন।',
    'error.allFailed': 'আবহাওয়া সেবা সাময়িকভাবে অনুপলব্ধ। অন্য সরবরাহকারী চেষ্টা করা হচ্ছে…',
    'error.noData': 'এই মুহূর্তে কোনো আবহাওয়ার তথ্য নেই।',
    'error.export': 'এক্সপোর্ট ব্যর্থ হয়েছে। আবার চেষ্টা করুন।',

    'section.current': 'বর্তমান আবহাওয়া',
    'section.metrics': 'বর্তমান অবস্থা',
    'section.airQuality': 'বায়ু গুণমান',
    'section.hourly': 'পরবর্তী ২৪ ঘণ্টা',
    'section.charts': 'প্রবণতা',
    'section.daily': '৭ দিনের পূর্বাভাস',
    'section.summary': 'সাপ্তাহিক সারাংশ',
    'section.farmer': 'কৃষকের পূর্বাভাস',
    'section.clothing': 'আমি কী পরব?',
    'section.astronomy': 'সূর্য',
    'section.map': 'কোথায় বৃষ্টি হচ্ছে?',
    'section.favorites': 'প্রিয় অবস্থান',
    'section.recents': 'সাম্প্রতিক অনুসন্ধান',
    'section.export': 'আবহাওয়া তথ্য এক্সপোর্ট',

    'metrics.humidity': 'আর্দ্রতা',
    'metrics.wind': 'বাতাস',
    'metrics.windDir': 'দিক',
    'metrics.pressure': 'চাপ',
    'metrics.visibility': 'দৃশ্যমানতা',
    'metrics.precipitation': 'বৃষ্টিপাত',
    'metrics.rainChance': 'বৃষ্টির সম্ভাবনা',
    'metrics.uv': 'ইউভি সূচক',
    'metrics.aqi': 'বায়ু গুণমান',
    'metrics.feelsLike': 'অনুভূত হচ্ছে',
    'metrics.sunrise': 'সূর্যোদয়',
    'metrics.sunset': 'সূর্যাস্ত',
    'metrics.daylight': 'দিনের আলো',

    'aqi.unavailable': 'AQI তথ্য অনুপলব্ধ',
    'aqi.source': 'উৎস',
    'aqi.pm25': 'PM2.5',
    'aqi.pm10': 'PM10',
    'aqi.co': 'CO',
    'aqi.no2': 'NO₂',
    'aqi.so2': 'SO₂',
    'aqi.o3': 'O₃',

    'uv.title': 'ইউভি সূচক',
    'uv.advice': 'পরামর্শ',

    'charts.temperature24': 'তাপমাত্রা — পরবর্তী ২৪ ঘণ্টা',
    'charts.rain24': 'বৃষ্টির সম্ভাবনা — পরবর্তী ২৪ ঘণ্টা',
    'charts.temperature7': 'সর্বোচ্চ ও সর্বনিম্ন তাপমাত্রা — ৭ দিন',
    'charts.temp': 'তাপমাত্রা',
    'charts.rain': 'বৃষ্টি %',
    'charts.high': 'সর্বোচ্চ',
    'charts.low': 'সর্বনিম্ন',

    'daily.high': 'সর্বোচ্চ',
    'daily.low': 'সর্বনিম্ন',
    'daily.rain': 'বৃষ্টি',
    'daily.wind': 'বাতাস',
    'daily.uv': 'ইউভি',

    'summary.rain': 'বৃষ্টির সম্ভাবনা রয়েছে',
    'summary.dry': 'আগামী দিনগুলোতে উল্লেখযোগ্য বৃষ্টির সম্ভাবনা নেই।',
    'summary.hot': 'সবচেয়ে গরম দিন হবে',
    'summary.cold': 'সবচেয়ে ঠান্ডা দিন হবে',
    'summary.wind': 'বাতাসের সম্ভাবনা রয়েছে',
    'summary.warming': 'সপ্তাহজুড়ে তাপমাত্রা বাড়ার প্রবণতা।',
    'summary.cooling': 'সপ্তাহজুড়ে তাপমাত্রা কমার প্রবণতা।',
    'summary.stable': 'সপ্তাহজুড়ে তাপমাত্রা প্রায় স্থির থাকবে।',

    'farmer.rainToday': 'আজ বৃষ্টি হবে?',
    'farmer.rainChance': 'বৃষ্টির সম্ভাবনা',
    'farmer.rainAmount': 'সম্ভাব্য বৃষ্টির পরিমাণ',
    'farmer.tomorrow': 'আগামীকাল বৃষ্টির সম্ভাবনা',
    'farmer.wind': 'জোরে বাতাসের সম্ভাবনা',
    'farmer.dry': 'শুষ্ক সময়',
    'farmer.wet': 'ভেজা সময়',
    'farmer.suggested': 'প্রস্তাবিত বাইরের সময়',
    'farmer.advisory': 'এটি শুধুমাত্র পরামর্শমূলক তথ্য, কোনো গ্যারান্টি নয়।',

    'clothing.title': 'আমি কী পরব?',
    'clothing.hot': 'হালকা ও শ্বাসপ্রশ্বাসযোগ্য পোশাক আরামদায়ক হতে পারে।',
    'clothing.warm': 'হালকা পোশাক আরামদায়ক হবে।',
    'clothing.mild': 'একটি হালকা স্তর আরামদায়ক হতে পারে।',
    'clothing.cool': 'একটি হালকা জ্যাকেট বা সোয়েটশার্ট আরামদায়ক হতে পারে।',
    'clothing.cold': 'উষ্ণ জ্যাকেট পরামর্শ দেওয়া হচ্ছে।',
    'clothing.freezing': 'উষ্ণ, উত্তাপযুক্ত পোশাক পরামর্শ দেওয়া হচ্ছে।',
    'clothing.rain': 'ছাতা বা রেইন জ্যাকেট সাথে রাখার কথা ভাবুন।',
    'clothing.windy': 'বাতাসপ্রতিরোধী স্তর সহায়ক হতে পারে।',
    'clothing.humid': 'শ্বাসপ্রশ্বাসযোগ্য কাপড় বেছে নিন — আর্দ্রতা বেশি।',

    'astro.sunrise': 'সূর্যোদয়',
    'astro.sunset': 'সূর্যাস্ত',
    'astro.daylight': 'দিনের আলো',

    'map.rain': 'বৃষ্টি',
    'map.clouds': 'মেঘ',
    'map.wind': 'বাতাস',
    'map.temperature': 'তাপমাত্রা',
    'map.pressure': 'চাপ',
    'map.none': 'কিছু না',
    'map.noKey': 'আবহাওয়ার মানচিত্র স্তরের জন্য OpenWeatherMap API কী প্রয়োজন। বেস মানচিত্র এখনও উপলব্ধ।',
    'map.unavailable': 'মানচিত্র স্তর অনুপলব্ধ। বেস মানচিত্র ব্যবহারযোগ্য।',

    'export.description': 'এই অবস্থানের বর্তমান পূর্বাভাস ডাউনলোড করুন। ফাইল সম্পূর্ণভাবে আপনার ব্রাউজারে তৈরি হয়।',
    'export.excel': 'এক্সেল (.xlsx)',
    'export.csv': 'CSV',
    'export.pdf': 'PDF রিপোর্ট',
    'export.done': 'এক্সপোর্ট সম্পন্ন।',
    'export.failed': 'এক্সপোর্ট ব্যর্থ। আবার চেষ্টা করুন।',

    'install.prompt': 'আবহাওয়া অ্যাপ ইনস্টল করুন — দ্রুত অ্যাক্সেস ও অফলাইন আবহাওয়া পান।',

    'footer.dataBy': 'আবহাওয়ার তথ্য',
    'footer.mapBy': 'মানচিত্র',
    'footer.and': 'এবং',
    'footer.advisory': 'পূর্বাভাস পরামর্শমূলক। গুরুত্বপূর্ণ সিদ্ধান্তের আগে সর্বদা অফিসিয়াল সূত্র দেখুন।',

    'toast.locationDetected': 'অবস্থান শনাক্ত হয়েছে।',
    'toast.locationDenied': 'অবস্থানের অনুমতি অস্বীকৃত। ডিফল্ট অবস্থান ব্যবহার করা হচ্ছে।',
    'toast.usingCache': 'সংরক্ষিত আবহাওয়ার তথ্য ব্যবহার করা হচ্ছে।',
    'toast.weatherUpdated': 'আবহাওয়া সফলভাবে হালনাগাদ হয়েছে।',
    'toast.voiceListening': 'ভয়েস অনুসন্ধান শুনছে…',
    'toast.voiceUnsupported': 'এই ব্রাউজারে ভয়েস অনুসন্ধান সমর্থিত নয়।',
    'toast.favAdded': 'প্রিয় তালিকায় যোগ করা হয়েছে।',
    'toast.favRemoved': 'প্রিয় তালিকা থেকে সরানো হয়েছে।',
    'toast.favExists': 'এই অবস্থান ইতিমধ্যে আপনার প্রিয় তালিকায় আছে।',
    'toast.recentsCleared': 'সাম্প্রতিক অনুসন্ধান মুছে ফেলা হয়েছে।',
    'toast.invalidLocation': 'আমরা এই অবস্থান খুঁজে পাইনি।',

    'list.emptyFav': 'এখনো কোনো প্রিয় অবস্থান নেই। তারা বোতাম দিয়ে একটি সংরক্ষণ করুন।',
    'list.emptyRecents': 'এখনো কোনো সাম্প্রতিক অনুসন্ধান নেই।',

    'unit.kmh': 'কিমি/ঘণ্টা',
    'unit.hpa': 'হেক্টোপাস্কাল',
    'unit.km': 'কিমি',
    'unit.mm': 'মিমি',
    'unit.percent': '%',
    'unit.deg': '°',

    'day.today': 'আজ',
    'day.tomorrow': 'আগামীকাল',

    'provider.open-meteo': 'Open-Meteo',
    'provider.weatherapi': 'WeatherAPI',
    'provider.openweather': 'OpenWeather',
    'provider.cache': 'সংরক্ষিত তথ্য'
  }
};

let currentLang = 'en';

export function setLanguage(lang) {
  currentLang = translations[lang] ? lang : 'en';
  document.documentElement.setAttribute('lang', currentLang);
}

export function getLanguage() {
  return currentLang;
}

export function t(key, lang = currentLang) {
  const dict = translations[lang] || translations.en;
  return dict[key] ?? translations.en[key] ?? key;
}

export default translations;