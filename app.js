// 全局变量
let startingPoint = null;
let destinations = [];
let map = null;
let markers = [];
let polyline = null;
let departureDate = null;
let departureTime = "09:00";  // 默認出發時間為早上9點
let maxDailyHours = 8;  // 每天的最大行程時間，預設為8小時

// 存儲每日特定的時間設置和結束地點
let dailySettings = []; // 格式: [{dayIndex: 0, departureTime: "09:00", maxHours: 8}, ...]
let dailyEndPoints = []; // 格式: [{dayIndex: 0, endPoint: {name, coordinates, stayDuration}}, ...]

// 位置緩存：儲存已經使用經緯度輸入過的位置名稱和坐標
let locationCache = {}; // 格式: {位置名稱: [緯度, 經度]}

// 本地儲存的鍵名
const STORAGE_KEY = 'travel_planner_data';
const SAVED_ITINERARIES_KEY = 'saved_itineraries';
const LOCATION_CACHE_KEY = 'location_cache';
const LOCATION_MANAGER_ID = 'location-manager-dialog';

// Undo/Redo 功能相關變量
let historyStates = []; // 儲存歷史狀態
let currentHistoryIndex = -1; // 當前歷史狀態的索引
const MAX_HISTORY_STATES = 30; // 最大歷史記錄數量

// 當前選擇的國家和城市
let currentCountry = '台灣';
let currentCity = '台北';

// 每天的最大行程时间（小时）
const MAX_DAILY_HOURS = 8;

// 景点默认停留时间（小时）
const DEFAULT_STAY_DURATION = {
    '公園': 1,
    '博物館': 2,
    '美術館': 1.5,
    '寺廟': 1,
    '夜市': 2,
    '海灘': 3,
    '山': 4,
    '湖': 1.5,
    '古蹟': 1.5,
    '購物中心': 2,
    '動物園': 3,
    '遊樂園': 5,
    '溫泉': 2,
    '瀑布': 1.5,
    '步道': 2.5,
    '展覽館': 1.5,
    '餐廳': 1.5,
    '咖啡廳': 1,
    '夜店': 3,
    '電影院': 2.5,
    '劇院': 2.5,
    '音樂廳': 2.5,
    '市場': 1.5,
    '廣場': 1,
    '碼頭': 1.5,
    '燈塔': 1,
    '觀景台': 1,
    '纜車': 1.5,
    '天文台': 1.5,
    '水族館': 2,
    '植物園': 1.5,
    '歷史街區': 2,
    '教堂': 1,
    '宮殿': 2,
    '城堡': 2,
    '農場': 2.5,
    '牧場': 2.5,
    '果園': 2,
    '酒莊': 2,
    '溫室': 1.5,
    '花園': 1.5,
    '森林': 3,
    '峽谷': 3,
    '洞穴': 1.5,
    '島嶼': 4,
    '沙漠': 3,
    '火山': 3,
    '冰川': 3,
    '溫泉區': 2.5,
    '滑雪場': 4,
    '衝浪點': 3,
    '潛水點': 3,
    '釣魚點': 3,
    '露營地': 5,
    '野餐區': 2,
    '觀鳥區': 2,
    '自然保護區': 3,
    '國家公園': 5,
    '主題公園': 5,
    '水上樂園': 4,
    '高爾夫球場': 4,
    '運動場': 2.5,
    '體育館': 2.5,
    '游泳池': 2,
    '健身中心': 1.5,
    '溜冰場': 2,
    '保齡球館': 2,
    '賽車場': 3,
    '賽馬場': 3,
    '賽狗場': 3,
    '賭場': 3,
    '遊艇碼頭': 2,
    '遊艇俱樂部': 3,
    '遊艇租賃': 4,
    '直升機場': 1,
    '機場': 2,
    '火車站': 1,
    '巴士站': 0.5,
    '地鐵站': 0.5,
    '輕軌站': 0.5,
    '渡輪碼頭': 1,
    '郵輪碼頭': 1.5,
    '其他': 2
};

// 交通方式和速度（公里/小时）
const TRANSPORTATION_SPEEDS = {
    '步行': 5,
    '自行車': 15,
    '機車': 40,
    '汽車': 60,
    '公車': 25, // 考慮站點停靠，速度略慢
    '捷運': 35, // 考慮站點停靠，速度略慢
    '火車': 70, // 考慮站點停靠，速度略慢
    '高鐵': 220, // 考慮站點停靠，速度略慢
    '飛機': 750, // 考慮起降時間
    // 日本交通方式
    '地鐵': 35, // 相當於捷運
    '電車': 70, // 相當於火車
    '新幹線': 250 // 相當於高鐵
};

// 根據地理位置識別國家和城市
function identifyLocation(latitude, longitude) {
    // 簡單的地理位置判斷，實際應用中可使用更精確的地理編碼API
    
    // 台灣範圍 (約略)
    if (latitude >= 21.5 && latitude <= 25.5 && longitude >= 119.5 && longitude <= 122.5) {
        // 台北市範圍 (約略)
        if (latitude >= 24.9 && latitude <= 25.2 && longitude >= 121.4 && longitude <= 121.7) {
            return { country: '台灣', city: '台北' };
        }
        // 高雄市範圍 (約略)
        else if (latitude >= 22.5 && latitude <= 23.0 && longitude >= 120.2 && longitude <= 120.5) {
            return { country: '台灣', city: '高雄' };
        }
        // 台中市範圍 (約略)
        else if (latitude >= 24.0 && latitude <= 24.3 && longitude >= 120.6 && longitude <= 121.0) {
            return { country: '台灣', city: '台中' };
        }
        // 其他台灣地區
        return { country: '台灣', city: '默認' };
    }
    
    // 日本範圍 (約略)
    else if (latitude >= 30.0 && latitude <= 46.0 && longitude >= 128.0 && longitude <= 146.0) {
        // 東京範圍 (約略)
        if (latitude >= 35.5 && latitude <= 36.0 && longitude >= 139.5 && longitude <= 140.0) {
            return { country: '日本', city: '東京' };
        }
        // 大阪範圍 (約略)
        else if (latitude >= 34.5 && latitude <= 35.0 && longitude >= 135.3 && longitude <= 135.7) {
            return { country: '日本', city: '大阪' };
        }
        // 京都範圍 (約略)
        else if (latitude >= 34.9 && latitude <= 35.2 && longitude >= 135.6 && longitude <= 136.0) {
            return { country: '日本', city: '京都' };
        }
        // 其他日本地區
        return { country: '日本', city: '默認' };
    }
    
    // 美國範圍 (約略)
    else if (latitude >= 24.0 && latitude <= 49.5 && longitude >= -125.0 && longitude <= -66.0) {
        // 紐約範圍 (約略)
        if (latitude >= 40.5 && latitude <= 41.0 && longitude >= -74.1 && longitude <= -73.7) {
            return { country: '美國', city: '紐約' };
        }
        // 洛杉磯範圍 (約略)
        else if (latitude >= 33.7 && latitude <= 34.2 && longitude >= -118.5 && longitude <= -118.0) {
            return { country: '美國', city: '洛杉磯' };
        }
        // 舊金山範圍 (約略)
        else if (latitude >= 37.7 && latitude <= 37.9 && longitude >= -122.5 && longitude <= -122.3) {
            return { country: '美國', city: '舊金山' };
        }
        // 其他美國地區
        return { country: '美國', city: '默認' };
    }
    
    // 中國範圍 (約略)
    else if (latitude >= 18.0 && latitude <= 53.0 && longitude >= 73.0 && longitude <= 135.0) {
        // 北京範圍 (約略)
        if (latitude >= 39.8 && latitude <= 40.2 && longitude >= 116.2 && longitude <= 116.6) {
            return { country: '中國', city: '北京' };
        }
        // 上海範圍 (約略)
        else if (latitude >= 31.0 && latitude <= 31.5 && longitude >= 121.2 && longitude <= 121.8) {
            return { country: '中國', city: '上海' };
        }
        // 廣州範圍 (約略)
        else if (latitude >= 22.9 && latitude <= 23.3 && longitude >= 113.1 && longitude <= 113.6) {
            return { country: '中國', city: '廣州' };
        }
        // 其他中國地區
        return { country: '中國', city: '默認' };
    }
    
    // 韓國範圍 (約略)
    else if (latitude >= 33.0 && latitude <= 38.7 && longitude >= 124.5 && longitude <= 131.0) {
        // 首爾範圍 (約略)
        if (latitude >= 37.4 && latitude <= 37.7 && longitude >= 126.8 && longitude <= 127.2) {
            return { country: '韓國', city: '首爾' };
        }
        // 釜山範圍 (約略)
        else if (latitude >= 35.0 && latitude <= 35.3 && longitude >= 128.9 && longitude <= 129.3) {
            return { country: '韓國', city: '釜山' };
        }
        // 其他韓國地區
        return { country: '韓國', city: '默認' };
    }
    
    // 默認返回
    return { country: '默認', city: '默認' };
}

// 初始化地图
function initMap() {
    // 世界中心点坐标（默認顯示台灣）
    const worldCenter = [23.6978, 120.9605];
    map = L.map('map').setView(worldCenter, 8);
    
    // 使用OpenStreetMap作为底图
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // 添加地圖點選功能
    map.on('click', function(e) {
        const latlng = e.latlng;
        handleMapClick(latlng);
    });
}

// 初始化事件监听器
function initEventListeners() {
    // 设置出发点
    document.getElementById('set-starting-point').addEventListener('click', function() {
        const startingPointInput = document.getElementById('starting-point').value.trim();
        if (startingPointInput) {
            setStartingPoint(startingPointInput);
        } else {
            alert('請輸入出發點！');
        }
    });
    
    // 添加景点
    document.getElementById('add-destination').addEventListener('click', function() {
        const newDestinationInput = document.getElementById('new-destination').value.trim();
        if (newDestinationInput) {
            addDestination(newDestinationInput);
            document.getElementById('new-destination').value = '';
        } else {
            alert('請輸入景點名稱！');
        }
    });
    
    // 設置經緯度輸入模式
    document.getElementById('set-coordinates-mode').addEventListener('click', function() {
        toggleCoordinatesInputMode();
    });
    
    // 管理經緯度位置
    document.getElementById('manage-coordinates').addEventListener('click', function() {
        manageLocationCache();
    });
    
    // 設置經緯度
    document.getElementById('set-coordinates').addEventListener('click', function() {
        const latInput = document.getElementById('latitude').value.trim();
        const lngInput = document.getElementById('longitude').value.trim();
        
        if (latInput && lngInput) {
            const lat = parseFloat(latInput);
            const lng = parseFloat(lngInput);
            
            if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
                const locationName = document.getElementById('coordinates-name').value.trim() || '自定義位置';
                handleCoordinatesInput(lat, lng, locationName);
            } else {
                alert('請輸入有效的經緯度！緯度範圍：-90 到 90，經度範圍：-180 到 180');
            }
        } else {
            alert('請輸入經緯度！');
        }
    });
    
    // 設定出發時間
    document.getElementById('set-departure-time').addEventListener('click', () => {
        const dateInput = document.getElementById('departure-date');
        const timeInput = document.getElementById('departure-time');
        
        departureDate = dateInput.value;
        departureTime = timeInput.value || "09:00";  // 如果用戶未輸入時間，則使用默認值
        
        // 顯示確認訊息
        if (departureDate) {
            alert(`已設定出發日期: ${departureDate}, 時間: ${departureTime}`);
        } else {
            alert(`已設定出發時間: ${departureTime} (未設定日期)`);
        }
        
        // 更新行程顯示
        updateItinerary();
    });
    
    // 設定每日行程時間
    document.getElementById('set-daily-hours').addEventListener('click', () => {
        const hoursInput = document.getElementById('max-daily-hours');
        const newHours = parseFloat(hoursInput.value);
        
        if (!isNaN(newHours) && newHours > 0 && newHours <= 24) {
            // 更新每日行程時間
            maxDailyHours = newHours;
            alert(`已設定每日行程時間: ${maxDailyHours} 小時`);
            
            // 重新分配行程
            updateItinerary();
        } else {
            alert('請輸入有效的時間（1-24小時）');
            hoursInput.value = maxDailyHours; // 重置為當前值
        }
    });
    
    // 儲存行程按鈕
    document.getElementById('save-itinerary').addEventListener('click', function() {
        if (!startingPoint) {
            alert('請先設置出發點！');
            return;
        }
        
        if (destinations.length === 0) {
            alert('請先添加至少一個景點！');
            return;
        }
        
        // 獲取已儲存的所有行程
        let savedItineraries = JSON.parse(localStorage.getItem(SAVED_ITINERARIES_KEY) || '{}');
        
        // 獲取最後一次使用的行程名稱
        let lastItineraryName = localStorage.getItem('last_itinerary_name') || '我的行程';
        
        // 彈出對話框讓用戶輸入行程名稱，預設使用最後一次的名稱
        const itineraryName = prompt('請輸入行程名稱：', lastItineraryName);
        
        if (!itineraryName) {
            alert('請輸入有效的行程名稱！');
            return;
        }
        
        // 儲存當前行程名稱，方便下次使用
        localStorage.setItem('last_itinerary_name', itineraryName);
        
        // 儲存當前行程
        savedItineraries[itineraryName] = {
            startingPoint: startingPoint,
            destinations: destinations,
            savedAt: new Date().toISOString(),
            departureDate: departureDate,
            departureTime: departureTime,
            maxDailyHours: maxDailyHours,
            dailySettings: dailySettings,
            dailyEndPoints: dailyEndPoints,
            locationCache: locationCache  // 同時保存位置緩存
        };
        
        // 更新本地儲存
        localStorage.setItem(SAVED_ITINERARIES_KEY, JSON.stringify(savedItineraries));
        
        // 同時更新當前行程
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            startingPoint: startingPoint,
            destinations: destinations,
            departureDate: departureDate,
            departureTime: departureTime,
            maxDailyHours: maxDailyHours,
            dailySettings: dailySettings,
            dailyEndPoints: dailyEndPoints,
            locationCache: locationCache
        }));
        
        console.log(`行程「${itineraryName}」已儲存到本地`);
        
        // 顯示儲存成功提示
        alert(`行程「${itineraryName}」已成功儲存！`);
    });
    
    // 讀取行程按鈕
    document.getElementById('load-itinerary').addEventListener('click', function() {
        loadItinerary();
    });
    
    // 管理行程按鈕
    document.getElementById('manage-itinerary').addEventListener('click', function() {
        manageItineraries();
    });
    
    // 匯出資料
    document.getElementById('export-data').addEventListener('click', function() {
        exportData();
    });
    
    // 匯入資料
    document.getElementById('import-data').addEventListener('click', function() {
        importData();
    });
    
    // 修復數據
    document.getElementById('repair-data').addEventListener('click', function() {
        repairLocalStorage();
    });
    
    // 規劃新行程按鈕
    document.getElementById('new-itinerary').addEventListener('click', startNewItinerary);
    
    // Undo 和 Redo 按鈕
    document.getElementById('undo-button').addEventListener('click', undoAction);
    document.getElementById('redo-button').addEventListener('click', redoAction);
    
    // 添加鍵盤快捷鍵
    document.addEventListener('keydown', function(e) {
        // 檢查是否在輸入框中
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        // Ctrl+Z 或 Command+Z（Mac）用於復原操作
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            undoAction();
        }
        
        // Ctrl+Y、Command+Y（Mac）或 Ctrl+Shift+Z 用於重做操作
        if (((e.ctrlKey || e.metaKey) && e.key === 'y') || 
            ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z')) {
            e.preventDefault();
            redoAction();
        }
    });
}

// 设置出发点
async function setStartingPoint(location) {
    try {
        const coordinates = await geocodeLocation(location);
        startingPoint = {
            name: location,
            coordinates: coordinates,
            stayDuration: 0 // 出发点不计入停留时间
        };
        
        // 更新地图
        updateMap();
        
        // 更新行程
        updateItinerary();
        
        // 启用添加景点功能
        document.getElementById('new-destination').disabled = false;
        document.getElementById('add-destination').disabled = false;
        
        console.log(`出發點設置為: ${location}`);
    } catch (error) {
        alert(`無法找到位置: ${location}。請嘗試更具體的地址。`);
        console.error('Geocoding error:', error);
    }
    
    // 保存當前狀態
    saveStateToHistory();
}

// 添加景点
async function addDestination(location) {
    if (!startingPoint) {
        alert('請先設置出發點！');
        return;
    }
    
    try {
        let coordinates;
        
        // 檢查緩存中是否有該位置的經緯度資料
        if (locationCache[location]) {
            // 使用緩存的經緯度資料
            coordinates = locationCache[location];
            console.log(`使用緩存中的經緯度資料: ${location} -> [${coordinates[0]}, ${coordinates[1]}]`);
        } else {
            // 執行地理編碼獲取經緯度
            coordinates = await geocodeLocation(location);
        }
        
        // 根據經緯度識別當前位置的國家和城市
        const locationInfo = identifyLocation(coordinates[0], coordinates[1]);
        currentCountry = locationInfo.country;
        currentCity = locationInfo.city;
        
        console.log(`識別位置為: ${currentCountry} - ${currentCity}`);
        
        // 确定景点类型和停留时间
        const stayDuration = determineStayDuration(location);
        
        // 添加到目的地列表
        destinations.push({
            name: location,
            coordinates: coordinates,
            stayDuration: stayDuration,
            country: currentCountry,
            city: currentCity
        });
        
        // 更新地图
        updateMap();
        
        // 更新行程
        updateItinerary();
        
        console.log(`新增景點: ${location}，停留時間: ${stayDuration} 小時`);
    } catch (error) {
        console.error('Geocoding error:', error);
        
        // 詢問用戶是否要在Google地圖中搜索該位置
        const useGoogleMaps = confirm(`無法找到位置: ${location}。\n\n是否要在Google地圖中搜索此位置？\n（您可以在Google地圖中找到正確位置後，使用經緯度來設定）`);
        
        if (useGoogleMaps) {
            // 打開Google地圖搜索該位置
            openGoogleMapsSearch(location);
            
            // 自動切換到經緯度輸入模式
            toggleCoordinatesInputMode();
            
            // 預先填入位置名稱
            document.getElementById('coordinates-name').value = location;
        }
    }
    
    // 保存當前狀態
    saveStateToHistory();
}

// 删除景点
function removeDestination(index) {
    // 獲取要刪除的景點名稱
    const destinationName = destinations[index].name;
    
    // 顯示確認對話框
    if (!confirm(`確定要刪除景點「${destinationName}」嗎？`)) {
        return; // 如果用戶取消，則不執行刪除操作
    }
    
    destinations.splice(index, 1);
    
    // 更新地图
    updateMap();
    
    // 更新行程
    updateItinerary();
    
    console.log(`已刪除景點 #${index + 1}: ${destinationName}`);
    
    // 保存當前狀態
    saveStateToHistory();
}

// 地理编码：将地址转换为坐标
async function geocodeLocation(location) {
    // 使用Nominatim API进行地理编码（免费的OpenStreetMap服务）
    // 移除台灣限制，支持全球範圍的地點搜索
    const query = encodeURIComponent(location);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.length > 0) {
            return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        } else {
            throw new Error('Location not found');
        }
    } catch (error) {
        console.error('Geocoding error:', error);
        throw error;
    }
}

// 确定景点停留时间
function determineStayDuration(location) {
    // 简单的关键词匹配来确定景点类型
    for (const [keyword, duration] of Object.entries(DEFAULT_STAY_DURATION)) {
        if (location.includes(keyword)) {
            return duration;
        }
    }
    
    // 默认停留时间
    return DEFAULT_STAY_DURATION['其他'];
}

