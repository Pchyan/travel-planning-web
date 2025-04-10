/**
 * Firebase 測試工具
 * 用於測試 Firebase 連接和即時同步功能
 */

// 當文檔載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 創建測試按鈕
    createFirebaseTestButton();
});

// 創建 Firebase 測試按鈕
function createFirebaseTestButton() {
    // 檢查是否已有測試按鈕區域
    let testButtonsContainer = document.querySelector('.test-buttons');

    // 如果沒有測試按鈕區域，創建一個
    if (!testButtonsContainer) {
        testButtonsContainer = document.createElement('div');
        testButtonsContainer.className = 'test-buttons';
        document.body.appendChild(testButtonsContainer);
    }

    // 創建 Firebase 測試按鈕
    const testButton = document.createElement('button');
    testButton.id = 'test-firebase-connection';
    testButton.className = 'test-button';
    testButton.style.backgroundColor = '#4a89dc';
    testButton.innerHTML = '<i class="fas fa-sync-alt"></i> 測試 Firebase 連接';

    // 創建即時同步測試按鈕
    const realtimeTestButton = document.createElement('button');
    realtimeTestButton.id = 'test-realtime-share';
    realtimeTestButton.className = 'test-button';
    realtimeTestButton.style.backgroundColor = '#28a745';
    realtimeTestButton.innerHTML = '<i class="fas fa-share-alt"></i> 測試即時同步';
    realtimeTestButton.style.marginLeft = '10px';

    // 創建測試載入分享行程按鈕
    const testLoadShareButton = document.createElement('button');
    testLoadShareButton.id = 'test-load-share';
    testLoadShareButton.className = 'test-button';
    testLoadShareButton.style.backgroundColor = '#fd7e14';
    testLoadShareButton.innerHTML = '<i class="fas fa-download"></i> 測試載入分享行程';
    testLoadShareButton.style.marginLeft = '10px';

    // 添加按鈕到測試區域
    testButtonsContainer.appendChild(testButton);
    testButtonsContainer.appendChild(realtimeTestButton);
    testButtonsContainer.appendChild(testLoadShareButton);

    // 添加點擊事件
    testButton.addEventListener('click', testFirebaseConnection);
    realtimeTestButton.addEventListener('click', testRealtimeShare);
    testLoadShareButton.addEventListener('click', testLoadSharedItinerary);
}

// 測試 Firebase 連接
function testFirebaseConnection() {
    if (typeof FirebaseService === 'undefined') {
        alert('Firebase 服務模組未載入');
        return;
    }

    alert('Firebase 服務狀態: ' + (FirebaseService.isReady() ? '已就緒' : '未就緒') + '\n\n嘗試重新初始化...');

    FirebaseService.init()
        .then(() => {
            alert('Firebase 服務初始化成功\n\n即時同步功能已就緒');

            // 觸發自定義事件，通知其他模組 Firebase 已就緒
            const event = new CustomEvent('firebase-ready');
            window.dispatchEvent(event);

            // 啟用即時同步按鈕
            const realtimeShareButton = document.getElementById('realtime-share');
            if (realtimeShareButton) {
                realtimeShareButton.disabled = false;
                realtimeShareButton.title = '即時同步分享行程';
            }
        })
        .catch(error => {
            alert('Firebase 服務初始化失敗\n\n錯誤訊息: ' + error.message);
        });
}

// 測試即時同步功能
function testRealtimeShare() {
    console.log('測試即時同步功能...');

    // 檢查 RealtimeSharing 模組是否存在
    if (typeof RealtimeSharing === 'undefined') {
        console.error('RealtimeSharing 模組未載入');
        alert('RealtimeSharing 模組未載入，即時同步功能無法使用');
        return;
    }

    // 檢查是否有行程可分享
    if (!window.startingPoint) {
        console.log('沒有設置出發點，創建測試出發點');

        // 創建測試出發點
        window.startingPoint = {
            name: '測試出發點',
            coordinates: [25.0330, 121.5654] // 台北市座標
        };
    }

    if (!window.destinations || window.destinations.length === 0) {
        console.log('沒有景點，創建測試景點');

        // 創建測試景點
        window.destinations = [
            {
                name: '測試景點 1',
                coordinates: [25.0375, 121.5637],
                stayDuration: 2
            },
            {
                name: '測試景點 2',
                coordinates: [25.0428, 121.5448],
                stayDuration: 1.5
            }
        ];
    }

    // 嘗試創建即時分享
    try {
        console.log('嘗試創建即時分享...');
        console.log('目前行程狀態:', {
            startingPoint: window.startingPoint,
            destinations: window.destinations
        });

        // 直接調用 createRealtimeShare 函數
        RealtimeSharing.createRealtimeShare();
    } catch (error) {
        console.error('創建即時分享時發生錯誤:', error);
        alert('創建即時分享時發生錯誤\n\n' + error.message);
    }
}

// 測試載入分享行程
function testLoadSharedItinerary() {
    console.log('測試載入分享行程...');

    // 檢查 RealtimeSharing 模組是否存在
    if (typeof RealtimeSharing === 'undefined') {
        console.error('RealtimeSharing 模組未載入');
        alert('RealtimeSharing 模組未載入，無法測試載入分享行程');
        return;
    }

    // 創建測試行程資料
    const testItineraryData = {
        startingPoint: {
            name: '測試出發點',
            coordinates: [25.0330, 121.5654] // 台北市座標
        },
        destinations: [
            {
                name: '測試景點 1',
                coordinates: [25.0375, 121.5637],
                stayDuration: 2
            },
            {
                name: '測試景點 2',
                coordinates: [25.0428, 121.5448],
                stayDuration: 1.5
            }
        ],
        departureDate: '2023-12-31',
        departureTime: '09:00',
        maxDailyHours: 8,
        dailySettings: {},
        dailyEndPoints: [],
        locationCache: {}
    };

    try {
        // 直接調用 loadSharedItineraryData 函數
        console.log('嘗試載入測試行程資料...');
        RealtimeSharing.loadSharedItineraryData(testItineraryData);
        alert('測試行程資料已載入，請檢查地圖和行程是否正確顯示。');
    } catch (error) {
        console.error('載入測試行程資料時發生錯誤:', error);
        alert('載入測試行程資料時發生錯誤\n\n' + error.message);
    }
}
