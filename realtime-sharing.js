/**
 * 即時同步行程分享模組
 * 提供行程的即時同步功能，讓多位使用者可以同時編輯同一個行程
 */

const RealtimeSharing = (function() {
    // 私有變數
    let isInitialized = false;
    let currentShareId = null;
    let currentUser = null;
    let isConnected = false;
    let lastSyncTime = 0;
    let changeListeners = [];
    let unsubscribeFunctions = {};

    // 常數
    const SYNC_DEBOUNCE_TIME = 500; // 同步防抖時間（毫秒）
    const CURRENT_USER_KEY = 'realtime_current_user';

    // 初始化模組
    function init() {
        if (isInitialized) return;

        console.log('即時同步行程分享模組初始化中...');

        // 載入使用者資料
        loadUserData();

        // 檢查 Firebase 是否已初始化
        if (typeof FirebaseService === 'undefined' || !FirebaseService.isReady()) {
            console.error('Firebase 服務未初始化，即時同步功能將無法使用');
            alert('即時同步功能初始化失敗，將使用本地儲存模式。');
            return;
        }

        // 檢查 URL 是否包含分享 ID
        checkShareIdInUrl();

        isInitialized = true;
        console.log('即時同步行程分享模組初始化完成');
    }

    // 載入使用者資料
    function loadUserData() {
        try {
            const savedUser = localStorage.getItem(CURRENT_USER_KEY);
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                console.log('已從本地儲存載入使用者資料:', currentUser.name);
            }
        } catch (error) {
            console.error('載入使用者資料時出錯:', error);
            currentUser = null;
        }
    }

    // 儲存使用者資料
    function saveUserData() {
        if (currentUser) {
            try {
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
                console.log('已儲存使用者資料到本地儲存');
            } catch (error) {
                console.error('儲存使用者資料時出錯:', error);
            }
        }
    }

    // 檢查 URL 是否包含分享 ID
    function checkShareIdInUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const shareId = urlParams.get('rtshare');

        if (shareId) {
            console.log('從 URL 中檢測到即時分享 ID:', shareId);
            // 連接到分享的行程
            connectToSharedItinerary(shareId);

            // 清除 URL 參數，防止重複載入
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // 生成分享 ID
    function generateShareId() {
        return 'rt_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    // 創建即時分享行程
    function createRealtimeShare() {
        // 檢查是否有行程可分享
        if (!window.startingPoint || window.destinations.length === 0) {
            alert('請先建立行程再進行即時分享！');
            return;
        }

        // 檢查使用者是否已設置名稱
        if (!currentUser) {
            const userName = prompt('請輸入您的名稱，以便其他協作者識別：');
            if (!userName) {
                alert('必須輸入名稱才能即時分享行程！');
                return;
            }

            currentUser = {
                name: userName,
                id: 'user_' + Date.now().toString(36)
            };

            saveUserData();
        }

        // 創建分享 ID
        const shareId = generateShareId();

        // 獲取當前行程資料
        const itineraryData = {
            startingPoint: window.startingPoint,
            destinations: window.destinations,
            departureDate: window.departureDate,
            departureTime: window.departureTime,
            maxDailyHours: window.maxDailyHours,
            dailySettings: window.dailySettings,
            dailyEndPoints: window.dailyEndPoints,
            locationCache: window.locationCache,
            name: prompt('請為即時分享的行程命名：', '我的行程') || '未命名行程',
            createdAt: new Date().toISOString()
        };

        // 創建分享資料
        const shareData = {
            itineraryData: itineraryData,
            owner: currentUser,
            collaborators: [],
            lastModified: new Date().toISOString(),
            version: 1,
            activeUsers: {}
        };

        // 將擁有者添加為活躍用戶
        shareData.activeUsers[currentUser.id] = {
            name: currentUser.name,
            lastActive: new Date().toISOString()
        };

        // 將分享資料儲存到 Firebase
        FirebaseService.setData(`shared_itineraries/${shareId}`, shareData)
            .then(() => {
                console.log('已創建即時分享行程:', shareId);

                // 連接到分享的行程
                connectToSharedItinerary(shareId);

                // 顯示分享連結對話框
                showShareLinkDialog(shareId);
            })
            .catch(error => {
                console.error('創建即時分享行程時出錯:', error);
                alert('創建即時分享行程時出錯，請稍後再試。');
            });
    }

    // 顯示分享連結對話框
    function showShareLinkDialog(shareId) {
        // 生成分享連結
        const shareUrl = `${window.location.origin}${window.location.pathname}?rtshare=${shareId}`;

        // 創建對話框
        const dialog = document.createElement('div');
        dialog.className = 'realtime-share-dialog';
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
            max-width: 500px;
            width: 90%;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        // 生成QR碼的HTML
        const qrCodeHtml = `
            <div id="realtime-qrcode" style="text-align: center; margin: 20px 0;"></div>
        `;

        dialogContent.innerHTML = `
            <h3 style="margin-top: 0; color: #4a89dc;">即時同步分享</h3>
            <p>您可以透過以下連結即時分享此行程：</p>
            <div style="display: flex; margin-bottom: 15px;">
                <input type="text" id="realtime-share-link" value="${shareUrl}" readonly style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px 0 0 4px;">
                <button id="copy-realtime-link" style="background: #4a89dc; color: white; border: none; padding: 8px 12px; border-radius: 0 4px 4px 0; cursor: pointer;">複製</button>
            </div>
            <p>或掃描QR碼：</p>
            ${qrCodeHtml}
            <div style="margin-top: 10px;">
                <p style="color: #4a89dc; font-weight: bold;">即時同步模式已啟動!</p>
                <p>當其他人透過這個連結加入時，他們的變更將即時同步到您的行程中。</p>
            </div>
            <div style="margin-top: 20px; text-align: right;">
                <button id="close-realtime-share-dialog" style="background: #f0f0f0; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">關閉</button>
            </div>
        `;

        dialog.appendChild(dialogContent);
        document.body.appendChild(dialog);

        // 生成QR碼
        if (window.QRCode) {
            new QRCode(document.getElementById("realtime-qrcode"), {
                text: shareUrl,
                width: 128,
                height: 128
            });
        } else {
            document.getElementById("realtime-qrcode").innerHTML = '<p>QR碼生成器未載入</p>';

            // 動態載入QR碼生成器
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js';
            script.onload = function() {
                new QRCode(document.getElementById("realtime-qrcode"), {
                    text: shareUrl,
                    width: 128,
                    height: 128
                });
            };
            document.head.appendChild(script);
        }

        // 複製連結按鈕
        document.getElementById('copy-realtime-link').addEventListener('click', function() {
            const shareLink = document.getElementById('realtime-share-link');
            shareLink.select();
            document.execCommand('copy');
            this.textContent = '已複製';
            setTimeout(() => {
                this.textContent = '複製';
            }, 2000);
        });

        // 關閉按鈕
        document.getElementById('close-realtime-share-dialog').addEventListener('click', function() {
            document.body.removeChild(dialog);
        });
    }

    // 顯示即時同步模式提示
    function showRealtimeSyncModeNotice(sharedItinerary) {
        // 創建提示元素
        const notice = document.createElement('div');
        notice.className = 'realtime-sync-notice';
        notice.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(74, 137, 220, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 4px;
            z-index: 1000;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            max-width: 300px;
        `;

        // 獲取活躍用戶數量
        const activeUsersCount = Object.keys(sharedItinerary.activeUsers || {}).length;

        notice.innerHTML = `
            <div style="margin-bottom: 5px; font-weight: bold;">即時同步模式</div>
            <div style="font-size: 14px; margin-bottom: 5px;">您正在編輯「${sharedItinerary.itineraryData.name}」</div>
            <div style="font-size: 12px;">建立者: ${sharedItinerary.owner.name}</div>
            <div style="font-size: 12px;">目前有 ${activeUsersCount} 位用戶在線</div>
            <div style="margin-top: 10px;">
                <button id="show-realtime-users" style="background: white; color: #4a89dc; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 12px;">查看協作者</button>
            </div>
        `;

        document.body.appendChild(notice);

        // 查看協作者按鈕
        document.getElementById('show-realtime-users').addEventListener('click', function() {
            showActiveUsersDialog(currentShareId);
        });

        // 5秒後自動隱藏
        setTimeout(() => {
            notice.style.opacity = '0';
            notice.style.transition = 'opacity 0.5s';
            setTimeout(() => {
                if (document.body.contains(notice)) {
                    document.body.removeChild(notice);
                }
            }, 500);
        }, 5000);
    }

    // 顯示活躍用戶對話框
    function showActiveUsersDialog(shareId) {
        if (!shareId) {
            alert('無法獲取協作者信息，請重新連接到即時分享行程。');
            return;
        }

        // 獲取分享行程資料
        FirebaseService.getRef(`shared_itineraries/${shareId}`).once('value', snapshot => {
            const sharedItinerary = snapshot.val();

            if (!sharedItinerary) {
                alert('找不到即時分享的行程！');
                return;
            }

            // 創建對話框
            const dialog = document.createElement('div');
            dialog.className = 'active-users-dialog';
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
                max-width: 500px;
                width: 90%;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;

            // 生成活躍用戶列表
            const activeUsers = sharedItinerary.activeUsers || {};
            const activeUsersList = Object.values(activeUsers).map(user => {
                const lastActive = new Date(user.lastActive);
                const now = new Date();
                const diffMinutes = Math.floor((now - lastActive) / (1000 * 60));

                let statusText = '在線';
                let statusColor = '#4CAF50';

                if (diffMinutes > 5) {
                    statusText = `${diffMinutes} 分鐘前活躍`;
                    statusColor = '#FFC107';
                }

                if (diffMinutes > 30) {
                    statusText = `${Math.floor(diffMinutes / 60)} 小時前活躍`;
                    statusColor = '#FF5722';
                }

                return `
                    <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
                        <div>${user.name}</div>
                        <div style="color: ${statusColor};">${statusText}</div>
                    </div>
                `;
            }).join('');

            // 生成協作者列表
            const collaboratorsList = sharedItinerary.collaborators.map(collaborator => {
                return `<li>${collaborator.name}</li>`;
            }).join('');

            dialogContent.innerHTML = `
                <h3 style="margin-top: 0; color: #4a89dc;">即時協作</h3>
                <p><strong>行程名稱：</strong>${sharedItinerary.itineraryData.name}</p>
                <p><strong>建立者：</strong>${sharedItinerary.owner.name}</p>
                <p><strong>最後修改：</strong>${new Date(sharedItinerary.lastModified).toLocaleString('zh-TW')}</p>

                <div style="margin: 20px 0;">
                    <h4>目前活躍用戶</h4>
                    <div style="max-height: 200px; overflow-y: auto; border: 1px solid #eee; padding: 10px;">
                        ${activeUsersList || '<p>目前沒有活躍用戶</p>'}
                    </div>
                </div>

                <div style="margin: 20px 0;">
                    <h4>所有協作者</h4>
                    <ul style="padding-left: 20px;">
                        ${collaboratorsList || '<li>目前沒有協作者</li>'}
                    </ul>
                </div>

                <div style="margin-top: 20px; text-align: right;">
                    <button id="close-active-users-dialog" style="background: #f0f0f0; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">關閉</button>
                </div>
            `;

            dialog.appendChild(dialogContent);
            document.body.appendChild(dialog);

            // 關閉按鈕
            document.getElementById('close-active-users-dialog').addEventListener('click', function() {
                document.body.removeChild(dialog);
            });
        }, error => {
            console.error('獲取協作者信息時出錯:', error);
            alert('獲取協作者信息時出錯，請稍後再試。');
        });
    }

    // 載入分享的行程資料
    function loadSharedItineraryData(itineraryData) {
        if (!itineraryData) {
            console.error('行程資料為空');
            return;
        }

        console.log('正在載入分享的行程資料');

        // 載入行程資料
        window.startingPoint = itineraryData.startingPoint;
        window.destinations = itineraryData.destinations;
        window.departureDate = itineraryData.departureDate;
        window.departureTime = itineraryData.departureTime;
        window.maxDailyHours = itineraryData.maxDailyHours;
        window.dailySettings = itineraryData.dailySettings;
        window.dailyEndPoints = itineraryData.dailyEndPoints;
        window.locationCache = itineraryData.locationCache || {};

        // 更新界面
        document.getElementById('starting-point').value = window.startingPoint.name;

        if (window.departureDate) {
            document.getElementById('departure-date').value = window.departureDate;
        }

        if (window.departureTime) {
            document.getElementById('departure-time').value = window.departureTime;
        }

        if (window.maxDailyHours) {
            document.getElementById('max-daily-hours').value = window.maxDailyHours;
        }

        // 啟用添加景點功能
        document.getElementById('new-destination').disabled = false;
        document.getElementById('add-destination').disabled = false;

        // 更新地圖和行程
        window.updateItinerary();
        window.updateMap();

        console.log('已載入分享的行程資料');
    }

    // 連接到分享的行程
    function connectToSharedItinerary(shareId) {
        if (!FirebaseService.isReady()) {
            alert('Firebase 服務未初始化，無法連接到即時分享行程。');
            return;
        }

        console.log('正在連接到即時分享行程:', shareId);

        // 檢查使用者是否已設置名稱
        if (!currentUser) {
            const userName = prompt('請輸入您的名稱，以便其他協作者識別：');
            if (!userName) {
                alert('必須輸入名稱才能加入即時分享行程！');
                return;
            }

            currentUser = {
                name: userName,
                id: 'user_' + Date.now().toString(36)
            };

            saveUserData();
        }

        // 首先檢查分享的行程是否存在
        FirebaseService.getRef(`shared_itineraries/${shareId}`).once('value', snapshot => {
            const sharedItinerary = snapshot.val();

            if (!sharedItinerary) {
                alert('找不到即時分享的行程！');
                return;
            }

            // 設置當前分享 ID
            currentShareId = shareId;

            // 將用戶添加為活躍用戶
            const activeUserUpdate = {};
            activeUserUpdate[currentUser.id] = {
                name: currentUser.name,
                lastActive: new Date().toISOString()
            };

            // 如果不是擁有者且不在協作者列表中，則添加為協作者
            let isNewCollaborator = false;
            if (sharedItinerary.owner.id !== currentUser.id &&
                !sharedItinerary.collaborators.some(c => c.id === currentUser.id)) {
                isNewCollaborator = true;
            }

            // 更新活躍用戶
            FirebaseService.updateData(`shared_itineraries/${shareId}/activeUsers`, activeUserUpdate)
                .then(() => {
                    console.log('已將用戶添加為活躍用戶');

                    // 如果是新協作者，則添加到協作者列表
                    if (isNewCollaborator) {
                        return FirebaseService.getRef(`shared_itineraries/${shareId}/collaborators`).once('value')
                            .then(collabSnapshot => {
                                const collaborators = collabSnapshot.val() || [];
                                collaborators.push(currentUser);
                                return FirebaseService.updateData(`shared_itineraries/${shareId}`, {
                                    collaborators: collaborators
                                });
                            });
                    }
                })
                .then(() => {
                    // 載入行程資料
                    loadSharedItineraryData(sharedItinerary.itineraryData);

                    // 設置即時同步
                    setupRealtimeSync(shareId);

                    // 顯示即時同步模式提示
                    showRealtimeSyncModeNotice(sharedItinerary);

                    // 設置定期更新活躍狀態
                    setupActivityHeartbeat(shareId);

                    // 設置頁面關閉事件
                    setupPageUnloadHandler(shareId);

                    isConnected = true;
                })
                .catch(error => {
                    console.error('連接到即時分享行程時出錯:', error);
                    alert('連接到即時分享行程時出錯，請稍後再試。');
                });
        }, error => {
            console.error('檢查即時分享行程時出錯:', error);
            alert('檢查即時分享行程時出錯，請稍後再試。');
        });
    }

    // 設置即時同步
    function setupRealtimeSync(shareId) {
        if (!FirebaseService.isReady() || !shareId) {
            console.error('無法設置即時同步，服務未初始化或分享 ID 為空');
            return;
        }

        console.log('正在設置即時同步，分享 ID:', shareId);

        // 監聽行程資料變更
        const itineraryRef = FirebaseService.getRef(`shared_itineraries/${shareId}/itineraryData`);
        const unsubscribeItinerary = FirebaseService.onDataChange(`shared_itineraries/${shareId}/itineraryData`, (itineraryData) => {
            // 如果最後同步時間在 SYNC_DEBOUNCE_TIME 毫秒內，則跳過
            const now = Date.now();
            if (now - lastSyncTime < SYNC_DEBOUNCE_TIME) {
                console.log('跳過同步，防抖時間內');
                return;
            }

            console.log('接收到行程資料變更');

            // 更新行程資料
            loadSharedItineraryData(itineraryData);
        });

        // 監聽活躍用戶變更
        const activeUsersRef = FirebaseService.getRef(`shared_itineraries/${shareId}/activeUsers`);
        const unsubscribeActiveUsers = FirebaseService.onDataChange(`shared_itineraries/${shareId}/activeUsers`, (activeUsers) => {
            console.log('活躍用戶已更新，當前活躍用戶數量:', Object.keys(activeUsers || {}).length);
        });

        // 儲存取消監聽的函數
        unsubscribeFunctions[shareId] = {
            itinerary: unsubscribeItinerary,
            activeUsers: unsubscribeActiveUsers
        };

        // 監聽行程更新事件
        window.addEventListener('itinerary-updated', handleItineraryUpdated);

        console.log('即時同步設置完成');
    }

    // 處理行程更新事件
    function handleItineraryUpdated(event) {
        if (!isConnected || !currentShareId) {
            return;
        }

        // 設置最後同步時間
        lastSyncTime = Date.now();

        // 獲取當前行程資料
        const itineraryData = {
            startingPoint: window.startingPoint,
            destinations: window.destinations,
            departureDate: window.departureDate,
            departureTime: window.departureTime,
            maxDailyHours: window.maxDailyHours,
            dailySettings: window.dailySettings,
            dailyEndPoints: window.dailyEndPoints,
            locationCache: window.locationCache,
            name: window.itineraryName || '未命名行程'
        };

        // 更新 Firebase 中的行程資料
        FirebaseService.updateData(`shared_itineraries/${currentShareId}`, {
            itineraryData: itineraryData,
            lastModified: new Date().toISOString(),
            version: firebase.database.ServerValue.INCREMENT
        }).then(() => {
            console.log('已將行程變更同步到伺服器');
        }).catch(error => {
            console.error('同步行程變更時出錯:', error);
        });
    }

    // 設置定期更新活躍狀態
    function setupActivityHeartbeat(shareId) {
        if (!FirebaseService.isReady() || !shareId || !currentUser) {
            return;
        }

        // 每 30 秒更新一次活躍狀態
        const heartbeatInterval = setInterval(() => {
            if (!isConnected || !currentShareId) {
                clearInterval(heartbeatInterval);
                return;
            }

            // 更新活躍狀態
            const activeUserUpdate = {};
            activeUserUpdate[currentUser.id] = {
                name: currentUser.name,
                lastActive: new Date().toISOString()
            };

            FirebaseService.updateData(`shared_itineraries/${shareId}/activeUsers`, activeUserUpdate)
                .then(() => {
                    console.log('已更新活躍狀態');
                })
                .catch(error => {
                    console.error('更新活躍狀態時出錯:', error);
                });
        }, 30000); // 30 秒
    }

    // 設置頁面關閉事件
    function setupPageUnloadHandler(shareId) {
        if (!FirebaseService.isReady() || !shareId || !currentUser) {
            return;
        }

        // 監聽頁面關閉事件
        window.addEventListener('beforeunload', function() {
            // 如果已連接到分享行程，則移除活躍用戶
            if (isConnected && currentShareId && currentUser) {
                // 使用同步 AJAX 請求確保在頁面關閉前發送
                const xhr = new XMLHttpRequest();
                xhr.open('DELETE', `https://travel-planner-demo-default-rtdb.firebaseio.com/shared_itineraries/${shareId}/activeUsers/${currentUser.id}.json`, false);
                xhr.send();

                // 取消監聽
                if (unsubscribeFunctions[shareId]) {
                    if (unsubscribeFunctions[shareId].itinerary) {
                        unsubscribeFunctions[shareId].itinerary();
                    }
                    if (unsubscribeFunctions[shareId].activeUsers) {
                        unsubscribeFunctions[shareId].activeUsers();
                    }
                    delete unsubscribeFunctions[shareId];
                }

                // 移除行程更新事件監聽器
                window.removeEventListener('itinerary-updated', handleItineraryUpdated);

                isConnected = false;
                currentShareId = null;
            }
        });
    }

    // 公開 API
    return {
        init: init,
        createRealtimeShare: createRealtimeShare,
        connectToSharedItinerary: connectToSharedItinerary,
        showActiveUsersDialog: showActiveUsersDialog,

        // 取得當前分享 ID
        getCurrentShareId: function() {
            return currentShareId;
        },

        // 檢查是否已連接
        isConnected: function() {
            return isConnected;
        },

        // 取得當前使用者
        getCurrentUser: function() {
            return currentUser;
        },

        // 設置當前使用者
        setCurrentUser: function(user) {
            currentUser = user;
            saveUserData();
        }
    };
})();

// 當文檔載入完成後初始化模組
document.addEventListener('DOMContentLoaded', function() {
    RealtimeSharing.init();
});