// 计算两点之间的距离（公里）
function calculateDistance(coord1, coord2) {
    // 使用Haversine公式计算两点之间的距离
    const R = 6371; // 地球半径（公里）
    const dLat = (coord2[0] - coord1[0]) * Math.PI / 180;
    const dLon = (coord2[1] - coord1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(coord1[0] * Math.PI / 180) * Math.cos(coord2[0] * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// 确定两点之间的最佳交通方式
function determineTransportation(coord1, coord2) {
    const distance = calculateDistance(coord1, coord2);
    
    // 根据距离确定交通方式，優先使用大眾運輸
    if (distance < 1) {
        return { mode: '步行', time: distance / TRANSPORTATION_SPEEDS['步行'] };
    } else if (distance < 3) {
        // 短距離優先使用公車，考慮等車時間
        return { mode: '公車', time: (distance / TRANSPORTATION_SPEEDS['公車']) + 0.25 };
    } else if (distance < 30) {
        // 市內交通優先使用捷運，考慮等車和換乘時間
        return { mode: '捷運', time: (distance / TRANSPORTATION_SPEEDS['捷運']) + 0.3 };
    } else if (distance < 100) {
        // 城際交通優先使用火車，考慮候車時間
        return { mode: '火車', time: (distance / TRANSPORTATION_SPEEDS['火車']) + 0.5 };
    } else if (distance < 300) {
        // 長途交通使用高鐵，考慮候車和安檢時間
        return { mode: '高鐵', time: (distance / TRANSPORTATION_SPEEDS['高鐵']) + 1 };
    } else {
        // 超長距離使用飛機，考慮機場等待時間、安檢時間和交通時間
        return { mode: '飛機', time: (distance / TRANSPORTATION_SPEEDS['飛機']) + 3 };
    }
}

// 优化行程顺序（使用最近邻算法）
function optimizeItinerary() {
    if (destinations.length <= 1) {
        return; // 不需要优化
    }
    
    const optimizedDestinations = [destinations[0]]; // 从第一个景点开始
    const remainingDestinations = [...destinations.slice(1)];
    
    while (remainingDestinations.length > 0) {
        const lastPoint = optimizedDestinations[optimizedDestinations.length - 1];
        let nearestIndex = 0;
        let minDistance = calculateDistance(lastPoint.coordinates, remainingDestinations[0].coordinates);
        
        // 找到最近的下一个景点
        for (let i = 1; i < remainingDestinations.length; i++) {
            const distance = calculateDistance(lastPoint.coordinates, remainingDestinations[i].coordinates);
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = i;
            }
        }
        
        // 添加到优化后的行程中
        const nextDestination = remainingDestinations[nearestIndex];
        optimizedDestinations.push(nextDestination);
        remainingDestinations.splice(nearestIndex, 1);
    }
    
    destinations = optimizedDestinations;
}

// 将行程分配到多天
function distributeItineraryToDays() {
    if (!startingPoint || destinations.length === 0) {
        return [];
    }
    
    const days = [];
    let currentDay = [];
    let currentDayDuration = 0;
    let lastDayLastDestination = null; // 記錄前一天最後的景點
    let currentDayStartTime = null; // 當天的起始時間
    let currentDayIndex = 0; // 當前是第幾天
    
    // 取得第一天的設定
    let currentDaySettings = getDaySettings(0);
    
    // 第一天的起始時間
    currentDayStartTime = new Date();
    currentDayStartTime.setHours(
        currentDaySettings.departureHours, 
        currentDaySettings.departureMinutes, 
        0, 0
    );
    
    // 添加發出點作為第一天起點
    currentDay.push({
        ...startingPoint,
        isStartingPoint: true,
        transportationFromPrevious: null,
        arrivalTime: formatTime(currentDayStartTime), // 出發點的到達時間就是出發時間
        stayDuration: 0 // 確保出發點不計入停留時間
    });
    
    // 檢查當前天是否有設定結束地點
    const checkDayEndPoint = (dayIndex, destination, destIndex) => {
        const dayEndPoint = dailyEndPoints.find(ep => ep.dayIndex === dayIndex);
        
        if (!dayEndPoint) return false;
        
        // 先按名稱匹配
        if (destination.name === dayEndPoint.endPoint.name) {
            // 如果名稱匹配，檢查此景點是否為當天行程中此名稱的最後一個景點
            // 為此，需要找出當天所有同名景點
            const dayDestinations = destinations.filter((dest, i) => {
                // 通過模擬行程分配邏輯來確定景點在哪一天
                let destDay = 0;
                let currentTime = 0;
                let lastCoords = startingPoint.coordinates;
                
                for (let j = 0; j <= i; j++) {
                    // 計算交通時間
                    const transport = determineTransportation(lastCoords, destinations[j].coordinates);
                    // 累計時間
                    currentTime += transport.time + (j === i ? 0 : destinations[j].stayDuration);
                    
                    // 檢查是否需要換天
                    if (currentTime > getDaySettings(destDay).maxHours) {
                        destDay++;
                        currentTime = transport.time;
                    }
                    
                    lastCoords = destinations[j].coordinates;
                }
                
                return destDay === dayIndex && destinations[i].name === destination.name;
            });
            
            // 查找當前景點在同名景點中的位置
            const currentDestIndex = destinations.indexOf(destination);
            
            // 如果是最後一個同名景點，則標記為結束點
            const isLastOccurrence = currentDestIndex === Math.max(...dayDestinations.map(d => destinations.indexOf(d)));
            
            if (isLastOccurrence) {
                // 精確比較座標，以進一步確認
                return (
                    Math.abs(destination.coordinates[0] - dayEndPoint.endPoint.coordinates[0]) < 0.0000001 && 
                    Math.abs(destination.coordinates[1] - dayEndPoint.endPoint.coordinates[1]) < 0.0000001
                );
            }
        }
        
        return false;
    };
    
    // 遍歷所有目的地
    for (let i = 0; i < destinations.length; i++) {
        const destination = destinations[i];
        const previousPoint = currentDay[currentDay.length - 1];
        
        // 計算交通時間
        const transportation = determineTransportation(
            previousPoint.coordinates,
            destination.coordinates
        );
        
        // 計算加上當前景點後的總時間
        const totalTimeWithCurrentDestination = currentDayDuration + transportation.time + destination.stayDuration;
        
        // 檢查是否是當天的結束地點
        const isEndPoint = checkDayEndPoint(currentDayIndex, destination, i);
        
        // 檢查是否是當天的最後一個景點
        const isLastDestination = 
            (i === destinations.length - 1) || 
            (totalTimeWithCurrentDestination > currentDaySettings.maxHours) ||
            isEndPoint; // 使用新的判斷方法
        
        // 記錄時間計算結果，幫助調試
        console.log(`景點 ${destination.name} - 當前天數: ${currentDayIndex+1}, 當前累積時間: ${currentDayDuration}, 交通時間: ${transportation.time}, 停留時間: ${destination.stayDuration}, 總計: ${totalTimeWithCurrentDestination}, 最大限制: ${currentDaySettings.maxHours}, 是否是結束地點: ${isEndPoint}, 是否是最後一個景點: ${isLastDestination}`);
        
        // 如果是當天最後一個景點，暫時不計入停留時間
        const effectiveStayDuration = isLastDestination ? 0 : destination.stayDuration;
        
        // 計算當前景點總時長（交通時間 + 停留時間）
        const totalTime = transportation.time + effectiveStayDuration;
        
        // 計算預計到達時間
        let arrivalTime = new Date(currentDayStartTime);
        
        if (previousPoint.isStartingPoint) {
            // 如果前一個點是出發點，直接加上交通時間計算第一個景點的到達時間
            const transportHours = Math.floor(transportation.time);
            const transportMinutes = Math.round((transportation.time - transportHours) * 60);
            arrivalTime.setHours(arrivalTime.getHours() + transportHours);
            arrivalTime.setMinutes(arrivalTime.getMinutes() + transportMinutes);
        } else {
            // 從上一個點的到達時間開始計算
            const prevArrivalTimeParts = previousPoint.arrivalTime.split(':').map(Number);
            arrivalTime.setHours(prevArrivalTimeParts[0], prevArrivalTimeParts[1], 0, 0);
            
            // 加上上一個點的停留時間
            const prevStayHours = Math.floor(previousPoint.stayDuration);
            const prevStayMinutes = Math.round((previousPoint.stayDuration - prevStayHours) * 60);
            arrivalTime.setHours(arrivalTime.getHours() + prevStayHours);
            arrivalTime.setMinutes(arrivalTime.getMinutes() + prevStayMinutes);
            
            // 加上交通時間
            const transportHours = Math.floor(transportation.time);
            const transportMinutes = Math.round((transportation.time - transportHours) * 60);
            arrivalTime.setHours(arrivalTime.getHours() + transportHours);
            arrivalTime.setMinutes(arrivalTime.getMinutes() + transportMinutes);
        }
        
        // 檢查是否需要進入下一天
        const needNextDay = 
            (totalTimeWithCurrentDestination > currentDaySettings.maxHours) || 
            // 如果這個景點是結束地點，且不是最後一個景點，則下一個景點需要進入下一天
            (isEndPoint && i < destinations.length - 1);
        
        if (needNextDay) {
            // 如果超過當天時間限制或者是設定的結束地點，進入下一天
            
            // 添加當前景點到今天的行程（作為今天的最後一個景點）
                currentDay.push({
                ...destination,
                    isStartingPoint: false,
                transportationFromPrevious: transportation,
                arrivalTime: formatTime(arrivalTime),
                effectiveStayDuration: 0, // 結束地點不計停留時間
                isEndPoint: isEndPoint
            });
            
            // 更新當天行程時間（只計算交通時間，不計算停留時間）
            currentDayDuration += transportation.time;
            
            // 記錄這個點作為下一天的起點
            lastDayLastDestination = destination;
            
            // 將當前天加入到days陣列
            days.push(currentDay);
            
            // 進入下一天
            currentDay = [];
            currentDayIndex++;
            
            // 獲取下一天的設定
            currentDaySettings = getDaySettings(currentDayIndex);
            
            // 下一天的起始時間
            currentDayStartTime = new Date();
            currentDayStartTime.setHours(
                currentDaySettings.departureHours,
                currentDaySettings.departureMinutes, 
                0, 0
            );
            
            // 將前一天的最後一個景點作為下一天的起點
            currentDay.push({
                ...lastDayLastDestination,
                isStartingPoint: false,
                transportationFromPrevious: null,
                arrivalTime: formatTime(currentDayStartTime),
                stayDuration: 0 // 確保每一天的第一個點不計入停留時間
            });
            
            // 重置當天行程時間
            currentDayDuration = 0;
            
            // 如果這是一個結束地點且不是所有景點的最後一個，跳到下一個景點
            if (isEndPoint && i < destinations.length - 1) {
                continue;
            }
        } else {
            // 正常添加景點到當前天
            currentDay.push({
                ...destination,
                isStartingPoint: false,
                transportationFromPrevious: transportation,
                arrivalTime: formatTime(arrivalTime),
                effectiveStayDuration: effectiveStayDuration,
                isEndPoint: isEndPoint
            });
            
            // 更新當天行程時間
            currentDayDuration += totalTime;
        }
    }
    
    // 添加最後一天
    if (currentDay.length > 1) { // 確保至少有一目的地
        days.push(currentDay);
    }
    
    return days;
}

// 獲取特定日期的設定，如果沒有則使用默認值
function getDaySettings(dayIndex) {
    // 查找這一天的特定設定
    const daySetting = dailySettings.find(setting => setting.dayIndex === dayIndex);
    
    if (daySetting) {
        // 如果有特定設定，解析出發時間
        const [departureHours, departureMinutes] = daySetting.departureTime.split(':').map(Number);
        return {
            departureHours: departureHours,
            departureMinutes: departureMinutes,
            maxHours: daySetting.maxHours
        };
    } else {
        // 如果沒有特定設定，使用全局設定
        const [defaultHours, defaultMinutes] = departureTime.split(':').map(Number);
        return {
            departureHours: defaultHours,
            departureMinutes: defaultMinutes,
            maxHours: maxDailyHours
        };
    }
}

// 格式化時間為 HH:MM 格式
function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 更新地图
function updateMap() {
    // 清除现有标记和路线
    clearMap();
    
    if (!startingPoint) {
        return;
    }
    
    // 添加出发点标记
    addMarker(startingPoint.coordinates, startingPoint.name, 'green');
    
    // 根據當前顯示模式決定顯示哪些景點
    if (currentViewMode === 'page') {
        // 翻頁模式：只顯示當前頁的景點
        const days = distributeItineraryToDays();
        
        // 確保當前日索引有效
        if (currentDayIndex >= 0 && currentDayIndex < days.length) {
            const currentDay = days[currentDayIndex];
            console.log(`翻頁模式: 顯示第 ${currentDayIndex + 1} 天的 ${currentDay.length} 個景點`);
            
            // 找出當前天中的景點在全局 destinations 數組中的索引
            const currentDayDestinations = currentDay.filter(dest => !dest.isStartingPoint);
            
            // 為當前天的景點添加標記
            let markerIndex = 1; // 從1開始標記景點序號
            currentDayDestinations.forEach(dayDest => {
                // 查找此景點在全局 destinations 數組中的索引
                const destIndex = destinations.findIndex(d => 
                    d.name === dayDest.name && 
                    d.coordinates[0] === dayDest.coordinates[0] && 
                    d.coordinates[1] === dayDest.coordinates[1]
                );
                
                if (destIndex !== -1) {
                    addMarker(dayDest.coordinates, `${markerIndex}. ${dayDest.name}`, 'red');
                    markerIndex++;
                }
            });
            
            // 繪製當前天的路線
            drawDayRoute(currentDay);
        }
    } else {
        // 一頁式模式：顯示所有景點
        console.log(`一頁式模式: 顯示所有 ${destinations.length} 個景點`);
        
        // 添加目的地标记
        destinations.forEach((destination, index) => {
            addMarker(destination.coordinates, `${index + 1}. ${destination.name}`, 'red');
        });
        
        // 绘制路线
        drawRoute();
    }
    
    // 调整地图视图以包含所有标记
    fitMapToMarkers();
}

// 繪製指定日期的路線
function drawDayRoute(dayDestinations) {
    if (!dayDestinations || dayDestinations.length <= 1) {
        return;
    }
    
    // 創建路徑點數組
    const routePoints = dayDestinations.map(dest => dest.coordinates);
    
    // 繪製路線
    polyline = L.polyline(routePoints, { color: 'blue', weight: 3 }).addTo(map);
}

// 清除地图上的标记和路线
function clearMap() {
    // 清除标记
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // 清除路线
    if (polyline) {
        map.removeLayer(polyline);
        polyline = null;
    }
}

// 添加标记到地图
function addMarker(coordinates, title, color) {
    const markerIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold;">${markers.length + 1}</div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
    
    const marker = L.marker(coordinates, { icon: markerIcon }).addTo(map);
    marker.bindPopup(title);
    markers.push(marker);
}

// 绘制路线
function drawRoute() {
    if (!startingPoint || destinations.length === 0) {
        return;
    }
    
    // 创建路径点数组
    const routePoints = [startingPoint.coordinates];
    destinations.forEach(destination => {
        routePoints.push(destination.coordinates);
    });
    
    // 绘制路线
    polyline = L.polyline(routePoints, { color: 'blue', weight: 3 }).addTo(map);
}

// 调整地图视图以包含所有标记
function fitMapToMarkers() {
    if (markers.length === 0) {
        return;
    }
    
    const group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds().pad(0.1)); // 添加一些填充
}

// 從本地儲存讀取行程
function loadItinerary() {
    try {
        // 添加錯誤處理和記錄日誌
        console.log('正在嘗試讀取已保存的行程...');
        
        // 從本地存儲獲取保存的行程
        const savedItinerariesStr = localStorage.getItem(SAVED_ITINERARIES_KEY);
        console.log('從localStorage獲取的行程數據:', savedItinerariesStr);
        
        if (!savedItinerariesStr) {
            alert('沒有找到已保存的行程數據');
            return;
        }
        
        let savedItineraries;
        try {
            savedItineraries = JSON.parse(savedItinerariesStr);
            console.log('解析後的行程數據:', savedItineraries);
            
            if (!savedItineraries || typeof savedItineraries !== 'object') {
                throw new Error('無效的行程數據格式');
            }
        } catch (parseError) {
            console.error('解析行程數據時出錯:', parseError);
            alert('行程數據損壞，無法讀取。您可能需要重新創建行程。');
        return;
    }
    
        const itineraryNames = Object.keys(savedItineraries);
        
        if (itineraryNames.length === 0) {
            alert('沒有保存的行程');
            return;
        }
        
        // 建立行程選擇對話框
        console.log('發現', itineraryNames.length, '個已保存的行程');
        
        // 創建選擇對話框
        const selectDialog = document.createElement('div');
        selectDialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        `;
        
        const dialogContent = document.createElement('div');
        dialogContent.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 5px;
            max-width: 500px;
            width: 100%;
            max-height: 80vh;
            overflow-y: auto;
        `;
        
        dialogContent.innerHTML = `
            <h3>選擇行程</h3>
            <ul style="list-style: none; padding: 0;">
                ${itineraryNames.map((name, index) => {
                    const item = savedItineraries[name];
                    const savedDate = item.savedAt ? new Date(item.savedAt).toLocaleString('zh-TW') : '未知日期';
                    const startPointName = item.startingPoint ? item.startingPoint.name : '未設置出發點';
                    const destinationsCount = item.destinations ? item.destinations.length : 0;
                    
                    return `
                    <li style="margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                        <strong>${name}</strong>
                        <div>建立日期: ${savedDate}</div>
                        <div>出發點: ${startPointName}</div>
                        <div>景點數: ${destinationsCount}</div>
                        ${item.departureDate ? `<div>出發日期: ${item.departureDate}</div>` : ''}
                        ${item.departureTime ? `<div>出發時間: ${item.departureTime}</div>` : ''}
                        ${item.maxDailyHours ? `<div>每日行程時間: ${item.maxDailyHours} 小時</div>` : ''}
                        <div style="margin-top: 10px;">
                            <button class="load-btn" data-name="${name}">讀取</button>
                            <button class="delete-btn" data-name="${name}">刪除</button>
                        </div>
                    </li>
                    `;
                }).join('')}
            </ul>
            <div style="text-align: right; margin-top: 20px;">
                <button id="cancel-load">取消</button>
            </div>
        `;
        
        selectDialog.appendChild(dialogContent);
        document.body.appendChild(selectDialog);
        
        // 取消按鈕
        document.getElementById('cancel-load').addEventListener('click', () => {
            document.body.removeChild(selectDialog);
        });
        
        // 讀取行程
        document.querySelectorAll('.load-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                try {
                    const name = btn.dataset.name;
                    console.log('嘗試讀取行程:', name);
                    
                    const selectedItinerary = savedItineraries[name];
                    if (!selectedItinerary) {
                        throw new Error(`找不到名為 "${name}" 的行程`);
                    }
                    
                    console.log('選擇的行程數據:', selectedItinerary);
                    
                    // 檢查必要的數據
                    if (!selectedItinerary.startingPoint) {
                        throw new Error('行程數據損壞：缺少出發點');
                    }
                    
                    if (!Array.isArray(selectedItinerary.destinations)) {
                        throw new Error('行程數據損壞：目的地不是有效的數組');
                    }
                    
                    // 讀取行程數據
                    startingPoint = selectedItinerary.startingPoint;
                    destinations = selectedItinerary.destinations;
                    
                    // 讀取出發時間信息
                    departureDate = selectedItinerary.departureDate || null;
                    departureTime = selectedItinerary.departureTime || "09:00";
                    
                    // 讀取每日行程時間
                    if (selectedItinerary.maxDailyHours) {
                        maxDailyHours = selectedItinerary.maxDailyHours;
                        document.getElementById('max-daily-hours').value = maxDailyHours;
                    }
                    
                    // 讀取每日特定設定
                    if (selectedItinerary.dailySettings && Array.isArray(selectedItinerary.dailySettings)) {
                        dailySettings = selectedItinerary.dailySettings;
                    } else {
                        dailySettings = []; // 如果沒有每日設定，重置為空
                    }
                    
                    // 讀取每日結束地點設定
                    if (selectedItinerary.dailyEndPoints && Array.isArray(selectedItinerary.dailyEndPoints)) {
                        dailyEndPoints = selectedItinerary.dailyEndPoints;
                    } else {
                        dailyEndPoints = []; // 如果沒有結束地點設定，重置為空
                    }
                    
                    // 更新界面
                    document.getElementById('starting-point').value = startingPoint.name;
                    
                    // 如果有出發日期和時間，更新相應的輸入框
                    if (departureDate) {
                        document.getElementById('departure-date').value = departureDate;
                    }
                    if (departureTime) {
                        document.getElementById('departure-time').value = departureTime;
                    }
                    
                    // 启用添加景点功能
                    document.getElementById('new-destination').disabled = false;
                    document.getElementById('add-destination').disabled = false;
                    
                    // 更新地圖和行程
                    updateItinerary();
                    updateMap();
                    
                    // 讀取位置緩存
                    if (selectedItinerary.locationCache) {
                        locationCache = selectedItinerary.locationCache;
                        // 更新本地儲存的位置緩存
                        localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationCache));
                        console.log('已讀取位置緩存:', Object.keys(locationCache).length, '個地點');
                    }
                    
                    // 保存當前狀態到歷史記錄
                    saveStateToHistory();
                    
                    document.body.removeChild(selectDialog);
                    alert(`已讀取行程: ${name}`);
                } catch (loadError) {
                    console.error('讀取行程時出錯:', loadError);
                    alert(`讀取行程時出錯: ${loadError.message}`);
                }
            });
        });
        
        // 刪除行程
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();  // 避免觸發父元素的點擊事件
                
                const name = btn.dataset.name;
                
                if (confirm(`確定要刪除行程 "${name}" 嗎?`)) {
                    delete savedItineraries[name];
                    localStorage.setItem(SAVED_ITINERARIES_KEY, JSON.stringify(savedItineraries));
                    
                    // 重新繪製對話框
                    document.body.removeChild(selectDialog);
                    if (Object.keys(savedItineraries).length > 0) {
                        loadItinerary();
                    } else {
                        alert('沒有更多保存的行程');
                    }
                }
            });
        });
    } catch (error) {
        console.error('讀取行程過程中發生錯誤:', error);
        alert(`讀取行程失敗: ${error.message}\n\n請嘗試清除瀏覽器緩存或重新創建行程。`);
    }
}

