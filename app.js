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
        alert(`無法找到位置: ${location}。請嘗試更具體的地址。`);
        console.error('Geocoding error:', error);
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
    const checkDayEndPoint = (dayIndex, destination) => {
        const dayEndPoint = dailyEndPoints.find(ep => ep.dayIndex === dayIndex);
        
        if (!dayEndPoint) return false;
        
        // 精確比較名稱和座標，避免誤判
        return (
            destination.name === dayEndPoint.endPoint.name && 
            Math.abs(destination.coordinates[0] - dayEndPoint.endPoint.coordinates[0]) < 0.0000001 && 
            Math.abs(destination.coordinates[1] - dayEndPoint.endPoint.coordinates[1]) < 0.0000001
        );
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
        const isEndPoint = checkDayEndPoint(currentDayIndex, destination);
        
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
    
    // 添加目的地标记
    destinations.forEach((destination, index) => {
        addMarker(destination.coordinates, `${index + 1}. ${destination.name}`, 'red');
    });
    
    // 绘制路线
    drawRoute();
    
    // 调整地图视图以包含所有标记
    fitMapToMarkers();
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
    const savedItineraries = JSON.parse(localStorage.getItem(SAVED_ITINERARIES_KEY) || '{}');
    const itineraryNames = Object.keys(savedItineraries);
    
    if (itineraryNames.length === 0) {
        alert('沒有保存的行程');
        return;
    }
    
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
                const savedDate = new Date(item.savedAt).toLocaleString('zh-TW');
                return `
                <li style="margin-bottom: 10px; padding: 10px; border: 1px solid #ddd; border-radius: 5px;">
                    <strong>${name}</strong>
                    <div>建立日期: ${savedDate}</div>
                    <div>出發點: ${item.startingPoint.name}</div>
                    <div>景點數: ${item.destinations.length}</div>
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
            const name = btn.dataset.name;
            const selectedItinerary = savedItineraries[name];
            
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
            
            updateItinerary();
            updateMap();
            
            document.body.removeChild(selectDialog);
            alert(`已讀取行程: ${name}`);
            
            // 讀取位置緩存
            if (selectedItinerary.locationCache) {
                locationCache = selectedItinerary.locationCache;
                // 更新本地儲存的位置緩存
                localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationCache));
                console.log('已讀取位置緩存:', Object.keys(locationCache).length, '個地點');
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
    const daysContainer = document.querySelector('.days-container');
    daysContainer.innerHTML = '';
    
    if (!startingPoint) {
        daysContainer.innerHTML = '<p>請先設置出發點</p>';
        return;
    }
    
    if (destinations.length === 0) {
        daysContainer.innerHTML = '<p>請添加景點</p>';
        return;
    }
    
    // 分配行程到多天
    const days = distributeItineraryToDays();
    
    // 创建每天的行程卡片
    days.forEach((day, dayIndex) => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.dataset.dayIndex = dayIndex;
        
        // 獲取當天的設定
        const daySetting = dailySettings.find(setting => setting.dayIndex === dayIndex);
        const departureTimeValue = daySetting ? daySetting.departureTime : departureTime;
        const maxHoursValue = daySetting ? daySetting.maxHours : maxDailyHours;
        
        // 创建天数标题和设置
        const dayTitle = document.createElement('div');
        dayTitle.className = 'day-title';
        dayTitle.innerHTML = `
            <span>第 ${dayIndex + 1} 天</span>
            <div class="day-settings">
                <span>出發時間: ${departureTimeValue}</span>
                <span>行程時間: ${maxHoursValue} 小時</span>
                <button class="day-settings-button" onclick="editDaySettings(${dayIndex})">設定</button>
            </div>
            <button class="optimize-day-button" onclick="optimizeDayItinerary(${dayIndex})">建議行程順序</button>
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
                        <div class="destination-name">出發點: ${point.name}</div>
                        <div class="destination-details">
                            <div>出發時間: ${point.arrivalTime}</div>
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
                            fromCity = day[pointIndex - 1].city || '默認';
                        }
                        
                        if (point.country) {
                            toCountry = point.country;
                            toCity = point.city || '默認';
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
                    
                    transportationItem.innerHTML = `
                        <div class="transportation-icon">${transportIcon}</div>
                        <div>
                            <div>交通方式: ${point.transportationFromPrevious.mode}</div>
                            <div>預計時間: ${Math.round(point.transportationFromPrevious.time * 60)} 分鐘</div>
                        </div>
                        <div class="transportation-actions">
                            <button onclick="openScheduleQuery('${point.transportationFromPrevious.mode}', '${fromLocation}', '${toLocation}')" title="查詢交通路線">🔍 交通查詢</button>
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
}

// 處理地圖點選事件
function handleMapClick(latlng) {
    // 顯示確認對話框
    const isConfirmed = confirm(`您選擇了經緯度：${latlng.lat.toFixed(6)}, ${latlng.lng.toFixed(6)}\n是否要將此位置添加為景點？`);
    
    if (isConfirmed) {
        // 彈出輸入框讓用戶輸入位置名稱
        const locationName = prompt('請輸入此位置的名稱：', '自定義位置');
        
        if (locationName) {
            // 根據經緯度識別當前位置的國家和城市
            const location = identifyLocation(latlng.lat, latlng.lng);
            currentCountry = location.country;
            currentCity = location.city;
            
            console.log(`識別位置為: ${currentCountry} - ${currentCity}`);
            
            // 根據當前狀態決定是設置為出發點還是添加為景點
            if (!startingPoint) {
                // 如果還沒有出發點，則設置為出發點
                startingPoint = {
                    name: locationName,
                    coordinates: [latlng.lat, latlng.lng],
                    stayDuration: 0, // 出發點不計入停留時間
                    country: currentCountry,
                    city: currentCity
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
                    coordinates: [latlng.lat, latlng.lng],
                    stayDuration: stayDuration,
                    country: currentCountry,
                    city: currentCity
                });
                
                // 更新地图
                updateMap();
                
                // 更新行程
                updateItinerary();
                
                console.log(`新增景點: ${locationName}，停留時間: ${stayDuration} 小時 (${currentCountry} - ${currentCity})`);
            }
        }
    }
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
});

// 根據交通方式和起訖點打開交通查詢網站
function openScheduleQuery(transportMode, fromLocation, toLocation) {
    // 確保起訖點不為空
    if (!fromLocation || !toLocation) {
        alert('無法獲取完整的起訖點信息，無法查詢交通路線');
        return;
    }
    
    console.log(`查詢交通: ${transportMode}，從 ${fromLocation} 到 ${toLocation}，當前位置: ${currentCountry}/${currentCity}`);
    
    // 直接使用Google Maps進行路線規劃
    let travelMode = 'transit'; // 預設使用大眾運輸
    
    // 根據交通方式選擇適當的Google Maps旅行模式
    switch(transportMode) {
        case '步行':
            travelMode = 'walking';
            break;
        case '自行車':
            travelMode = 'bicycling';
            break;
        case '汽車':
        case '機車':
            travelMode = 'driving';
            break;
        case '公車':
        case '捷運':
        case '地鐵':
        case '火車':
        case '高鐵':
        case '電車':
        case '新幹線':
        default:
            travelMode = 'transit';
            break;
    }
    
    // 構建Google Maps URL
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(fromLocation)}&destination=${encodeURIComponent(toLocation)}&travelmode=${travelMode}`;
    
    // 打開查詢網站
    window.open(googleMapsUrl, '_blank');
    
    console.log(`使用Google Maps查詢從 ${fromLocation} 到 ${toLocation} 的交通路線，交通方式: ${travelMode}`);
    console.log(`打開URL: ${googleMapsUrl}`);
}
// 拖曳相關變數
let draggedItem = null;
let touchDraggedItem = null;
let touchStartX = 0;
let touchStartY = 0;
let isTouchMoving = false;

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
    
    // 保留當天的起點（可能是出發點或前一天的最後一個景點）
    const startPoint = day[0];
    
    // 檢查當前天是否有設定結束地點
    const dayEndPoint = dailyEndPoints.find(ep => ep.dayIndex === dayIndex);
    
    // 獲取當天的所有景點（排除起點）
    const dayDestinations = day.slice(1);
    
    if (dayDestinations.length <= 1) {
        alert('此天可優化的景點數量太少！');
        return;
    }
    
    // 檢查最後一個景點是否是結束地點
    let endPoint = null;
    let lastDestinationIndex = -1;
    
    if (dayEndPoint) {
        // 尋找結束地點在當天景點中的位置
        lastDestinationIndex = dayDestinations.findIndex(d => 
            d.name === dayEndPoint.endPoint.name && 
            d.coordinates[0] === dayEndPoint.endPoint.coordinates[0] && 
            d.coordinates[1] === dayEndPoint.endPoint.coordinates[1]
        );
        
        if (lastDestinationIndex !== -1) {
            endPoint = dayDestinations[lastDestinationIndex];
            // 從待優化列表中移除結束地點
            dayDestinations.splice(lastDestinationIndex, 1);
        }
    }
    
    console.log(`開始優化第 ${dayIndex + 1} 天的行程，包含 ${dayDestinations.length} 個景點，${endPoint ? '有設定結束地點' : '沒有結束地點'}`);
    
    if (dayDestinations.length <= 1 && endPoint) {
        alert('此天除起點和終點外，只有一個或沒有景點，無需優化！');
        return;
    }
    
    // 查找目前全局destinations中當天所有景點的位置（除了起點和終點）
    let allDayDestinationIndices = [];
    let firstDayDestinationIndex = -1; // 記錄第一個景點的索引，作為插入位置參考
    
    for (const destination of dayDestinations) {
        const index = destinations.findIndex(d => 
            d.name === destination.name && 
            d.coordinates[0] === destination.coordinates[0] && 
            d.coordinates[1] === destination.coordinates[1]
        );
        
        if (index !== -1) {
            if (firstDayDestinationIndex === -1) {
                firstDayDestinationIndex = index;
            }
            allDayDestinationIndices.push(index);
        }
    }
    
    // 確認是否所有景點都找到了
    if (allDayDestinationIndices.length !== dayDestinations.length) {
        console.error('無法找到所有當天景點在全局destinations中的位置');
        alert('優化失敗：無法匹配所有景點');
        return;
    }
    
    // 將當天景點（除了起點和終點）保存下來
    const dayDestinationsCopy = allDayDestinationIndices.map(index => ({...destinations[index]}));
    
    // 使用最近鄰算法優化景點順序
    const optimizedDestinations = [];
    const destinationsToOptimize = [...dayDestinationsCopy];
    
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
        
        // 添加到優化後的行程中
        const nextDestination = destinationsToOptimize[nearestIndex];
        optimizedDestinations.push(nextDestination);
        lastCoordinates = nextDestination.coordinates;
        destinationsToOptimize.splice(nearestIndex, 1);
    }
    
    // 如果有結束地點，加回到優化後的列表
    if (endPoint) {
        optimizedDestinations.push(endPoint);
    }
    
    console.log('優化後的景點順序:', optimizedDestinations.map(d => d.name));
    
    // 從全局destinations中移除當天的所有景點
    // 注意：我們需要從後往前刪除，避免索引變化
    allDayDestinationIndices.sort((a, b) => b - a);
    for (const index of allDayDestinationIndices) {
        destinations.splice(index, 1);
    }
    
    // 在第一個景點的位置插入優化後的景點
    destinations.splice(firstDayDestinationIndex, 0, ...optimizedDestinations);
    
    // 更新地圖和行程
    updateMap();
    updateItinerary();
    
    alert(`已優化第 ${dayIndex + 1} 天的行程順序！`);
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
        padding: 20px;
        border-radius: 5px;
        width: 400px;
        max-width: 90%;
    `;
    
    dialogContent.innerHTML = `
        <h3>第 ${dayIndex + 1} 天設定</h3>
        <div class="settings-form">
            <div class="settings-row">
                <label for="day-departure-time">出發時間:</label>
                <input type="time" id="day-departure-time" value="${currentDepartureTime}">
            </div>
            <div class="settings-row">
                <label for="day-max-hours">行程時間:</label>
                <input type="number" id="day-max-hours" min="1" max="24" step="0.5" value="${currentMaxHours}">
                <span>小時</span>
            </div>
            <div class="settings-row">
                <label for="day-end-point">結束地點:</label>
                <input type="text" id="day-end-point" placeholder="請輸入結束地點" value="${currentEndPoint}">
                <button id="use-saved-location">使用已儲存位置</button>
                ${currentEndPoint ? `<button id="remove-end-point">移除</button>` : ''}
            </div>
            <div class="settings-actions">
                <button id="save-day-settings">儲存</button>
                <button id="cancel-day-settings">取消</button>
                <button id="reset-day-settings">重置為默認</button>
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
            background-color: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1001;
        `;
        
        const locationContent = document.createElement('div');
        locationContent.style.cssText = `
            background: white;
            padding: 20px;
            border-radius: 5px;
            width: 400px;
            max-width: 90%;
            max-height: 70vh;
            overflow-y: auto;
        `;
        
        // 建立位置列表
        const locationList = Object.entries(locationCache).map(([name, coords]) => {
            return `
            <div style="padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;" 
                 class="location-item" data-name="${name}" data-lat="${coords[0]}" data-lng="${coords[1]}">
                <strong>${name}</strong>
                <div>經緯度: [${coords[0]}, ${coords[1]}]</div>
            </div>
            `;
        }).join('');
        
        locationContent.innerHTML = `
            <h3>選擇已儲存的位置</h3>
            <div style="margin-bottom: 15px;">
                ${locationList}
            </div>
            <div style="text-align: right;">
                <button id="cancel-location-select">取消</button>
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
    // 獲取已儲存的所有行程
    const savedItineraries = JSON.parse(localStorage.getItem(SAVED_ITINERARIES_KEY) || '{}');
    
    // 檢查行程是否存在
    if (!savedItineraries[name]) {
        alert(`找不到行程: ${name}`);
        return;
    }
    
    const selectedItinerary = savedItineraries[name];
    
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
    
    updateItinerary();
    updateMap();
    
    alert(`已讀取行程: ${name}`);
    
    // 讀取位置緩存
    if (selectedItinerary.locationCache) {
        locationCache = selectedItinerary.locationCache;
        // 更新本地儲存的位置緩存
        localStorage.setItem(LOCATION_CACHE_KEY, JSON.stringify(locationCache));
        console.log('已讀取位置緩存:', Object.keys(locationCache).length, '個地點');
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