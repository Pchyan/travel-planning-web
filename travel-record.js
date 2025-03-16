/**
 * 旅行記錄模組 - 用於管理旅行回顧、照片上傳和分享功能
 * 使用模組模式設計，確保良好的封裝和可維護性
 */

const TravelRecord = (function() {
    // 私有變數
    let records = [];
    let currentRecord = null;
    
    // 本地存儲鍵
    const RECORDS_STORAGE_KEY = 'travel_records';
    
    // 私有方法
    function init() {
        console.log('TravelRecord模組初始化中...');
        loadRecordsFromStorage();
        
        // 確保DOM已經載入完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupEventListeners);
        } else {
            // 如果DOM已經載入完成，直接設置事件
            setupEventListeners();
        }
    }
    
    function loadRecordsFromStorage() {
        try {
            const savedRecords = localStorage.getItem(RECORDS_STORAGE_KEY);
            if (savedRecords) {
                records = JSON.parse(savedRecords);
                console.log(`已載入 ${records.length} 條旅行記錄`);
            }
        } catch (error) {
            console.error('載入旅行記錄時出錯:', error);
            records = [];
        }
    }
    
    function saveRecordsToStorage() {
        try {
            localStorage.setItem(RECORDS_STORAGE_KEY, JSON.stringify(records));
            console.log(`已保存 ${records.length} 條旅行記錄`);
        } catch (error) {
            console.error('保存旅行記錄時出錯:', error);
            alert('保存旅行記錄時出錯，請檢查本地存儲空間');
        }
    }
    
    function setupEventListeners() {
        console.log('設置旅行記錄按鈕事件監聽器...');
        
        // 確保使用setTimeout確保DOM完全載入
        setTimeout(function() {
            // 尋找旅行記錄按鈕
            const recordButton = document.getElementById('open-travel-record');
            
            if (recordButton) {
                console.log('找到旅行記錄按鈕，添加點擊事件');
                
                // 移除可能存在的事件監聽器（避免重複）
                recordButton.removeEventListener('click', openRecordPanel);
                
                // 添加新的事件監聽器
                recordButton.addEventListener('click', function(e) {
                    console.log('旅行記錄按鈕被點擊!');
                    openRecordPanel();
                });
                
                console.log('旅行記錄按鈕事件已成功綁定');
            } else {
                console.error('未找到ID為"open-travel-record"的按鈕，嘗試重新查找...');
                
                // 嘗試通過文本內容查找
                const allButtons = document.querySelectorAll('button');
                const recordButtons = Array.from(allButtons).filter(btn => {
                    return btn.textContent.includes('旅行記錄') || 
                           (btn.querySelector('i.fa-book') && btn.textContent.includes('記錄'));
                });
                
                if (recordButtons.length > 0) {
                    console.log('通過內容找到旅行記錄按鈕:', recordButtons.length);
                    recordButtons.forEach(btn => {
                        btn.removeEventListener('click', openRecordPanel);
                        btn.addEventListener('click', function(e) {
                            console.log('替代旅行記錄按鈕被點擊!');
                            openRecordPanel();
                        });
                    });
                } else {
                    console.error('無法找到任何旅行記錄相關按鈕');
                }
            }
        }, 500); // 延遲500毫秒確保DOM加載完成
    }
    
    // 顯示旅行記錄面板
    function openRecordPanel() {
        console.log('打開旅行記錄面板');
        
        // 移除已存在的面板（如果有）
        const existingPanel = document.getElementById('travel-record-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        // 創建新面板
        const panel = document.createElement('div');
        panel.id = 'travel-record-panel';
        panel.className = 'record-panel';
        
        // 設置面板內容
        panel.innerHTML = `
            <div class="record-panel-header">
                <h2>旅行記錄</h2>
                <button id="close-record-panel" class="close-btn">&times;</button>
            </div>
            <div class="record-panel-tabs">
                <button id="view-records-tab" class="tab-btn active">我的旅行記錄</button>
                <button id="create-record-tab" class="tab-btn">創建新記錄</button>
            </div>
            <div id="records-list-container" class="tab-content active">
                <div id="records-list" class="records-list">
                    ${renderRecordsList()}
                </div>
                <div class="records-empty ${records.length > 0 ? 'hidden' : ''}">
                    <p>您還沒有旅行記錄，點擊「創建新記錄」開始記錄您的旅行體驗！</p>
                </div>
            </div>
            <div id="create-record-container" class="tab-content">
                <form id="record-form">
                    <div class="form-group">
                        <label for="record-title">旅行標題</label>
                        <input type="text" id="record-title" required placeholder="例如：日本東京五日遊">
                    </div>
                    <div class="form-group">
                        <label for="record-date">旅行日期</label>
                        <input type="date" id="record-date" required>
                    </div>
                    <div class="form-group">
                        <label for="record-description">旅行描述</label>
                        <textarea id="record-description" rows="4" placeholder="分享您的旅行體驗..."></textarea>
                    </div>
                    <div class="form-group">
                        <label for="record-photos">上傳照片</label>
                        <input type="file" id="record-photos" multiple accept="image/*">
                        <div id="photo-preview" class="photo-preview"></div>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="link-itinerary"> 連結當前行程
                        </label>
                        <p class="form-hint">將當前規劃的行程與此記錄關聯，以便日後查看</p>
                    </div>
                    <div class="form-actions">
                        <button type="submit" id="save-record" class="primary-btn">保存記錄</button>
                        <button type="button" id="cancel-record" class="secondary-btn">取消</button>
                    </div>
                </form>
            </div>
        `;
        
        // 添加面板到頁面
        document.body.appendChild(panel);
        
        // 確保添加初始樣式，使面板可見
        setTimeout(() => {
            const panelEl = document.getElementById('travel-record-panel');
            if (panelEl) {
                panelEl.style.display = 'flex';
                panelEl.style.zIndex = '1000';
            }
        }, 0);
        
        // 添加事件監聽器
        document.getElementById('close-record-panel').addEventListener('click', () => {
            panel.remove();
        });
        
        document.getElementById('view-records-tab').addEventListener('click', () => {
            showTab('records-list-container');
        });
        
        document.getElementById('create-record-tab').addEventListener('click', () => {
            showTab('create-record-container');
        });
        
        document.getElementById('record-photos').addEventListener('change', handlePhotoUpload);
        
        document.getElementById('record-form').addEventListener('submit', function(e) {
            e.preventDefault();
            saveNewRecord();
        });
        
        document.getElementById('cancel-record').addEventListener('click', function() {
            panel.remove();
        });
        
        // 綁定記錄列表中的按鈕事件
        bindRecordItemEvents();
        
        console.log('旅行記錄面板已經打開');
    }

    // 顯示指定的標籤頁
    function showTab(tabId) {
        const tabContents = document.querySelectorAll('.tab-content');
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        // 隱藏所有標籤頁
        tabContents.forEach(tab => {
            tab.classList.remove('active');
        });
        
        // 取消所有標籤按鈕的激活狀態
        tabButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        
        // 激活指定的標籤頁
        document.getElementById(tabId).classList.add('active');
        
        // 激活對應的標籤按鈕
        if (tabId === 'records-list-container') {
            document.getElementById('view-records-tab').classList.add('active');
        } else if (tabId === 'create-record-container') {
            document.getElementById('create-record-tab').classList.add('active');
        }
    }
    
    // 渲染記錄列表
    function renderRecordsList() {
        if (records.length === 0) {
            return '';
        }
        
        return records.map((record, index) => {
            // 獲取第一張照片或使用默認圖標
            const hasPhotos = record.photos && record.photos.length > 0;
            const photoHtml = hasPhotos ? 
                `<img src="${record.photos[0]}" alt="${record.title}" class="record-thumbnail">` : 
                `<div class="no-photo"><i class="fas fa-image"></i></div>`;
            
            return `
                <div class="record-item" data-index="${index}">
                    <div class="record-preview">
                        ${photoHtml}
                        <div class="record-info">
                            <h3>${record.title}</h3>
                            <div class="record-date">${formatDate(record.date)}</div>
                            <div class="record-description">${record.description || '沒有描述'}</div>
                        </div>
                    </div>
                    <div class="record-actions">
                        <button class="view-record-btn" data-index="${index}">查看詳情</button>
                        <button class="share-record-btn" data-index="${index}">分享</button>
                        <button class="delete-record-btn" data-index="${index}">刪除</button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // 綁定記錄項目的事件
    function bindRecordItemEvents() {
        // 查看詳情按鈕
        document.querySelectorAll('.view-record-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                viewRecord(index);
            });
        });
        
        // 分享按鈕
        document.querySelectorAll('.share-record-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                shareRecord(index);
            });
        });
        
        // 刪除按鈕
        document.querySelectorAll('.delete-record-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                deleteRecord(index);
            });
        });
    }
    
    // 格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
    }
    
    // 處理照片上傳
    function handlePhotoUpload(event) {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        
        const previewContainer = document.getElementById('photo-preview');
        previewContainer.innerHTML = '';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) continue;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const previewItem = document.createElement('div');
                previewItem.className = 'photo-preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="預覽照片">
                    <button type="button" class="remove-photo" data-index="${i}">&times;</button>
                `;
                previewContainer.appendChild(previewItem);
                
                // 添加刪除照片的事件
                previewItem.querySelector('.remove-photo').addEventListener('click', function() {
                    previewItem.remove();
                });
            };
            reader.readAsDataURL(file);
        }
    }
    
    // 保存新記錄
    function saveNewRecord() {
        const titleInput = document.getElementById('record-title');
        const dateInput = document.getElementById('record-date');
        const descriptionInput = document.getElementById('record-description');
        const photosInput = document.getElementById('record-photos');
        const linkItineraryCheck = document.getElementById('link-itinerary');
        
        // 基本資料驗證
        if (!titleInput.value.trim() || !dateInput.value) {
            alert('請填寫標題和日期');
            return;
        }
        
        // 收集照片數據
        const photos = [];
        const previewContainer = document.getElementById('photo-preview');
        const previewImages = previewContainer.querySelectorAll('img');
        previewImages.forEach(img => {
            photos.push(img.src);
        });
        
        // 創建新記錄
        const newRecord = {
            id: Date.now().toString(),
            title: titleInput.value.trim(),
            date: dateInput.value,
            description: descriptionInput.value.trim(),
            photos: photos,
            createdAt: new Date().toISOString(),
            linkedItinerary: linkItineraryCheck.checked ? getCurrentItinerary() : null
        };
        
        // 添加到記錄數組
        records.unshift(newRecord);
        saveRecordsToStorage();
        
        // 更新顯示
        document.getElementById('records-list').innerHTML = renderRecordsList();
        bindRecordItemEvents();
        
        // 顯示記錄列表標籤
        showTab('records-list-container');
        
        // 重置表單
        document.getElementById('record-form').reset();
        document.getElementById('photo-preview').innerHTML = '';
        
        // 隱藏空記錄提示
        document.querySelector('.records-empty').classList.add('hidden');
    }

    // 獲取當前行程
    function getCurrentItinerary() {
        // 這裡應該從主應用獲取當前行程數據
        // 如果主應用有提供API，可以調用它
        if (window.getItineraryData && typeof window.getItineraryData === 'function') {
            return window.getItineraryData();
        }
        
        // 如果沒有API，可以嘗試從localStorage獲取
        try {
            const savedItinerary = localStorage.getItem('current_itinerary');
            if (savedItinerary) {
                return JSON.parse(savedItinerary);
            }
        } catch (error) {
            console.error('獲取當前行程時出錯:', error);
        }
        
        return null;
    }

    // 查看記錄詳情
    function viewRecord(index) {
        if (index < 0 || index >= records.length) return;
        
        currentRecord = records[index];
        
        // 創建記錄詳情面板
        const detailPanel = document.createElement('div');
        detailPanel.id = 'record-detail-panel';
        detailPanel.className = 'record-detail-panel';
        
        // 構建照片幻燈片
        let photosHtml = '';
        if (currentRecord.photos && currentRecord.photos.length > 0) {
            photosHtml = `
                <div class="record-photos-slider">
                    ${currentRecord.photos.map(photo => `
                        <div class="record-photo-slide">
                            <img src="${photo}" alt="${currentRecord.title}">
                        </div>
                    `).join('')}
                    ${currentRecord.photos.length > 1 ? `
                        <button class="slide-nav prev">&lt;</button>
                        <button class="slide-nav next">&gt;</button>
                    ` : ''}
                </div>
            `;
        } else {
            photosHtml = `<div class="no-photos">沒有照片</div>`;
        }
        
        // 構建詳情內容
        detailPanel.innerHTML = `
            <div class="detail-panel-header">
                <h2>${currentRecord.title}</h2>
                <button id="close-detail-panel" class="close-btn">&times;</button>
            </div>
            <div class="detail-panel-content">
                ${photosHtml}
                <div class="detail-info">
                    <div class="detail-date">旅行日期: ${formatDate(currentRecord.date)}</div>
                    <div class="detail-description">
                        <h3>旅行描述</h3>
                        <p>${currentRecord.description || '沒有描述'}</p>
                    </div>
                    ${currentRecord.linkedItinerary ? `
                        <div class="linked-itinerary">
                            <h3>關聯行程</h3>
                            <button id="view-linked-itinerary" class="secondary-btn">查看行程</button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        // 添加到頁面
        document.body.appendChild(detailPanel);
        
        // 添加關閉按鈕事件
        document.getElementById('close-detail-panel').addEventListener('click', function() {
            detailPanel.remove();
        });
        
        // 如果有照片，設置幻燈片導航
        if (currentRecord.photos && currentRecord.photos.length > 1) {
            let currentSlide = 0;
            const slides = detailPanel.querySelectorAll('.record-photo-slide');
            
            // 顯示第一張照片
            slides[0].classList.add('active');
            
            // 上一張按鈕
            detailPanel.querySelector('.slide-nav.prev').addEventListener('click', function() {
                slides[currentSlide].classList.remove('active');
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                slides[currentSlide].classList.add('active');
            });
            
            // 下一張按鈕
            detailPanel.querySelector('.slide-nav.next').addEventListener('click', function() {
                slides[currentSlide].classList.remove('active');
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide].classList.add('active');
            });
        }
        
        // 如果有關聯行程，添加查看行程按鈕事件
        if (currentRecord.linkedItinerary) {
            document.getElementById('view-linked-itinerary').addEventListener('click', function() {
                // 這裡應該調用主應用的加載行程功能
                if (window.loadItinerary && typeof window.loadItinerary === 'function') {
                    window.loadItinerary(currentRecord.linkedItinerary);
                    detailPanel.remove();
                }
            });
        }
    }

    // 分享記錄
    function shareRecord(index) {
        if (index < 0 || index >= records.length) return;
        
        const record = records[index];
        
        // 如果瀏覽器支持Web Share API
        if (navigator.share) {
            navigator.share({
                title: record.title,
                text: record.description || '我的旅行記錄',
                url: window.location.href
            }).catch(error => console.error('分享失敗:', error));
        } else {
            // 創建一個簡單的分享對話框
            const sharePanel = document.createElement('div');
            sharePanel.className = 'share-panel';
            sharePanel.innerHTML = `
                <div class="share-panel-header">
                    <h3>分享旅行記錄</h3>
                    <button class="close-btn">&times;</button>
                </div>
                <div class="share-panel-content">
                    <p>分享方式:</p>
                    <div class="share-buttons">
                        <button class="share-btn facebook">
                            <i class="fab fa-facebook"></i> Facebook
                        </button>
                        <button class="share-btn twitter">
                            <i class="fab fa-twitter"></i> Twitter
                        </button>
                        <button class="share-btn line">
                            <i class="fab fa-line"></i> Line
                        </button>
                        <button class="share-btn email">
                            <i class="fas fa-envelope"></i> Email
                        </button>
                    </div>
                    <div class="share-url">
                        <p>或複製鏈接:</p>
                        <input type="text" value="${window.location.href}" readonly>
                        <button class="copy-btn">複製</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(sharePanel);
            
            // 關閉按鈕
            sharePanel.querySelector('.close-btn').addEventListener('click', function() {
                sharePanel.remove();
            });
            
            // 複製鏈接按鈕
            sharePanel.querySelector('.copy-btn').addEventListener('click', function() {
                const input = sharePanel.querySelector('input');
                input.select();
                document.execCommand('copy');
                this.textContent = '已複製';
                setTimeout(() => {
                    this.textContent = '複製';
                }, 2000);
            });
            
            // 模擬社交媒體分享
            sharePanel.querySelectorAll('.share-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    alert(`模擬分享到 ${this.textContent.trim()}`);
                    sharePanel.remove();
                });
            });
        }
    }

    // 刪除記錄
    function deleteRecord(index) {
        if (index < 0 || index >= records.length) return;
        
        if (confirm('確定要刪除這條旅行記錄嗎？這個操作不可恢復。')) {
            records.splice(index, 1);
            saveRecordsToStorage();
            
            // 更新顯示
            document.getElementById('records-list').innerHTML = renderRecordsList();
            bindRecordItemEvents();
            
            // 如果記錄為空，顯示空記錄提示
            if (records.length === 0) {
                document.querySelector('.records-empty').classList.remove('hidden');
            }
        }
    }
    
    // 公共API
    const publicAPI = {
        init: init,
        openRecordPanel: openRecordPanel,
        getRecords: function() {
            return [...records];
        },
        addRecord: function(recordData) {
            if (!recordData.title || !recordData.date) {
                console.error('記錄必須包含標題和日期');
                return false;
            }
            
            const newRecord = {
                id: Date.now().toString(),
                title: recordData.title,
                date: recordData.date,
                description: recordData.description || '',
                photos: recordData.photos || [],
                createdAt: new Date().toISOString(),
                linkedItinerary: recordData.linkedItinerary || null
            };
            
            records.unshift(newRecord);
            saveRecordsToStorage();
            return true;
        }
    };
    
    // 在頁面載入完成後自動初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // 返回公共API
    return publicAPI;
})();

// 確保模組在全局範圍可用
window.TravelRecord = TravelRecord; 