// 更新行程显示
// 添加班次查詢功能的CSS樣式
document.head.insertAdjacentHTML('beforeend', `
<style>
.transportation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 15px;
}

.transportation-actions button {
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    padding: 5px 10px;
    cursor: pointer;
    font-size: 0.9em;
    transition: background-color 0.3s;
}

.transportation-actions button:hover {
    background-color: #45a049;
}

.transportation-actions button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
}

.destination-item {
    cursor: move;
}

.day-title button {
    margin-left: 10px;
    font-size: 0.8em;
    padding: 3px 8px;
}

.stay-duration-edit {
    display: inline-block;
    margin-left: 10px;
    cursor: pointer;
    color: #4a89dc;
    font-size: 0.9em;
}

.stay-duration-edit:hover {
    text-decoration: underline;
}

.dragging {
    opacity: 0.5;
    background-color: #f0f0f0;
}
</style>
`);

function updateItinerary() {
    const daysContainer = document.getElementById('itinerary-container');
    
    // 確保容器存在
    if (!daysContainer) {
        console.error('找不到行程容器元素 #itinerary-container');
        return;
    }
    
    daysContainer.innerHTML = '';
    
    if (!startingPoint) {
        daysContainer.innerHTML = '<div class="empty-state"><img src="https://cdn-icons-png.flaticon.com/512/5578/5578703.png" style="width: 120px; height: 120px; margin-bottom: 20px;"><p>請先設置出發點</p></div>';
        return;
    }
    
    if (destinations.length === 0) {
        daysContainer.innerHTML = '<div class="empty-state"><img src="https://cdn-icons-png.flaticon.com/512/1041/1041728.png" style="width: 120px; height: 120px; margin-bottom: 20px;"><p>請添加景點</p></div>';
        return;
    }
    
    // 分配行程到多天
    const days = distributeItineraryToDays();
    
    // 獲取當前日期，用於計算行程日期
    const today = new Date();
    const departureDate = document.getElementById('departure-date')?.value;
    let tripStartDate;
    
    if (departureDate) {
        tripStartDate = new Date(departureDate);
    } else {
        tripStartDate = new Date();
    }
    
    // 创建每天的行程卡片
    days.forEach((day, dayIndex) => {
        // 計算當前行程日期
        const currentDate = new Date(tripStartDate);
        currentDate.setDate(tripStartDate.getDate() + dayIndex);
        const formattedDate = formatDateWithLunar(currentDate);
        
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.dataset.dayIndex = dayIndex;
        
        // 設置卡片的基本樣式
        if (dayIndex % 2 === 0) {
            dayCard.style.backgroundColor = '#f9f9f9';
        } else {
            dayCard.style.backgroundColor = '#ffffff';
        }
        
        // 獲取當天的設定
        const daySetting = dailySettings.find(setting => setting.dayIndex === dayIndex);
        const departureTimeValue = daySetting ? daySetting.departureTime : departureTime;
        const maxHoursValue = daySetting ? daySetting.maxHours : maxDailyHours;
        
        // 計算當天已安排的時間
        let scheduledHours = 0;
        day.forEach((point, index) => {
            if (index > 0) { // 跳過起點
                scheduledHours += point.transportationFromPrevious.time;
                if (!point.isEndPoint) {
                    scheduledHours += point.stayDuration;
                }
            }
        });
        
        // 計算剩餘時間
        const remainingHours = Math.max(0, maxHoursValue - scheduledHours);
        const scheduledPercentage = Math.min(100, (scheduledHours / maxHoursValue) * 100);
        
        // 创建天数标题和设置
        const dayTitle = document.createElement('div');
        dayTitle.className = 'day-title';
        dayTitle.innerHTML = `
            <div class="day-header">
                <div>
                    <h3 style="margin: 0; color: #4a89dc;">第 ${dayIndex + 1} 天 ${formattedDate}</h3>
                </div>
            </div>
            <div class="day-info" style="display: flex; justify-content: space-between; margin: 15px 0;">
                <div class="day-settings">
                    <div style="margin-bottom: 5px;">
                        <i class="far fa-clock"></i> 出發時間: <strong>${departureTimeValue}</strong>
                    </div>
                    <div>
                        <i class="fas fa-hourglass-half"></i> 行程時間: <strong>${maxHoursValue}</strong> 小時 
                        <span style="font-size: 12px; color: #666;">(已安排: ${scheduledHours.toFixed(1)} 小時)</span>
                    </div>
                </div>
                <div>
                    <button class="day-settings-button" onclick="editDaySettings(${dayIndex})">
                        <i class="fas fa-cog"></i> 設定
                    </button>
                    <div style="font-size: 12px; color: #777; text-align: center; margin-top: 5px;">
                        可設定每日出發時間及行程時間
                    </div>
                </div>
            </div>
            <div class="time-progress" style="height: 6px; background-color: #e0e0e0; border-radius: 3px; margin-bottom: 15px;">
                <div style="height: 100%; width: ${scheduledPercentage}%; background-color: ${scheduledPercentage > 90 ? '#e74c3c' : '#4CAF50'}; border-radius: 3px;"></div>
            </div>
            <div style="text-align: right; margin-bottom: 10px; display: flex; justify-content: flex-end; gap: 10px;">
                <button class="optimize-day-button" onclick="optimizeDayItinerary(${dayIndex})">
                    <i class="fas fa-route"></i> 路徑最佳化
                </button>
                <button class="add-to-day-btn" onclick="showAddToSpecificDayDialog(${dayIndex})">
                    <i class="fas fa-plus-circle"></i> 在此日添加景點
                </button>
            </div>
        `;
        dayCard.appendChild(dayTitle);
        
        // 添加每个目的地
        day.forEach((point, pointIndex) => {
            if (point.isStartingPoint && pointIndex === 0) {
                // 出发点
                const startingPointItem = document.createElement('div');
                startingPointItem.className = 'destination-item';
                startingPointItem.dataset.pointIndex = pointIndex;
                startingPointItem.dataset.isStartingPoint = 'true';
                startingPointItem.innerHTML = `
                    <div class="destination-info">
                        <div class="destination-name">
                            <i class="fas fa-map-marker-alt" style="color: #4CAF50;"></i> 出發點: ${point.name}
                        </div>
                        <div class="destination-details">
                            <div><i class="far fa-clock"></i> 出發時間: ${point.arrivalTime}</div>
                            ${point.country ? `<div style="font-size: 12px; color: #666;"><i class="fas fa-globe-asia"></i> ${point.country} ${point.city || ''}</div>` : ''}
                        </div>
                    </div>
                `;
                dayCard.appendChild(startingPointItem);
            } else if (!point.isStartingPoint) {
                // 交通方式
                if (point.transportationFromPrevious) {
                    const transportationItem = document.createElement('div');
                    transportationItem.className = 'transportation';
                    
                    // 根據交通方式選擇適當的圖標，優先顯示大眾運輸工具
                    let transportIcon = '🚌'; // 默認改為公車圖標
                    
                    switch(point.transportationFromPrevious.mode) {
                        case '步行':
                            transportIcon = '🚶';
                            break;
                        case '自行車':
                            transportIcon = '🚲';
                            break;
                        case '機車':
                            transportIcon = '🛵';
                            break;
                        case '汽車':
                            transportIcon = '🚗';
                            break;
                        case '公車':
                            transportIcon = '🚌';
                            break;
                        case '捷運':
                            transportIcon = '🚇';
                            break;
                        case '火車':
                            transportIcon = '🚆';
                            break;
                        case '高鐵':
                            transportIcon = '🚄';
                            break;
                        case '飛機':
                            transportIcon = '✈️';
                            break;
                        default:
                            transportIcon = '🚌'; // 默認改為公車圖標
                    }
                    
                    // 獲取起訖點信息
                    let fromLocation = '';
                    let toLocation = '';
                    let fromCountry = currentCountry;
                    let fromCity = currentCity;
                    let toCountry = currentCountry;
                    let toCity = currentCity;
                    
                    if (pointIndex > 0) {
                        fromLocation = day[pointIndex - 1].name;
                        toLocation = point.name;
                        
                        // 獲取起訖點的國家和城市信息
                        if (day[pointIndex - 1].country) {
                            fromCountry = day[pointIndex - 1].country;
                            fromCity = day[pointIndex - 1].city || '';
                        }
                        
                        if (point.country) {
                            toCountry = point.country;
                            toCity = point.city || '';
                        }
                    }
                    
                    // 使用目的地的國家和城市作為當前位置
                    // 這樣可以確保查詢的是目的地所在地區的交通系統
                    currentCountry = toCountry;
                    currentCity = toCity;
                    
                    // 獲取當前國家的交通方式映射
                    const modeMapping = TRANSPORTATION_MODE_MAPPING[currentCountry] || TRANSPORTATION_MODE_MAPPING['默認'];
                    
                    // 將標準交通方式映射到當地交通方式名稱
                    const localTransportMode = modeMapping[point.transportationFromPrevious.mode] || point.transportationFromPrevious.mode;
                    
                    // 轉換分鐘為小時和分鐘格式
                    const totalMinutes = Math.round(point.transportationFromPrevious.time * 60);
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    let timeDisplay = '';
                    
                    if (hours > 0) {
                        timeDisplay += `${hours} 小時 `;
                    }
                    if (minutes > 0 || hours === 0) {
                        timeDisplay += `${minutes} 分鐘`;
                    }
                    
                    transportationItem.innerHTML = `
                        <div class="transportation-icon">${transportIcon}</div>
                        <div class="transportation-info">
                            <div>交通方式: ${point.transportationFromPrevious.mode}</div>
                            <div>預計時間: ${timeDisplay}</div>
                        </div>
                        <div class="transportation-actions">
                            <button onclick="openScheduleQuery('${point.transportationFromPrevious.mode}', '${fromLocation}', '${toLocation}')" title="查詢交通路線">
                                <i class="fas fa-search"></i> 交通查詢
                            </button>
                        </div>
                    `;
                    
                    console.log(`顯示從 ${fromLocation} 到 ${toLocation} 的交通方式: ${point.transportationFromPrevious.mode}，當地對應: ${localTransportMode}，國家/城市: ${currentCountry}/${currentCity}`);
                    dayCard.appendChild(transportationItem);
                }
                
                // 目的地
                const destinationItem = document.createElement('div');
                destinationItem.className = 'destination-item';
                destinationItem.dataset.pointIndex = pointIndex;
                destinationItem.dataset.destinationIndex = destinations.findIndex(d => d.name === point.name);
                
                // 設置是否為出發點或結束點的標記
                if (point.isStartingPoint) {
                    destinationItem.dataset.isStartingPoint = "true";
                    destinationItem.draggable = false; // 出發點不可拖曳
                } else if (point.isEndPoint) {
                    destinationItem.dataset.isEndPoint = "true";
                    destinationItem.draggable = false; // 結束點不可拖曳
                } else {
                destinationItem.draggable = true;
                }
                
                // 添加停留時間編輯功能
                const destinationIndex = destinations.findIndex(d => d.name === point.name);
                
                // 判斷是否為出發點
                let setEndPointButton = '';
                if (!point.isStartingPoint && !point.isEndPoint) {
                    // 只有非出發點和非結束點的景點才能設為結束地點
                    setEndPointButton = `<button class="set-endpoint-btn" onclick="selectEndPointFromDay(${dayIndex}, ${destinationIndex})">設為結束點</button>`;
                }
                
                destinationItem.innerHTML = `
                    <div class="destination-info">
                        <div class="destination-name">${point.name}</div>
                        <div class="destination-details">
                            <div>預計到達時間: ${point.arrivalTime}</div>
                            ${point.isEndPoint ?
                                `<div><strong>當天行程結束地點</strong></div>
                                <button class="remove-endpoint-btn" onclick="removeDayEndPoint(${dayIndex})">取消設為結束點</button>` :
                                point.hasOwnProperty('effectiveStayDuration') && point.effectiveStayDuration === 0 ?
                                    `<div>停留時間: 行程結束</div>` :
                                    `<div>建議停留時間: ${point.stayDuration} 小時</div>
                                    <span class="stay-duration-edit" onclick="editStayDuration(${destinationIndex})">✏️ 編輯</span>`
                            }
                        </div>
                    </div>
                    <div class="destination-actions">
                        ${setEndPointButton}
                        <button class="remove-btn" onclick="removeDestination(${destinationIndex})">✖</button>
                    </div>
                `;
                
                // 添加拖曳事件監聽器
                destinationItem.addEventListener('dragstart', handleDragStart);
                destinationItem.addEventListener('dragend', handleDragEnd);
                destinationItem.addEventListener('dragover', handleDragOver);
                destinationItem.addEventListener('dragenter', handleDragEnter);
                destinationItem.addEventListener('dragleave', handleDragLeave);
                destinationItem.addEventListener('drop', handleDrop);
                
                // 添加觸摸事件監聽器（用於移動設備）
                destinationItem.addEventListener('touchstart', handleTouchStart);
                destinationItem.addEventListener('touchmove', handleTouchMove);
                destinationItem.addEventListener('touchend', handleTouchEnd);
                destinationItem.addEventListener('touchcancel', handleTouchEnd);
                
                dayCard.appendChild(destinationItem);
            }
        });
        
        daysContainer.appendChild(dayCard);
    });
    
    // 初始化或更新顯示模式功能
    initViewModeToggle();
    
    // 更新翻頁控件
    updatePagerControls();
    
    // 更新日期摘要
    updateSummaryDays();
    
    // 如果當前是翻頁模式，確保只顯示當前頁
    if (currentViewMode === 'page') {
        const itinerarySection = document.querySelector('.itinerary-section');
        itinerarySection.classList.add('paged-mode');
        showDayByIndex(currentDayIndex);
    }
    
    // 在函數結尾添加視圖模式初始化
    initViewModeToggle();
    reinitViewMode();
}

// 切換經緯度輸入模式
function toggleCoordinatesInputMode() {
    const coordinatesInputContainer = document.getElementById('coordinates-input-container');
    
    if (coordinatesInputContainer.style.display === 'none' || !coordinatesInputContainer.style.display) {
        coordinatesInputContainer.style.display = 'block';
    } else {
        coordinatesInputContainer.style.display = 'none';
    }
}

// 處理經緯度輸入
function handleCoordinatesInput(lat, lng, locationName) {
    // 將地點資訊存入緩存
    locationCache[locationName] = [lat, lng];
    // 保存緩存到本地儲存
    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationCache));
    
    // 根據當前狀態決定是設置為出發點還是添加為景點
    if (!startingPoint) {
        // 如果還沒有出發點，則設置為出發點
        startingPoint = {
            name: locationName,
            coordinates: [lat, lng],
            stayDuration: 0 // 出發點不計入停留時間
        };
        
        // 更新地圖和行程
        updateMap();
        updateItinerary();
        
        // 啟用添加景點功能
        document.getElementById('new-destination').disabled = false;
        document.getElementById('add-destination').disabled = false;
        
        // 更新出發點輸入框
        document.getElementById('starting-point').value = locationName;
        
        console.log(`出發點設置為: ${locationName}`);
    } else {
        // 已有出發點，添加為景點
        const stayDuration = determineStayDuration(locationName);
        
        destinations.push({
            name: locationName,
            coordinates: [lat, lng],
            stayDuration: stayDuration
        });
        
        // 更新地圖和行程
        updateMap();
        updateItinerary();
        
        console.log(`新增景點: ${locationName}，停留時間: ${stayDuration} 小時`);
    }
    
    // 清空經緯度輸入框
    document.getElementById('latitude').value = '';
    document.getElementById('longitude').value = '';
    document.getElementById('coordinates-name').value = '';
    
    // 隱藏經緯度輸入區域
    document.getElementById('coordinates-input-container').style.display = 'none';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化地图
    initMap();
    
    // 初始化事件监听器
    initEventListeners();
    
    // 禁用添加景点功能，直到设置出发点
    document.getElementById('new-destination').disabled = true;
    document.getElementById('add-destination').disabled = true;
    
    // 讀取位置緩存
    const savedLocationCache = localStorage.getItem(LOCATION_CACHE_KEY);
    if (savedLocationCache) {
        locationCache = JSON.parse(savedLocationCache);
        console.log('已讀取位置緩存:', Object.keys(locationCache).length, '個地點');
    }
    
    // 載入並顯示保存的行程數據（如果有）
    try {
        // 嘗試從本地儲存中讀取行程數據
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            
            if (parsedData.startingPoint) {
                startingPoint = parsedData.startingPoint;
                document.getElementById('starting-point').value = startingPoint.name;
                
                // 启用添加景点功能
                document.getElementById('new-destination').disabled = false;
                document.getElementById('add-destination').disabled = false;
            }
            
            if (parsedData.destinations && Array.isArray(parsedData.destinations)) {
                destinations = parsedData.destinations;
            }
            
            if (parsedData.departureDate) {
                departureDate = parsedData.departureDate;
                document.getElementById('departure-date').value = departureDate;
            }
            
            if (parsedData.departureTime) {
                departureTime = parsedData.departureTime;
                document.getElementById('departure-time').value = departureTime;
            }
            
            if (parsedData.maxDailyHours) {
                maxDailyHours = parsedData.maxDailyHours;
                document.getElementById('max-daily-hours').value = maxDailyHours;
            }
            
            if (parsedData.dailySettings && Array.isArray(parsedData.dailySettings)) {
                dailySettings = parsedData.dailySettings;
            }
            
            if (parsedData.dailyEndPoints && Array.isArray(parsedData.dailyEndPoints)) {
                dailyEndPoints = parsedData.dailyEndPoints;
            }
            
            if (parsedData.locationCache) {
                locationCache = parsedData.locationCache;
            }
            
            // 更新行程和地圖
            updateItinerary();
            updateMap();
            
            console.log('已從本地儲存載入行程數據');
        }
    } catch (error) {
        console.error('讀取保存的行程數據時出錯:', error);
    }
    
    // 嘗試讀取已儲存的行程
    loadItinerary();
    
    // 看是否有從管理頁面選擇的行程
    const selectedItineraryName = sessionStorage.getItem('selected_itinerary');
    if (selectedItineraryName) {
        // 清除，避免重複載入
        sessionStorage.removeItem('selected_itinerary');
        
        // 載入選定的行程
        loadSelectedItinerary(selectedItineraryName);
    }
    
    // 應用程式初始化後，保存第一個狀態到歷史記錄
    setTimeout(() => {
        saveStateToHistory();
        console.log('已保存初始狀態到歷史記錄');
    }, 1000);
    
    // 檢查URL中是否包含經緯度參數
    parseLocationFromUrl();
    
    // 初始化行程顯示模式
    initViewModeToggle();
});

// 根據交通方式和起訖點打開交通查詢網站
function openScheduleQuery(transportMode, fromLocation, toLocation) {
    // 確保起訖點不為空
    if (!fromLocation || !toLocation) {
        alert('無法獲取完整的起訖點信息，無法查詢交通路線');
        return;
    }
    
    console.log(`查詢交通: ${transportMode}，從 ${fromLocation} 到 ${toLocation}，當前位置: ${currentCountry}/${currentCity}`);
    
    // 檢查是否有保存的交通查詢偏好
    let savedPreferences = localStorage.getItem('transportQueryPreferences');
    let preferences = null;
    
    if (savedPreferences) {
        try {
            preferences = JSON.parse(savedPreferences);
        } catch (e) {
            console.error('無法解析保存的交通查詢偏好:', e);
        }
    }
    
    // 創建交通查詢設置對話框
    showTransportQueryDialog(transportMode, fromLocation, toLocation, preferences);
}

