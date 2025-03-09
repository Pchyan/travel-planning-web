// 全局变量
let startingPoint = null;
let destinations = [];
let map = null;
let markers = [];
let polyline = null;

// 本地儲存的鍵名
const STORAGE_KEY = 'travel_planner_data';

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
        let savedItineraries = JSON.parse(localStorage.getItem('saved_itineraries') || '{}');
        
        // 獲取最後一次使用的行程名稱
        let lastItineraryName = localStorage.getItem('last_itinerary_name') || '我的行程';
        
        // 彈出對話框讓用戶輸入行程名稱，預設使用最後一次的名稱
        const itineraryName = prompt('請輸入行程名稱：', lastItineraryName);
        
        if (!itineraryName) {
            alert('請輸入有效的行程名稱！');
            return;
        }
        
        // 儲存當前行程
        savedItineraries[itineraryName] = {
            startingPoint: startingPoint,
            destinations: destinations,
            savedAt: new Date().toISOString()
        };
        
        // 更新本地儲存
        localStorage.setItem('saved_itineraries', JSON.stringify(savedItineraries));
        
        // 儲存最後使用的行程名稱
        localStorage.setItem('last_itinerary_name', itineraryName);
        
        // 同時更新當前行程
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            startingPoint: startingPoint,
            destinations: destinations
        }));
        
        console.log(`行程「${itineraryName}」已儲存到本地`);
        
        // 顯示儲存成功提示
        alert(`行程「${itineraryName}」已成功儲存！`);
    });
    
    // 讀取行程按鈕
    document.getElementById('load-itinerary').addEventListener('click', function() {
        const success = loadItinerary();
    });
    
    // 管理行程按鈕
    document.getElementById('manage-itinerary').addEventListener('click', function() {
        window.location.href = 'manage-itineraries.html';
    
        if (!success) {
            alert('沒有找到已儲存的行程！');
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
}

// 添加景点
async function addDestination(location) {
    if (!startingPoint) {
        alert('請先設置出發點！');
        return;
    }
    
    try {
        const coordinates = await geocodeLocation(location);
        
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
        
        // 优化行程顺序
        optimizeItinerary();
        
        // 更新地图
        updateMap();
        
        // 更新行程
        updateItinerary();
        
        console.log(`新增景點: ${location}，停留時間: ${stayDuration} 小時`);
    } catch (error) {
        alert(`無法找到位置: ${location}。請嘗試更具體的地址。`);
        console.error('Geocoding error:', error);
    }
}

// 删除景点
function removeDestination(index) {
    destinations.splice(index, 1);
    
    // 优化行程顺序
    optimizeItinerary();
    
    // 更新地图
    updateMap();
    
    // 更新行程
    updateItinerary();
    
    console.log(`已刪除景點 #${index + 1}`);
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
        optimizedDestinations.push(remainingDestinations[nearestIndex]);
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
    
    // 添加發出點作為第一天起點
    currentDay.push({
        ...startingPoint,
        isStartingPoint: true,
        transportationFromPrevious: null
    });
    
    // 遍歷所有目的地
    for (let i = 0; i < destinations.length; i++) {
        const destination = destinations[i];
        const previousPoint = currentDay[currentDay.length - 1];
        
        // 計算交通時間
        const transportation = determineTransportation(
            previousPoint.coordinates,
            destination.coordinates
        );
        
        // 計算當前景點總時長（交通時間 + 停留時間）
        const totalTime = transportation.time + destination.stayDuration;
        
        // 檢查是否超過每天最大行程時間
        if (currentDayDuration + totalTime > MAX_DAILY_HOURS) {
            // 如果超過，保存當前景點作為下一天的起點
            lastDayLastDestination = previousPoint;
            
            // 創建新的一天
            days.push(currentDay);
            
            // 新的一天從前一天最後一個景點開始，而不是出發點
            currentDay = [];
            
            // 如果有前一天的最後景點，則將其作為新一天的第一個點
            if (lastDayLastDestination) {
                // 將前一天最後的景點複製到新的一天作為起點
                currentDay.push({
                    ...lastDayLastDestination,
                    isStartingPoint: false,
                    transportationFromPrevious: null
                });
            } else {
                // 如果沒有前一天的景點（理論上不應該發生），使用出發點
                currentDay.push({
                    ...startingPoint,
                    isStartingPoint: true,
                    transportationFromPrevious: null
                });
            }
            
            // 重置當天行程時間，但不計算第一個點的停留時間（因為已經在前一天計算過）
            currentDayDuration = 0;
            
            // 重新計算交通時間，因為起點變了
            const newTransportation = determineTransportation(
                currentDay[0].coordinates,
                destination.coordinates
            );
            
            // 添加目的地到當前天，使用新計算的交通方式
            currentDay.push({
                ...destination,
                isStartingPoint: false,
                transportationFromPrevious: newTransportation
            });
            
            // 更新當天行程時間
            currentDayDuration += newTransportation.time + destination.stayDuration;
        } else {
            // 添加目的地到當前天
            currentDay.push({
                ...destination,
                isStartingPoint: false,
                transportationFromPrevious: transportation
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

// 儲存行程到本地儲存
function saveItinerary() {
    if (!startingPoint) {
        return; // 沒有出發點，不需要儲存
    }
    
    // 彈出對話框讓用戶輸入行程名稱
    const itineraryName = prompt('請輸入行程名稱：', '我的行程');
    
    if (!itineraryName) {
        alert('請輸入有效的行程名稱！');
        return;
    }
    
    // 獲取已儲存的所有行程
    let savedItineraries = JSON.parse(localStorage.getItem('saved_itineraries') || '{}');
    
    // 儲存當前行程
    savedItineraries[itineraryName] = {
        startingPoint: startingPoint,
        destinations: destinations,
        savedAt: new Date().toISOString()
    };
    
    // 更新本地儲存
    localStorage.setItem('saved_itineraries', JSON.stringify(savedItineraries));
    
    // 同時更新當前行程
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
        startingPoint: startingPoint,
        destinations: destinations
    }));
    
    console.log(`行程「${itineraryName}」已儲存到本地`);
    
    // 顯示儲存成功提示
    alert(`行程「${itineraryName}」已成功儲存！`);
}

// 從本地儲存讀取行程
function loadItinerary() {
    // 檢查是否有從管理頁面選擇的行程
    const selectedItineraryName = sessionStorage.getItem('selected_itinerary');
    if (selectedItineraryName) {
        // 清除選擇，避免重複載入
        sessionStorage.removeItem('selected_itinerary');
        
        // 獲取已儲存的所有行程
        const savedItineraries = JSON.parse(localStorage.getItem('saved_itineraries') || '{}');
        
        // 檢查選擇的行程是否存在
        if (savedItineraries[selectedItineraryName]) {
            try {
                // 恢復出發點和目的地
                startingPoint = savedItineraries[selectedItineraryName].startingPoint;
                destinations = savedItineraries[selectedItineraryName].destinations;
                
                // 更新地圖和行程
                updateMap();
                updateItinerary();
                
                // 啟用添加景點功能
                document.getElementById('new-destination').disabled = false;
                document.getElementById('add-destination').disabled = false;
                
                // 更新出發點輸入框
                if (startingPoint) {
                    document.getElementById('starting-point').value = startingPoint.name;
                }
                
                console.log(`已載入行程「${selectedItineraryName}」`);
                alert(`已成功載入行程「${selectedItineraryName}」！`);
                return true;
            } catch (error) {
                console.error('讀取儲存的行程時出錯:', error);
                return false;
            }
        }
    }
    
    // 如果沒有從管理頁面選擇的行程，則顯示選擇對話框
    // 獲取已儲存的所有行程
    const savedItineraries = JSON.parse(localStorage.getItem('saved_itineraries') || '{}');
    
    // 檢查是否有已儲存的行程
    const itineraryNames = Object.keys(savedItineraries);
    
    if (itineraryNames.length === 0) {
        // 嘗試讀取舊版本的單一行程
        const savedData = localStorage.getItem(STORAGE_KEY);
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                
                // 恢復出發點和目的地
                startingPoint = data.startingPoint;
                destinations = data.destinations;
                
                // 更新地圖和行程
                updateMap();
                updateItinerary();
                
                // 啟用添加景點功能
                document.getElementById('new-destination').disabled = false;
                document.getElementById('add-destination').disabled = false;
                
                // 更新出發點輸入框
                if (startingPoint) {
                    document.getElementById('starting-point').value = startingPoint.name;
                }
                
                console.log('已從本地儲存讀取行程');
                return true;
            } catch (error) {
                console.error('讀取儲存的行程時出錯:', error);
                return false;
            }
        }
        
        return false;
    }
    
    // 創建行程選擇列表
    let itineraryList = '請選擇要載入的行程：\n';
    
    itineraryNames.forEach((name, index) => {
        const savedDate = new Date(savedItineraries[name].savedAt);
        const formattedDate = savedDate.toLocaleString('zh-TW');
        itineraryList += `${index + 1}. ${name} (儲存於 ${formattedDate})\n`;
    });
    
    // 顯示行程選擇對話框
    const selectedIndex = prompt(itineraryList, '1');
    
    if (selectedIndex === null) {
        return false; // 用戶取消選擇
    }
    
    const index = parseInt(selectedIndex) - 1;
    
    if (isNaN(index) || index < 0 || index >= itineraryNames.length) {
        alert('請輸入有效的行程編號！');
        return false;
    }
    
    const selectedName = itineraryNames[index];
    const selectedItinerary = savedItineraries[selectedName];
    
    try {
        // 恢復出發點和目的地
        startingPoint = selectedItinerary.startingPoint;
        destinations = selectedItinerary.destinations;
        
        // 更新地圖和行程
        updateMap();
        updateItinerary();
        
        // 啟用添加景點功能
        document.getElementById('new-destination').disabled = false;
        document.getElementById('add-destination').disabled = false;
        
        // 更新出發點輸入框
        if (startingPoint) {
            document.getElementById('starting-point').value = startingPoint.name;
        }
        
        console.log(`已載入行程「${selectedName}」`);
        alert(`已成功載入行程「${selectedName}」！`);
        return true;
    } catch (error) {
        console.error('讀取儲存的行程時出錯:', error);
        return false;
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
        
        // 创建天数标题
        const dayTitle = document.createElement('div');
        dayTitle.className = 'day-title';
        dayTitle.innerHTML = `<span>第 ${dayIndex + 1} 天</span><button class="optimize-day-button" onclick="optimizeDayItinerary(${dayIndex})">建議行程順序</button>`;
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
                destinationItem.draggable = true;
                
                // 添加停留時間編輯功能
                const destinationIndex = destinations.findIndex(d => d.name === point.name);
                destinationItem.innerHTML = `
                    <div class="destination-info">
                        <div class="destination-name">${point.name}</div>
                        <div class="destination-details">
                            建議停留時間: ${point.stayDuration} 小時
                            <span class="stay-duration-edit" onclick="editStayDuration(${destinationIndex})">✏️ 編輯</span>
                        </div>
                    </div>
                    <div class="destination-actions">
                        <button onclick="removeDestination(${destinationIndex})">刪除</button>
                    </div>
                `;
                dayCard.appendChild(destinationItem);
                
                // 添加拖曳事件監聽器
                destinationItem.addEventListener('dragstart', handleDragStart);
                destinationItem.addEventListener('dragend', handleDragEnd);
                destinationItem.addEventListener('dragover', handleDragOver);
                destinationItem.addEventListener('dragenter', handleDragEnter);
                destinationItem.addEventListener('dragleave', handleDragLeave);
                destinationItem.addEventListener('drop', handleDrop);
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
                
                // 優化行程順序
                optimizeItinerary();
                
                // 更新地圖和行程
                updateMap();
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
        
        // 優化行程順序
        optimizeItinerary();
        
        // 更新地圖和行程
        updateMap();
        updateItinerary();
        
        console.log(`新增景點: ${locationName}，停留時間: ${stayDuration} 小時`);
    }
    
    // 清空經緯度輸入框
    document.getElementById('latitude').value = '';
    document.getElementById('longitude').value = '';
    document.getElementById('coordinates-name').value = '';
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
    
    // 嘗試讀取已儲存的行程
    loadItinerary();
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

// 拖曳事件處理函數
function handleDragStart(e) {
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
    this.classList.add('drag-over');
}

function handleDragLeave(e) {
    this.classList.remove('drag-over');
}

function handleDrop(e) {
    if (e.stopPropagation) {
        e.stopPropagation();
    }
    
    if (draggedItem !== this) {
        // 獲取拖曳項目和目標項目的索引
        const draggedIndex = parseInt(draggedItem.dataset.destinationIndex);
        const targetIndex = parseInt(this.dataset.destinationIndex);
        
        if (!isNaN(draggedIndex) && !isNaN(targetIndex)) {
            // 交換目的地順序
            const temp = destinations[draggedIndex];
            destinations[draggedIndex] = destinations[targetIndex];
            destinations[targetIndex] = temp;
            
            // 更新地圖和行程
            updateMap();
            updateItinerary();
        }
    }
    
    this.classList.remove('drag-over');
    return false;
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
}

// 優化單天行程順序功能
function optimizeDayItinerary(dayIndex) {
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
    
    // 獲取當天的所有景點（排除起點）
    const dayDestinations = day.slice(1);
    
    // 找出這些景點在全局destinations中的索引
    const dayDestinationIndices = dayDestinations.map(point => 
        destinations.findIndex(d => d.name === point.name)
    ).filter(index => index !== -1);
    
    if (dayDestinationIndices.length <= 1) {
        alert('此天可優化的景點數量太少！');
        return;
    }
    
    // 使用最近鄰算法優化當天行程順序
    const optimizedIndices = [dayDestinationIndices[0]];
    const remainingIndices = [...dayDestinationIndices.slice(1)];
    
    // 從起點開始計算
    let lastCoordinates = startPoint.coordinates;
    
    while (remainingIndices.length > 0) {
        let nearestIndex = 0;
        let minDistance = calculateDistance(lastCoordinates, destinations[remainingIndices[0]].coordinates);
        
        // 找到最近的下一個景點
        for (let i = 1; i < remainingIndices.length; i++) {
            const distance = calculateDistance(lastCoordinates, destinations[remainingIndices[i]].coordinates);
            if (distance < minDistance) {
                minDistance = distance;
                nearestIndex = i;
            }
        }
        
        // 添加到優化後的行程中
        const nextDestinationIndex = remainingIndices[nearestIndex];
        optimizedIndices.push(nextDestinationIndex);
        lastCoordinates = destinations[nextDestinationIndex].coordinates;
        remainingIndices.splice(nearestIndex, 1);
    }
    
    // 重新排序全局destinations中的相關景點
    const newDestinations = [...destinations];
    
    // 將優化後的順序應用到全局destinations
    for (let i = 0; i < dayDestinationIndices.length; i++) {
        const oldIndex = dayDestinationIndices[i];
        const newIndex = optimizedIndices[i];
        newDestinations[oldIndex] = destinations[newIndex];
    }
    
    destinations = newDestinations;
    
    // 更新地圖和行程
    updateMap();
    updateItinerary();
    
    alert(`已優化第 ${dayIndex + 1} 天的行程順序！`);
}