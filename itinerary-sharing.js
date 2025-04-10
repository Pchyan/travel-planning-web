/**
 * 行程分享模組 - 提供行程分享、協作編輯和評論功能
 */

const ItinerarySharing = (function() {
    // 私有變數
    let isInitialized = false;
    let sharedItineraries = {}; // 格式: {shareId: {itineraryData, owner, collaborators, comments}}
    let currentShareId = null;
    let isCollaborationMode = false;
    let currentUser = null;

    // 本地儲存鍵
    const SHARED_ITINERARIES_KEY = 'shared_itineraries';
    const CURRENT_USER_KEY = 'current_user';

    // 初始化模組
    function init() {
        if (isInitialized) return;

        console.log('行程分享模組初始化中...');

        // 從本地儲存載入資料
        loadFromStorage();

        // 設置事件監聽器
        setupEventListeners();

        // 檢查URL是否包含分享ID
        checkShareIdInUrl();

        isInitialized = true;
        console.log('行程分享模組初始化完成');
    }

    // 從本地儲存載入資料
    function loadFromStorage() {
        try {
            const savedSharedItineraries = localStorage.getItem(SHARED_ITINERARIES_KEY);
            if (savedSharedItineraries) {
                sharedItineraries = JSON.parse(savedSharedItineraries);
                console.log('已從本地儲存載入分享行程資料');
            }

            const savedUser = localStorage.getItem(CURRENT_USER_KEY);
            if (savedUser) {
                currentUser = JSON.parse(savedUser);
                console.log('已從本地儲存載入使用者資料');
            }
        } catch (error) {
            console.error('載入分享行程資料時出錯:', error);
            sharedItineraries = {};
            currentUser = null;
        }
    }

    // 儲存資料到本地儲存
    function saveToStorage() {
        try {
            localStorage.setItem(SHARED_ITINERARIES_KEY, JSON.stringify(sharedItineraries));
            if (currentUser) {
                localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(currentUser));
            }
            console.log('已儲存分享行程資料到本地儲存');
        } catch (error) {
            console.error('儲存分享行程資料時出錯:', error);
            alert('儲存分享行程資料時出錯，請檢查本地儲存空間');
        }
    }

    // 設置事件監聽器
    function setupEventListeners() {
        // 確保DOM已經載入完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', attachEventListeners);
        } else {
            // 如果DOM已經載入完成，直接設置事件
            attachEventListeners();
        }
    }

    // 附加事件監聽器
    function attachEventListeners() {
        // 分享按鈕事件
        const shareButton = document.getElementById('share-itinerary');
        if (shareButton) {
            shareButton.addEventListener('click', showShareDialog);
        }

        // 協作按鈕事件
        const collaborateButton = document.getElementById('collaborate-itinerary');
        if (collaborateButton) {
            collaborateButton.addEventListener('click', showCollaborateDialog);
        }
    }

    // 檢查URL是否包含分享ID
    function checkShareIdInUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const shareId = urlParams.get('share');

        if (shareId && sharedItineraries[shareId]) {
            // 載入分享的行程
            loadSharedItinerary(shareId);

            // 清除URL參數，防止重複載入
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    // 生成唯一的分享ID
    function generateShareId() {
        return 'share_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }

    // 顯示分享對話框
    function showShareDialog() {
        // 檢查是否有行程可分享
        const startingPoint = window.startingPoint || startingPoint;
        const destinations = window.destinations || destinations;

        const status = {
            startingPoint: startingPoint,
            destinationsLength: destinations ? destinations.length : 0,
            destinations: destinations
        };

        console.log('分享行程狀態檢查:', status);

        // 檢查 startingPoint 是否存在
        if (!startingPoint) {
            console.error('出發點未設置');
            alert('請先設置出發點再進行分享！');
            return;
        }

        // 檢查 destinations 是否存在且不為空
        if (!destinations) {
            console.error('destinations 變數不存在');
            alert('行程資料不完整，請重新整理行程再進行分享！');
            return;
        }

        // 檢查是否有景點
        if (destinations.length === 0) {
            console.error('沒有景點');
            alert('請先添加至少一個景點再進行分享！');
            return;
        }

        // 檢查使用者是否已設置名稱
        if (!currentUser) {
            const userName = prompt('請輸入您的名稱，以便其他協作者識別：');
            if (!userName) {
                alert('必須輸入名稱才能分享行程！');
                return;
            }

            currentUser = {
                name: userName,
                id: 'user_' + Date.now().toString(36)
            };

            saveToStorage();
        }

        // 創建分享ID
        const shareId = generateShareId();

        // 獲取當前行程資料
        const itineraryData = {
            startingPoint: startingPoint,
            destinations: destinations,
            departureDate: window.departureDate || departureDate,
            departureTime: window.departureTime || departureTime,
            maxDailyHours: window.maxDailyHours || maxDailyHours,
            dailySettings: window.dailySettings || dailySettings,
            dailyEndPoints: window.dailyEndPoints || dailyEndPoints,
            locationCache: window.locationCache || locationCache,
            name: prompt('請為分享的行程命名：', '我的行程') || '未命名行程',
            createdAt: new Date().toISOString()
        };

        // 儲存分享行程
        sharedItineraries[shareId] = {
            itineraryData: itineraryData,
            owner: currentUser,
            collaborators: [],
            comments: [],
            lastModified: new Date().toISOString(),
            version: 1
        };

        saveToStorage();

        // 生成分享連結
        const shareUrl = `${window.location.origin}${window.location.pathname}?share=${shareId}`;

        // 顯示分享對話框
        showShareLinkDialog(shareId, shareUrl);

        // 更新當前分享ID
        currentShareId = shareId;
    }

    // 顯示分享連結對話框
    function showShareLinkDialog(shareId, shareUrl) {
        // 創建對話框
        const dialog = document.createElement('div');
        dialog.className = 'share-dialog';
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
            <div id="qrcode" style="text-align: center; margin: 20px 0;"></div>
        `;

        dialogContent.innerHTML = `
            <h3 style="margin-top: 0; color: #4a89dc;">分享行程</h3>
            <p>您可以透過以下連結分享此行程：</p>
            <div style="display: flex; margin-bottom: 15px;">
                <input type="text" id="share-link" value="${shareUrl}" readonly style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px 0 0 4px;">
                <button id="copy-link" style="background: #4a89dc; color: white; border: none; padding: 8px 12px; border-radius: 0 4px 4px 0; cursor: pointer;">複製</button>
            </div>
            <p>或掃描QR碼：</p>
            ${qrCodeHtml}
            <div style="margin-top: 20px; text-align: right;">
                <button id="close-share-dialog" style="background: #f0f0f0; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">關閉</button>
            </div>
        `;

        dialog.appendChild(dialogContent);
        document.body.appendChild(dialog);

        // 生成QR碼
        if (typeof QRCodeHelper !== 'undefined') {
            // 使用我們的輔助工具生成 QR 碼
            QRCodeHelper.generateQRCode("qrcode", shareUrl)
                .catch(error => {
                    console.error('使用 QRCodeHelper 生成 QR 碼失敗:', error);
                    // 如果主要方法失敗，使用備用方法
                    QRCodeHelper.generateQRCodeFallback("qrcode", shareUrl, 128);
                });
        } else {
            // 如果輔助工具不可用，嘗試直接使用 QRCode
            try {
                if (window.QRCode) {
                    new QRCode(document.getElementById("qrcode"), {
                        text: shareUrl,
                        width: 128,
                        height: 128
                    });
                    console.log('QR碼生成成功');
                } else {
                    // 如果 QRCode 不可用，使用 Google Charts API 生成 QR 碼
                    const googleChartsUrl = `https://chart.googleapis.com/chart?cht=qr&chs=128x128&chl=${encodeURIComponent(shareUrl)}&chld=H|0`;
                    document.getElementById("qrcode").innerHTML = `<img src="${googleChartsUrl}" alt="QR Code" style="width:128px; height:128px;">`;
                    console.log('使用 Google Charts API 生成 QR 碼成功');
                }
            } catch (err) {
                console.error('QR碼生成過程中發生錯誤:', err);
                // 最後的備用方案：使用 Google Charts API
                const googleChartsUrl = `https://chart.googleapis.com/chart?cht=qr&chs=128x128&chl=${encodeURIComponent(shareUrl)}&chld=H|0`;
                document.getElementById("qrcode").innerHTML = `<img src="${googleChartsUrl}" alt="QR Code" style="width:128px; height:128px;">`;
            }
        }

        // 複製連結按鈕
        document.getElementById('copy-link').addEventListener('click', function() {
            const shareLink = document.getElementById('share-link');
            shareLink.select();
            document.execCommand('copy');
            this.textContent = '已複製';
            setTimeout(() => {
                this.textContent = '複製';
            }, 2000);
        });

        // 關閉按鈕
        document.getElementById('close-share-dialog').addEventListener('click', function() {
            document.body.removeChild(dialog);
        });
    }

    // 顯示協作對話框
    function showCollaborateDialog() {
        // 檢查是否有分享的行程
        if (!currentShareId) {
            alert('請先分享行程才能進行協作！');
            return;
        }

        const sharedItinerary = sharedItineraries[currentShareId];

        // 創建對話框
        const dialog = document.createElement('div');
        dialog.className = 'collaborate-dialog';
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
            max-width: 600px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        // 生成協作者列表
        let collaboratorsHtml = '';
        if (sharedItinerary.collaborators.length > 0) {
            collaboratorsHtml = `
                <h4>協作者</h4>
                <ul style="padding-left: 20px;">
                    ${sharedItinerary.collaborators.map(collaborator =>
                        `<li>${collaborator.name}</li>`
                    ).join('')}
                </ul>
            `;
        } else {
            collaboratorsHtml = '<p>目前沒有其他協作者</p>';
        }

        // 生成評論列表
        let commentsHtml = '';
        if (sharedItinerary.comments.length > 0) {
            commentsHtml = `
                <h4>評論與建議</h4>
                <div class="comments-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #eee; padding: 10px; margin-bottom: 15px;">
                    ${sharedItinerary.comments.map(comment => `
                        <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <strong>${comment.user.name}</strong>
                                <span style="color: #999; font-size: 12px;">${new Date(comment.timestamp).toLocaleString('zh-TW')}</span>
                            </div>
                            <p style="margin: 0;">${comment.text}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            commentsHtml = '<p>目前沒有評論</p>';
        }

        dialogContent.innerHTML = `
            <h3 style="margin-top: 0; color: #4a89dc;">行程協作</h3>
            <p><strong>行程名稱：</strong>${sharedItinerary.itineraryData.name}</p>
            <p><strong>建立者：</strong>${sharedItinerary.owner.name}</p>
            <p><strong>最後修改：</strong>${new Date(sharedItinerary.lastModified).toLocaleString('zh-TW')}</p>

            <div style="margin: 20px 0;">
                ${collaboratorsHtml}
            </div>

            <div style="margin: 20px 0;">
                ${commentsHtml}
            </div>

            <div style="margin-top: 15px;">
                <h4>新增評論</h4>
                <textarea id="new-comment" style="width: 100%; height: 80px; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;"></textarea>
                <button id="add-comment" style="background: #4a89dc; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer;">新增評論</button>
            </div>

            <div style="margin-top: 20px; text-align: right;">
                <button id="close-collaborate-dialog" style="background: #f0f0f0; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; margin-left: 10px;">關閉</button>
            </div>
        `;

        dialog.appendChild(dialogContent);
        document.body.appendChild(dialog);

        // 新增評論按鈕
        document.getElementById('add-comment').addEventListener('click', function() {
            const commentText = document.getElementById('new-comment').value.trim();
            if (!commentText) {
                alert('請輸入評論內容！');
                return;
            }

            // 檢查使用者是否已設置名稱
            if (!currentUser) {
                const userName = prompt('請輸入您的名稱，以便其他協作者識別：');
                if (!userName) {
                    alert('必須輸入名稱才能新增評論！');
                    return;
                }

                currentUser = {
                    name: userName,
                    id: 'user_' + Date.now().toString(36)
                };

                saveToStorage();
            }

            // 新增評論
            sharedItinerary.comments.push({
                user: currentUser,
                text: commentText,
                timestamp: new Date().toISOString()
            });

            // 更新最後修改時間
            sharedItinerary.lastModified = new Date().toISOString();

            saveToStorage();

            // 重新顯示協作對話框
            document.body.removeChild(dialog);
            showCollaborateDialog();
        });

        // 關閉按鈕
        document.getElementById('close-collaborate-dialog').addEventListener('click', function() {
            document.body.removeChild(dialog);
        });
    }

    // 載入分享的行程
    function loadSharedItinerary(shareId) {
        if (!sharedItineraries[shareId]) {
            alert('找不到分享的行程！');
            return;
        }

        const sharedItinerary = sharedItineraries[shareId];

        // 檢查使用者是否已設置名稱
        if (!currentUser) {
            const userName = prompt('請輸入您的名稱，以便其他協作者識別：');
            if (userName) {
                currentUser = {
                    name: userName,
                    id: 'user_' + Date.now().toString(36)
                };

                saveToStorage();
            }
        }

        // 如果不是擁有者且不在協作者列表中，則添加為協作者
        if (currentUser &&
            sharedItinerary.owner.id !== currentUser.id &&
            !sharedItinerary.collaborators.some(c => c.id === currentUser.id)) {
            sharedItinerary.collaborators.push(currentUser);
            saveToStorage();
        }

        // 載入行程資料
        window.startingPoint = sharedItinerary.itineraryData.startingPoint;
        window.destinations = sharedItinerary.itineraryData.destinations;
        window.departureDate = sharedItinerary.itineraryData.departureDate;
        window.departureTime = sharedItinerary.itineraryData.departureTime;
        window.maxDailyHours = sharedItinerary.itineraryData.maxDailyHours;
        window.dailySettings = sharedItinerary.itineraryData.dailySettings;
        window.dailyEndPoints = sharedItinerary.itineraryData.dailyEndPoints;
        window.locationCache = sharedItinerary.itineraryData.locationCache;

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

        // 启用添加景点功能
        document.getElementById('new-destination').disabled = false;
        document.getElementById('add-destination').disabled = false;

        // 更新地圖和行程
        window.updateItinerary();
        window.updateMap();

        // 更新當前分享ID
        currentShareId = shareId;

        // 進入協作模式
        isCollaborationMode = true;

        // 顯示協作模式提示
        showCollaborationModeNotice(sharedItinerary);
    }

    // 顯示協作模式提示
    function showCollaborationModeNotice(sharedItinerary) {
        // 創建提示元素
        const notice = document.createElement('div');
        notice.className = 'collaboration-notice';
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

        notice.innerHTML = `
            <div style="margin-bottom: 5px; font-weight: bold;">協作模式</div>
            <div style="font-size: 14px; margin-bottom: 5px;">您正在編輯「${sharedItinerary.itineraryData.name}」</div>
            <div style="font-size: 12px;">建立者: ${sharedItinerary.owner.name}</div>
            <div style="margin-top: 10px;">
                <button id="show-collaboration-details" style="background: white; color: #4a89dc; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 12px;">查看詳情</button>
            </div>
        `;

        document.body.appendChild(notice);

        // 查看詳情按鈕
        document.getElementById('show-collaboration-details').addEventListener('click', showCollaborateDialog);

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

    // 儲存協作行程的變更
    function saveCollaborationChanges() {
        if (!isCollaborationMode || !currentShareId) {
            return;
        }

        const sharedItinerary = sharedItineraries[currentShareId];

        // 更新行程資料
        sharedItinerary.itineraryData = {
            startingPoint: window.startingPoint,
            destinations: window.destinations,
            departureDate: window.departureDate,
            departureTime: window.departureTime,
            maxDailyHours: window.maxDailyHours,
            dailySettings: window.dailySettings,
            dailyEndPoints: window.dailyEndPoints,
            locationCache: window.locationCache,
            name: sharedItinerary.itineraryData.name,
            createdAt: sharedItinerary.itineraryData.createdAt
        };

        // 更新最後修改時間和版本
        sharedItinerary.lastModified = new Date().toISOString();
        sharedItinerary.version++;

        saveToStorage();

        console.log('已儲存協作行程變更');
    }

    // 公開API
    return {
        init: init,
        showShareDialog: showShareDialog,
        showCollaborateDialog: showCollaborateDialog,
        saveCollaborationChanges: saveCollaborationChanges,
        loadSharedItinerary: loadSharedItinerary,

        // 取得當前分享ID
        getCurrentShareId: function() {
            return currentShareId;
        },

        // 檢查是否在協作模式
        isInCollaborationMode: function() {
            return isCollaborationMode;
        },

        // 取得當前使用者
        getCurrentUser: function() {
            return currentUser;
        },

        // 設置當前使用者
        setCurrentUser: function(user) {
            currentUser = user;
            saveToStorage();
        }
    };
})();

// 初始化模組
document.addEventListener('DOMContentLoaded', function() {
    ItinerarySharing.init();
});

// 監聽行程變更事件，自動儲存協作變更
window.addEventListener('itinerary-updated', function() {
    if (ItinerarySharing.isInCollaborationMode()) {
        ItinerarySharing.saveCollaborationChanges();
    }
});