// 顯示交通查詢設置對話框
function showTransportQueryDialog(defaultMode, defaultFrom, defaultTo, savedPreferences) {
    // 創建對話框
    const dialog = document.createElement('div');
    dialog.className = 'query-dialog';
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(3px);
    `;
    
    // 將預設值與保存的偏好合併
    let transportMode = defaultMode;
    let fromLocation = defaultFrom;
    let toLocation = defaultTo;
    let savePreferences = false;
    
    // 檢查是否已有保存偏好
    let hasPreferences = false;
    
    if (savedPreferences) {
        // 如果有保存的偏好，記住設置但不自動套用起點和終點
        hasPreferences = true;
        
        // 只在用戶明確勾選了"記住起點"時才使用保存的起點
        if (savedPreferences.saveFrom && savedPreferences.customFrom && savedPreferences.alwaysUseCustomFrom) {
            fromLocation = savedPreferences.customFrom;
        }
        
        // 只在用戶明確勾選了"記住終點"時才使用保存的終點
        if (savedPreferences.saveTo && savedPreferences.customTo && savedPreferences.alwaysUseCustomTo) {
            toLocation = savedPreferences.customTo;
        }
        
        // 交通方式可以自動套用，因為它通常較為固定
        if (savedPreferences.saveMode && savedPreferences.customMode) {
            transportMode = savedPreferences.customMode;
        }
        
        savePreferences = savedPreferences.savePreferences || false;
    }
    
    // 獲取Google Maps支持的交通方式
    const transportModes = [
        { value: 'driving', text: '汽車/機車', icon: 'fa-car' },
        { value: 'transit', text: '大眾運輸', icon: 'fa-bus' },
        { value: 'walking', text: '步行', icon: 'fa-walking' },
        { value: 'bicycling', text: '自行車', icon: 'fa-bicycle' }
    ];
    
    // 將當前交通方式轉換為Google Maps支持的格式
    let googleMapsMode = 'transit'; // 預設使用大眾運輸
    
    // 根據交通方式選擇適當的Google Maps旅行模式
    switch(transportMode) {
        case '步行':
            googleMapsMode = 'walking';
            break;
        case '自行車':
            googleMapsMode = 'bicycling';
            break;
        case '汽車':
        case '機車':
            googleMapsMode = 'driving';
            break;
        case '公車':
        case '捷運':
        case '地鐵':
        case '火車':
        case '高鐵':
        case '電車':
        case '新幹線':
        default:
            googleMapsMode = 'transit';
            break;
    }
    
    // 創建對話框內容
    const dialogContent = document.createElement('div');
    dialogContent.className = 'query-dialog-content';
    dialogContent.style.cssText = `
        background: white;
        padding: 25px;
        border-radius: 8px;
        max-width: 550px;
        width: 90%;
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    `;
    
    dialogContent.innerHTML = `
        <h3 style="color: #4a89dc; margin-bottom: 20px; text-align: center; font-size: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">
            <i class="fas fa-route"></i> 自定義交通查詢
        </h3>
        
        <div style="margin-bottom: 20px;">
            <div style="margin-bottom: 15px;">
                <label for="transport-mode" style="display: block; font-weight: bold; color: #333; margin-bottom: 10px;">交通方式:</label>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${transportModes.map(mode => `
                        <div class="transport-mode-option ${googleMapsMode === mode.value ? 'active' : ''}" data-mode="${mode.value}" style="
                            flex: 1; 
                            min-width: 100px; 
                            padding: 10px; 
                            text-align: center; 
                            border: 1px solid #ddd; 
                            border-radius: 6px; 
                            cursor: pointer;
                            ${googleMapsMode === mode.value ? 'background-color: #4a89dc; color: white;' : 'background-color: #f9f9f9;'}
                        ">
                            <i class="fas ${mode.icon}" style="font-size: 20px; margin-bottom: 5px;"></i>
                            <div>${mode.text}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label for="from-location" style="display: block; font-weight: bold; color: #333; margin-bottom: 10px;">起點:</label>
                <input type="text" id="from-location" value="${fromLocation}" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 5px;">
                <div style="display: flex; align-items: center;">
                    <input type="checkbox" id="save-from" ${savedPreferences && savedPreferences.saveFrom ? 'checked' : ''} style="margin-right: 10px;">
                    <label for="save-from" style="font-size: 14px; color: #666;">記住此起點設置</label>
                </div>
                <div style="display: flex; align-items: center; margin-top: 5px;">
                    <input type="checkbox" id="always-use-from" ${savedPreferences && savedPreferences.alwaysUseCustomFrom ? 'checked' : ''} style="margin-right: 10px;">
                    <label for="always-use-from" style="font-size: 14px; color: #666;">總是使用自定義起點</label>
                </div>
            </div>
            
            <div style="margin-bottom: 15px;">
                <label for="to-location" style="display: block; font-weight: bold; color: #333; margin-bottom: 10px;">終點:</label>
                <input type="text" id="to-location" value="${toLocation}" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 5px;">
                <div style="display: flex; align-items: center;">
                    <input type="checkbox" id="save-to" ${savedPreferences && savedPreferences.saveTo ? 'checked' : ''} style="margin-right: 10px;">
                    <label for="save-to" style="font-size: 14px; color: #666;">記住此終點設置</label>
                </div>
                <div style="display: flex; align-items: center; margin-top: 5px;">
                    <input type="checkbox" id="always-use-to" ${savedPreferences && savedPreferences.alwaysUseCustomTo ? 'checked' : ''} style="margin-right: 10px;">
                    <label for="always-use-to" style="font-size: 14px; color: #666;">總是使用自定義終點</label>
                </div>
            </div>
            
            <div style="margin-bottom: 15px; border-top: 1px solid #eee; padding-top: 15px;">
                <div style="display: flex; align-items: center;">
                    <input type="checkbox" id="save-preferences" ${savePreferences ? 'checked' : ''} style="margin-right: 10px;">
                    <label for="save-preferences" style="font-weight: bold; color: #333;">將此設置保存為默認值</label>
                </div>
                <p style="margin-top: 5px; font-size: 13px; color: #666;">保存後，所有交通查詢將默認使用這些設置</p>
            </div>
        </div>
        
        <div style="display: flex; justify-content: space-between;">
            <button id="query-transport" class="query-btn" style="background-color: #4CAF50; color: white; border: none; padding: 12px 0; border-radius: 6px; cursor: pointer; flex: 1; margin-right: 15px; font-weight: bold;">
                <i class="fas fa-search" style="margin-right: 8px;"></i> 查詢交通路線
            </button>
            <button id="cancel-query" class="query-btn" style="background-color: #f0ad4e; color: white; border: none; padding: 12px 0; border-radius: 6px; cursor: pointer; flex: 1;">
                <i class="fas fa-times" style="margin-right: 8px;"></i> 取消
            </button>
        </div>
    `;
    
    dialog.appendChild(dialogContent);
    document.body.appendChild(dialog);
    
    // 為交通方式選項添加點擊事件
    const transportOptions = document.querySelectorAll('.transport-mode-option');
    transportOptions.forEach(option => {
        option.addEventListener('click', () => {
            // 移除所有選項的選中狀態
            transportOptions.forEach(opt => {
                opt.classList.remove('active');
                opt.style.backgroundColor = '#f9f9f9';
                opt.style.color = '#333';
            });
            
            // 設置當前選項為選中狀態
            option.classList.add('active');
            option.style.backgroundColor = '#4a89dc';
            option.style.color = 'white';
            
            // 更新選中的交通方式
            googleMapsMode = option.dataset.mode;
        });
    });
    
    // 查詢按鈕點擊事件
    document.getElementById('query-transport').addEventListener('click', () => {
        // 獲取用戶輸入的值
        const customFrom = document.getElementById('from-location').value.trim();
        const customTo = document.getElementById('to-location').value.trim();
        const saveFrom = document.getElementById('save-from').checked;
        const saveTo = document.getElementById('save-to').checked;
        const alwaysUseCustomFrom = document.getElementById('always-use-from').checked;
        const alwaysUseCustomTo = document.getElementById('always-use-to').checked;
        const saveAllPreferences = document.getElementById('save-preferences').checked;
        
        // 保存用戶偏好設置
        if (saveAllPreferences || saveFrom || saveTo || alwaysUseCustomFrom || alwaysUseCustomTo) {
            const preferences = {
                savePreferences: saveAllPreferences,
                saveFrom: saveFrom,
                customFrom: saveFrom ? customFrom : '',
                alwaysUseCustomFrom: alwaysUseCustomFrom, 
                saveTo: saveTo,
                customTo: saveTo ? customTo : '',
                alwaysUseCustomTo: alwaysUseCustomTo,
                saveMode: saveAllPreferences,
                customMode: saveAllPreferences ? googleMapsMode : ''
            };
            
            localStorage.setItem('transportQueryPreferences', JSON.stringify(preferences));
        }
        
        // 構建Google Maps URL
        const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(customFrom)}&destination=${encodeURIComponent(customTo)}&travelmode=${googleMapsMode}`;
        
        // 關閉對話框
        document.body.removeChild(dialog);
        
        // 打開Google Maps
        window.open(googleMapsUrl, '_blank');
        
        console.log(`使用Google Maps查詢從 ${customFrom} 到 ${customTo} 的交通路線，交通方式: ${googleMapsMode}`);
        console.log(`打開URL: ${googleMapsUrl}`);
    });
    
    // 取消按鈕點擊事件
    document.getElementById('cancel-query').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
}

// 拖曳相關變數
let draggedItem = null;
let touchDraggedItem = null;
let touchStartX = 0;
let touchStartY = 0;
let isTouchMoving = false;
let longPressTimer = null;

// 拖曳事件處理函數
function handleDragStart(e) {
    // 如果是出發點或結束點，則不允許拖曳
    if (this.dataset.isStartingPoint === "true" || this.dataset.isEndPoint === "true") {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    
    // 在拖曳前先檢查，確保相同元素不會在拖曳中被修改屬性
    const destinationIndex = parseInt(this.dataset.destinationIndex);
    if (isNaN(destinationIndex) || destinationIndex < 0 || destinationIndex >= destinations.length) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    
    draggedItem = this;
    setTimeout(() => {
        this.classList.add('dragging');
    }, 0);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedItem = null;
}

function handleDragOver(e) {
    if (e.preventDefault) {
        e.preventDefault();
    }
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDragEnter(e) {
    // 如果目標是出發點或結束點，則不顯示拖曳目標樣式
    if (this.dataset.isStartingPoint === "true" || this.dataset.isEndPoint === "true") {
        return;
    }
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    // 如果目標是出發點或結束點，則不執行交換
    if (this.dataset.isStartingPoint === "true" || this.dataset.isEndPoint === "true") {
        return false;
    }
    
    if (draggedItem !== this) {
        // 獲取拖曳項目和目標項目的索引
        const draggedIndex = parseInt(draggedItem.dataset.destinationIndex);
        const targetIndex = parseInt(this.dataset.destinationIndex);
        
        if (!isNaN(draggedIndex) && !isNaN(targetIndex) && 
            draggedIndex >= 0 && draggedIndex < destinations.length &&
            targetIndex >= 0 && targetIndex < destinations.length) {
            
            console.log(`交換目的地: 從索引 ${draggedIndex}(${destinations[draggedIndex].name}) 到 ${targetIndex}(${destinations[targetIndex].name})`);
            
            // 交換目的地順序
            const temp = destinations[draggedIndex];
            destinations[draggedIndex] = destinations[targetIndex];
            destinations[targetIndex] = temp;
            
            // 更新地圖和行程
            updateMap();
            updateItinerary();
            
            // 保存當前狀態
            saveStateToHistory();
        } else {
            console.error(`無法交換目的地: 無效的索引 (拖曳: ${draggedIndex}, 目標: ${targetIndex})`);
        }
    }
    
    this.classList.remove('drag-over');
    return false;
}

// 移動設備觸控處理函數
function handleTouchStart(e) {
    // 如果是出發點或結束點，則不啟動拖曳
    if (this.dataset.isStartingPoint === "true" || this.dataset.isEndPoint === "true") {
        return;
    }
    
    touchDraggedItem = this;
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    isTouchMoving = false;
    
    setTimeout(() => {
        if (!isTouchMoving && touchDraggedItem) {
            touchDraggedItem.classList.add('dragging');
            // 長按震動反饋（如果設備支持）
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
    }, 300);  // 300ms 長按後觸發拖曳
}

function handleTouchMove(e) {
    if (!touchDraggedItem) return;
    
    const touch = e.touches[0];
    const moveX = touch.clientX - touchStartX;
    const moveY = touch.clientY - touchStartY;
    
    // 確定是否為有意義的移動（超過10px）
    if (Math.abs(moveX) > 10 || Math.abs(moveY) > 10) {
        isTouchMoving = true;
    }
    
    // 只有在拖曳模式下才滾動頁面
    if (touchDraggedItem.classList.contains('dragging')) {
        e.preventDefault();  // 防止頁面滾動
        
        // 獲取觸摸位置下的元素
        const elementsUnderTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
        
        // 查找可拖放的目標元素
        for (const element of elementsUnderTouch) {
            if (element.classList.contains('destination-item') && element !== touchDraggedItem) {
                // 檢查是否為出發點或結束點
                if (element.dataset.isStartingPoint === "true" || element.dataset.isEndPoint === "true") {
                    continue; // 跳過出發點和結束點
                }
                
                // 移除之前的目標元素標記
                document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
                
                // 標記當前目標元素
                element.classList.add('drag-over');
                break;
            }
        }
    }
}

function handleTouchEnd(e) {
    if (!touchDraggedItem) return;
    
    if (touchDraggedItem.classList.contains('dragging')) {
        const touch = e.changedTouches[0];
        
        // 獲取觸摸結束位置下的元素
        const elementsUnderTouch = document.elementsFromPoint(touch.clientX, touch.clientY);
        
        // 查找可拖放的目標元素
        for (const element of elementsUnderTouch) {
            if (element.classList.contains('destination-item') && element !== touchDraggedItem) {
                // 檢查是否為出發點或結束點
                if (element.dataset.isStartingPoint === "true" || element.dataset.isEndPoint === "true") {
                    continue; // 跳過出發點和結束點
                }
                
                // 獲取索引並交換位置
                const draggedIndex = parseInt(touchDraggedItem.dataset.destinationIndex);
                const targetIndex = parseInt(element.dataset.destinationIndex);
                
                if (!isNaN(draggedIndex) && !isNaN(targetIndex) && 
                    draggedIndex >= 0 && draggedIndex < destinations.length &&
                    targetIndex >= 0 && targetIndex < destinations.length) {
                    
                    console.log(`觸摸交換目的地: 從索引 ${draggedIndex}(${destinations[draggedIndex].name}) 到 ${targetIndex}(${destinations[targetIndex].name})`);
                    
                    // 交換目的地順序
                    const temp = destinations[draggedIndex];
                    destinations[draggedIndex] = destinations[targetIndex];
                    destinations[targetIndex] = temp;
                    
                    // 更新地圖和行程
                    updateMap();
                    updateItinerary();
                    
                    // 保存當前狀態
                    saveStateToHistory();
                } else {
                    console.error(`觸摸無法交換目的地: 無效的索引 (拖曳: ${draggedIndex}, 目標: ${targetIndex})`);
                }
                
                break;
            }
        }
    }
    
    // 清理狀態
    if (touchDraggedItem) {
        touchDraggedItem.classList.remove('dragging');
        touchDraggedItem = null;
    }
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

// 編輯停留時間功能
function editStayDuration(index) {
    if (index < 0 || index >= destinations.length) {
        return;
    }
    
    const destination = destinations[index];
    const currentDuration = destination.stayDuration;
    
    // 彈出對話框讓用戶輸入新的停留時間
    const newDuration = prompt(`請輸入「${destination.name}」的停留時間（小時）：`, currentDuration);
    
    if (newDuration === null) {
        return; // 用戶取消
    }
    
    const parsedDuration = parseFloat(newDuration);
    
    if (isNaN(parsedDuration) || parsedDuration < 0) {
        alert('請輸入有效的停留時間！');
        return;
    }
    
    // 更新停留時間
    destination.stayDuration = parsedDuration;
    
    // 更新行程
    updateItinerary();
    
    console.log(`已更新「${destination.name}」的停留時間為 ${parsedDuration} 小時`);
    
    // 保存當前狀態
    saveStateToHistory();
}

// 優化單天行程順序功能
function optimizeDayItinerary(dayIndex) {
    // 獲取當前分配到各天的行程
    const days = distributeItineraryToDays();
    
    if (dayIndex < 0 || dayIndex >= days.length) {
        return;
    }
    
    const day = days[dayIndex];
    
    if (day.length <= 2) {
        alert('此天行程點數量太少，無需優化！');
        return;
    }
    
    // 保留當天的第一個景點（起點）
    const startPoint = day[0];
    
    // 保留當天的最後一個景點（終點）
    const lastPoint = day[day.length - 1];
    
    // 如果只有起點和終點，或只有三個點（起點、一個中間點、終點），則無需優化
    if (day.length <= 3) {
        alert('此天可優化的景點數量太少！');
        return;
    }
    
    // 獲取需要優化的中間景點（排除第一個和最後一個）
    const middleDestinations = day.slice(1, day.length - 1);
    
    console.log(`開始優化第 ${dayIndex + 1} 天的行程，保留起點 "${startPoint.name}" 和終點 "${lastPoint.name}"，優化 ${middleDestinations.length} 個中間景點`);
    
    // 查找目前全局destinations中當天中間景點的位置
    let middleDestinationIndices = [];
    let firstMiddleDestinationIndex = -1; // 記錄第一個中間景點的索引，作為插入位置參考
    
    for (const destination of middleDestinations) {
        const index = destinations.findIndex(d => 
            d.name === destination.name && 
            d.coordinates[0] === destination.coordinates[0] && 
            d.coordinates[1] === destination.coordinates[1]
        );
        
        if (index !== -1) {
            if (firstMiddleDestinationIndex === -1) {
                firstMiddleDestinationIndex = index;
            }
            middleDestinationIndices.push(index);
        }
    }
    
    // 確認是否所有中間景點都找到了
    if (middleDestinationIndices.length !== middleDestinations.length) {
        console.error('無法找到所有中間景點在全局destinations中的位置');
        alert('優化失敗：無法匹配所有景點');
        return;
    }
    
    // 將中間景點保存下來
    const middleDestinationsCopy = middleDestinationIndices.map(index => ({...destinations[index]}));
    
    // 使用最近鄰算法優化中間景點順序
    const optimizedMiddleDestinations = [];
    const destinationsToOptimize = [...middleDestinationsCopy];
    
    // 從起點開始計算
    let lastCoordinates = startPoint.coordinates;
    
    while (destinationsToOptimize.length > 0) {
        let nearestIndex = 0;
        let minDistance = calculateDistance(lastCoordinates, destinationsToOptimize[0].coordinates);
        
        // 找到最近的下一個景點
        for (let i = 1; i < destinationsToOptimize.length; i++) {
            const distance = calculateDistance(lastCoordinates, destinationsToOptimize[i].coordinates);
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = i;
            }
        }
        
        // 添加最近的景點到優化後列表
        const nearestDestination = destinationsToOptimize[nearestIndex];
        optimizedMiddleDestinations.push(nearestDestination);
        
        // 更新最後的坐標
        lastCoordinates = nearestDestination.coordinates;
        
        // 從待優化列表中移除已添加的景點
        destinationsToOptimize.splice(nearestIndex, 1);
    }
    
    // 從全局destinations中移除所有中間景點
    // 為了避免索引變化，需要從後向前移除
    middleDestinationIndices.sort((a, b) => b - a).forEach(index => {
        destinations.splice(index, 1);
    });
    
    // 在firstMiddleDestinationIndex位置插入優化後的中間景點
    destinations.splice(firstMiddleDestinationIndex, 0, ...optimizedMiddleDestinations);
    
    // 更新地圖和行程
    updateMap();
    updateItinerary();
    
    // 保存歷史狀態
    saveStateToHistory();
    
    alert(`已完成第 ${dayIndex + 1} 天的路徑最佳化！已保留起點和終點，並按最佳路線重新排序中間的 ${optimizedMiddleDestinations.length} 個景點。`);
}

// 編輯特定日期的設定
function editDaySettings(dayIndex) {
    // 獲取當前設定
    const daySetting = dailySettings.find(setting => setting.dayIndex === dayIndex);
    const currentDepartureTime = daySetting ? daySetting.departureTime : departureTime;
    const currentMaxHours = daySetting ? daySetting.maxHours : maxDailyHours;
    
    // 獲取當前結束地點
    const dayEndPoint = dailyEndPoints.find(ep => ep.dayIndex === dayIndex);
    const currentEndPoint = dayEndPoint ? dayEndPoint.endPoint.name : '';
    
    // 創建設定對話框
    const settingsDialog = document.createElement('div');
    settingsDialog.className = 'settings-dialog';
    settingsDialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const dialogContent = document.createElement('div');
    dialogContent.className = 'settings-dialog-content';
    dialogContent.style.cssText = `
        background: white;
        padding: 25px;
        border-radius: 8px;
        width: 450px;
        max-width: 90%;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    `;
    
    dialogContent.innerHTML = `
        <h3 style="color: #4a89dc; margin-bottom: 15px; text-align: center; font-size: 20px;">第 ${dayIndex + 1} 天個人化設定</h3>
        <p style="color: #666; margin-bottom: 25px; font-size: 14px; text-align: center; line-height: 1.5;">
            您可以為這一天設定特定的出發時間和行程總時間，不受全局設定影響
        </p>
        <div class="settings-form" style="margin-bottom: 15px;">
            <div class="settings-group" style="border: 1px solid #eee; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #f9f9f9;">
                <h4 style="margin-top: 0; margin-bottom: 15px; color: #555; font-size: 16px;">時間設定</h4>
                <div class="settings-row" style="margin-bottom: 15px; display: flex; align-items: center;">
                    <label for="day-departure-time" style="min-width: 100px; font-weight: bold; color: #333;">出發時間:</label>
                    <input type="time" id="day-departure-time" value="${currentDepartureTime}" style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; appearance: textfield;">
                </div>
                <div class="settings-row" style="margin-bottom: 5px; display: flex; align-items: center;">
                    <label for="day-max-hours" style="min-width: 100px; font-weight: bold; color: #333;">行程時間:</label>
                    <input type="number" id="day-max-hours" min="1" max="24" step="0.5" value="${currentMaxHours}" style="flex: 1; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                    <span style="margin-left: 10px; color: #555;">小時</span>
                </div>
            </div>
            
            <div class="settings-group" style="border: 1px solid #eee; border-radius: 8px; padding: 15px; margin-bottom: 20px; background-color: #f9f9f9;">
                <h4 style="margin-top: 0; margin-bottom: 15px; color: #555; font-size: 16px;">結束地點設定</h4>
                <div class="settings-row">
                    <label for="day-end-point" style="display: block; font-weight: bold; color: #333; margin-bottom: 10px;">結束地點:</label>
                    <div style="position: relative;">
                        <input type="text" id="day-end-point" placeholder="請輸入結束地點" value="${currentEndPoint}" 
                               style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px; margin-bottom: 12px; box-sizing: border-box;">
                    </div>
                    <div style="display: flex; justify-content: flex-end; width: 100%;">
                        <button id="use-saved-location" 
                                style="background-color: #5bc0de; border: none; color: white; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-right: 10px; display: flex; align-items: center;">
                            <i class="fas fa-map-marker-alt" style="margin-right: 5px;"></i> 選擇位置
                        </button>
                        ${currentEndPoint ? `
                        <button id="remove-end-point" 
                                style="background-color: #d9534f; border: none; color: white; padding: 8px 15px; border-radius: 4px; cursor: pointer; display: flex; align-items: center;">
                            <i class="fas fa-times" style="margin-right: 5px;"></i> 移除
                        </button>` : ''}
                    </div>
                </div>
            </div>
            
            <div class="settings-actions" style="display: flex; justify-content: space-between; margin-top: 20px;">
                <button id="save-day-settings" style="background-color: #5cb85c; border: none; color: white; padding: 12px 0; border-radius: 4px; cursor: pointer; flex: 1; margin-right: 10px; font-weight: bold;">
                    <i class="fas fa-save"></i> 儲存設定
                </button>
                <button id="cancel-day-settings" style="background-color: #f0ad4e; border: none; color: white; padding: 12px 0; border-radius: 4px; cursor: pointer; flex: 1; margin-right: 10px;">
                    <i class="fas fa-times"></i> 取消
                </button>
                <button id="reset-day-settings" style="background-color: #d9534f; border: none; color: white; padding: 12px 0; border-radius: 4px; cursor: pointer; flex: 1;">
                    <i class="fas fa-undo"></i> 重置
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(settingsDialog);
    
    // 將對話框內容添加到對話框
    settingsDialog.appendChild(dialogContent);
    
    // 使用已儲存位置按鈕
    document.getElementById('use-saved-location').addEventListener('click', () => {
        // 檢查是否有儲存的位置
        if (Object.keys(locationCache).length === 0) {
            alert('沒有已儲存的經緯度位置');
            return;
        }
        
        // 創建位置選擇對話框
        const locationDialog = document.createElement('div');
        locationDialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0,0,0,0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1001;
            backdrop-filter: blur(3px);
        `;
        
        const locationContent = document.createElement('div');
        locationContent.style.cssText = `
            background: white;
            padding: 25px;
            border-radius: 8px;
            width: 450px;
            max-width: 90%;
            max-height: 70vh;
            overflow-y: auto;
            box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        `;
        
        // 建立位置列表
        const locationList = Object.entries(locationCache).map(([name, coords]) => {
            return `
            <div style="padding: 15px; margin-bottom: 12px; border: 1px solid #eee; border-radius: 6px; cursor: pointer; transition: all 0.3s ease; background-color: #f9f9f9;" 
                 class="location-item" data-name="${name}" data-lat="${coords[0]}" data-lng="${coords[1]}"
                 onmouseover="this.style.backgroundColor='#f0f7ff'" 
                 onmouseout="this.style.backgroundColor='#f9f9f9'">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <strong style="font-size: 16px; color: #333;">${name}</strong>
                    <span style="color: #4a89dc; font-size: 12px;"><i class="fas fa-map-marker-alt"></i> 已儲存位置</span>
                </div>
                <div style="color: #777; margin-top: 8px; font-size: 13px;">經緯度: [${coords[0].toFixed(6)}, ${coords[1].toFixed(6)}]</div>
            </div>
            `;
        }).join('');
        
        locationContent.innerHTML = `
            <h3 style="color: #4a89dc; margin-bottom: 20px; text-align: center; font-size: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">選擇已儲存的位置</h3>
            <div style="margin-bottom: 20px; max-height: 350px; overflow-y: auto; padding-right: 10px;">
                ${locationList.length > 0 ? locationList : '<div style="text-align: center; padding: 20px; color: #666;">沒有已儲存的位置</div>'}
            </div>
            <div style="text-align: right; margin-top: 15px; border-top: 1px solid #eee; padding-top: 15px;">
                <button id="cancel-location-select" style="background-color: #f0ad4e; border: none; color: white; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-size: 14px; transition: all 0.2s ease;">
                    <i class="fas fa-times"></i> 取消選擇
                </button>
            </div>
        `;
        
        locationDialog.appendChild(locationContent);
        document.body.appendChild(locationDialog);
        
        // 取消選擇
        document.getElementById('cancel-location-select').addEventListener('click', () => {
            document.body.removeChild(locationDialog);
        });
        
        // 選擇位置
        document.querySelectorAll('.location-item').forEach(item => {
            item.addEventListener('click', () => {
                const name = item.dataset.name;
                
                // 設定結束地點輸入欄
                document.getElementById('day-end-point').value = name;
                
                // 關閉位置選擇對話框
                document.body.removeChild(locationDialog);
            });
        });
    });
    
    // 儲存設定
    document.getElementById('save-day-settings').addEventListener('click', () => {
        const newDepartureTime = document.getElementById('day-departure-time').value;
        const newMaxHours = parseFloat(document.getElementById('day-max-hours').value);
        const newEndPoint = document.getElementById('day-end-point').value.trim();
        
        if (!newDepartureTime) {
            alert('請輸入有效的出發時間');
            return;
        }
        
        if (isNaN(newMaxHours) || newMaxHours < 1 || newMaxHours > 24) {
            alert('請輸入有效的行程時間 (1-24小時)');
            return;
        }
        
        // 更新或添加時間設定
        const existingSettingIndex = dailySettings.findIndex(setting => setting.dayIndex === dayIndex);
        if (existingSettingIndex >= 0) {
            dailySettings[existingSettingIndex] = {
                dayIndex,
                departureTime: newDepartureTime,
                maxHours: newMaxHours
            };
        } else {
            dailySettings.push({
                dayIndex,
                departureTime: newDepartureTime,
                maxHours: newMaxHours
            });
        }
        
        // 處理結束地點
        if (newEndPoint) {
            // 關閉設定對話框，避免重複彈出對話框
            document.body.removeChild(settingsDialog);
            
            // 設定結束地點 (會觸發更新行程和地圖)
            setDayEndPoint(dayIndex, newEndPoint);
        } else {
            // 如果沒有設定結束地點但之前有，則移除
            if (dayEndPoint) {
                removeDayEndPoint(dayIndex);
            }
            
            // 關閉對話框
            document.body.removeChild(settingsDialog);
            
            // 提示用戶設定已更新
            console.log(`第 ${dayIndex + 1} 天設定已更新: 出發時間 = ${newDepartureTime}, 最大行程時間 = ${newMaxHours} 小時`);
            
            // 顯示提示訊息
            const message = document.createElement('div');
            message.className = 'alert alert-success';
            message.style.position = 'fixed';
            message.style.top = '20px';
            message.style.left = '50%';
            message.style.transform = 'translateX(-50%)';
            message.style.zIndex = '9999';
            message.style.padding = '10px 20px';
            message.style.borderRadius = '5px';
            message.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
            message.textContent = `第 ${dayIndex + 1} 天設定已更新，重新計算行程`;
            
            document.body.appendChild(message);
            
            // 2秒後移除提示
            setTimeout(() => {
                document.body.removeChild(message);
            }, 2000);
            
            // 重新計算和顯示行程
            updateItinerary();
        }
        
        // 保存當前狀態
        saveStateToHistory();
    });
    
    // 移除結束地點
    if (currentEndPoint) {
        document.getElementById('remove-end-point').addEventListener('click', () => {
            removeDayEndPoint(dayIndex);
            document.body.removeChild(settingsDialog);
        });
    }
    
    // 取消設定
    document.getElementById('cancel-day-settings').addEventListener('click', () => {
        document.body.removeChild(settingsDialog);
    });
    
    // 重置為默認設定
    document.getElementById('reset-day-settings').addEventListener('click', () => {
        // 移除特定日期的設定
        const existingSettingIndex = dailySettings.findIndex(setting => setting.dayIndex === dayIndex);
        if (existingSettingIndex >= 0) {
            dailySettings.splice(existingSettingIndex, 1);
        }
        
        // 移除結束地點設定
        const existingEndPointIndex = dailyEndPoints.findIndex(ep => ep.dayIndex === dayIndex);
        if (existingEndPointIndex >= 0) {
            dailyEndPoints.splice(existingEndPointIndex, 1);
        }
        
        // 關閉對話框
        document.body.removeChild(settingsDialog);
        
        // 重新計算和顯示行程
        updateItinerary();
    });
}

// 載入指定名稱的行程
function loadSelectedItinerary(name) {
    try {
        console.log(`嘗試加載指定行程: ${name}`);
        
        // 獲取已儲存的所有行程
        const savedItinerariesStr = localStorage.getItem(SAVED_ITINERARIES_KEY);
        if (!savedItinerariesStr) {
            console.error('沒有找到已保存的行程數據');
            alert('沒有找到已保存的行程數據');
            return;
        }
        
        let savedItineraries;
        try {
            savedItineraries = JSON.parse(savedItinerariesStr);
        } catch (parseError) {
            console.error('解析行程數據時出錯:', parseError);
            alert('行程數據損壞，無法讀取。');
            return;
        }
        
        // 檢查行程是否存在
        if (!savedItineraries[name]) {
            console.error(`找不到行程: ${name}`);
            alert(`找不到行程: ${name}`);
            return;
        }
        
        const selectedItinerary = savedItineraries[name];
        console.log('找到行程數據:', selectedItinerary);
        
        // 檢查行程數據的完整性
        if (!selectedItinerary.startingPoint) {
            console.error('行程數據損壞：缺少出發點');
            alert('行程數據損壞：缺少出發點');
            return;
        }
        
        if (!Array.isArray(selectedItinerary.destinations)) {
            console.error('行程數據損壞：目的地不是有效的數組');
            alert('行程數據損壞：目的地格式無效');
            return;
        }
        
        // 設置行程數據
        startingPoint = selectedItinerary.startingPoint;
        destinations = selectedItinerary.destinations;
        
        // 讀取出發時間信息
        departureDate = selectedItinerary.departureDate || null;
        departureTime = selectedItinerary.departureTime || "09:00";
        
        // 讀取每日行程時間
        if (selectedItinerary.maxDailyHours) {
            maxDailyHours = selectedItinerary.maxDailyHours;
            document.getElementById('max-daily-hours').value = maxDailyHours;
        }
        
        // 讀取每日特定設定
        if (selectedItinerary.dailySettings && Array.isArray(selectedItinerary.dailySettings)) {
            dailySettings = selectedItinerary.dailySettings;
        } else {
            dailySettings = []; // 如果沒有每日設定，重置為空
        }
        
        // 讀取每日結束地點設定
        if (selectedItinerary.dailyEndPoints && Array.isArray(selectedItinerary.dailyEndPoints)) {
            dailyEndPoints = selectedItinerary.dailyEndPoints;
        } else {
            dailyEndPoints = []; // 如果沒有結束地點設定，重置為空
        }
        
        // 更新界面
        document.getElementById('starting-point').value = startingPoint.name;
        
        // 如果有出發日期和時間，更新相應的輸入框
        if (departureDate) {
            document.getElementById('departure-date').value = departureDate;
        }
        if (departureTime) {
            document.getElementById('departure-time').value = departureTime;
        }
        
        // 启用添加景点功能
        document.getElementById('new-destination').disabled = false;
        document.getElementById('add-destination').disabled = false;
        
        // 更新界面和地圖
        updateItinerary();
        updateMap();
        
        // 讀取位置緩存
        if (selectedItinerary.locationCache) {
            locationCache = selectedItinerary.locationCache;
            // 更新本地儲存的位置緩存
            localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationCache));
            console.log('已讀取位置緩存:', Object.keys(locationCache).length, '個地點');
        }
        
        // 保存當前狀態到歷史記錄
        saveStateToHistory();
        
        alert(`已載入行程: ${name}`);
        return true;
    } catch (error) {
        console.error('讀取行程時發生錯誤:', error);
        alert(`讀取行程失敗: ${error.message}\n\n請嘗試重新創建行程。`);
        return false;
    }
}

// 管理已儲存的經緯度位置
function manageLocationCache() {
    // 檢查是否有保存的位置
    if (Object.keys(locationCache).length === 0) {
        alert('目前沒有使用經緯度設定過的位置');
        return;
    }
    
    // 檢查是否已經有開啟的管理視窗
    let existingDialog = document.getElementById(LOCATION_MANAGER_ID);
    if (existingDialog) {
        document.body.removeChild(existingDialog);
    }
    
    // 創建管理視窗
    const managerDialog = document.createElement('div');
    managerDialog.id = LOCATION_MANAGER_ID;
    managerDialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 5px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    const locationList = Object.entries(locationCache).map(([name, coords]) => {
        return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px;">
            <div>
                <strong>${name}</strong>
                <div>經緯度: [${coords[0]}, ${coords[1]}]</div>
            </div>
            <div>
                <button class="use-location-btn" data-name="${name}" data-lat="${coords[0]}" data-lng="${coords[1]}">使用</button>
                <button class="remove-location-btn" data-name="${name}">刪除</button>
            </div>
        </div>
        `;
    }).join('');
    
    dialogContent.innerHTML = `
        <h3>管理經緯度位置</h3>
        <div style="margin-bottom: 20px;">
            總共有 ${Object.keys(locationCache).length} 個保存的位置
        </div>
        <div>
            ${locationList}
        </div>
        <div style="text-align: right; margin-top: 20px;">
            <button id="close-location-manager">關閉</button>
        </div>
    `;
    
    managerDialog.appendChild(dialogContent);
    document.body.appendChild(managerDialog);
    
    // 關閉管理視窗
    document.getElementById('close-location-manager').addEventListener('click', () => {
        document.body.removeChild(managerDialog);
    });
    
    // 使用位置按鈕
    document.querySelectorAll('.use-location-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            const lat = parseFloat(btn.dataset.lat);
            const lng = parseFloat(btn.dataset.lng);
            
            // 填入經緯度輸入區域
            document.getElementById('latitude').value = lat;
            document.getElementById('longitude').value = lng;
            document.getElementById('coordinates-name').value = name;
            
            // 顯示經緯度輸入區域
            document.getElementById('coordinates-input-container').style.display = 'block';
            
            // 關閉管理視窗
            document.body.removeChild(managerDialog);
        });
    });
    
    // 刪除位置按鈕
    document.querySelectorAll('.remove-location-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            
            if (confirm(`確定要刪除「${name}」這個位置嗎？`)) {
                // 從緩存中刪除
                delete locationCache[name];
                
                // 更新本地儲存
                localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationCache));
                
                // 重新載入管理視窗
                manageLocationCache();
            }
        });
    });
}

