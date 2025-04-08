// 天氣服務模組 - 整合OpenWeatherMap API
const WeatherService = (function() {
    // OpenWeatherMap API金鑰
    const API_KEY = ''; // 請在此處填入您的API金鑰
    
    // API基礎URL
    const BASE_URL = 'https://api.openweathermap.org/data/3.0';
    
    // 天氣圖示URL
    const ICON_URL = 'https://openweathermap.org/img/wn/';
    
    // 天氣資料緩存
    let weatherCache = {};
    
    // 緩存過期時間（毫秒）- 3小時
    const CACHE_EXPIRY = 3 * 60 * 60 * 1000;
    
    // 從本地儲存載入緩存
    function loadCacheFromStorage() {
        const cachedData = localStorage.getItem('weather_cache');
        if (cachedData) {
            try {
                weatherCache = JSON.parse(cachedData);
                console.log('已從本地儲存載入天氣緩存');
                
                // 清理過期的緩存項目
                const now = Date.now();
                let hasExpired = false;
                
                Object.keys(weatherCache).forEach(key => {
                    if (now - weatherCache[key].timestamp > CACHE_EXPIRY) {
                        delete weatherCache[key];
                        hasExpired = true;
                    }
                });
                
                if (hasExpired) {
                    saveCacheToStorage();
                    console.log('已清理過期的天氣緩存項目');
                }
            } catch (error) {
                console.error('載入天氣緩存時發生錯誤:', error);
                weatherCache = {};
            }
        }
    }
    
    // 將緩存保存到本地儲存
    function saveCacheToStorage() {
        try {
            localStorage.setItem('weather_cache', JSON.stringify(weatherCache));
        } catch (error) {
            console.error('保存天氣緩存時發生錯誤:', error);
            // 如果儲存空間已滿，清除緩存
            if (error.name === 'QuotaExceededError') {
                weatherCache = {};
                localStorage.removeItem('weather_cache');
            }
        }
    }
    
    // 生成緩存鍵
    function generateCacheKey(lat, lon, date) {
        return `${lat},${lon},${date}`;
    }
    
    // 檢查API金鑰是否已設置
    function isApiKeySet() {
        return API_KEY && API_KEY.length > 0;
    }
    
    // 獲取特定日期的天氣預報
    async function getWeatherForDate(lat, lon, date) {
        if (!isApiKeySet()) {
            console.error('尚未設置OpenWeatherMap API金鑰');
            return {
                error: true,
                message: '尚未設置天氣API金鑰'
            };
        }
        
        // 檢查參數
        if (!lat || !lon || !date) {
            console.error('獲取天氣預報時缺少必要參數');
            return {
                error: true,
                message: '缺少必要參數'
            };
        }
        
        // 生成緩存鍵
        const cacheKey = generateCacheKey(lat, lon, date);
        
        // 檢查緩存
        if (weatherCache[cacheKey] && 
            (Date.now() - weatherCache[cacheKey].timestamp < CACHE_EXPIRY)) {
            console.log(`使用緩存的天氣資料: ${cacheKey}`);
            return weatherCache[cacheKey].data;
        }
        
        try {
            // 計算日期差異（天數）
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const targetDate = new Date(date);
            targetDate.setHours(0, 0, 0, 0);
            
            const daysDiff = Math.round((targetDate - today) / (1000 * 60 * 60 * 24));
            
            let weatherData;
            
            // 根據日期差異選擇適當的API端點
            if (daysDiff >= 0 && daysDiff <= 7) {
                // 使用One Call API獲取未來7天的預報
                const response = await fetch(`${BASE_URL}/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&lang=zh_tw&appid=${API_KEY}`);
                
                if (!response.ok) {
                    throw new Error(`API請求失敗: ${response.status} ${response.statusText}`);
                }
                
                const data = await response.json();
                
                // 提取指定日期的天氣資料
                weatherData = data.daily[daysDiff];
                
                // 添加額外資訊
                weatherData.city = data.timezone.split('/').pop().replace(/_/g, ' ');
                weatherData.date = date;
                weatherData.forecast_type = 'daily';
            } else if (daysDiff > 7 && daysDiff <= 16) {
                // 使用16天預報API（需要付費訂閱）
                console.warn('請求的日期超出免費API的7天預報範圍，嘗試使用16天預報API');
                
                // 這裡可以實作付費API的調用，但目前我們返回一個錯誤
                return {
                    error: true,
                    message: '請求的日期超出免費API的7天預報範圍'
                };
            } else if (daysDiff < 0) {
                // 使用歷史天氣API（需要付費訂閱）
                console.warn('請求的是過去日期的天氣資料，嘗試使用歷史天氣API');
                
                // 這裡可以實作歷史天氣API的調用，但目前我們返回一個錯誤
                return {
                    error: true,
                    message: '請求的是過去日期的天氣資料，需要使用付費API'
                };
            } else {
                // 日期超出可預報範圍
                return {
                    error: true,
                    message: '請求的日期超出可預報範圍（最多7天）'
                };
            }
            
            // 緩存結果
            weatherCache[cacheKey] = {
                timestamp: Date.now(),
                data: weatherData
            };
            
            // 保存緩存到本地儲存
            saveCacheToStorage();
            
            return weatherData;
        } catch (error) {
            console.error('獲取天氣預報時發生錯誤:', error);
            return {
                error: true,
                message: `獲取天氣預報失敗: ${error.message}`
            };
        }
    }
    
    // 獲取當前天氣
    async function getCurrentWeather(lat, lon) {
        if (!isApiKeySet()) {
            console.error('尚未設置OpenWeatherMap API金鑰');
            return {
                error: true,
                message: '尚未設置天氣API金鑰'
            };
        }
        
        // 檢查參數
        if (!lat || !lon) {
            console.error('獲取當前天氣時缺少必要參數');
            return {
                error: true,
                message: '缺少必要參數'
            };
        }
        
        // 生成緩存鍵
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = generateCacheKey(lat, lon, 'current');
        
        // 檢查緩存
        if (weatherCache[cacheKey] && 
            (Date.now() - weatherCache[cacheKey].timestamp < CACHE_EXPIRY)) {
            console.log(`使用緩存的當前天氣資料: ${cacheKey}`);
            return weatherCache[cacheKey].data;
        }
        
        try {
            // 使用Current Weather API獲取當前天氣
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=zh_tw&appid=${API_KEY}`);
            
            if (!response.ok) {
                throw new Error(`API請求失敗: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // 格式化天氣資料
            const weatherData = {
                city: data.name,
                date: today,
                forecast_type: 'current',
                temp: {
                    day: data.main.temp,
                    min: data.main.temp_min,
                    max: data.main.temp_max
                },
                humidity: data.main.humidity,
                pressure: data.main.pressure,
                wind_speed: data.wind.speed,
                wind_deg: data.wind.deg,
                weather: data.weather[0],
                clouds: data.clouds.all,
                dt: data.dt
            };
            
            // 緩存結果
            weatherCache[cacheKey] = {
                timestamp: Date.now(),
                data: weatherData
            };
            
            // 保存緩存到本地儲存
            saveCacheToStorage();
            
            return weatherData;
        } catch (error) {
            console.error('獲取當前天氣時發生錯誤:', error);
            return {
                error: true,
                message: `獲取當前天氣失敗: ${error.message}`
            };
        }
    }
    
    // 獲取天氣圖示URL
    function getWeatherIconUrl(iconCode, size = '2x') {
        return `${ICON_URL}${iconCode}@${size}.png`;
    }
    
    // 獲取風向文字描述
    function getWindDirection(degrees) {
        const directions = ['北', '東北', '東', '東南', '南', '西南', '西', '西北'];
        const index = Math.round(degrees / 45) % 8;
        return directions[index];
    }
    
    // 格式化天氣描述
    function formatWeatherDescription(weatherData) {
        if (!weatherData || weatherData.error) {
            return '無法獲取天氣資訊';
        }
        
        let description = '';
        
        if (weatherData.forecast_type === 'current') {
            description = `${weatherData.city} 當前天氣: ${weatherData.weather.description}, 溫度 ${Math.round(weatherData.temp.day)}°C`;
            description += `\n濕度: ${weatherData.humidity}%, 風速: ${weatherData.wind_speed}m/s (${getWindDirection(weatherData.wind_deg)}風)`;
        } else {
            description = `${weatherData.city} ${weatherData.date} 天氣預報: ${weatherData.weather.description}`;
            description += `\n溫度: ${Math.round(weatherData.temp.day)}°C (最低 ${Math.round(weatherData.temp.min)}°C / 最高 ${Math.round(weatherData.temp.max)}°C)`;
            description += `\n濕度: ${weatherData.humidity}%, 風速: ${weatherData.wind_speed}m/s (${getWindDirection(weatherData.wind_deg)}風)`;
            
            if (weatherData.pop) {
                description += `\n降雨機率: ${Math.round(weatherData.pop * 100)}%`;
            }
        }
        
        return description;
    }
    
    // 根據天氣狀況提供行程建議
    function getTravelSuggestions(weatherData) {
        if (!weatherData || weatherData.error) {
            return [];
        }
        
        const suggestions = [];
        const weatherId = weatherData.weather.id;
        const temp = weatherData.temp.day;
        const windSpeed = weatherData.wind_speed;
        const pop = weatherData.pop || 0;
        
        // 根據天氣ID分類提供建議
        // 雷雨 (2xx)
        if (weatherId >= 200 && weatherId < 300) {
            suggestions.push('有雷雨天氣，建議避免戶外活動');
            suggestions.push('攜帶雨具並尋找室內景點替代方案');
            suggestions.push('注意天氣警報，確保安全');
        }
        // 毛毛雨 (3xx)
        else if (weatherId >= 300 && weatherId < 400) {
            suggestions.push('有毛毛雨，建議攜帶雨具');
            suggestions.push('可考慮室內景點或博物館');
        }
        // 雨 (5xx)
        else if (weatherId >= 500 && weatherId < 600) {
            suggestions.push('有雨，請攜帶雨具');
            if (weatherId >= 502) { // 大雨
                suggestions.push('大雨天氣，建議調整為室內行程');
                suggestions.push('注意交通狀況，可能會有延誤');
            } else {
                suggestions.push('輕微降雨，戶外活動時請注意防水');
            }
        }
        // 雪 (6xx)
        else if (weatherId >= 600 && weatherId < 700) {
            suggestions.push('有雪，請穿著保暖衣物');
            suggestions.push('道路可能濕滑，注意交通安全');
            if (weatherId >= 602) { // 大雪
                suggestions.push('大雪天氣，建議調整為室內行程');
                suggestions.push('檢查交通狀況，可能會有延誤或取消');
            }
        }
        // 霧等大氣現象 (7xx)
        else if (weatherId >= 700 && weatherId < 800) {
            if (weatherId === 781) { // 龍捲風
                suggestions.push('有龍捲風警報，請立即尋找安全處所');
                suggestions.push('取消所有戶外活動計劃');
            } else if (weatherId === 762) { // 火山灰
                suggestions.push('空氣中有火山灰，請戴口罩並減少戶外活動');
            } else {
                suggestions.push('能見度可能受限，駕車時請小心');
                suggestions.push('攜帶口罩可能有幫助');
            }
        }
        // 晴天 (800)
        else if (weatherId === 800) {
            suggestions.push('晴天適合戶外活動');
            if (temp > 30) {
                suggestions.push('溫度較高，請做好防曬並多補充水分');
                suggestions.push('考慮在中午時分安排室內或陰涼處的活動');
            } else if (temp < 10) {
                suggestions.push('溫度較低，請穿著保暖衣物');
            }
        }
        // 多雲 (80x)
        else if (weatherId > 800 && weatherId < 900) {
            suggestions.push('多雲天氣，適合大多數戶外活動');
            if (pop > 0.3) {
                suggestions.push(`有${Math.round(pop * 100)}%的降雨機率，建議攜帶雨具`);
            }
        }
        
        // 根據溫度提供建議
        if (temp > 35) {
            suggestions.push('極高溫天氣，請避免長時間戶外活動');
            suggestions.push('多補充水分，注意防曬和中暑');
        } else if (temp > 30 && temp <= 35) {
            suggestions.push('高溫天氣，請做好防曬措施');
            suggestions.push('建議攜帶足夠的水和遮陽物品');
        } else if (temp < 0) {
            suggestions.push('氣溫低於冰點，請穿著足夠保暖的衣物');
            suggestions.push('注意防滑，道路可能結冰');
        } else if (temp < 10) {
            suggestions.push('氣溫較低，請穿著保暖衣物');
        }
        
        // 根據風速提供建議
        if (windSpeed > 10.8) { // 強風
            suggestions.push('風速較大，戶外活動時請注意安全');
            suggestions.push('避免前往開闊地區或海邊');
        } else if (windSpeed > 17.2) { // 大風
            suggestions.push('大風天氣，建議取消戶外活動');
            suggestions.push('注意交通安全，留意掉落物');
        }
        
        return suggestions;
    }
    
    // 初始化模組
    function init() {
        loadCacheFromStorage();
        console.log('天氣服務模組已初始化');
    }
    
    // 設置API金鑰
    function setApiKey(key) {
        if (key && key.length > 0) {
            localStorage.setItem('weather_api_key', key);
            return true;
        }
        return false;
    }
    
    // 獲取API金鑰
    function getApiKey() {
        return localStorage.getItem('weather_api_key') || '';
    }
    
    // 公開API
    return {
        init: init,
        getWeatherForDate: getWeatherForDate,
        getCurrentWeather: getCurrentWeather,
        getWeatherIconUrl: getWeatherIconUrl,
        formatWeatherDescription: formatWeatherDescription,
        getTravelSuggestions: getTravelSuggestions,
        setApiKey: setApiKey,
        getApiKey: getApiKey,
        isApiKeySet: isApiKeySet
    };
})();

// 初始化天氣服務
document.addEventListener('DOMContentLoaded', function() {
    WeatherService.init();
});
