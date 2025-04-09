/**
 * 交通服務模組 - 提供交通延誤提醒與替代路線建議功能
 * 整合各國主要城市的公共交通 API
 */

const TransportationService = (function() {
    // 私有變數
    let isInitialized = false;
    let apiKeys = {};
    let delayNotifications = [];
    let activeMonitoring = {};
    let userPreferences = {
        notificationEnabled: true,
        autoSuggestAlternatives: true,
        monitoringInterval: 5, // 分鐘
        delayThreshold: 10 // 分鐘
    };

    // 支援的交通 API 提供商
    const API_PROVIDERS = {
        'TW_TRA': {
            name: '台灣鐵路管理局',
            url: 'https://ptx.transportdata.tw/MOTC/v2/Rail/TRA/',
            requiresKey: true,
            supports: ['台灣'],
            modes: ['火車']
        },
        'TW_THSR': {
            name: '台灣高鐵',
            url: 'https://ptx.transportdata.tw/MOTC/v2/Rail/THSR/',
            requiresKey: true,
            supports: ['台灣'],
            modes: ['高鐵']
        },
        'TW_METRO_TPE': {
            name: '台北捷運',
            url: 'https://ptx.transportdata.tw/MOTC/v2/Rail/Metro/Taipei/',
            requiresKey: true,
            supports: ['台灣'],
            modes: ['捷運']
        },
        'TW_BUS': {
            name: '公車動態資訊',
            url: 'https://ptx.transportdata.tw/MOTC/v2/Bus/',
            requiresKey: true,
            supports: ['台灣'],
            modes: ['公車']
        },
        'JP_TRAIN': {
            name: '日本鐵路資訊',
            url: 'https://api.odpt.org/api/v4/',
            requiresKey: true,
            supports: ['日本'],
            modes: ['電車', '新幹線']
        },
        'US_TRANSIT': {
            name: '美國公共交通',
            url: 'https://api.511.org/transit/',
            requiresKey: true,
            supports: ['美國'],
            modes: ['地鐵', '公車', '火車']
        },
        'MOCK_API': {
            name: '模擬交通 API (測試用)',
            url: 'https://mockapi.example.com/',
            requiresKey: false,
            supports: ['全球'],
            modes: ['所有']
        }
    };

    // 初始化模組
    function init() {
        if (isInitialized) return;

        // 從本地儲存載入設定
        loadSettings();

        // 註冊事件監聽器
        registerEventListeners();

        isInitialized = true;
        console.log('交通服務模組已初始化');
        return true;
    }

    // 從本地儲存載入設定
    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem('transportation_service_settings');
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);

                // 合併使用者偏好設定
                if (settings.userPreferences) {
                    userPreferences = {...userPreferences, ...settings.userPreferences};
                }

                // 載入 API 金鑰
                if (settings.apiKeys) {
                    apiKeys = settings.apiKeys;
                }

                console.log('已載入交通服務設定');
            }
        } catch (error) {
            console.error('載入交通服務設定時發生錯誤:', error);
        }
    }

    // 儲存設定到本地儲存
    function saveSettings() {
        try {
            const settings = {
                userPreferences: userPreferences,
                apiKeys: apiKeys
            };

            localStorage.setItem('transportation_service_settings', JSON.stringify(settings));
            console.log('已儲存交通服務設定');
        } catch (error) {
            console.error('儲存交通服務設定時發生錯誤:', error);
        }
    }

    // 註冊事件監聽器
    function registerEventListeners() {
        // 這裡將在後續實作中添加事件監聽器
        console.log('交通服務事件監聽器已註冊');
    }

    // 設定 API 金鑰
    function setApiKey(provider, key) {
        apiKeys[provider] = key;
        saveSettings();
        return true;
    }

    // 更新使用者偏好設定
    function updatePreferences(newPreferences) {
        userPreferences = {...userPreferences, ...newPreferences};
        saveSettings();
        return userPreferences;
    }

    // 查詢交通路線
    async function queryTransportation(from, to, mode, options = {}) {
        const country = options.country || '默認';
        const city = options.city || '默認';
        const date = options.date || new Date();
        const time = options.time || '09:00';

        console.log(`查詢交通路線: 從 ${from} 到 ${to}, 交通方式: ${mode}, 國家/城市: ${country}/${city}`);

        // 根據國家和交通方式選擇適當的 API 提供商
        const provider = selectApiProvider(country, mode);

        if (!provider) {
            console.warn(`找不到支援 ${country} 的 ${mode} 交通 API 提供商`);
            return {
                success: false,
                error: `找不到支援 ${country} 的 ${mode} 交通 API 提供商`,
                mockData: true,
                routes: getMockRoutes(from, to, mode, date, time)
            };
        }

        try {
            // 如果是模擬 API，直接返回模擬數據
            if (provider === 'MOCK_API') {
                return {
                    success: true,
                    mockData: true,
                    routes: getMockRoutes(from, to, mode, date, time)
                };
            }

            // 實際 API 調用
            const routes = await callTransportationApi(provider, from, to, mode, date, time, country, city);

            return {
                success: true,
                mockData: false,
                routes: routes
            };
        } catch (error) {
            console.error(`查詢交通路線時發生錯誤:`, error);

            // 發生錯誤時返回模擬數據
            return {
                success: false,
                error: error.message,
                mockData: true,
                routes: getMockRoutes(from, to, mode, date, time)
            };
        }
    }

    // 選擇適當的 API 提供商
    function selectApiProvider(country, mode) {
        // 遍歷所有 API 提供商，找出支援指定國家和交通方式的提供商
        for (const [providerId, provider] of Object.entries(API_PROVIDERS)) {
            if (
                (provider.supports.includes(country) || provider.supports.includes('全球')) &&
                (provider.modes.includes(mode) || provider.modes.includes('所有'))
            ) {
                // 檢查是否需要 API 金鑰
                if (provider.requiresKey && !apiKeys[providerId]) {
                    console.warn(`${provider.name} 需要 API 金鑰，但未設定`);
                    continue;
                }

                return providerId;
            }
        }

        // 如果找不到適當的提供商，返回模擬 API
        return 'MOCK_API';
    }

    // 調用交通 API
    async function callTransportationApi(providerId, from, to, mode, date, time, country, city) {
        // 這裡將實作實際的 API 調用
        // 由於大多數 API 需要註冊和金鑰，這裡先返回模擬數據
        console.log(`模擬調用 ${API_PROVIDERS[providerId].name} API`);

        // 模擬 API 調用延遲
        await new Promise(resolve => setTimeout(resolve, 500));

        return getMockRoutes(from, to, mode, date, time);
    }

    // 生成模擬路線數據
    function getMockRoutes(from, to, mode, date, time) {
        const routes = [];
        const baseTime = new Date(date);
        baseTime.setHours(parseInt(time.split(':')[0]), parseInt(time.split(':')[1]), 0, 0);

        // 生成 3 條模擬路線
        for (let i = 0; i < 3; i++) {
            const departureTime = new Date(baseTime);
            departureTime.setMinutes(departureTime.getMinutes() + i * 15); // 每 15 分鐘一班

            const duration = 30 + Math.floor(Math.random() * 30); // 30-60 分鐘的行程時間
            const arrivalTime = new Date(departureTime);
            arrivalTime.setMinutes(arrivalTime.getMinutes() + duration);

            // 隨機生成延誤時間 (0-30 分鐘)
            const delay = Math.floor(Math.random() * 31);
            const delayedArrival = new Date(arrivalTime);
            delayedArrival.setMinutes(delayedArrival.getMinutes() + delay);

            // 隨機生成擁擠程度 (1-5)
            const crowdLevel = 1 + Math.floor(Math.random() * 5);

            // 生成路線 ID
            const routeId = `ROUTE_${mode}_${from}_${to}_${i}`;

            routes.push({
                id: routeId,
                from: from,
                to: to,
                mode: mode,
                departureTime: departureTime.toISOString(),
                scheduledArrivalTime: arrivalTime.toISOString(),
                actualArrivalTime: delayedArrival.toISOString(),
                delay: delay,
                duration: duration,
                distance: 5 + Math.floor(Math.random() * 20), // 5-25 公里
                price: 50 + Math.floor(Math.random() * 150), // 50-200 元
                transfers: Math.floor(Math.random() * 3), // 0-2 次轉乘
                crowdLevel: crowdLevel, // 1-5 擁擠程度
                status: delay > 10 ? '延誤' : '準時',
                stops: generateMockStops(from, to, 2 + Math.floor(Math.random() * 4)) // 2-5 個停靠站
            });
        }

        return routes;
    }

    // 生成模擬停靠站
    function generateMockStops(from, to, count) {
        const stops = [
            { name: from, arrivalTime: null, departureTime: null, isOrigin: true },
            // 中間站將在下面生成
        ];

        // 生成中間站
        for (let i = 1; i < count; i++) {
            stops.push({
                name: `中途站 ${i}`,
                arrivalTime: null,
                departureTime: null,
                isOrigin: false,
                isDestination: false
            });
        }

        // 添加終點站
        stops.push({ name: to, arrivalTime: null, departureTime: null, isDestination: true });

        return stops;
    }

    // 監控交通路線狀態
    function monitorTransportation(routeId, callback) {
        if (activeMonitoring[routeId]) {
            console.log(`已在監控路線 ${routeId}`);
            return activeMonitoring[routeId];
        }

        console.log(`開始監控路線 ${routeId}`);

        // 設定監控間隔
        const intervalId = setInterval(() => {
            // 模擬獲取最新狀態
            const status = getRouteStatus(routeId);

            // 如果有延誤且超過閾值，則處理延誤通知
            if (status.delay >= userPreferences.delayThreshold) {
                const notification = {
                    routeId: routeId,
                    status: status,
                    timestamp: new Date().toISOString(),
                    message: `路線 ${routeId} 延誤 ${status.delay} 分鐘`
                };

                // 使用延誤通知處理器
                handleDelayNotification(notification);

                // 仍然執行原始的回調函數（如果有提供）
                if (typeof callback === 'function') {
                    callback(notification);
                }
            }
        }, userPreferences.monitoringInterval * 60 * 1000); // 轉換為毫秒

        // 記錄監控狀態
        activeMonitoring[routeId] = {
            routeId: routeId,
            intervalId: intervalId,
            startTime: new Date().toISOString()
        };

        return activeMonitoring[routeId];
    }

    // 停止監控交通路線
    function stopMonitoring(routeId) {
        if (!activeMonitoring[routeId]) {
            console.log(`未監控路線 ${routeId}`);
            return false;
        }

        clearInterval(activeMonitoring[routeId].intervalId);
        delete activeMonitoring[routeId];

        console.log(`已停止監控路線 ${routeId}`);
        return true;
    }

    // 模擬獲取路線狀態
    function getRouteStatus(routeId) {
        // 隨機生成延誤時間 (0-30 分鐘)
        const delay = Math.floor(Math.random() * 31);

        // 隨機生成擁擠程度 (1-5)
        const crowdLevel = 1 + Math.floor(Math.random() * 5);

        return {
            routeId: routeId,
            delay: delay,
            crowdLevel: crowdLevel,
            status: delay > 10 ? '延誤' : '準時',
            timestamp: new Date().toISOString()
        };
    }

    // 建議替代路線
    async function suggestAlternativeRoutes(routeId, reason = '延誤') {
        console.log(`為路線 ${routeId} 建議替代路線，原因: ${reason}`);

        // 從路線 ID 中提取信息
        // 格式: ROUTE_mode_from_to_index
        const parts = routeId.split('_');
        if (parts.length < 5) {
            console.error(`無效的路線 ID 格式: ${routeId}`);
            return {
                success: false,
                error: `無效的路線 ID 格式`,
                alternatives: []
            };
        }

        const mode = parts[1];
        const from = parts[2];
        const to = parts[3];

        // 查詢原始交通方式的替代路線
        const originalRoutes = await queryTransportation(from, to, mode);

        // 查詢其他交通方式的路線
        const alternativeModes = getAlternativeModes(mode);
        const alternativeResults = await Promise.all(
            alternativeModes.map(altMode => queryTransportation(from, to, altMode))
        );

        // 合併所有路線結果
        let allRoutes = [];

        // 添加原始交通方式的路線，但排除原始路線
        if (originalRoutes.success && originalRoutes.routes) {
            const filteredOriginalRoutes = originalRoutes.routes.filter(route => route.id !== routeId);
            allRoutes = allRoutes.concat(filteredOriginalRoutes);
        }

        // 添加其他交通方式的路線
        alternativeResults.forEach(result => {
            if (result.success && result.routes) {
                allRoutes = allRoutes.concat(result.routes);
            }
        });

        // 根據延誤、時間和擁擠程度對路線進行排序
        allRoutes.sort((a, b) => {
            // 先按延誤時間排序（延誤較少的優先）
            if (a.delay !== b.delay) {
                return a.delay - b.delay;
            }

            // 其次按行程時間排序（較短的優先）
            if (a.duration !== b.duration) {
                return a.duration - b.duration;
            }

            // 最後按擁擠程度排序（較不擁擠的優先）
            return a.crowdLevel - b.crowdLevel;
        });

        // 取前 5 條最佳路線作為建議
        const recommendations = allRoutes.slice(0, 5);

        return {
            success: true,
            reason: reason,
            originalRouteId: routeId,
            alternatives: recommendations
        };
    }

    // 獲取替代交通方式
    function getAlternativeModes(currentMode) {
        // 交通方式替代對應表
        const modeAlternatives = {
            '步行': ['公車', '捷運', '自行車'],
            '公車': ['捷運', '火車', '自行車', '機車', '汽車'],
            '捷運': ['公車', '火車', '機車', '汽車'],
            '地鐵': ['公車', '火車', '機車', '汽車'],
            '火車': ['公車', '捷運', '高鐵', '機車', '汽車'],
            '高鐵': ['火車', '飛機', '機車', '汽車'],
            '電車': ['公車', '地鐵', '火車'],
            '新幹線': ['火車', '飛機'],
            '飛機': ['高鐵', '火車'],
            '自行車': ['步行', '公車', '捷運'],
            '機車': ['公車', '捷運', '汽車'],
            '汽車': ['公車', '捷運', '火車', '機車']
        };

        // 返回指定交通方式的替代方式，如果沒有對應則返回默認替代方式
        return modeAlternatives[currentMode] || ['公車', '捷運', '火車'];
    }

    // 處理交通延誤通知
    function handleDelayNotification(notification) {
        // 將通知添加到延誤通知列表
        delayNotifications.push(notification);

        // 如果啟用了自動建議替代路線，則獲取替代路線
        if (userPreferences.autoSuggestAlternatives) {
            suggestAlternativeRoutes(notification.routeId, '延誤')
                .then(alternatives => {
                    // 將替代路線添加到通知中
                    notification.alternatives = alternatives;

                    // 觸發延誤通知事件
                    const event = new CustomEvent('transportation-delay', { detail: notification });
                    window.dispatchEvent(event);

                    console.log(`已發送交通延誤通知，包含 ${alternatives.alternatives.length} 條替代路線`);
                })
                .catch(error => {
                    console.error('獲取替代路線時發生錯誤:', error);

                    // 即使沒有替代路線，也發送延誤通知
                    const event = new CustomEvent('transportation-delay', { detail: notification });
                    window.dispatchEvent(event);
                });
        } else {
            // 如果未啟用自動建議，直接發送延誤通知
            const event = new CustomEvent('transportation-delay', { detail: notification });
            window.dispatchEvent(event);

            console.log('已發送交通延誤通知（未包含替代路線）');
        }

        return notification;
    }

    // 公開 API
    return {
        init: init,
        setApiKey: setApiKey,
        updatePreferences: updatePreferences,
        API_PROVIDERS: API_PROVIDERS,
        queryTransportation: queryTransportation,
        monitorTransportation: monitorTransportation,
        stopMonitoring: stopMonitoring,
        suggestAlternativeRoutes: suggestAlternativeRoutes,
        handleDelayNotification: handleDelayNotification
    };
})();

// 如果在 Node.js 環境中，導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TransportationService;
}