// 匯出行程與經緯度位置數據
function exportData() {
    // 檢查是否有資料可匯出
    const hasItineraries = Object.keys(JSON.parse(localStorage.getItem(SAVED_ITINERARIES_KEY) || '{}')).length > 0;
    const hasLocationCache = Object.keys(locationCache).length > 0;
    
    if (!hasItineraries && !hasLocationCache) {
        alert('沒有行程或經緯度位置可供匯出');
        return;
    }
    
    // 準備匯出資料
    const exportData = {
        savedItineraries: JSON.parse(localStorage.getItem(SAVED_ITINERARIES_KEY) || '{}'),
        locationCache: locationCache,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };
    
    // 轉換為JSON字串
    const dataStr = JSON.stringify(exportData, null, 2);
    
    // 建立下載用的blob與連結
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // 建立下載連結
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `travel_planner_export_${new Date().toISOString().slice(0, 10)}.json`;
    
    // 觸發下載
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // 清理
    setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    }, 100);
    
    alert('匯出成功！');
}

// 匯入行程與經緯度位置數據
function importData() {
    // 建立隱藏的檔案輸入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    fileInput.style.display = 'none';
    
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const importedData = JSON.parse(event.target.result);
                
                // 驗證匯入資料格式
                if (!importedData.version || !importedData.exportDate) {
                    throw new Error('無效的匯入資料格式');
                }
                
                // 確認要匯入哪些資料
                let importItineraries = false;
                let importLocations = false;
                
                if (importedData.savedItineraries && Object.keys(importedData.savedItineraries).length > 0) {
                    importItineraries = confirm(`發現 ${Object.keys(importedData.savedItineraries).length} 個已儲存的行程，是否匯入？\n(注意：同名行程將被覆蓋)`);
                }
                
                if (importedData.locationCache && Object.keys(importedData.locationCache).length > 0) {
                    importLocations = confirm(`發現 ${Object.keys(importedData.locationCache).length} 個經緯度位置，是否匯入？\n(注意：同名位置將被覆蓋)`);
                }
                
                // 執行匯入
                if (importItineraries) {
                    const currentItineraries = JSON.parse(localStorage.getItem(SAVED_ITINERARIES_KEY) || '{}');
                    const mergedItineraries = { ...currentItineraries, ...importedData.savedItineraries };
                    localStorage.setItem(SAVED_ITINERARIES_KEY, JSON.stringify(mergedItineraries));
                }
                
                if (importLocations) {
                    locationCache = { ...locationCache, ...importedData.locationCache };
                    localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationCache));
                }
                
                if (importItineraries || importLocations) {
                    alert('匯入成功！');
                } else {
                    alert('沒有匯入任何資料');
                }
                
            } catch (error) {
                console.error('匯入錯誤', error);
                alert(`匯入失敗：${error.message}`);
            }
        };
        
        reader.readAsText(file);
    });
    
    document.body.appendChild(fileInput);
    fileInput.click();
    
    // 清理
    setTimeout(() => {
        document.body.removeChild(fileInput);
    }, 100);
}

// 設定每天行程的結束地點
function setDayEndPoint(dayIndex, endPointLocation) {
    if (!endPointLocation || !endPointLocation.trim()) {
        alert('請輸入有效的結束地點');
        return;
    }
    
    // 檢查是否已有該天的行程
    const days = distributeItineraryToDays();
    if (dayIndex >= days.length) {
        alert(`第 ${dayIndex + 1} 天的行程尚未安排，無法設定結束地點`);
        return;
    }
    
    // 檢查是否是儲存的經緯度位置
    let coordinates;
    
    // 首先檢查該景點是否在當天行程中出現過，如果有，且出現多次，使用最後一次出現的景點坐標
    const currentDayDestinations = days[dayIndex].filter(point => !point.isStartingPoint);
    const matchingDestinations = currentDayDestinations.filter(point => point.name === endPointLocation);
    
    if (matchingDestinations.length > 0) {
        // 如果同名景點在當天行程中存在，取最後一個
        const lastMatchingDestination = matchingDestinations[matchingDestinations.length - 1];
        coordinates = lastMatchingDestination.coordinates;
        console.log(`景點 "${endPointLocation}" 在第 ${dayIndex + 1} 天出現 ${matchingDestinations.length} 次，使用最後一次出現的坐標設為結束點`);
        
        // 直接設定結束地點
        setEndPointWithCoordinates(dayIndex, endPointLocation, coordinates);
        return;
    }
    
    // 如果行程中沒有該景點，檢查是否是儲存的經緯度位置
    if (locationCache[endPointLocation]) {
        // 使用緩存的經緯度資料
        coordinates = locationCache[endPointLocation];
        console.log(`使用緩存中的經緯度資料設定結束地點: ${endPointLocation} -> [${coordinates[0]}, ${coordinates[1]}]`);
        
        // 直接設定結束地點
        setEndPointWithCoordinates(dayIndex, endPointLocation, coordinates);
    } else {
        // 地理編碼獲取結束地點的座標
        geocodeLocation(endPointLocation).then(coords => {
            setEndPointWithCoordinates(dayIndex, endPointLocation, coords);
        }).catch(error => {
            alert(`無法找到地點: ${endPointLocation}。請嘗試更具體的地址或使用已儲存的經緯度位置。`);
            console.error('Geocoding error:', error);
        });
    }
}

