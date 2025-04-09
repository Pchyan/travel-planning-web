/**
 * AR 導航模組 - 整合 AR.js 和 A-Frame 提供擴增實境導航功能
 * 使用模組模式設計，確保良好的封裝和可維護性
 */

const ARNavigation = (function() {
    // 私有變數
    let isInitialized = false;
    let isARActive = false;
    let hasDeviceOrientation = false;
    let hasGeolocation = false;
    let userLocation = null;
    let destinations = [];
    let currentDestinationIndex = 0;
    let currentDestination = null;
    let arScene = null;
    let arCamera = null;
    let compass = null;
    let watchPositionId = null;
    let deviceOrientationHandler = null;
    let destinationMarkers = [];

    // 常數
    const STORAGE_KEY = 'ar_navigation_settings';
    const DESTINATION_MARKER_PREFIX = 'destination-marker-';
    const EARTH_RADIUS = 6371000; // 地球半徑，單位為公尺

    // 檢查設備兼容性
    function checkDeviceCompatibility() {
        // 檢查地理位置 API
        hasGeolocation = 'geolocation' in navigator;

        // 檢查設備方向 API
        hasDeviceOrientation = 'DeviceOrientationEvent' in window;

        // 檢查相機 API
        const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;

        // 檢查 WebXR API (可選)
        const hasWebXR = 'xr' in navigator;

        console.log('AR 兼容性檢查:', {
            地理位置: hasGeolocation ? '支援' : '不支援',
            設備方向: hasDeviceOrientation ? '支援' : '不支援',
            相機: hasCamera ? '支援' : '不支援',
            WebXR: hasWebXR ? '支援' : '不支援'
        });

        return hasGeolocation && hasDeviceOrientation && hasCamera;
    }

    // 初始化 AR 導航
    async function init() {
        console.log('AR 導航模組初始化中...');

        // 檢查設備兼容性
        const isCompatible = checkDeviceCompatibility();
        if (!isCompatible) {
            console.warn('設備不完全支援 AR 導航功能，部分功能可能無法使用');
        }

        // 載入設定
        loadSettings();

        // 設置事件監聽器
        setupEventListeners();

        isInitialized = true;
        console.log('AR 導航模組初始化完成');

        return isCompatible;
    }

    // 載入設定
    function loadSettings() {
        try {
            const savedSettings = localStorage.getItem(STORAGE_KEY);
            if (savedSettings) {
                const settings = JSON.parse(savedSettings);
                console.log('已載入 AR 導航設定:', settings);
                // 應用設定...
            }
        } catch (error) {
            console.error('載入 AR 導航設定時出錯:', error);
        }
    }

    // 保存設定
    function saveSettings(settings) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
            console.log('已保存 AR 導航設定');
        } catch (error) {
            console.error('保存 AR 導航設定時出錯:', error);
        }
    }

    // 設置事件監聽器
    function setupEventListeners() {
        // 這裡將添加必要的事件監聽器
        console.log('設置 AR 導航事件監聽器');
    }

    // 請求相機權限
    async function requestCameraPermission() {
        try {
            // 顯示權限請求對話框
            showPermissionDialog('camera');

            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            // 成功獲取相機權限後立即停止使用，僅用於權限請求
            stream.getTracks().forEach(track => track.stop());

            // 關閉權限對話框
            hidePermissionDialog();

            console.log('已獲取相機權限');
            return true;
        } catch (error) {
            console.error('無法獲取相機權限:', error);

            // 關閉權限對話框
            hidePermissionDialog();

            // 顯示錯誤提示
            showErrorMessage('無法啟動 AR 導航，需要相機權限才能使用此功能。');

            return false;
        }
    }

    // 顯示權限請求對話框
    function showPermissionDialog(permissionType) {
        // 移除現有的對話框
        hidePermissionDialog();

        const dialog = document.createElement('div');
        dialog.className = 'ar-permission-dialog';
        dialog.id = 'ar-permission-dialog';

        let title = '';
        let message = '';

        if (permissionType === 'camera') {
            title = '需要相機權限';
            message = 'AR 導航功能需要使用您的相機。請允許存取相機以繼續。';
        } else if (permissionType === 'location') {
            title = '需要位置權限';
            message = 'AR 導航功能需要使用您的位置。請允許存取位置以繼續。';
        } else if (permissionType === 'orientation') {
            title = '需要裝置方向權限';
            message = 'AR 導航功能需要使用您的裝置方向。請允許存取裝置方向以繼續。';
        }

        dialog.innerHTML = `
            <h3>${title}</h3>
            <p>${message}</p>
            <div class="loading-indicator">
                <div class="spinner"></div>
                <span>請等待...</span>
            </div>
        `;

        document.body.appendChild(dialog);
    }

    // 隱藏權限對話框
    function hidePermissionDialog() {
        const dialog = document.getElementById('ar-permission-dialog');
        if (dialog) {
            dialog.remove();
        }
    }

    // 顯示錯誤訊息
    function showErrorMessage(message) {
        // 移除現有的錯誤訊息
        const existingError = document.getElementById('ar-error-message');
        if (existingError) {
            existingError.remove();
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'ar-not-supported';
        errorDiv.id = 'ar-error-message';
        errorDiv.innerHTML = `
            <h3>錯誤</h3>
            <p>${message}</p>
            <button id="ar-error-close">關閉</button>
        `;

        document.body.appendChild(errorDiv);

        // 添加關閉按鈕事件
        document.getElementById('ar-error-close').addEventListener('click', function() {
            errorDiv.remove();
        });
    }

    // 獲取當前位置
    async function getCurrentPosition() {
        return new Promise((resolve, reject) => {
            if (!hasGeolocation) {
                reject(new Error('設備不支援地理位置功能'));
                return;
            }

            // 顯示權限請求對話框
            showPermissionDialog('location');

            navigator.geolocation.getCurrentPosition(
                position => {
                    userLocation = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                        timestamp: position.timestamp
                    };

                    // 關閉權限對話框
                    hidePermissionDialog();

                    console.log('已獲取當前位置:', userLocation);
                    resolve(userLocation);
                },
                error => {
                    // 關閉權限對話框
                    hidePermissionDialog();

                    console.error('獲取位置時出錯:', error);

                    // 顯示錯誤提示
                    let errorMessage = '無法獲取您的位置。';
                    if (error.code === 1) {
                        errorMessage = '您拒絕了位置權限請求。AR 導航功能需要位置權限才能正常運作。';
                    } else if (error.code === 2) {
                        errorMessage = '無法取得位置資訊。請確保您的裝置已開啟 GPS 功能。';
                    } else if (error.code === 3) {
                        errorMessage = '位置請求逾時。請確保您的裝置已開啟 GPS 功能並在有足夠訊號的地方。';
                    }

                    showErrorMessage(errorMessage);
                    reject(error);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0
                }
            );
        });
    }

    // 開始持續追蹤位置
    function startWatchingPosition() {
        if (!hasGeolocation || watchPositionId !== null) {
            return;
        }

        watchPositionId = navigator.geolocation.watchPosition(
            position => {
                userLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    altitude: position.coords.altitude,
                    altitudeAccuracy: position.coords.altitudeAccuracy,
                    heading: position.coords.heading,
                    speed: position.coords.speed,
                    timestamp: position.timestamp
                };

                // 更新 AR 導航資訊
                updateARNavigation();
            },
            error => {
                console.error('監控位置時出錯:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );

        console.log('已開始監控位置變化');
    }

    // 停止追蹤位置
    function stopWatchingPosition() {
        if (watchPositionId !== null) {
            navigator.geolocation.clearWatch(watchPositionId);
            watchPositionId = null;
            console.log('已停止監控位置變化');
        }
    }

    // 開始 AR 導航
    async function startARNavigation(destinationsList) {
        if (!isInitialized) {
            await init();
        }

        // 檢查是否支援 AR 導航
        if (!checkDeviceCompatibility()) {
            showErrorMessage('您的裝置不支援 AR 導航功能。需要支援地理位置、裝置方向和相機功能的裝置。');
            throw new Error('裝置不支援 AR 導航');
        }

        // 請求相機權限
        const hasCameraPermission = await requestCameraPermission();
        if (!hasCameraPermission) {
            throw new Error('AR 導航需要相機權限');
        }

        try {
            // 鎖定屏幕方向為縱向
            lockScreenOrientation();

            // 獲取當前位置
            await getCurrentPosition();

            // 設置目的地
            destinations = destinationsList || [];
            if (destinations.length > 0) {
                currentDestination = destinations[0];
                currentDestinationIndex = 0;
            }

            // 創建 AR 界面
            const interfaceCreated = createARInterface();
            if (!interfaceCreated) {
                throw new Error('無法創建 AR 界面');
            }

            // 開始追蹤位置
            startWatchingPosition();

            // 設置裝置方向事件
            setupDeviceOrientation();

            // 標記為活動狀態
            isARActive = true;

            // 初始化更新 AR 導航資訊
            updateARNavigation();

            // 提供振動反饋，表示 AR 導航已啟動
            vibrate(200);

            console.log('AR 導航已啟動');
            return true;
        } catch (error) {
            console.error('啟動 AR 導航時出錯:', error);

            // 清理資源
            stopARNavigation();

            // 顯示錯誤訊息
            showErrorMessage(`啟動 AR 導航失敗: ${error.message}`);

            throw error;
        }
    }

    // 創建 AR 界面
    function createARInterface() {
        console.log('創建 AR 界面');

        // 獲取 AR 場景和相機
        arScene = document.getElementById('ar-scene');
        arCamera = document.querySelector('#ar-scene a-entity[camera]');

        if (!arScene || !arCamera) {
            console.error('AR 場景或相機元素不存在');
            return false;
        }

        // 初始化相機視訊
        initCameraFeed();

        // 初始化 AR 元素
        initARElements();

        // 開始追蹤位置
        startWatchingPosition();

        // 設置裝置方向事件
        setupDeviceOrientation();

        // 設置 AR 控制按鈕事件
        setupARControlEvents();

        // 標記為活動狀態
        isARActive = true;

        return true;
    }

    // 初始化相機視訊
    async function initCameraFeed() {
        try {
            console.log('初始化相機視訊');

            // 獲取視訊元素
            const videoElement = document.getElementById('ar-camera-feed');
            if (!videoElement) {
                console.error('相機視訊元素不存在');
                return false;
            }

            // 確保視訊元素可見
            videoElement.style.display = 'block';

            // 獲取相機權限並啟動視訊
            const constraints = {
                video: {
                    facingMode: 'environment',  // 使用後置相機（如果有）
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            console.log('請求相機權限中...', constraints);
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('相機權限已授予');

            // 將視訊流設置到視訊元素
            videoElement.srcObject = stream;

            // 等待視訊元素載入
            await new Promise((resolve) => {
                videoElement.onloadedmetadata = () => {
                    console.log('相機視訊已載入，尺寸:', videoElement.videoWidth, 'x', videoElement.videoHeight);
                    resolve();
                };

                // 添加超時處理
                setTimeout(() => {
                    if (videoElement.readyState >= 2) { // HAVE_CURRENT_DATA or higher
                        console.log('相機視訊已就緒（超時解決）');
                        resolve();
                    }
                }, 3000); // 3 秒超時
            });

            // 啟動視訊播放
            try {
                await videoElement.play();
                console.log('相機視訊已啟動播放');

                // 更新 A-Frame 場景中的視訊平面
                const videoPlane = document.getElementById('ar-video-plane');
                if (videoPlane) {
                    videoPlane.setAttribute('material', 'src', '#ar-camera-feed');
                    videoPlane.setAttribute('material', 'shader', 'flat');
                    console.log('已更新視訊平面材質');
                }
            } catch (playError) {
                console.error('啟動視訊播放失敗:', playError);
                // 嘗試使用非自動播放方式
                videoElement.setAttribute('autoplay', '');
                videoElement.setAttribute('playsinline', '');
                videoElement.setAttribute('muted', '');
                videoElement.muted = true;
                videoElement.play().catch(e => console.error('再次嘗試播放失敗:', e));
            }

            return true;
        } catch (error) {
            console.error('初始化相機視訊失敗:', error);
            alert(`無法啟動相機: ${error.message}`);
            return false;
        }
    }

    // 初始化 AR 元素
    function initARElements() {
        // 清除現有的目的地標記
        clearDestinationMarkers();

        // 為每個目的地創建標記
        destinations.forEach((destination, index) => {
            createDestinationMarker(destination, index);
        });

        // 更新目的地資訊面板
        updateDestinationInfo();
    }

    // 創建目的地標記
    function createDestinationMarker(destination, index) {
        // 如果沒有使用者位置，無法創建標記
        if (!userLocation) {
            console.warn('無法創建目的地標記：無使用者位置資訊');
            return;
        }

        // 計算目的地相對於使用者的方向和距離
        const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            destination.coordinates.latitude,
            destination.coordinates.longitude
        );

        const bearing = calculateBearing(
            userLocation.latitude,
            userLocation.longitude,
            destination.coordinates.latitude,
            destination.coordinates.longitude
        );

        // 轉換為 AR 場景中的坐標
        // 注意：這裡使用簡化的坐標轉換，實際應用中可能需要更複雜的轉換
        const scale = 0.1; // 縮放因子，使遠距離的目的地也能在場景中顯示
        const maxDistance = 100; // 最大顯示距離，單位為公尺
        const displayDistance = Math.min(distance, maxDistance);

        // 轉換為極座標
        const x = displayDistance * scale * Math.sin(bearing * Math.PI / 180);
        const z = -displayDistance * scale * Math.cos(bearing * Math.PI / 180);
        const y = 0; // 可以根據高度差異調整

        // 創建標記元素
        const markerId = `${DESTINATION_MARKER_PREFIX}${index}`;

        // 檢查是否已存在標記
        let marker = document.getElementById(markerId);

        if (!marker) {
            // 創建新的標記
            marker = document.createElement('a-entity');
            marker.id = markerId;
            marker.className = 'ar-marker';
            marker.setAttribute('position', `${x} ${y} ${z}`);

            // 根據目的地類型設置不同的外觀
            if (destination.type === 'starting-point') {
                marker.innerHTML = `
                    <a-sphere radius="0.5" color="#4CAF50"></a-sphere>
                    <a-text value="${destination.name}" position="0 1 0" align="center" color="white" scale="2 2 2"></a-text>
                `;
            } else {
                marker.innerHTML = `
                    <a-sphere radius="0.5" color="#4a89dc"></a-sphere>
                    <a-text value="${index}. ${destination.name}" position="0 1 0" align="center" color="white" scale="2 2 2"></a-text>
                `;
            }

            // 添加到場景
            arScene.appendChild(marker);

            // 添加到標記列表
            destinationMarkers.push({
                id: markerId,
                element: marker,
                destination: destination,
                index: index
            });
        } else {
            // 更新現有標記的位置
            marker.setAttribute('position', `${x} ${y} ${z}`);
        }

        // 更新標記的外觀，根據距離變化
        updateMarkerAppearance(marker, distance);

        // 添加點擊事件
        if (!marker.hasAttribute('data-has-click-listener')) {
            marker.addEventListener('click', function() {
                // 設置為當前目的地
                currentDestinationIndex = index;
                currentDestination = destination;

                // 更新目的地資訊
                updateDestinationInfo();

                // 顯示目的地詳細資訊
                showDestinationDetails(destination, distance);
            });

            // 標記已添加點擊事件
            marker.setAttribute('data-has-click-listener', 'true');
        }

        return marker;
    }

    // 顯示目的地詳細資訊
    function showDestinationDetails(destination, distance) {
        // 創建詳細資訊對話框
        const detailsDialog = document.createElement('div');
        detailsDialog.className = 'ar-details-dialog';
        detailsDialog.id = 'ar-details-dialog';

        // 格式化距離
        let formattedDistance = '';
        if (distance >= 1000) {
            formattedDistance = `${(distance / 1000).toFixed(1)} 公里`;
        } else {
            formattedDistance = `${Math.round(distance)} 公尺`;
        }

        // 計算預計到達時間
        const estimatedTime = estimateArrivalTime(distance);

        // 計算預計到達時間點
        const arrivalTime = calculateArrivalTime(distance);

        // 設置對話框內容
        detailsDialog.innerHTML = `
            <div class="ar-details-header">
                <h3>${destination.name}</h3>
                <button id="close-details" class="ar-details-close">&times;</button>
            </div>
            <div class="ar-details-content">
                <p><strong>距離:</strong> ${formattedDistance}</p>
                <p><strong>預計時間:</strong> ${estimatedTime}</p>
                <p><strong>預計到達:</strong> ${arrivalTime}</p>
                <p><strong>類型:</strong> ${destination.type === 'starting-point' ? '出發點' : '目的地'}</p>
                ${destination.stayDuration ? `<p><strong>停留時間:</strong> ${destination.stayDuration} 小時</p>` : ''}
                <div class="ar-details-actions">
                    <button id="navigate-to-destination" class="ar-details-button">導航到這裡</button>
                </div>
            </div>
        `;

        // 添加到文檔
        document.body.appendChild(detailsDialog);

        // 添加關閉按鈕事件
        document.getElementById('close-details').addEventListener('click', function() {
            detailsDialog.remove();
        });

        // 添加導航按鈕事件
        document.getElementById('navigate-to-destination').addEventListener('click', function() {
            // 關閉詳細資訊對話框
            detailsDialog.remove();

            // 將視圖對準目的地
            centerViewOnCurrentDestination();
        });

        // 添加動畫效果
        setTimeout(() => {
            detailsDialog.classList.add('active');
        }, 10);
    }

    // 清除所有目的地標記
    function clearDestinationMarkers() {
        // 移除 DOM 元素
        destinationMarkers.forEach(marker => {
            if (marker.element && marker.element.parentNode) {
                marker.element.parentNode.removeChild(marker.element);
            }
        });

        // 清空標記列表
        destinationMarkers = [];
    }

    // 設置裝置方向事件
    function setupDeviceOrientation() {
        // 如果已經設置了事件處理程序，先移除
        if (deviceOrientationHandler) {
            window.removeEventListener('deviceorientation', deviceOrientationHandler);
            deviceOrientationHandler = null;
        }

        // 檢查是否需要請求方向權限（iOS 13+ 需要）
        if (typeof DeviceOrientationEvent !== 'undefined' &&
            typeof DeviceOrientationEvent.requestPermission === 'function') {
            // iOS 13+ 需要請求權限
            requestDeviceOrientationPermission();
        } else {
            // 其他裝置不需要請求權限
            addDeviceOrientationListener();
        }
    }

    // 請求裝置方向權限（iOS 13+）
    async function requestDeviceOrientationPermission() {
        try {
            // 顯示權限請求對話框
            showPermissionDialog('orientation');

            const response = await DeviceOrientationEvent.requestPermission();

            // 關閉權限對話框
            hidePermissionDialog();

            if (response === 'granted') {
                // 權限已授予，添加事件監聽器
                addDeviceOrientationListener();
            } else {
                // 權限被拒絕
                console.error('裝置方向權限被拒絕');
                showErrorMessage('AR 導航需要裝置方向權限才能正常運作。請在設定中允許存取裝置方向。');
            }
        } catch (error) {
            // 關閉權限對話框
            hidePermissionDialog();

            console.error('請求裝置方向權限時出錯:', error);
            showErrorMessage('無法請求裝置方向權限。請確保您使用的是支援的瀏覽器和裝置。');
        }
    }

    // 添加裝置方向事件監聽器
    function addDeviceOrientationListener() {
        // 創建新的事件處理程序
        deviceOrientationHandler = function(event) {
            // 只有在 AR 模式活動時才處理
            if (!isARActive) return;

            // 取得裝置方向數據
            const alpha = event.alpha; // z軸旋轉角度 (方位角)
            const beta = event.beta;   // x軸旋轉角度 (仪俗角)
            const gamma = event.gamma; // y軸旋轉角度 (橫滾角)

            // 更新指南針
            updateCompass(alpha);

            // 更新相機旋轉
            updateCameraRotation(alpha, beta, gamma);

            // 更新 AR 導航資訊
            updateARNavigation();
        };

        // 添加事件監聽器
        window.addEventListener('deviceorientation', deviceOrientationHandler);
        console.log('已設置裝置方向事件監聽器');
    }

    // 更新相機旋轉
    function updateCameraRotation(alpha, beta, gamma) {
        if (!arCamera || !alpha) return;

        // 在實際應用中，這裡可能需要更複雜的計算來調整相機的旋轉
        // 這裡使用簡化的方法，僅調整相機的方位角

        // 設置相機的旋轉
        // 注意：這裡的旋轉可能需要根據實際測試進行調整
        arCamera.setAttribute('rotation', `0 ${360 - alpha} 0`);
    }

    // 更新指南針
    function updateCompass(alpha) {
        if (!alpha) return;

        const compassArrow = document.getElementById('ar-compass-arrow');
        if (compassArrow) {
            // 旋轉指南針使其指向北方
            compassArrow.style.transform = `rotate(${360 - alpha}deg)`;
        }
    }

    // 設置 AR 控制按鈕事件
    function setupARControlEvents() {
        // 下一個目的地按鈕
        const nextButton = document.getElementById('ar-next-destination');
        if (nextButton) {
            nextButton.addEventListener('click', function() {
                navigateToNextDestination();
            });
        }

        // 將視圖對準目的地按鈕
        const centerButton = document.getElementById('ar-center-view');
        if (centerButton) {
            centerButton.addEventListener('click', function() {
                centerViewOnCurrentDestination();
            });
        }
    }

    // 導航到下一個目的地
    function navigateToNextDestination() {
        if (destinations.length === 0) return;

        // 更新目的地索引
        currentDestinationIndex = (currentDestinationIndex + 1) % destinations.length;
        currentDestination = destinations[currentDestinationIndex];

        // 更新目的地資訊
        updateDestinationInfo();

        console.log(`導航到下一個目的地: ${currentDestination.name}`);
    }

    // 將視圖對準當前目的地
    function centerViewOnCurrentDestination() {
        if (!currentDestination || !userLocation) return;

        // 計算目的地方位
        const bearing = calculateBearing(
            userLocation.latitude,
            userLocation.longitude,
            currentDestination.coordinates.latitude,
            currentDestination.coordinates.longitude
        );

        // 在實際應用中，這裡可能需要調用設備的方向感應器或其他方法來對準
        console.log(`將視圖對準目的地，方位角: ${bearing}度`);
    }

    // 更新目的地資訊
    function updateDestinationInfo() {
        if (!currentDestination || !userLocation) return;

        // 計算距離
        const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            currentDestination.coordinates.latitude,
            currentDestination.coordinates.longitude
        );

        // 計算預計到達時間
        const estimatedTime = estimateArrivalTime(distance);

        // 更新 UI 元素
        const nameElement = document.querySelector('.ar-destination-name');
        const distanceElement = document.getElementById('ar-distance');
        const timeElement = document.getElementById('ar-time');

        if (nameElement) {
            nameElement.textContent = currentDestination.name;
        }

        if (distanceElement) {
            // 格式化距離
            let formattedDistance = '';
            if (distance >= 1000) {
                formattedDistance = `${(distance / 1000).toFixed(1)} 公里`;
            } else {
                formattedDistance = `${Math.round(distance)} 公尺`;
            }

            distanceElement.textContent = formattedDistance;
        }

        if (timeElement) {
            timeElement.textContent = estimatedTime;
        }
    }

    // 計算預計到達時間
    function estimateArrivalTime(distance) {
        // 假設步行速度為 5 公里/小時，即 1.4 公尺/秒
        const walkingSpeedMetersPerSecond = 1.4;

        // 計算時間（秒）
        const timeInSeconds = distance / walkingSpeedMetersPerSecond;

        // 格式化時間
        if (timeInSeconds < 60) {
            // 不到一分鐘
            return `${Math.round(timeInSeconds)} 秒`;
        } else if (timeInSeconds < 3600) {
            // 不到一小時
            const minutes = Math.floor(timeInSeconds / 60);
            const seconds = Math.round(timeInSeconds % 60);
            return `${minutes} 分 ${seconds} 秒`;
        } else {
            // 超過一小時
            const hours = Math.floor(timeInSeconds / 3600);
            const minutes = Math.floor((timeInSeconds % 3600) / 60);
            return `${hours} 小時 ${minutes} 分`;
        }
    }

    // 計算預計到達時間點
    function calculateArrivalTime(distance) {
        // 假設步行速度為 5 公里/小時，即 1.4 公尺/秒
        const walkingSpeedMetersPerSecond = 1.4;

        // 計算時間（秒）
        const timeInSeconds = distance / walkingSpeedMetersPerSecond;

        // 獲取當前時間
        const now = new Date();

        // 計算到達時間
        const arrivalTime = new Date(now.getTime() + timeInSeconds * 1000);

        // 格式化時間
        const hours = arrivalTime.getHours().toString().padStart(2, '0');
        const minutes = arrivalTime.getMinutes().toString().padStart(2, '0');

        return `${hours}:${minutes}`;
    }

    // 更新 AR 導航資訊
    function updateARNavigation() {
        if (!isARActive || !userLocation) return;

        // 更新目的地標記
        destinations.forEach((destination, index) => {
            createDestinationMarker(destination, index);
        });

        // 更新目的地資訊
        updateDestinationInfo();

        // 更新方向指示器
        updateDirectionIndicator();
    }

    // 更新方向指示器
    function updateDirectionIndicator() {
        if (!isARActive || !userLocation || !currentDestination) return;

        // 獲取方向指示器元素
        const directionIndicator = document.getElementById('ar-direction-indicator');
        if (!directionIndicator) return;

        // 計算目的地方位
        const bearing = calculateBearing(
            userLocation.latitude,
            userLocation.longitude,
            currentDestination.coordinates.latitude,
            currentDestination.coordinates.longitude
        );

        // 設置方向指示器的旋轉
        directionIndicator.setAttribute('rotation', `0 ${bearing} 0`);

        // 設置方向指示器的顏色，根據距離變化
        const distance = calculateDistance(
            userLocation.latitude,
            userLocation.longitude,
            currentDestination.coordinates.latitude,
            currentDestination.coordinates.longitude
        );

        // 距離越近，顏色越綠；距離越遠，顏色越紅
        const maxDistance = 1000; // 1000公尺以上為紅色
        const normalizedDistance = Math.min(distance, maxDistance) / maxDistance;

        // 計算顏色：從綠色到紅色的漸變
        const r = Math.floor(255 * normalizedDistance);
        const g = Math.floor(255 * (1 - normalizedDistance));
        const color = `rgb(${r}, ${g}, 0)`;

        // 更新方向指示器的顏色
        const triangle = directionIndicator.querySelector('a-triangle');
        if (triangle) {
            triangle.setAttribute('color', color);
        }

        // 更新方向指示器的可見性
        directionIndicator.setAttribute('visible', 'true');
    }

    // 更新目的地標記的外觀
    function updateMarkerAppearance(marker, distance) {
        if (!marker) return;

        // 根據距離調整標記的大小
        const maxDistance = 1000; // 1000公尺以上為最小大小
        const minScale = 0.5;    // 最小大小為原始大小的 50%

        // 計算縮放比例：距離越近，標記越大
        const normalizedDistance = Math.min(distance, maxDistance) / maxDistance;
        const scale = 1 - ((1 - minScale) * normalizedDistance);

        // 設置縮放
        const sphere = marker.querySelector('a-sphere');
        if (sphere) {
            sphere.setAttribute('scale', `${scale} ${scale} ${scale}`);
        }

        // 設置透明度：距離越遠，越透明
        const minOpacity = 0.3;
        const opacity = 1 - ((1 - minOpacity) * normalizedDistance);

        if (sphere) {
            sphere.setAttribute('opacity', opacity);
        }

        // 設置脈動效果：距離越近，脈動越快
        const maxPulseFrequency = 2.0; // 最快脈動頻率（秒）
        const minPulseFrequency = 0.5; // 最慢脈動頻率（秒）

        // 距離越近，脈動越快
        const pulseFrequency = minPulseFrequency + ((maxPulseFrequency - minPulseFrequency) * (1 - normalizedDistance));

        // 設置脈動動畫
        if (sphere && !sphere.hasAttribute('animation')) {
            sphere.setAttribute('animation', {
                property: 'scale',
                dir: 'alternate',
                dur: (1000 / pulseFrequency).toFixed(0),
                easing: 'easeInOutSine',
                loop: true,
                to: `${scale * 1.2} ${scale * 1.2} ${scale * 1.2}`
            });
        } else if (sphere && sphere.hasAttribute('animation')) {
            // 更新現有動畫
            sphere.setAttribute('animation', 'dur', (1000 / pulseFrequency).toFixed(0));
            sphere.setAttribute('animation', 'to', `${scale * 1.2} ${scale * 1.2} ${scale * 1.2}`);
        }

        // 設置顏色：距離越近，顏色越亮
        if (sphere) {
            // 根據目的地類型設置基本顏色
            let baseColor;
            const destination = destinationMarkers.find(m => m.element === marker)?.destination;

            if (destination && destination.type === 'starting-point') {
                baseColor = '#4CAF50'; // 綠色用於出發點
            } else {
                baseColor = '#4a89dc'; // 藍色用於目的地
            }

            // 距離越近，顏色越亮
            const brightness = 0.7 + (0.3 * (1 - normalizedDistance));

            // 調整顏色亮度
            const adjustedColor = adjustColorBrightness(baseColor, brightness);

            // 設置顏色
            sphere.setAttribute('color', adjustedColor);
        }

        // 更新文字標籤
        const text = marker.querySelector('a-text');
        if (text) {
            // 設置文字透明度
            text.setAttribute('opacity', opacity);

            // 設置文字大小，距離越近越大
            const textScale = 1.5 + (0.5 * (1 - normalizedDistance));
            text.setAttribute('scale', `${textScale} ${textScale} ${textScale}`);

            // 更新距離信息
            const destination = destinationMarkers.find(m => m.element === marker)?.destination;
            if (destination && destination.type !== 'starting-point') {
                // 格式化距離
                let formattedDistance = '';
                if (distance >= 1000) {
                    formattedDistance = `${(distance / 1000).toFixed(1)} 公里`;
                } else {
                    formattedDistance = `${Math.round(distance)} 公尺`;
                }

                // 更新文字內容，包含距離信息
                const index = destinationMarkers.find(m => m.element === marker)?.index;
                text.setAttribute('value', `${index}. ${destination.name} (${formattedDistance})`);
            }
        }

        // 如果是當前目的地，添加特殊效果
        if (currentDestination && marker.id === `${DESTINATION_MARKER_PREFIX}${currentDestinationIndex}`) {
            // 添加特殊效果，如光環
            if (!marker.querySelector('.highlight-ring')) {
                const ring = document.createElement('a-ring');
                ring.className = 'highlight-ring';
                ring.setAttribute('radius-inner', '0.6');
                ring.setAttribute('radius-outer', '0.7');
                ring.setAttribute('color', '#FFEB3B');
                ring.setAttribute('position', '0 0 0');
                ring.setAttribute('rotation', '90 0 0');
                ring.setAttribute('animation', {
                    property: 'scale',
                    dir: 'alternate',
                    dur: '1500',
                    easing: 'easeInOutSine',
                    loop: true,
                    to: '1.2 1.2 1.2'
                });
                marker.appendChild(ring);
            }
        } else {
            // 移除特殊效果
            const ring = marker.querySelector('.highlight-ring');
            if (ring) {
                marker.removeChild(ring);
            }
        }
    }

    // 調整顏色亮度
    function adjustColorBrightness(hex, factor) {
        // 將十六進制顏色轉換為 RGB
        let r = parseInt(hex.substring(1, 3), 16);
        let g = parseInt(hex.substring(3, 5), 16);
        let b = parseInt(hex.substring(5, 7), 16);

        // 調整亮度
        r = Math.min(255, Math.round(r * factor));
        g = Math.min(255, Math.round(g * factor));
        b = Math.min(255, Math.round(b * factor));

        // 轉換回十六進制
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    // 停止 AR 導航
    function stopARNavigation() {
        // 清理 AR 資源
        console.log('停止 AR 導航');

        // 停止追蹤位置
        stopWatchingPosition();

        // 移除裝置方向事件監聽器
        if (deviceOrientationHandler) {
            window.removeEventListener('deviceorientation', deviceOrientationHandler);
            deviceOrientationHandler = null;
        }

        // 清除目的地標記
        clearDestinationMarkers();

        // 標記為非活動狀態
        isARActive = false;

        // 停止相機視訊
        stopCameraFeed();

        // 解鎖屏幕方向
        unlockScreenOrientation();

        // 提供振動反饋，表示 AR 導航已停止
        vibrate([100, 50, 100]);

        return true;
    }

    // 停止相機視訊
    function stopCameraFeed() {
        try {
            console.log('停止相機視訊');

            // 獲取視訊元素
            const videoElement = document.getElementById('ar-camera-feed');
            if (!videoElement) {
                console.error('相機視訊元素不存在');
                return false;
            }

            // 停止視訊播放
            videoElement.pause();

            // 停止所有視訊軌道
            if (videoElement.srcObject) {
                const tracks = videoElement.srcObject.getTracks();
                tracks.forEach(track => track.stop());
                videoElement.srcObject = null;
            }

            console.log('相機視訊已停止');
            return true;
        } catch (error) {
            console.error('停止相機視訊失敗:', error);
            return false;
        }
    }

    // 鎖定屏幕方向為縱向
    function lockScreenOrientation() {
        try {
            // 檢查是否支援屏幕方向鎖定
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('portrait').then(() => {
                    console.log('屏幕方向已鎖定為縱向');
                }).catch(error => {
                    console.error('鎖定屏幕方向失敗:', error);
                });
            } else if (screen.lockOrientation) {
                // 舊版 API
                screen.lockOrientation('portrait');
                console.log('屏幕方向已鎖定為縱向 (舊版 API)');
            } else {
                console.warn('此裝置不支援屏幕方向鎖定');
            }
        } catch (error) {
            console.error('鎖定屏幕方向時出錯:', error);
        }
    }

    // 解鎖屏幕方向
    function unlockScreenOrientation() {
        try {
            // 檢查是否支援屏幕方向鎖定
            if (screen.orientation && screen.orientation.unlock) {
                screen.orientation.unlock();
                console.log('屏幕方向已解鎖');
            } else if (screen.unlockOrientation) {
                // 舊版 API
                screen.unlockOrientation();
                console.log('屏幕方向已解鎖 (舊版 API)');
            } else {
                console.warn('此裝置不支援屏幕方向鎖定');
            }
        } catch (error) {
            console.error('解鎖屏幕方向時出錯:', error);
        }
    }

    // 振動反饋
    function vibrate(pattern) {
        try {
            // 檢查是否支援振動 API
            if ('vibrate' in navigator) {
                navigator.vibrate(pattern);
            } else {
                console.warn('此裝置不支援振動功能');
            }
        } catch (error) {
            console.error('使用振動功能時出錯:', error);
        }
    }

    // 計算兩點間的距離（公尺）
    function calculateDistance(lat1, lon1, lat2, lon2) {
        // 轉換為弧度
        const phi1 = lat1 * Math.PI / 180;
        const phi2 = lat2 * Math.PI / 180;
        const deltaPhi = (lat2 - lat1) * Math.PI / 180;
        const deltaLambda = (lon2 - lon1) * Math.PI / 180;

        // 使用 Haversine 公式計算距離
        const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
                Math.cos(phi1) * Math.cos(phi2) *
                Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = EARTH_RADIUS * c;

        return distance; // 單位為公尺
    }

    // 計算兩點間的方位角（度數）
    function calculateBearing(lat1, lon1, lat2, lon2) {
        // 轉換為弧度
        const phi1 = lat1 * Math.PI / 180;
        const phi2 = lat2 * Math.PI / 180;
        const deltaLambda = (lon2 - lon1) * Math.PI / 180;

        // 計算方位角
        const y = Math.sin(deltaLambda) * Math.cos(phi2);
        const x = Math.cos(phi1) * Math.sin(phi2) -
                Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
        let bearing = Math.atan2(y, x) * 180 / Math.PI;

        // 轉換為 0-360 度
        bearing = (bearing + 360) % 360;

        return bearing;
    }

    // 公共 API
    return {
        init: init,
        startARNavigation: startARNavigation,
        stopARNavigation: stopARNavigation,
        isSupported: checkDeviceCompatibility
    };
})();

// 當文檔載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 僅檢查兼容性，不立即初始化
    ARNavigation.isSupported();
});