// 使用指定座標設定結束地點
function setEndPointWithCoordinates(dayIndex, locationName, coordinates) {
    // 查找現有結束地點設定
    const existingEndPointIndex = dailyEndPoints.findIndex(ep => ep.dayIndex === dayIndex);
    
    const endPoint = {
        name: locationName,
        coordinates: coordinates,
        stayDuration: 0 // 結束地點不計停留時間
    };
    
    // 更新或添加結束地點
    if (existingEndPointIndex >= 0) {
        dailyEndPoints[existingEndPointIndex].endPoint = endPoint;
    } else {
        dailyEndPoints.push({
            dayIndex: dayIndex,
            endPoint: endPoint
        });
    }
    
    // 打印日誌以幫助調試
    console.log(`設置第 ${dayIndex + 1} 天結束地點：${locationName}，座標：[${coordinates[0]}, ${coordinates[1]}]`);
    console.log(`當前所有結束地點設定：`, JSON.stringify(dailyEndPoints));
    
    // 保存到本地儲存
    saveToLocalStorage();
    
    // 更新行程顯示
    updateItinerary();
    
    alert(`已設定第 ${dayIndex + 1} 天的結束地點為: ${locationName}`);
    
    // 保存當前狀態
    saveStateToHistory();
}

// 移除每天行程的結束地點
function removeDayEndPoint(dayIndex) {
    const existingEndPointIndex = dailyEndPoints.findIndex(ep => ep.dayIndex === dayIndex);
    
    if (existingEndPointIndex >= 0) {
        const endPointName = dailyEndPoints[existingEndPointIndex].endPoint.name;
        dailyEndPoints.splice(existingEndPointIndex, 1);
        
        // 打印日誌以幫助調試
        console.log(`移除第 ${dayIndex + 1} 天結束地點：${endPointName}`);
        console.log(`當前所有結束地點設定：`, JSON.stringify(dailyEndPoints));
        
        // 保存到本地儲存
        saveToLocalStorage();
        
        // 更新行程顯示
        updateItinerary();
        
        alert(`已移除第 ${dayIndex + 1} 天的結束地點: ${endPointName}`);
    } else {
        alert(`第 ${dayIndex + 1} 天沒有設定結束地點`);
    }
    
    // 保存當前狀態
    saveStateToHistory();
}

// 保存設定到本地儲存
function saveToLocalStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        startingPoint: startingPoint,
        destinations: destinations,
        departureDate: departureDate,
        departureTime: departureTime,
        maxDailyHours: maxDailyHours,
        dailySettings: dailySettings,
        dailyEndPoints: dailyEndPoints,
        locationCache: locationCache
    }));
}

// 管理行程功能
function manageItineraries() {
    // 獲取保存的行程
    const savedItineraries = JSON.parse(localStorage.getItem(SAVED_ITINERARIES_KEY) || '{}');
    
    // 檢查是否有保存的行程
    if (Object.keys(savedItineraries).length === 0) {
        alert('沒有已保存的行程');
        return;
    }
    
    // 創建管理對話框
    const manageDialog = document.createElement('div');
    manageDialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 5px;
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    // 建立行程列表
    const itineraryCards = Object.entries(savedItineraries).map(([name, data]) => {
        const itineraryDate = new Date(data.savedAt).toLocaleString('zh-TW');
        const destinationsCount = data.destinations ? data.destinations.length : 0;
        
        return `
        <div class="itinerary-card" style="margin-bottom: 15px; padding: 15px; border: 1px solid #ddd; border-radius: 5px;">
            <h3 style="margin-top: 0;">${name}</h3>
            <div>
                <p><strong>建立時間:</strong> ${itineraryDate}</p>
                <p><strong>出發點:</strong> ${data.startingPoint ? data.startingPoint.name : '未設定'}</p>
                <p><strong>景點數量:</strong> ${destinationsCount}</p>
                ${data.departureDate ? `<p><strong>出發日期:</strong> ${data.departureDate}</p>` : ''}
            </div>
            <div style="margin-top: 10px; display: flex; gap: 10px;">
                <button class="load-itinerary-btn" data-name="${name}">載入</button>
                <button class="rename-itinerary-btn" data-name="${name}">重命名</button>
                <button class="delete-itinerary-btn" data-name="${name}">刪除</button>
            </div>
        </div>
        `;
    }).join('');
    
    dialogContent.innerHTML = `
        <h2>管理已保存的行程</h2>
        <div style="margin-bottom: 20px;">
            共有 ${Object.keys(savedItineraries).length} 個已保存的行程
        </div>
        <div class="itinerary-list">
            ${itineraryCards}
        </div>
        <div style="margin-top: 20px; text-align: right;">
            <button id="close-manage-dialog">關閉</button>
        </div>
    `;
    
    manageDialog.appendChild(dialogContent);
    document.body.appendChild(manageDialog);
    
    // 關閉按鈕
    document.getElementById('close-manage-dialog').addEventListener('click', () => {
        document.body.removeChild(manageDialog);
    });
    
    // 設置載入行程按鈕的事件
    dialogContent.querySelectorAll('.load-itinerary-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            loadSelectedItinerary(name);
            document.body.removeChild(manageDialog);
        });
    });
    
    // 設置重命名行程按鈕的事件
    dialogContent.querySelectorAll('.rename-itinerary-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const oldName = btn.dataset.name;
            const newName = prompt('請輸入新名稱:', oldName);
            
            if (newName && newName !== oldName) {
                if (savedItineraries[newName]) {
                    alert(`名稱 "${newName}" 已存在`);
                    return;
                }
                
                // 重命名行程
                savedItineraries[newName] = savedItineraries[oldName];
                delete savedItineraries[oldName];
                
                // 保存更改
                localStorage.setItem(SAVED_ITINERARIES_KEY, JSON.stringify(savedItineraries));
                
                // 重新打開管理對話框
                document.body.removeChild(manageDialog);
                manageItineraries();
            }
        });
    });
    
    // 設置刪除行程按鈕的事件
    dialogContent.querySelectorAll('.delete-itinerary-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.dataset.name;
            
            if (confirm(`確定要刪除行程 "${name}" 嗎？`)) {
                // 刪除行程
                delete savedItineraries[name];
                
                // 保存更改
                localStorage.setItem(SAVED_ITINERARIES_KEY, JSON.stringify(savedItineraries));
                
                // 重新打開管理對話框，或者關閉如果沒有更多行程
                document.body.removeChild(manageDialog);
                
                if (Object.keys(savedItineraries).length > 0) {
                    manageItineraries();
                } else {
                    alert('所有行程已刪除');
                }
            }
        });
    });
}

// 從當日行程景點選擇一個作為當日結束地點
function selectEndPointFromDay(dayIndex, destinationIndex) {
    // 獲取行程分配
    const days = distributeItineraryToDays();
    
    // 檢查天數是否有效
    if (dayIndex >= days.length) {
        alert(`第 ${dayIndex + 1} 天的行程尚未安排，無法設定結束地點`);
        return;
    }
    
    // 檢查目的地索引是否有效
    const day = days[dayIndex];
    if (destinationIndex >= destinations.length || destinationIndex < 0) {
        alert('無效的目的地索引');
        return;
    }
    
    // 獲取目的地
    const destination = destinations[destinationIndex];
    if (!destination) {
        alert('找不到指定的目的地');
        return;
    }
    
    // 確認此景點確實在當天的行程中
    const pointInDay = day.find(p => 
        p.name === destination.name && 
        p.coordinates[0] === destination.coordinates[0] && 
        p.coordinates[1] === destination.coordinates[1]
    );
    
    if (!pointInDay) {
        alert(`選擇的目的地不在第 ${dayIndex + 1} 天的行程中`);
        return;
    }
    
    // 檢查是否是出發點
    if (pointInDay.isStartingPoint) {
        alert('出發點不能設為結束地點');
        return;
    }
    
    // 確認是否要設定為結束地點
    const confirmed = confirm(`確定要將「${destination.name}」設定為第 ${dayIndex + 1} 天的結束地點嗎？`);
    if (!confirmed) {
        return;
    }
    
    // 使用現有的函數設置結束地點
    setEndPointWithCoordinates(dayIndex, destination.name, destination.coordinates);
}

// 保存當前狀態到歷史記錄
function saveStateToHistory() {
    // 創建當前應用程式狀態的快照
    const currentState = {
        startingPoint: JSON.parse(JSON.stringify(startingPoint || null)),
        destinations: JSON.parse(JSON.stringify(destinations)),
        dailySettings: JSON.parse(JSON.stringify(dailySettings)),
        dailyEndPoints: JSON.parse(JSON.stringify(dailyEndPoints)),
        departureTime: departureTime,
        maxDailyHours: maxDailyHours
    };
    
    // 如果當前不在最後一個歷史狀態，刪除之後的所有狀態
    if (currentHistoryIndex < historyStates.length - 1) {
        historyStates = historyStates.slice(0, currentHistoryIndex + 1);
    }
    
    // 添加新狀態到歷史記錄
    historyStates.push(currentState);
    currentHistoryIndex = historyStates.length - 1;
    
    // 如果歷史記錄超過最大限制，刪除最舊的狀態
    if (historyStates.length > MAX_HISTORY_STATES) {
        historyStates.shift();
        currentHistoryIndex--;
    }
    
    // 更新 Undo/Redo 按鈕狀態
    updateUndoRedoButtons();
    
    console.log(`保存歷史狀態 #${currentHistoryIndex}，共 ${historyStates.length} 個狀態`);
}

// 從歷史記錄恢復狀態
function restoreStateFromHistory(stateIndex) {
    if (stateIndex < 0 || stateIndex >= historyStates.length) {
        console.error(`嘗試恢復無效的歷史狀態索引: ${stateIndex}`);
        return;
    }
    
    const state = historyStates[stateIndex];
    
    // 恢復應用程式狀態
    startingPoint = state.startingPoint;
    destinations = state.destinations;
    dailySettings = state.dailySettings;
    dailyEndPoints = state.dailyEndPoints;
    departureTime = state.departureTime;
    maxDailyHours = state.maxDailyHours;
    
    // 更新 UI
    updateMap();
    updateItinerary();
    
    // 更新歷史索引
    currentHistoryIndex = stateIndex;
    
    // 更新 Undo/Redo 按鈕狀態
    updateUndoRedoButtons();
    
    console.log(`恢復到歷史狀態 #${currentHistoryIndex}`);
}

// 執行撤銷操作 (Undo)
function undoAction() {
    if (currentHistoryIndex <= 0) {
        console.log("無法撤銷：已經是最早的狀態");
        return;
    }
    
    restoreStateFromHistory(currentHistoryIndex - 1);
}

// 執行重做操作 (Redo)
function redoAction() {
    if (currentHistoryIndex >= historyStates.length - 1) {
        console.log("無法重做：已經是最新的狀態");
        return;
    }
    
    restoreStateFromHistory(currentHistoryIndex + 1);
}

// 更新 Undo/Redo 按鈕的啟用/禁用狀態
function updateUndoRedoButtons() {
    const undoButton = document.getElementById('undo-button');
    const redoButton = document.getElementById('redo-button');
    
    if (undoButton) {
        undoButton.disabled = currentHistoryIndex <= 0;
    }
    
    if (redoButton) {
        redoButton.disabled = currentHistoryIndex >= historyStates.length - 1;
    }
}

// 在Google地圖中搜索位置
function openGoogleMapsSearch(location) {
    const searchQuery = encodeURIComponent(location);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
    
    // 在新標籤頁中打開Google地圖
    window.open(googleMapsUrl, '_blank');
    
    // 顯示更詳細的引導
    setTimeout(() => {
        alert('請在Google地圖中找到您要的位置，然後：\n\n1. 右鍵點擊地圖上的位置\n2. 選擇「這是哪裡」\n3. 底部顯示的經緯度格式為：緯度, 經度\n4. 複製這些數字到本應用的經緯度輸入框中\n\n查找後請返回本頁面，在經緯度輸入區域輸入正確的位置資訊。');
    }, 1000);
}

// 從URL解析經緯度參數
function parseLocationFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const lat = urlParams.get('lat');
    const lng = urlParams.get('lng');
    const name = urlParams.get('name');
    
    if (lat && lng) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const locationName = name || `位置 (${latitude.toFixed(6)}, ${longitude.toFixed(6)})`;
        
        if (!isNaN(latitude) && !isNaN(longitude)) {
            // 自動切換到經緯度輸入模式
            toggleCoordinatesInputMode();
            
            // 填入經緯度和名稱
            document.getElementById('latitude').value = latitude;
            document.getElementById('longitude').value = longitude;
            document.getElementById('coordinates-name').value = locationName;
            
            // 提示用戶
            alert(`已從URL中獲取位置經緯度：\n緯度：${latitude}\n經度：${longitude}\n\n請點擊「設定位置」按鈕將此位置添加到您的行程中。`);
            
            // 清除URL參數，防止重複處理
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

// 修復或重置本地存儲
function repairLocalStorage() {
    try {
        console.log('嘗試修復或重置本地存儲...');
        
        // 檢查現有數據
        const hasItineraries = localStorage.getItem(SAVED_ITINERARIES_KEY) !== null;
        const hasCurrentData = localStorage.getItem(STORAGE_KEY) !== null;
        const hasLocationCache = localStorage.getItem(LOCATION_CACHE_KEY) !== null;
        
        // 構建一個報告
        let report = '本地存儲狀態:\n';
        report += `- 已保存行程: ${hasItineraries ? '存在' : '不存在'}\n`;
        report += `- 當前行程: ${hasCurrentData ? '存在' : '不存在'}\n`;
        report += `- 位置緩存: ${hasLocationCache ? '存在' : '不存在'}\n\n`;
        
        // 嘗試解析數據，檢查是否損壞
        let dataStatus = [];
        
        if (hasItineraries) {
            try {
                const savedItineraries = JSON.parse(localStorage.getItem(SAVED_ITINERARIES_KEY));
                const count = Object.keys(savedItineraries).length;
                dataStatus.push(`已保存行程: ${count} 個行程`);
            } catch (error) {
                dataStatus.push(`已保存行程: 數據損壞 (${error.message})`);
            }
        }
        
        if (hasCurrentData) {
            try {
                const currentData = JSON.parse(localStorage.getItem(STORAGE_KEY));
                const hasStartPoint = currentData.startingPoint !== null && currentData.startingPoint !== undefined;
                const destinationsCount = currentData.destinations ? currentData.destinations.length : 0;
                dataStatus.push(`當前行程: ${hasStartPoint ? '有出發點' : '無出發點'}, ${destinationsCount} 個景點`);
            } catch (error) {
                dataStatus.push(`當前行程: 數據損壞 (${error.message})`);
            }
        }
        
        if (hasLocationCache) {
            try {
                const cache = JSON.parse(localStorage.getItem(LOCATION_CACHE_KEY));
                const cacheSize = Object.keys(cache).length;
                dataStatus.push(`位置緩存: ${cacheSize} 個位置`);
            } catch (error) {
                dataStatus.push(`位置緩存: 數據損壞 (${error.message})`);
            }
        }
        
        if (dataStatus.length > 0) {
            report += '數據狀態:\n- ' + dataStatus.join('\n- ');
        }
        
        // 詢問用戶是否要重置數據
        const shouldReset = confirm(`${report}\n\n檢測到您遇到讀取行程的問題。您想要重置損壞的數據嗎？\n\n注意：這會刪除已損壞的數據，但會保留可正常讀取的數據。`);
        
        if (shouldReset) {
            let resetReport = [];
            
            // 嘗試解析和重置損壞的數據
            if (hasItineraries) {
                try {
                    JSON.parse(localStorage.getItem(SAVED_ITINERARIES_KEY));
                } catch (error) {
                    localStorage.removeItem(SAVED_ITINERARIES_KEY);
                    resetReport.push('已刪除損壞的行程數據');
                }
            }
            
            if (hasCurrentData) {
                try {
                    JSON.parse(localStorage.getItem(STORAGE_KEY));
                } catch (error) {
                    localStorage.removeItem(STORAGE_KEY);
                    resetReport.push('已刪除損壞的當前行程數據');
                }
            }
            
            if (hasLocationCache) {
                try {
                    JSON.parse(localStorage.getItem(LOCATION_CACHE_KEY));
                } catch (error) {
                    localStorage.removeItem(LOCATION_CACHE_KEY);
                    resetReport.push('已刪除損壞的位置緩存數據');
                }
            }
            
            if (resetReport.length === 0) {
                // 如果沒有損壞的數據但用戶仍選擇重置，詢問是否要完全重置
                const shouldCompleteReset = confirm('沒有檢測到損壞的數據。您是否想要完全重置所有行程數據？\n\n警告：這將刪除所有已保存的行程和設置，無法恢復！');
                
                if (shouldCompleteReset) {
                    localStorage.removeItem(SAVED_ITINERARIES_KEY);
                    localStorage.removeItem(STORAGE_KEY);
                    localStorage.removeItem(LOCATION_CACHE_KEY);
                    resetReport.push('已完全重置所有行程數據');
                    
                    // 重置應用狀態
                    startingPoint = null;
                    destinations = [];
                    dailySettings = [];
                    dailyEndPoints = [];
                    locationCache = {};
                    
                    // 更新界面
                    document.getElementById('starting-point').value = '';
                    document.getElementById('new-destination').value = '';
                    
                    updateItinerary();
                    updateMap();
                }
            }
            
            if (resetReport.length > 0) {
                alert('重置完成:\n- ' + resetReport.join('\n- ') + '\n\n頁面將刷新以應用更改。');
                location.reload();
            } else {
                alert('未進行任何更改。');
            }
        }
    } catch (error) {
        console.error('修復本地存儲時發生錯誤:', error);
        alert(`修復過程中發生錯誤: ${error.message}`);
    }
}

// 允許在指定日期添加景點的函數
async function addDestinationToSpecificDay(location, targetDayIndex) {
    if (!startingPoint) {
        alert('請先設置出發點！');
        return;
    }
    
    // 檢查目標日期是否有效
    const days = distributeItineraryToDays();
    if (targetDayIndex < 0 || targetDayIndex >= days.length) {
        alert(`無效的日期：第 ${targetDayIndex + 1} 天不存在。請先安排足夠的行程。`);
        return;
    }
    
    try {
        let coordinates;
        
        // 檢查緩存中是否有該位置的經緯度資料
        if (locationCache[location]) {
            coordinates = locationCache[location];
            console.log(`使用緩存中的經緯度資料: ${location} -> [${coordinates[0]}, ${coordinates[1]}]`);
        } else {
            coordinates = await geocodeLocation(location);
        }
        
        // 識別位置的國家和城市
        const locationInfo = identifyLocation(coordinates[0], coordinates[1]);
        const country = locationInfo.country;
        const city = locationInfo.city;
        
        // 確定停留時間
        const stayDuration = determineStayDuration(location);
        
        // 創建新景點
        const newDestination = {
            name: location,
            coordinates: coordinates,
            stayDuration: stayDuration,
            country: country,
            city: city
        };
        
        // 計算新景點添加後該天的總時間
        const dayInfo = calculateDayTimeWithNewDestination(targetDayIndex, newDestination);
        
        // 獲取當天設定
        const daySetting = getDaySettings(targetDayIndex);
        
        // 檢查添加後是否超過當天時間限制
        if (dayInfo.totalTime > daySetting.maxHours) {
            // 超過時間限制，顯示調整選項對話框
            const overTime = (dayInfo.totalTime - daySetting.maxHours).toFixed(1);
            
            // 創建對話框
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background-color: rgba(0,0,0,0.6);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
                backdrop-filter: blur(3px);
            `;
            
            const dialogContent = document.createElement('div');
            dialogContent.style.cssText = `
                background: white;
                padding: 25px;
                border-radius: 8px;
                max-width: 550px;
                width: 90%;
                box-shadow: 0 6px 20px rgba(0,0,0,0.2);
            `;
            
            dialogContent.innerHTML = `
                <h3 style="color: #4a89dc; margin-bottom: 20px; text-align: center; font-size: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">時間衝突提醒</h3>
                <div style="margin-bottom: 20px; line-height: 1.5;">
                    <div style="background-color: #fff9e6; border-left: 4px solid #f0ad4e; padding: 15px; margin-bottom: 20px; border-radius: 4px;">
                        <div style="display: flex; align-items: center; margin-bottom: 10px;">
                            <i class="fas fa-exclamation-triangle" style="color: #f0ad4e; margin-right: 10px; font-size: 18px;"></i>
                            <span style="font-weight: bold; color: #555;">時間超出提示</span>
                        </div>
                        <p style="margin: 0; color: #666; line-height: 1.6;">
                            添加景點「${location}」後，第 ${targetDayIndex + 1} 天的行程將超出時間限制 <strong>${overTime}</strong> 小時。
                        </p>
                    </div>
                    
                    <p style="margin-bottom: 15px;">請選擇以下選項以解決時間衝突：</p>
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    <button id="adjust-stay-time" style="background-color: #5cb85c; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; text-align: left; transition: all 0.2s ease; display: flex; align-items: center;">
                        <i class="fas fa-clock" style="margin-right: 10px; font-size: 16px;"></i>
                        <div>
                            <div style="font-weight: bold;">自動調整景點停留時間</div>
                            <div style="font-size: 12px; margin-top: 3px;">系統將自動減少當天其他景點的停留時間</div>
                        </div>
                    </button>
                    
                    <button id="increase-time-limit" style="background-color: #5bc0de; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; text-align: left; transition: all 0.2s ease; display: flex; align-items: center;">
                        <i class="fas fa-hourglass-half" style="margin-right: 10px; font-size: 16px;"></i>
                        <div>
                            <div style="font-weight: bold;">增加當天行程時間</div>
                            <div style="font-size: 12px; margin-top: 3px;">將當天的最大行程時間從 ${daySetting.maxHours} 小時增加到 ${Math.ceil(dayInfo.totalTime * 10) / 10} 小時</div>
                        </div>
                    </button>
                    
                    <button id="cancel-add" style="background-color: #f0ad4e; color: white; border: none; padding: 12px; border-radius: 6px; cursor: pointer; text-align: left; transition: all 0.2s ease; display: flex; align-items: center;">
                        <i class="fas fa-times" style="margin-right: 10px; font-size: 16px;"></i>
                        <div>
                            <div style="font-weight: bold;">取消添加</div>
                            <div style="font-size: 12px; margin-top: 3px;">不添加此景點，返回上一步</div>
                        </div>
                    </button>
                </div>
            `;
            
            dialog.appendChild(dialogContent);
            document.body.appendChild(dialog);
            
            // 定義選項的處理
            return new Promise((resolve) => {
                // 選項1：調整停留時間
                document.getElementById('adjust-stay-time').addEventListener('click', async () => {
                    // 移除對話框
                    document.body.removeChild(dialog);
                    
                    // 嘗試調整當天其他景點的停留時間
                    const adjusted = adjustDayDestinationTimes(targetDayIndex, newDestination);
                    if (!adjusted) {
                        alert('無法完成自動調整，請手動調整景點停留時間。');
                        resolve(false);
                        return;
                    }
                    
                    // 添加新景點
                    destinations.push(newDestination);
                    updateMapAndItinerary(targetDayIndex, newDestination);
                    resolve(true);
                });
                
                // 選項2：增加時間限制
                document.getElementById('increase-time-limit').addEventListener('click', () => {
                    // 移除對話框
                    document.body.removeChild(dialog);
                    
                    // 計算新的最大時間
                    const newMaxHours = Math.ceil(dayInfo.totalTime * 10) / 10;
                    
                    // 更新或添加當天設定
                    const existingSettingIndex = dailySettings.findIndex(s => s.dayIndex === targetDayIndex);
                    if (existingSettingIndex >= 0) {
                        dailySettings[existingSettingIndex].maxHours = newMaxHours;
                    } else {
                        dailySettings.push({
                            dayIndex: targetDayIndex,
                            departureTime: daySetting.departureTime,
                            maxHours: newMaxHours
                        });
                    }
                    
                    // 添加新景點
                    destinations.push(newDestination);
                    updateMapAndItinerary(targetDayIndex, newDestination);
                    resolve(true);
                });
                
                // 選項3：取消添加
                document.getElementById('cancel-add').addEventListener('click', () => {
                    // 移除對話框
                    document.body.removeChild(dialog);
                    alert('已取消添加景點。');
                    resolve(false);
                });
            });
        } else {
            // 時間內可以正常添加
            destinations.push(newDestination);
            updateMapAndItinerary(targetDayIndex, newDestination);
            return true;
        }
    } catch (error) {
        console.error('添加景點到指定日期時出錯:', error);
        alert(`添加景點失敗: ${error.message}`);
        return false;
    }
    
    // 輔助函數：更新地圖和行程
    function updateMapAndItinerary(targetDayIndex, newDestination) {
        // 如果選擇的日期不是自動分配的日期，設置該景點為該日的結束點
        const simulatedDays = distributeItineraryToDays();
        const actualDayIndex = findDestinationDay(newDestination, simulatedDays);
        
        if (actualDayIndex !== targetDayIndex) {
            // 設置為目標日的結束點，以確保它在正確的日期
            setEndPointWithCoordinates(targetDayIndex, newDestination.name, newDestination.coordinates);
            
            // 如果下一天也有結束點，則將下一天的結束點重置
            if (targetDayIndex + 1 < simulatedDays.length) {
                const nextDayEndPoint = dailyEndPoints.find(ep => ep.dayIndex === targetDayIndex + 1);
                if (nextDayEndPoint) {
                    removeDayEndPoint(targetDayIndex + 1);
                }
            }
        }
        
        // 更新地圖和行程
        updateMap();
        updateItinerary();
        
        // 保存當前狀態
        saveStateToHistory();
        
        alert(`已成功添加景點「${newDestination.name}」到第 ${targetDayIndex + 1} 天的行程中。`);
    }
}

// 計算新增景點後當天的總時間
function calculateDayTimeWithNewDestination(dayIndex, newDestination) {
    const days = distributeItineraryToDays();
    
    if (dayIndex < 0 || dayIndex >= days.length) {
        return { totalTime: 0, destinations: [] };
    }
    
    const day = days[dayIndex];
    let dayDestinations = [...day];
    
    // 假設新景點添加到當天的最後
    const lastPoint = dayDestinations[dayDestinations.length - 1];
    
    // 計算從最後一個點到新景點的交通時間
    const transportation = determineTransportation(
        lastPoint.coordinates,
        newDestination.coordinates
    );
    
    // 計算當前已用時間
    let currentDayTime = 0;
    for (let i = 1; i < dayDestinations.length; i++) {
        const point = dayDestinations[i];
        if (point.transportationFromPrevious) {
            currentDayTime += point.transportationFromPrevious.time;
        }
        
        // 加上停留時間，最後一個點不算停留時間
        if (i < dayDestinations.length - 1 && !point.isEndPoint) {
            currentDayTime += point.stayDuration;
        }
    }
    
    // 加上新景點的交通時間和停留時間
    const totalTime = currentDayTime + transportation.time + newDestination.stayDuration;
    
    return {
        totalTime: totalTime,
        currentDayTime: currentDayTime,
        transportationTime: transportation.time,
        dayDestinations: dayDestinations
    };
}

// 自動調整當天景點的停留時間
function adjustDayDestinationTimes(dayIndex, newDestination) {
    const dayInfo = calculateDayTimeWithNewDestination(dayIndex, newDestination);
    const days = distributeItineraryToDays();
    
    if (dayIndex < 0 || dayIndex >= days.length) {
        return false;
    }
    
    const day = days[dayIndex];
    const daySetting = getDaySettings(dayIndex);
    
    // 需要減少的時間
    const targetReduction = dayInfo.totalTime - daySetting.maxHours;
    
    if (targetReduction <= 0) {
        return true; // 不需要調整
    }
    
    // 顯示調整界面
    showDayTimeAdjustmentDialog(dayIndex, day, targetReduction, newDestination);
    return true;
}

// 查找景點在哪一天
function findDestinationDay(destination, days) {
    for (let i = 0; i < days.length; i++) {
        const day = days[i];
        for (let j = 0; j < day.length; j++) {
            const point = day[j];
            if (point.name === destination.name && 
                Math.abs(point.coordinates[0] - destination.coordinates[0]) < 0.0000001 && 
                Math.abs(point.coordinates[1] - destination.coordinates[1]) < 0.0000001) {
                return i;
            }
        }
    }
    return -1;
}

// 顯示停留時間調整對話框
function showDayTimeAdjustmentDialog(dayIndex, day, targetReduction, newDestination) {
    // 創建對話框
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;
    
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background: white;
        padding: 20px;
        border-radius: 8px;
        max-width: 800px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    `;
    
    // 取得當前日期的農曆資訊（若有農曆功能）
    let lunarDateInfo = '';
    if (typeof getLunarDate === 'function') {
        try {
            const today = new Date();
            lunarDateInfo = `<span class="lunar-date">${getLunarDate(today)}</span>`;
        } catch (e) {
            console.log('無法獲取農曆日期');
        }
    }
    
    dialogContent.innerHTML = `
        <h3 style="color: #4a89dc; margin-bottom: 15px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">
            調整第 ${dayIndex + 1} 天的景點時間 ${lunarDateInfo}
        </h3>
        <div style="background-color: #f8f9fa; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
            <p style="margin-bottom: 8px;">您想添加的景點「<strong style="color: #e74c3c;">${newDestination.name}</strong>」資訊：</p>
            <ul style="margin-left: 20px; margin-bottom: 8px;">
                <li>建議停留時間：<strong>${newDestination.stayDuration.toFixed(1)}</strong> 小時</li>
                <li>預計交通時間：<strong>${calculateDayTimeWithNewDestination(dayIndex, newDestination).transportationTime.toFixed(1)}</strong> 小時</li>
            </ul>
            <p style="color: #e74c3c; font-weight: bold;">需要減少總計 ${targetReduction.toFixed(1)} 小時才能符合當天時間限制。</p>
        </div>
        
        <div style="margin-bottom: 10px;">
            <p style="font-weight: bold; margin-bottom: 5px;">調整選項：</p>
            <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                <button id="distribute-equally" style="padding: 5px 10px; background-color: #4a89dc; color: white; border: none; border-radius: 4px; cursor: pointer;">平均分配減少時間</button>
                <button id="reduce-proportionally" style="padding: 5px 10px; background-color: #4a89dc; color: white; border: none; border-radius: 4px; cursor: pointer;">按比例減少時間</button>
                <button id="reset-adjustments" style="padding: 5px 10px; background-color: #f0ad4e; color: white; border: none; border-radius: 4px; cursor: pointer;">重設調整</button>
            </div>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #ddd;">
            <tr style="background-color: #f5f7fa;">
                <th style="text-align: left; padding: 10px; border-bottom: 1px solid #ddd;">景點名稱</th>
                <th style="text-align: center; padding: 10px; border-bottom: 1px solid #ddd;">原始停留時間</th>
                <th style="text-align: center; padding: 10px; border-bottom: 1px solid #ddd;">調整後時間</th>
                <th style="text-align: center; padding: 10px; border-bottom: 1px solid #ddd;">減少時間</th>
            </tr>
            ${day.map((point, index) => {
                if (point.isStartingPoint || point.isEndPoint) return '';
                const destinationIndex = destinations.findIndex(d => 
                    d.name === point.name && 
                    Math.abs(d.coordinates[0] - point.coordinates[0]) < 0.0000001 && 
                    Math.abs(d.coordinates[1] - point.coordinates[1]) < 0.0000001
                );
                if (destinationIndex < 0) return '';
                
                // 計算初始建議的減少時間
                const suggestedNewTime = Math.max(0, point.stayDuration - targetReduction / (day.length - 1)).toFixed(1);
                const reductionTime = (point.stayDuration - suggestedNewTime).toFixed(1);
                
                return `
                    <tr class="destination-row" data-original="${point.stayDuration.toFixed(1)}">
                        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
                            <span>${point.name}</span>
                            <div style="font-size: 12px; color: #666;">
                                <span class="location-type">${getLocationType(point.name)}</span>
                            </div>
                        </td>
                        <td style="text-align: center; padding: 10px; border-bottom: 1px solid #ddd;">
                            ${point.stayDuration.toFixed(1)} 小時
                        </td>
                        <td style="text-align: center; padding: 10px; border-bottom: 1px solid #ddd;">
                            <input type="number" min="0" max="${point.stayDuration}" step="0.1" value="${suggestedNewTime}" 
                                data-index="${destinationIndex}" data-original="${point.stayDuration.toFixed(1)}" class="time-adjustment-input" style="width: 70px; padding: 5px; text-align: center; border: 1px solid #ddd; border-radius: 4px;">
                            <span> 小時</span>
                        </td>
                        <td style="text-align: center; padding: 10px; border-bottom: 1px solid #ddd;" class="reduction-display">
                            ${reductionTime} 小時
                        </td>
                    </tr>
                `;
            }).join('')}
            <tr style="background-color: #edf2f7; font-weight: bold;">
                <td colspan="2" style="text-align: right; padding: 10px;">總計減少時間：</td>
                <td colspan="2" style="text-align: center; padding: 10px;">
                    <span id="total-reduction">0.0</span> / <span id="target-reduction">${targetReduction.toFixed(1)}</span> 小時
                    <div style="width: 100%; height: 6px; background-color: #e0e0e0; border-radius: 3px; margin-top: 5px; overflow: hidden;">
                        <div id="reduction-progress" style="height: 100%; width: 0%; background-color: #4CAF50;"></div>
                    </div>
                </td>
            </tr>
        </table>
        
        <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 1px solid #eee;">
            <div>
                <span style="font-weight: bold;">還需減少時間：</span>
                <span id="remaining-reduction" style="color: #e74c3c; font-weight: bold;">${targetReduction.toFixed(1)}</span>
                <span> 小時</span>
            </div>
            <div>
                <button id="apply-time-adjustments" style="background-color: #4CAF50; color: white; border: none; padding: 8px 15px; border-radius: 4px; margin-right: 10px; cursor: pointer;">確認調整</button>
                <button id="cancel-time-adjustments" style="background-color: #f44336; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">取消</button>
            </div>
        </div>
    `;
    
    dialog.appendChild(dialogContent);
    document.body.appendChild(dialog);
    
    // 計算剩餘需減少的時間
    let remainingReduction = targetReduction;
    const timeInputs = dialogContent.querySelectorAll('.time-adjustment-input');
    const totalReductionDisplay = document.getElementById('total-reduction');
    const remainingReductionDisplay = document.getElementById('remaining-reduction');
    const reductionProgress = document.getElementById('reduction-progress');
    
    // 更新減少時間顯示
    function updateReductionDisplay() {
        let totalReduction = 0;
        
        timeInputs.forEach(input => {
            const originalTime = parseFloat(input.dataset.original);
            const newTime = parseFloat(input.value);
            const reduction = Math.max(0, originalTime - newTime);
            
            const row = input.closest('.destination-row');
            const reductionDisplay = row.querySelector('.reduction-display');
            reductionDisplay.textContent = reduction.toFixed(1) + ' 小時';
            
            // 根據調整幅度變更顏色
            if (reduction > 0) {
                reductionDisplay.style.color = '#e74c3c';
            } else {
                reductionDisplay.style.color = '#666';
            }
            
            totalReduction += reduction;
        });
        
        remainingReduction = Math.max(0, targetReduction - totalReduction);
        
        totalReductionDisplay.textContent = totalReduction.toFixed(1);
        remainingReductionDisplay.textContent = remainingReduction.toFixed(1);
        
        // 更新進度條
        const progressPercentage = Math.min(100, (totalReduction / targetReduction) * 100);
        reductionProgress.style.width = progressPercentage + '%';
        
        // 調整進度條顏色
        if (progressPercentage < 100) {
            reductionProgress.style.backgroundColor = '#f0ad4e';
        } else {
            reductionProgress.style.backgroundColor = '#4CAF50';
        }
        
        // 啟用或禁用應用按鈕
        const applyButton = document.getElementById('apply-time-adjustments');
        if (totalReduction >= targetReduction) {
            applyButton.removeAttribute('disabled');
            applyButton.style.opacity = '1';
        } else {
            applyButton.setAttribute('disabled', 'true');
            applyButton.style.opacity = '0.5';
        }
    }
    
    // 初始計算
    setTimeout(updateReductionDisplay, 100);
    
    // 平均分配減少時間
    document.getElementById('distribute-equally').addEventListener('click', () => {
        const adjustableInputs = Array.from(timeInputs);
        const adjustableCount = adjustableInputs.length;
        
        if (adjustableCount === 0) return;
        
        const reductionPerDestination = targetReduction / adjustableCount;
        
        adjustableInputs.forEach(input => {
            const originalTime = parseFloat(input.dataset.original);
            const newTime = Math.max(0, originalTime - reductionPerDestination).toFixed(1);
            input.value = newTime;
        });
        
        updateReductionDisplay();
    });
    
    // 按比例減少時間
    document.getElementById('reduce-proportionally').addEventListener('click', () => {
        const adjustableInputs = Array.from(timeInputs);
        
        // 計算總原始時間
        let totalOriginalTime = 0;
        adjustableInputs.forEach(input => {
            totalOriginalTime += parseFloat(input.dataset.original);
        });
        
        if (totalOriginalTime === 0) return;
        
        // 按比例減少
        adjustableInputs.forEach(input => {
            const originalTime = parseFloat(input.dataset.original);
            const proportion = originalTime / totalOriginalTime;
            const reduction = targetReduction * proportion;
            const newTime = Math.max(0, originalTime - reduction).toFixed(1);
            input.value = newTime;
        });
        
        updateReductionDisplay();
    });
    
    // 重設調整
    document.getElementById('reset-adjustments').addEventListener('click', () => {
        timeInputs.forEach(input => {
            const originalTime = parseFloat(input.dataset.original);
            input.value = originalTime.toFixed(1);
        });
        
        updateReductionDisplay();
    });
    
    // 綁定輸入事件
    timeInputs.forEach(input => {
        input.addEventListener('input', updateReductionDisplay);
    });
    
    // 應用按鈕事件
    document.getElementById('apply-time-adjustments').addEventListener('click', () => {
        // 檢查是否已滿足減少要求
        let totalReduction = 0;
        
        timeInputs.forEach(input => {
            const originalTime = parseFloat(input.dataset.original);
            const newTime = parseFloat(input.value);
            totalReduction += Math.max(0, originalTime - newTime);
        });
        
        if (totalReduction < targetReduction) {
            alert(`請至少減少 ${targetReduction.toFixed(1)} 小時的停留時間。目前只減少了 ${totalReduction.toFixed(1)} 小時。`);
            return;
        }
        
        // 應用調整
        timeInputs.forEach(input => {
            const destinationIndex = parseInt(input.dataset.index);
            const newTime = parseFloat(input.value);
            
            if (!isNaN(destinationIndex) && destinationIndex >= 0 && destinationIndex < destinations.length) {
                destinations[destinationIndex].stayDuration = newTime;
            }
        });
        
        // 關閉對話框
        document.body.removeChild(dialog);
        
        // 更新地圖和行程
        updateMap();
        updateItinerary();
        
        // 保存當前狀態
        saveStateToHistory();
        
        // 添加新景點
        destinations.push(newDestination);
        updateMap();
        updateItinerary();
        
        alert(`已成功調整行程時間並添加景點「${newDestination.name}」到第 ${dayIndex + 1} 天。`);
    });
    
    // 取消按鈕事件
    document.getElementById('cancel-time-adjustments').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
}

// 獲取景點類型（用於顯示更多資訊）
function getLocationType(locationName) {
    // 根據關鍵字判斷景點類型
    const types = {
        '國家公園': '自然景觀',
        '森林': '自然景觀',
        '山': '自然景觀',
        '溫泉': '休閒',
        '公園': '休閒',
        '海灘': '海岸景觀',
        '海': '海岸景觀',
        '港': '海岸景觀',
        '廟': '宗教古蹟',
        '寺': '宗教古蹟',
        '古蹟': '歷史古蹟',
        '博物館': '文化展覽',
        '美術館': '文化展覽',
        '展覽': '文化展覽',
        '夜市': '美食購物',
        '老街': '美食購物',
        '市場': '美食購物',
        '商圈': '美食購物',
        '百貨': '美食購物',
        '餐廳': '美食',
        '咖啡': '美食',
        '遊樂園': '主題樂園',
        '動物園': '主題樂園',
        '車站': '交通樞紐',
        '捷運': '交通樞紐',
        '機場': '交通樞紐'
    };
    
    // 預設類型
    let locationType = '一般景點';
    
    // 針對常見台灣景點特別處理
    const specialLocations = {
        '日月潭': '自然景觀',
        '阿里山': '自然景觀',
        '太魯閣': '自然景觀',
        '墾丁': '海岸景觀',
        '台北101': '都市景觀',
        '九份': '歷史老街',
        '淡水': '海岸景觀',
        '故宮博物院': '文化展覽',
        '西門町': '美食購物',
        '高雄85大樓': '都市景觀',
        '花蓮七星潭': '海岸景觀',
        '陽明山': '自然景觀',
        '三峽老街': '歷史老街',
        '鶯歌陶瓷': '文化體驗',
        '野柳': '自然景觀',
        '平溪': '歷史老街',
        '十分': '歷史老街'
    };
    
    // 檢查是否為特殊景點
    for (const [key, type] of Object.entries(specialLocations)) {
        if (locationName.includes(key)) {
            locationType = type;
            return locationType;
        }
    }
    
    // 如果不是特殊景點，根據關鍵字判斷
    for (const [keyword, type] of Object.entries(types)) {
        if (locationName.includes(keyword)) {
            locationType = type;
            return locationType;
        }
    }
    
    return locationType;
}

// 顯示添加景點到特定日期的對話框
function showAddToSpecificDayDialog(dayIndex) {
    // 創建對話框
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0,0,0,0.6);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        backdrop-filter: blur(3px);
    `;
    
    const dialogContent = document.createElement('div');
    dialogContent.style.cssText = `
        background: white;
        padding: 25px;
        border-radius: 8px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
    `;
    
    // 獲取當天的日期
    let dateDisplay = '';
    const departureDate = document.getElementById('departure-date')?.value;
    if (departureDate) {
        const tripStartDate = new Date(departureDate);
        tripStartDate.setDate(tripStartDate.getDate() + dayIndex);
        const formattedDate = formatDateWithLunar(tripStartDate);
        dateDisplay = `<div style="color: #666; margin-bottom: 5px; font-size: 14px;">${formattedDate}</div>`;
    }
    
    dialogContent.innerHTML = `
        <h3 style="color: #4a89dc; margin-bottom: 20px; text-align: center; font-size: 20px; border-bottom: 1px solid #eee; padding-bottom: 15px;">添加景點到第 ${dayIndex + 1} 天</h3>
        ${dateDisplay}
        <div style="margin-bottom: 20px;">
            <label for="specific-day-destination" style="display: block; margin-bottom: 10px; font-weight: bold; color: #333;">景點名稱：</label>
            <div style="position: relative;">
                <input type="text" id="specific-day-destination" style="width: 100%; padding: 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 15px; box-sizing: border-box;" placeholder="請輸入景點名稱">
                <i class="fas fa-search" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #aaa;"></i>
            </div>
        </div>
        
        <div style="background-color: #f9f9f9; border-radius: 6px; padding: 15px; margin-bottom: 20px; border: 1px solid #eee;">
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
                <i class="fas fa-info-circle" style="color: #4a89dc; margin-right: 10px; font-size: 18px;"></i>
                <span style="font-weight: bold; color: #555;">重要提示</span>
            </div>
            <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.5;">
                如果添加的景點使當天行程超出時間限制，系統會提供以下選項：
                <ul style="margin-top: 8px; padding-left: 20px;">
                    <li>自動調整其他景點的停留時間</li>
                    <li>增加當天的行程時間限制</li>
                    <li>取消添加此景點</li>
                </ul>
            </p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 15px;">
            <button id="add-to-day-confirm" style="background-color: #4CAF50; color: white; border: none; padding: 12px 0; border-radius: 6px; cursor: pointer; flex: 1; margin-right: 15px; font-weight: bold; transition: all 0.2s ease;">
                <i class="fas fa-plus-circle" style="margin-right: 8px;"></i> 添加景點
            </button>
            <button id="add-to-day-cancel" style="background-color: #f0ad4e; color: white; border: none; padding: 12px 0; border-radius: 6px; cursor: pointer; flex: 1; transition: all 0.2s ease;">
                <i class="fas fa-times" style="margin-right: 8px;"></i> 取消
            </button>
        </div>
    `;
    
    dialog.appendChild(dialogContent);
    document.body.appendChild(dialog);
    
    // 獲取輸入框並聚焦
    const input = document.getElementById('specific-day-destination');
    setTimeout(() => input.focus(), 100);
    
    // 確認按鈕事件
    document.getElementById('add-to-day-confirm').addEventListener('click', async () => {
        const destination = input.value.trim();
        if (!destination) {
            alert('請輸入景點名稱');
            return;
        }
        
        // 關閉對話框
        document.body.removeChild(dialog);
        
        // 在指定日期添加景點
        await addDestinationToSpecificDay(destination, dayIndex);
    });
    
    // 取消按鈕事件
    document.getElementById('add-to-day-cancel').addEventListener('click', () => {
        document.body.removeChild(dialog);
    });
    
    // 輸入框回車事件
    input.addEventListener('keyup', async (e) => {
        if (e.key === 'Enter') {
            const destination = input.value.trim();
            if (!destination) {
                alert('請輸入景點名稱');
                return;
            }
            
            // 關閉對話框
            document.body.removeChild(dialog);
            
            // 在指定日期添加景點
            await addDestinationToSpecificDay(destination, dayIndex);
        }
    });
}

// 農曆日期轉換功能
// 農曆日期資料（2021-2025年）
const LUNAR_INFO = {
    '2023': {
        '正月': { firstDay: new Date(2023, 0, 22), days: 29 },
        '二月': { firstDay: new Date(2023, 1, 20), days: 30 },
        '三月': { firstDay: new Date(2023, 2, 22), days: 29 },
        '四月': { firstDay: new Date(2023, 3, 20), days: 30 },
        '五月': { firstDay: new Date(2023, 4, 20), days: 29 },
        '六月': { firstDay: new Date(2023, 5, 18), days: 30 },
        '七月': { firstDay: new Date(2023, 6, 18), days: 29 },
        '八月': { firstDay: new Date(2023, 7, 16), days: 30 },
        '九月': { firstDay: new Date(2023, 8, 15), days: 29 },
        '十月': { firstDay: new Date(2023, 9, 14), days: 30 },
        '十一月': { firstDay: new Date(2023, 10, 13), days: 29 },
        '十二月': { firstDay: new Date(2023, 11, 12), days: 30 }
    },
    '2024': {
        '正月': { firstDay: new Date(2024, 0, 11), days: 30 },
        '二月': { firstDay: new Date(2024, 1, 10), days: 29 },
        '閏二月': { firstDay: new Date(2024, 2, 10), days: 30 },
        '三月': { firstDay: new Date(2024, 3, 9), days: 29 },
        '四月': { firstDay: new Date(2024, 4, 8), days: 30 },
        '五月': { firstDay: new Date(2024, 5, 7), days: 29 },
        '六月': { firstDay: new Date(2024, 6, 6), days: 30 },
        '七月': { firstDay: new Date(2024, 7, 5), days: 29 },
        '八月': { firstDay: new Date(2024, 8, 3), days: 30 },
        '九月': { firstDay: new Date(2024, 9, 3), days: 29 },
        '十月': { firstDay: new Date(2024, 10, 1), days: 30 },
        '十一月': { firstDay: new Date(2024, 11, 1), days: 30 },
        '十二月': { firstDay: new Date(2024, 11, 31), days: 29 }
    },
    '2025': {
        '正月': { firstDay: new Date(2025, 0, 29), days: 30 },
        '二月': { firstDay: new Date(2025, 1, 28), days: 29 },
        '三月': { firstDay: new Date(2025, 2, 29), days: 30 },
        '四月': { firstDay: new Date(2025, 3, 28), days: 29 },
        '五月': { firstDay: new Date(2025, 4, 27), days: 30 },
        '六月': { firstDay: new Date(2025, 5, 26), days: 29 },
        '七月': { firstDay: new Date(2025, 6, 25), days: 30 },
        '八月': { firstDay: new Date(2025, 7, 24), days: 29 },
        '九月': { firstDay: new Date(2025, 8, 22), days: 30 },
        '十月': { firstDay: new Date(2025, 9, 22), days: 29 },
        '十一月': { firstDay: new Date(2025, 10, 20), days: 30 },
        '十二月': { firstDay: new Date(2025, 11, 20), days: 30 }
    }
};

// 農曆日期轉換函數
function getLunarDate(date) {
    // 如果沒有提供日期，使用當前日期
    if (!date) {
        date = new Date();
    }
    
    // 取得年份
    const year = date.getFullYear();
    
    // 檢查年份是否在支援範圍內
    if (!LUNAR_INFO[year.toString()]) {
        return '農曆日期不支援此年份';
    }
    
    // 尋找日期所在的農曆月份
    let lunarMonth = '';
    let lunarDay = 0;
    
    const yearInfo = LUNAR_INFO[year.toString()];
    const months = Object.keys(yearInfo);
    
    for (let i = 0; i < months.length; i++) {
        const month = months[i];
        const monthInfo = yearInfo[month];
        const firstDay = monthInfo.firstDay;
        const days = monthInfo.days;
        
        // 計算當前月的最後一天
        const lastDay = new Date(firstDay);
        lastDay.setDate(lastDay.getDate() + days - 1);
        
        // 檢查日期是否在此月範圍內
        if (date >= firstDay && date <= lastDay) {
            lunarMonth = month;
            // 計算農曆日期
            const dayDiff = Math.floor((date - firstDay) / (24 * 60 * 60 * 1000));
            lunarDay = dayDiff + 1; // 農曆從初一開始
            break;
        }
        
        // 如果是最後一個月且日期比最後一天還晚，可能是下一年的正月
        if (i === months.length - 1 && date > lastDay) {
            // 嘗試獲取下一年的資料
            const nextYear = (year + 1).toString();
            if (LUNAR_INFO[nextYear] && LUNAR_INFO[nextYear]['正月']) {
                const nextYearFirstMonth = LUNAR_INFO[nextYear]['正月'];
                // 如果日期在下一年正月的第一天之前
                if (date < nextYearFirstMonth.firstDay) {
                    // 將其視為本年最後一個月的延續
                    lunarMonth = month;
                    const dayDiff = Math.floor((date - lastDay) / (24 * 60 * 60 * 1000));
                    lunarDay = days + dayDiff;
                }
            }
        }
    }
    
    // 如果沒有找到對應的農曆月份，返回錯誤訊息
    if (!lunarMonth) {
        return '無法計算農曆日期';
    }
    
    // 轉換農曆日為中文表示
    const lunarDayNames = [
        '初一', '初二', '初三', '初四', '初五', '初六', '初七', '初八', '初九', '初十',
        '十一', '十二', '十三', '十四', '十五', '十六', '十七', '十八', '十九', '二十',
        '廿一', '廿二', '廿三', '廿四', '廿五', '廿六', '廿七', '廿八', '廿九', '三十'
    ];
    
    // 返回格式化的農曆日期
    return `農曆 ${lunarMonth}${lunarDayNames[lunarDay - 1]}`;
}

// 轉換日期為帶農曆的展示格式
function formatDateWithLunar(date) {
    if (!(date instanceof Date)) {
        return '日期錯誤';
    }
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
    const weekDay = weekDays[date.getDay()];
    
    // 移除農曆日期信息
    return `${year}年${month}月${day}日 (${weekDay})`;
}

// 行程顯示模式相關變數
let currentViewMode = 'list'; // 'list' 或 'paged'
let currentDayIndex = 0;

// 行程顯示模式切換功能
function initViewModeToggle() {
    const pageBtn = document.getElementById('page-mode-btn');
    const listBtn = document.getElementById('list-mode-btn');
    const itinerarySection = document.querySelector('.itinerary-section');
    
    if (!pageBtn || !listBtn) return;
    
    pageBtn.addEventListener('click', () => {
        if (currentViewMode === 'page') return;
        
        currentViewMode = 'page';
        pageBtn.classList.add('active');
        listBtn.classList.remove('active');
        itinerarySection.classList.add('paged-mode');
        
        // 初始顯示第一天
        showDayByIndex(0);
        updatePagerControls();
        updateSummaryDays();
        
        // 更新地圖，只顯示當前天的景點
        updateMap();
        
        // 震動反饋（如果支援）
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // 儲存使用者偏好
        localStorage.setItem('viewMode', 'page');
    });
    
    listBtn.addEventListener('click', () => {
        if (currentViewMode === 'list') return;
        
        currentViewMode = 'list';
        listBtn.classList.add('active');
        pageBtn.classList.remove('active');
        itinerarySection.classList.remove('paged-mode');
        
        // 顯示所有天數
        const dayCards = document.querySelectorAll('.day-card');
        dayCards.forEach(card => {
            card.style.display = 'block';
            card.classList.remove('active');
        });
        
        // 更新地圖，顯示所有景點
        updateMap();
        
        // 震動反饋（如果支援）
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        // 儲存使用者偏好
        localStorage.setItem('viewMode', 'list');
    });
    
    // 初始化翻頁控制
    initPagerControls();
    
    // 讀取使用者偏好的顯示模式
    const savedViewMode = localStorage.getItem('viewMode');
    if (savedViewMode) {
        if (savedViewMode === 'page') {
            pageBtn.click();
        } else {
            listBtn.click();
        }
    }
}

// 初始化翻頁控制
function initPagerControls() {
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    
    if (!prevBtn || !nextBtn) {
        console.error('無法找到翻頁按鈕元素!');
        return;
    }
    
    // 添加明確的數據屬性以便識別
    prevBtn.setAttribute('data-direction', 'prev');
    nextBtn.setAttribute('data-direction', 'next');
    
    // 移除可能存在的舊事件監聽器（避免重複綁定）
    prevBtn.replaceWith(prevBtn.cloneNode(true));
    nextBtn.replaceWith(nextBtn.cloneNode(true));
    
    // 重新獲取按鈕引用
    const newPrevBtn = document.getElementById('prev-page-btn');
    const newNextBtn = document.getElementById('next-page-btn');
    
    // 為上一天按鈕添加事件監聽器
    newPrevBtn.addEventListener('click', () => {
        console.log('上一天按鈕被點擊，當前日期索引:', currentDayIndex);
        if (currentDayIndex > 0) {
            const newIndex = currentDayIndex - 1;
            console.log('將切換到索引:', newIndex);
            showDayByIndex(newIndex, 'prev');
        } else {
            console.log('已經是第一天，無法再往前');
        }
    });
    
    // 為下一天按鈕添加事件監聽器
    newNextBtn.addEventListener('click', () => {
        const dayCards = document.querySelectorAll('.day-card');
        console.log('下一天按鈕被點擊，當前日期索引:', currentDayIndex, '總天數:', dayCards.length);
        if (currentDayIndex < dayCards.length - 1) {
            const newIndex = currentDayIndex + 1;
            console.log('將切換到索引:', newIndex);
            showDayByIndex(newIndex, 'next');
        } else {
            console.log('已經是最後一天，無法再往後');
        }
    });
    
    console.log('翻頁控制已初始化，當前日期索引:', currentDayIndex);
}

// 顯示指定索引的日期卡片
function showDayByIndex(index, direction = null) {
    const dayCards = document.querySelectorAll('.day-card');
    
    // 詳細記錄索引檢查
    console.log(`嘗試顯示索引 ${index}，總天數 ${dayCards.length}`);
    
    // 檢查索引是否有效
    if (index < 0) {
        console.error(`索引 ${index} 無效：小於 0`);
        return;
    }
    
    if (index >= dayCards.length) {
        console.error(`索引 ${index} 無效：超出最大天數 ${dayCards.length - 1}`);
        return;
    }
    
    console.log(`showDayByIndex: 從索引 ${currentDayIndex} 切換到 ${index}，方向: ${direction || '無'}`);
    
    try {
        // 隱藏所有日期卡片
        dayCards.forEach((card, i) => {
            card.style.display = 'none';
            card.classList.remove('active');
            card.classList.remove('page-in-next', 'page-in-prev');
            console.log(`隱藏第 ${i+1} 天的卡片`);
        });
        
        // 顯示指定的日期卡片
        const targetCard = dayCards[index];
        if (!targetCard) {
            console.error(`無法找到索引 ${index} 對應的卡片元素`);
            return;
        }
        
        targetCard.style.display = 'block';
        targetCard.classList.add('active');
        console.log(`顯示第 ${index+1} 天的卡片`);
        
        // 添加方向動畫
        if (direction === 'next') {
            targetCard.classList.add('page-in-next');
            console.log('添加下一頁動畫效果');
        } else if (direction === 'prev') {
            targetCard.classList.add('page-in-prev');
            console.log('添加上一頁動畫效果');
        }
        
        // 設置當前索引
        const oldIndex = currentDayIndex;
        currentDayIndex = index;
        console.log(`當前日期索引已從 ${oldIndex} 更新為 ${currentDayIndex}`);
        
        // 更新UI控制元素
        updatePagerControls();
        updateSummaryDays();
        
        // 如果在翻頁模式下切換日期，也更新地圖顯示
        if (currentViewMode === 'page') {
            updateMap();
        }
    } catch (error) {
        console.error('顯示指定日期時發生錯誤:', error);
    }
}

// 更新頁面控制元素
function updatePagerControls() {
    const prevBtn = document.getElementById('prev-page-btn');
    const nextBtn = document.getElementById('next-page-btn');
    const currentPageEl = document.getElementById('current-page');
    const totalPagesEl = document.getElementById('total-pages');
    const dotsContainer = document.getElementById('page-dots-container');
    
    if (!prevBtn || !nextBtn || !currentPageEl || !totalPagesEl || !dotsContainer) return;
    
    const dayCards = document.querySelectorAll('.day-card');
    
    // 更新頁碼顯示
    currentPageEl.textContent = currentDayIndex + 1;
    totalPagesEl.textContent = dayCards.length;
    
    // 更新按鈕狀態
    prevBtn.disabled = currentDayIndex === 0;
    nextBtn.disabled = currentDayIndex === dayCards.length - 1;
    
    // 更新頁點
    dotsContainer.innerHTML = '';
    for (let i = 0; i < dayCards.length; i++) {
        const dot = document.createElement('div');
        dot.classList.add('page-dot');
        if (i === currentDayIndex) {
            dot.classList.add('active');
        }
        dot.addEventListener('click', () => {
            const direction = i > currentDayIndex ? 'next' : (i < currentDayIndex ? 'prev' : null);
            showDayByIndex(i, direction);
        });
        dotsContainer.appendChild(dot);
    }
}

// 更新日期摘要
function updateSummaryDays() {
    const summaryContainer = document.getElementById('summary-days-container');
    if (!summaryContainer) return;
    
    summaryContainer.innerHTML = '';
    const dayCards = document.querySelectorAll('.day-card');
    
    dayCards.forEach((card, index) => {
        const dayTitle = card.querySelector('.day-title h3')?.textContent || `第 ${index + 1} 天`;
        const summaryDay = document.createElement('div');
        summaryDay.classList.add('summary-day');
        if (index === currentDayIndex) {
            summaryDay.classList.add('active');
        }
        summaryDay.textContent = dayTitle;
        summaryDay.addEventListener('click', () => {
            const direction = index > currentDayIndex ? 'next' : (index < currentDayIndex ? 'prev' : null);
            showDayByIndex(index, direction);
        });
        summaryContainer.appendChild(summaryDay);
    });
}

// 在更新行程後重新初始化翻頁控制
function reinitViewMode() {
    // 重新初始化頁面控制，確保新的行程天數被正確處理
    initPagerControls();
    
    // 更新頁面控制元素
    updatePagerControls();
    
    // 更新日期摘要
    updateSummaryDays();
    
    // 記錄當前狀態
    console.log('重新初始化視圖模式，當前索引:', currentDayIndex, '當前模式:', currentViewMode);
    
    // 如果當前是翻頁模式，確保只顯示當前頁
    if (currentViewMode === 'page') {
        // 如果當前索引超出了範圍，則重置為第一天
        const dayCards = document.querySelectorAll('.day-card');
        if (currentDayIndex >= dayCards.length) {
            currentDayIndex = 0;
            console.log('當前索引超出範圍，重置為第一天');
        }
        
        // 顯示當前日期
        showDayByIndex(currentDayIndex);
        console.log('在翻頁模式下顯示第', currentDayIndex + 1, '天');
    } else {
        console.log('在列表模式下顯示所有天數');
    }
    
    // 更新地圖顯示，確保與當前視圖模式一致
    updateMap();
}

// 清除現有行程並開始新規劃
function startNewItinerary() {
    if (destinations.length > 0 || startingPoint !== null) {
        // 顯示確認對話框，避免意外清除
        if (!confirm('確定要開始規劃新行程嗎？現有的行程資料將被清除！')) {
            return;  // 用戶取消操作
        }
        
        // 清除當前行程數據
        startingPoint = null;
        destinations = [];
        departureDate = null;
        departureTime = "09:00";
        maxDailyHours = 8;
        dailySettings = [];
        dailyEndPoints = [];
        
        // 重置輸入欄位
        document.getElementById('starting-point').value = '';
        document.getElementById('new-destination').value = '';
        document.getElementById('departure-date').value = '';
        document.getElementById('departure-time').value = '09:00';
        document.getElementById('max-daily-hours').value = '8';
        
        // 禁用添加景點功能，直到設置新的出發點
        document.getElementById('new-destination').disabled = true;
        document.getElementById('add-destination').disabled = true;
        
        // 清除地圖
        clearMap();
        
        // 更新行程顯示
        updateItinerary();
        
        // 保存當前狀態到歷史記錄
        saveStateToHistory();
        
        console.log('已清除現有行程，可以開始新的規劃');
    } else {
        alert('目前沒有行程資料，可以直接開始規劃！');
    }
}