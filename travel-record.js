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
        
        // 動態載入Word匯出所需的庫
        loadDependencies();
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
    
    // 添加載入Word匯出依賴庫的函數
    function loadDependencies() {
        console.log('載入Word匯出所需的庫...');
        
        // 添加狀態追蹤變數
        window.wordExportDependenciesLoaded = false;
        window.wordExportDependenciesLoading = true;
        
        // 檢查html-docx-js
        let htmlDocxLoaded = false;
        let fileSaverLoaded = false;
        
        // 嘗試從多個CDN加載html-docx-js
        function loadHtmlDocx() {
            if (typeof window.htmlDocx !== 'undefined') {
                console.log('html-docx-js庫已成功載入');
                htmlDocxLoaded = true;
                checkAllLoaded();
                return;
            }
            
            const script = document.createElement('script');
            script.onload = () => {
                console.log('html-docx-js庫已成功載入');
                htmlDocxLoaded = true;
                checkAllLoaded();
            };
            script.onerror = () => {
                console.error('無法從CDN載入html-docx-js庫，嘗試備用來源');
                // 嘗試備用CDN
                const backupScript = document.createElement('script');
                backupScript.src = 'https://cdn.jsdelivr.net/npm/html-docx-js@0.3.1/dist/html-docx.min.js';
                backupScript.async = true;
                backupScript.onload = () => {
                    console.log('html-docx-js庫已從備用來源成功載入');
                    htmlDocxLoaded = true;
                    checkAllLoaded();
                };
                backupScript.onerror = () => {
                    console.error('所有來源都無法載入html-docx-js庫');
                    window.wordExportDependenciesLoading = false;
                };
                document.head.appendChild(backupScript);
            };
            script.src = 'https://unpkg.com/html-docx-js/dist/html-docx.min.js';
            script.async = true;
            document.head.appendChild(script);
        }
        
        // 嘗試從多個CDN加載FileSaver.js
        function loadFileSaver() {
            if (typeof window.saveAs !== 'undefined') {
                console.log('FileSaver.js庫已成功載入');
                fileSaverLoaded = true;
                checkAllLoaded();
                return;
            }
            
            const script = document.createElement('script');
            script.onload = () => {
                console.log('FileSaver.js庫已成功載入');
                fileSaverLoaded = true;
                checkAllLoaded();
            };
            script.onerror = () => {
                console.error('無法從CDN載入FileSaver.js庫，嘗試備用來源');
                // 嘗試備用CDN
                const backupScript = document.createElement('script');
                backupScript.src = 'https://cdn.jsdelivr.net/npm/file-saver@2.0.5/dist/FileSaver.min.js';
                backupScript.async = true;
                backupScript.onload = () => {
                    console.log('FileSaver.js庫已從備用來源成功載入');
                    fileSaverLoaded = true;
                    checkAllLoaded();
                };
                backupScript.onerror = () => {
                    console.error('所有來源都無法載入FileSaver.js庫');
                    window.wordExportDependenciesLoading = false;
                };
                document.head.appendChild(backupScript);
            };
            script.src = 'https://unpkg.com/file-saver/dist/FileSaver.min.js';
            script.async = true;
            document.head.appendChild(script);
        }
        
        // 檢查是否所有依賴項都已加載
        function checkAllLoaded() {
            if (htmlDocxLoaded && fileSaverLoaded) {
                console.log('所有Word匯出所需的庫已成功載入，功能準備就緒');
                window.wordExportDependenciesLoaded = true;
                window.wordExportDependenciesLoading = false;
                
                // 如果有待處理的匯出操作，現在執行它
                if (window.pendingExportIndices) {
                    console.log('執行待處理的匯出操作');
                    generateWordDocument(window.pendingExportIndices);
                    window.pendingExportIndices = null;
                }
            }
        }
        
        // 開始加載兩個庫
        loadHtmlDocx();
        loadFileSaver();
        
        // 設置超時檢查，確保加載過程不會無限期卡住
        setTimeout(() => {
            if (!window.wordExportDependenciesLoaded && window.wordExportDependenciesLoading) {
                console.warn('庫載入超時，載入過程可能卡住');
                window.wordExportDependenciesLoading = false;
            }
        }, 20000); // 20秒超時
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
                <div class="records-actions">
                    <button id="export-records-btn" class="action-btn" title="將記錄匯出為JSON檔案">
                        <i class="fas fa-file-export"></i> 匯出JSON
                    </button>
                    <button id="export-records-word-btn" class="action-btn" title="將記錄匯出為Word檔案">
                        <i class="fas fa-file-word"></i> 匯出Word
                    </button>
                    <button id="export-records-html-btn" class="action-btn" title="將記錄匯出為HTML檔案">
                        <i class="fas fa-file-code"></i> 匯出HTML
                    </button>
                    <button id="import-records-btn" class="action-btn" title="從JSON檔案匯入記錄">
                        <i class="fas fa-file-import"></i> 匯入JSON記錄
                    </button>
                </div>
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
                        <div class="rich-text-editor-container">
                            <div class="rich-text-toolbar">
                                <!-- 字體相關選項分組 -->
                                <div class="toolbar-group">
                                    <select class="toolbar-item font-family" title="選擇字型">
                                        <option value="inherit">預設字型</option>
                                        <option value="'微軟正黑體', 'Microsoft JhengHei'">微軟正黑體</option>
                                        <option value="'新細明體', 'PMingLiU'">新細明體</option>
                                        <option value="'標楷體', 'DFKai-SB'">標楷體</option>
                                        <option value="Arial, sans-serif">Arial</option>
                                        <option value="'Times New Roman', serif">Times New Roman</option>
                                    </select>
                                    <select class="toolbar-item font-size" title="選擇字體大小">
                                        <option value="1">小</option>
                                        <option value="2">正常</option>
                                        <option value="3">中</option>
                                        <option value="4">大</option>
                                        <option value="5">較大</option>
                                    </select>
                                </div>
                                
                                <!-- 文字樣式分組 -->
                                <div class="toolbar-group">
                                    <button type="button" class="toolbar-item" data-command="bold" title="粗體 (Ctrl+B)"><i class="fas fa-bold"></i></button>
                                    <button type="button" class="toolbar-item" data-command="italic" title="斜體 (Ctrl+I)"><i class="fas fa-italic"></i></button>
                                    <button type="button" class="toolbar-item" data-command="underline" title="底線 (Ctrl+U)"><i class="fas fa-underline"></i></button>
                                    <button type="button" class="toolbar-item" data-command="foreColor" data-value="#000000" title="文字顏色"><i class="fas fa-font"></i></button>
                                    <input type="color" class="color-picker" value="#000000" title="選擇顏色">
                                </div>
                                
                                <!-- 對齊方式分組 -->
                                <div class="toolbar-group">
                                    <button type="button" class="toolbar-item" data-command="justifyLeft" title="靠左對齊"><i class="fas fa-align-left"></i></button>
                                    <button type="button" class="toolbar-item" data-command="justifyCenter" title="置中對齊"><i class="fas fa-align-center"></i></button>
                                    <button type="button" class="toolbar-item" data-command="justifyRight" title="靠右對齊"><i class="fas fa-align-right"></i></button>
                                </div>
                                
                                <!-- 列表分組 -->
                                <div class="toolbar-group">
                                    <button type="button" class="toolbar-item" data-command="insertUnorderedList" title="項目符號清單"><i class="fas fa-list-ul"></i></button>
                                    <button type="button" class="toolbar-item" data-command="insertOrderedList" title="編號清單"><i class="fas fa-list-ol"></i></button>
                                </div>
                            </div>
                            <div id="record-description" class="rich-text-editor" contenteditable="true"></div>
                            <input type="hidden" id="record-description-html">
                        </div>
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
            
            // 初始化富文本編輯器
            initRichTextEditor();
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
            // 確保切換到創建標籤頁時初始化富文本編輯器
            setTimeout(initRichTextEditor, 0);
        });
        
        document.getElementById('record-photos').addEventListener('change', handlePhotoUpload);
        
        document.getElementById('record-form').addEventListener('submit', function(e) {
            e.preventDefault();
            saveNewRecord();
        });
        
        document.getElementById('cancel-record').addEventListener('click', function() {
            panel.remove();
        });
        
        // 添加匯出記錄按鈕事件
        document.getElementById('export-records-btn').addEventListener('click', exportRecords);
        
        // 添加匯出Word記錄按鈕事件
        document.getElementById('export-records-word-btn').addEventListener('click', exportRecordsToWord);
        
        // 添加匯出HTML記錄按鈕事件
        document.getElementById('export-records-html-btn').addEventListener('click', exportRecordsToHTML);
        
        // 添加匯入記錄按鈕事件
        document.getElementById('import-records-btn').addEventListener('click', importRecords);
        
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
            
            // 使用div顯示HTML格式的描述，但限制長度
            let description = record.description || '沒有描述';
            // 移除HTML標籤以計算文字長度，並截斷過長的描述
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = description;
            const textContent = tempDiv.textContent || tempDiv.innerText || '';
            if (textContent.length > 150) {
                // 顯示截斷的描述文字，保留原HTML格式
                description = `<div class="truncated-description">${description}</div>`;
            }
            
            return `
                <div class="record-item" data-index="${index}">
                    <div class="record-preview">
                        ${photoHtml}
                        <div class="record-info">
                            <h3>${record.title}</h3>
                            <div class="record-date">${formatDate(record.date)}</div>
                            <div class="record-description">${description}</div>
                        </div>
                    </div>
                    <div class="record-actions">
                        <button class="view-record-btn" data-index="${index}">查看詳情</button>
                        <button class="edit-record-btn" data-index="${index}">編輯</button>
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
        
        // 編輯按鈕
        document.querySelectorAll('.edit-record-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                editRecord(index);
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
        
        console.log('處理照片上傳，文件數量:', files.length);
        
        const previewContainer = document.getElementById('photo-preview');
        // 不清空已有照片，允許添加新照片
        // previewContainer.innerHTML = '';
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (!file.type.startsWith('image/')) {
                console.warn('跳過非圖片文件:', file.name);
                continue;
            }
            
            console.log('處理照片文件:', file.name, file.type);
            
            const reader = new FileReader();
            reader.onload = function(e) {
                console.log('照片文件讀取成功');
                
                const previewItem = document.createElement('div');
                previewItem.className = 'photo-preview-item';
                previewItem.innerHTML = `
                    <img src="${e.target.result}" alt="預覽照片">
                    <button type="button" class="remove-photo">&times;</button>
                `;
                previewContainer.appendChild(previewItem);
                
                // 添加刪除照片的事件
                previewItem.querySelector('.remove-photo').addEventListener('click', function() {
                    previewItem.remove();
                });
            };
            
            reader.onerror = function(e) {
                console.error('照片文件讀取失敗:', e);
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    // 保存新記錄
    function saveNewRecord() {
        const titleInput = document.getElementById('record-title');
        const dateInput = document.getElementById('record-date');
        const descriptionEditor = document.getElementById('record-description');
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
        
        console.log('保存記錄，找到照片數量:', previewImages.length);
        
        previewImages.forEach((img, idx) => {
            console.log(`處理照片 ${idx+1}，src長度:`, img.src.length);
            // 確保照片數據有效
            if (img.src && img.src.startsWith('data:image/')) {
                photos.push(img.src);
            } else {
                console.warn(`照片 ${idx+1} 格式異常，跳過`);
            }
        });
        
        console.log('有效照片數量:', photos.length);
        
        // 獲取富文本編輯器的HTML內容
        const description = descriptionEditor.innerHTML;
        
        // 創建新記錄
        const newRecord = {
            id: Date.now().toString(),
            title: titleInput.value.trim(),
            date: dateInput.value,
            description: description,
            photos: photos,
            createdAt: new Date().toISOString(),
            linkedItinerary: linkItineraryCheck.checked ? getCurrentItinerary() : null
        };
        
        console.log('創建新記錄:', newRecord.title, '照片數量:', newRecord.photos.length);
        
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
        document.getElementById('record-description').innerHTML = '';
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
        
        console.log('查看記錄詳情，索引:', index);
        currentRecord = records[index];
        console.log('查看的記錄:', currentRecord);
        console.log('照片數量:', currentRecord.photos ? currentRecord.photos.length : 0);
        
        // 創建記錄詳情面板
        const detailPanel = document.createElement('div');
        detailPanel.id = 'record-detail-panel';
        detailPanel.className = 'record-detail-panel';
        
        // 構建照片幻燈片
        let photosHtml = '';
        if (currentRecord.photos && currentRecord.photos.length > 0) {
            console.log('處理照片幻燈片，照片列表:', currentRecord.photos);
            
            photosHtml = `
                <div class="record-photos-slider">
                    ${currentRecord.photos.map((photo, idx) => `
                        <div class="record-photo-slide ${idx === 0 ? 'active' : ''}">
                            <img src="${photo}" alt="${currentRecord.title || '旅行照片'}" onload="console.log('照片${idx+1}載入成功')" onerror="console.error('照片${idx+1}載入失敗')">
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
        
        // 構建詳情內容，直接顯示HTML格式的旅行描述
        detailPanel.innerHTML = `
            <div class="detail-panel-header">
                <h2>${currentRecord.title || '未命名記錄'}</h2>
                <button id="close-detail-panel" class="close-btn">&times;</button>
            </div>
            <div class="detail-panel-content">
                ${photosHtml}
                <div class="detail-info">
                    <div class="detail-date">旅行日期: ${formatDate(currentRecord.date)}</div>
                    <div class="detail-description">
                        <h3>旅行描述</h3>
                        <div class="formatted-description">${currentRecord.description || '沒有描述'}</div>
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
        
        // 確保面板可見
        setTimeout(() => {
            const panelEl = document.getElementById('record-detail-panel');
            if (panelEl) {
                panelEl.style.display = 'flex';
                panelEl.style.zIndex = '1100';
            }
        }, 0);
        
        // 添加關閉按鈕事件
        document.getElementById('close-detail-panel').addEventListener('click', function() {
            detailPanel.remove();
        });
        
        // 如果有照片，設置幻燈片導航
        if (currentRecord.photos && currentRecord.photos.length > 1) {
            let currentSlide = 0;
            const slides = detailPanel.querySelectorAll('.record-photo-slide');
            
            console.log('找到幻燈片元素數量:', slides.length);
            
            // 檢查是否已經有active類，如果沒有則添加到第一張
            let hasActive = false;
            slides.forEach((slide, idx) => {
                if (slide.classList.contains('active')) {
                    hasActive = true;
                    currentSlide = idx;
                }
            });
            
            if (!hasActive && slides.length > 0) {
                slides[0].classList.add('active');
            }
            
            // 上一張按鈕
            const prevBtn = detailPanel.querySelector('.slide-nav.prev');
            if (prevBtn) {
                prevBtn.addEventListener('click', function() {
                    console.log('點擊上一張，當前索引:', currentSlide);
                    slides[currentSlide].classList.remove('active');
                    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                    slides[currentSlide].classList.add('active');
                    console.log('新索引:', currentSlide);
                });
            }
            
            // 下一張按鈕
            const nextBtn = detailPanel.querySelector('.slide-nav.next');
            if (nextBtn) {
                nextBtn.addEventListener('click', function() {
                    console.log('點擊下一張，當前索引:', currentSlide);
                    slides[currentSlide].classList.remove('active');
                    currentSlide = (currentSlide + 1) % slides.length;
                    slides[currentSlide].classList.add('active');
                    console.log('新索引:', currentSlide);
                });
            }
        }
        
        // 如果有關聯行程，添加查看行程按鈕事件
        if (currentRecord.linkedItinerary) {
            const itineraryBtn = document.getElementById('view-linked-itinerary');
            if (itineraryBtn) {
                itineraryBtn.addEventListener('click', function() {
                    // 這裡應該調用主應用的加載行程功能
                    if (window.loadItinerary && typeof window.loadItinerary === 'function') {
                        window.loadItinerary(currentRecord.linkedItinerary);
                        detailPanel.remove();
                    }
                });
            }
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
    
    // 匯出記錄為JSON檔案
    function exportRecords() {
        if (records.length === 0) {
            alert('沒有可匯出的旅行記錄');
            return;
        }
        
        try {
            // 準備匯出數據
            const exportData = {
                records: records,
                exportDate: new Date().toISOString(),
                exportVersion: '1.0'
            };
            
            // 轉換為JSON字符串
            const jsonData = JSON.stringify(exportData, null, 2);
            
            // 創建Blob對象
            const blob = new Blob([jsonData], { type: 'application/json' });
            
            // 創建臨時URL
            const url = URL.createObjectURL(blob);
            
            // 創建下載連結
            const downloadLink = document.createElement('a');
            downloadLink.href = url;
            
            // 設置檔案名稱 (使用當前日期)
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
            downloadLink.download = `travel-records-${dateStr}.json`;
            
            // 添加到頁面並模擬點擊
            document.body.appendChild(downloadLink);
            downloadLink.click();
            
            // 清理
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
            
            alert('旅行記錄已成功匯出');
        } catch (error) {
            console.error('匯出記錄時出錯:', error);
            alert('匯出記錄時發生錯誤，請稍後再試');
        }
    }
    
    // 從JSON檔案匯入記錄
    function importRecords() {
        // 創建檔案輸入元素
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'application/json';
        
        // 添加檔案選擇事件
        fileInput.addEventListener('change', function(e) {
            if (!fileInput.files || fileInput.files.length === 0) return;
            
            const file = fileInput.files[0];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    // 解析JSON數據
                    const importedData = JSON.parse(e.target.result);
                    
                    // 驗證數據格式
                    if (!importedData.records || !Array.isArray(importedData.records)) {
                        throw new Error('無效的記錄格式');
                    }
                    
                    if (importedData.records.length === 0) {
                        alert('匯入的檔案不包含任何記錄');
                        return;
                    }
                    
                    // 詢問用戶是替換還是合併記錄
                    const importAction = confirm('是否要將匯入的記錄合併到現有記錄中？\n（點擊"確定"合併，點擊"取消"替換所有現有記錄）');
                    
                    if (importAction) {
                        // 合併記錄
                        const oldCount = records.length;
                        
                        // 創建ID集合以避免重複
                        const existingIds = new Set(records.map(r => r.id));
                        
                        // 添加不重複的記錄
                        let addedCount = 0;
                        importedData.records.forEach(record => {
                            // 確保每條記錄有唯一ID
                            if (!record.id || existingIds.has(record.id)) {
                                record.id = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
                            }
                            records.unshift(record);
                            existingIds.add(record.id);
                            addedCount++;
                        });
                        
                        alert(`已成功合併 ${addedCount} 條記錄，現有總記錄數: ${records.length}`);
                    } else {
                        // 替換記錄
                        records = importedData.records;
                        alert(`已成功匯入 ${records.length} 條記錄，原有記錄已替換`);
                    }
                    
                    // 保存到本地存儲
                    saveRecordsToStorage();
                    
                    // 更新顯示
                    document.getElementById('records-list').innerHTML = renderRecordsList();
                    bindRecordItemEvents();
                    
                    // 隱藏空記錄提示
                    if (records.length > 0) {
                        document.querySelector('.records-empty').classList.add('hidden');
                    }
                } catch (error) {
                    console.error('匯入記錄時出錯:', error);
                    alert('匯入記錄時發生錯誤，請確保檔案格式正確');
                }
            };
            
            reader.readAsText(file);
        });
        
        // 模擬點擊打開檔案選擇對話框
        fileInput.click();
    }
    
    // 編輯記錄
    function editRecord(index) {
        if (index < 0 || index >= records.length) return;
        
        console.log('開始編輯記錄，索引:', index);
        
        // 獲取要編輯的記錄
        const recordToEdit = records[index];
        console.log('要編輯的記錄:', recordToEdit);
        
        // 創建新面板，不使用通用的記錄面板
        const existingPanel = document.getElementById('edit-record-panel');
        if (existingPanel) {
            existingPanel.remove();
        }
        
        // 創建編輯專用面板
        const panel = document.createElement('div');
        panel.id = 'edit-record-panel';
        panel.className = 'record-panel';
        
        // 設置編輯面板內容，添加富文本編輯器
        panel.innerHTML = `
            <div class="record-panel-header">
                <h2>編輯旅行記錄</h2>
                <button id="close-edit-panel" class="close-btn">&times;</button>
            </div>
            <div class="edit-panel-content">
                <form id="edit-record-form">
                    <div class="form-group">
                        <label for="edit-title">旅行標題</label>
                        <input type="text" id="edit-title" required value="${recordToEdit.title || ''}">
                    </div>
                    <div class="form-group">
                        <label for="edit-date">旅行日期</label>
                        <input type="date" id="edit-date" required value="${recordToEdit.date || ''}">
                    </div>
                    <div class="form-group">
                        <label for="edit-description">旅行描述</label>
                        <div class="rich-text-editor-container">
                            <div class="rich-text-toolbar">
                                <!-- 字體相關選項分組 -->
                                <div class="toolbar-group">
                                    <select class="toolbar-item font-family" title="選擇字型">
                                        <option value="inherit">預設字型</option>
                                        <option value="'微軟正黑體', 'Microsoft JhengHei'">微軟正黑體</option>
                                        <option value="'新細明體', 'PMingLiU'">新細明體</option>
                                        <option value="'標楷體', 'DFKai-SB'">標楷體</option>
                                        <option value="Arial, sans-serif">Arial</option>
                                        <option value="'Times New Roman', serif">Times New Roman</option>
                                    </select>
                                    <select class="toolbar-item font-size" title="選擇字體大小">
                                        <option value="1">小</option>
                                        <option value="2">正常</option>
                                        <option value="3">中</option>
                                        <option value="4">大</option>
                                        <option value="5">較大</option>
                                    </select>
                                </div>
                                
                                <!-- 文字樣式分組 -->
                                <div class="toolbar-group">
                                    <button type="button" class="toolbar-item" data-command="bold" title="粗體 (Ctrl+B)"><i class="fas fa-bold"></i></button>
                                    <button type="button" class="toolbar-item" data-command="italic" title="斜體 (Ctrl+I)"><i class="fas fa-italic"></i></button>
                                    <button type="button" class="toolbar-item" data-command="underline" title="底線 (Ctrl+U)"><i class="fas fa-underline"></i></button>
                                    <button type="button" class="toolbar-item" data-command="foreColor" data-value="#000000" title="文字顏色"><i class="fas fa-font"></i></button>
                                    <input type="color" class="color-picker" value="#000000" title="選擇顏色">
                                </div>
                                
                                <!-- 對齊方式分組 -->
                                <div class="toolbar-group">
                                    <button type="button" class="toolbar-item" data-command="justifyLeft" title="靠左對齊"><i class="fas fa-align-left"></i></button>
                                    <button type="button" class="toolbar-item" data-command="justifyCenter" title="置中對齊"><i class="fas fa-align-center"></i></button>
                                    <button type="button" class="toolbar-item" data-command="justifyRight" title="靠右對齊"><i class="fas fa-align-right"></i></button>
                                </div>
                                
                                <!-- 列表分組 -->
                                <div class="toolbar-group">
                                    <button type="button" class="toolbar-item" data-command="insertUnorderedList" title="項目符號清單"><i class="fas fa-list-ul"></i></button>
                                    <button type="button" class="toolbar-item" data-command="insertOrderedList" title="編號清單"><i class="fas fa-list-ol"></i></button>
                                </div>
                            </div>
                            <div id="edit-description" class="rich-text-editor" contenteditable="true"></div>
                            <input type="hidden" id="edit-description-html">
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="edit-photos">上傳新照片</label>
                        <input type="file" id="edit-photos" multiple accept="image/*">
                    </div>
                    <div class="form-group">
                        <label>現有照片</label>
                        <div id="edit-photo-preview" class="photo-preview"></div>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="edit-link-itinerary" ${recordToEdit.linkedItinerary ? 'checked' : ''}> 連結當前行程
                        </label>
                        <p class="form-hint">將當前規劃的行程與此記錄關聯，以便日後查看</p>
                    </div>
                    <div class="form-actions">
                        <button type="submit" id="update-record" class="primary-btn">更新記錄</button>
                        <button type="button" id="cancel-edit" class="secondary-btn">取消</button>
                    </div>
                </form>
            </div>
        `;
        
        // 添加面板到頁面
        document.body.appendChild(panel);
        
        // 初始化富文本編輯器
        setTimeout(() => {
            // 確保添加初始樣式，使面板可見
            panel.style.display = 'flex';
            panel.style.zIndex = '1000';
            
            // 初始化富文本編輯器
            const editor = document.getElementById('edit-description');
            const toolbar = panel.querySelector('.rich-text-toolbar');
            const hiddenInput = document.getElementById('edit-description-html');
            
            if (editor && toolbar) {
                // 設置編輯器初始內容為記錄的描述
                editor.innerHTML = recordToEdit.description || '';
                
                // 監聽編輯器內容變化，更新隱藏的input
                editor.addEventListener('input', function() {
                    if (hiddenInput) hiddenInput.value = editor.innerHTML;
                });
                
                // 為工具欄按鈕添加事件
                toolbar.querySelectorAll('button.toolbar-item').forEach(button => {
                    button.addEventListener('click', function(e) {
                        e.preventDefault();
                        const command = this.dataset.command;
                        
                        // 切換按鈕的激活狀態 (適用於開關式功能)
                        if (['bold', 'italic', 'underline'].includes(command)) {
                            this.classList.toggle('active');
                        }
                        
                        if (command === 'foreColor') {
                            const colorPicker = toolbar.querySelector('.color-picker');
                            document.execCommand(command, false, colorPicker.value);
                        } else if (this.dataset.value) {
                            document.execCommand(command, false, this.dataset.value);
                        } else {
                            document.execCommand(command, false, null);
                        }
                        
                        editor.focus();
                    });
                });
                
                // 字體下拉選單
                toolbar.querySelector('.font-family').addEventListener('change', function() {
                    document.execCommand('fontName', false, this.value);
                    editor.focus();
                });
                
                // 字體大小下拉選單
                toolbar.querySelector('.font-size').addEventListener('change', function() {
                    document.execCommand('fontSize', false, this.value);
                    editor.focus();
                });
                
                // 顏色選擇器
                const colorPicker = toolbar.querySelector('.color-picker');
                colorPicker.addEventListener('input', function() {
                    const colorButton = toolbar.querySelector('[data-command="foreColor"]');
                    colorButton.dataset.value = this.value;
                    document.execCommand('foreColor', false, this.value);
                    editor.focus();
                });
                
                // 點擊顏色按鈕時打開顏色選擇器
                toolbar.querySelector('[data-command="foreColor"]').addEventListener('click', function() {
                    colorPicker.click();
                });
            }
        }, 0);
        
        // 添加關閉按鈕事件
        document.getElementById('close-edit-panel').addEventListener('click', () => {
            panel.remove();
        });
        
        // 取消按鈕事件
        document.getElementById('cancel-edit').addEventListener('click', () => {
            panel.remove();
        });
        
        // 如果有現有照片，顯示它們
        const photoPreview = document.getElementById('edit-photo-preview');
        if (recordToEdit.photos && recordToEdit.photos.length > 0) {
            recordToEdit.photos.forEach((photoSrc, i) => {
                const photoItem = document.createElement('div');
                photoItem.className = 'photo-preview-item';
                photoItem.innerHTML = `
                    <img src="${photoSrc}" alt="現有照片" data-original="true">
                    <button type="button" class="remove-photo" data-index="${i}">&times;</button>
                `;
                photoPreview.appendChild(photoItem);
                
                // 添加刪除照片的事件
                photoItem.querySelector('.remove-photo').addEventListener('click', function() {
                    photoItem.remove();
                });
            });
        }
        
        // 處理新照片上傳
        document.getElementById('edit-photos').addEventListener('change', function(event) {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                if (!file.type.startsWith('image/')) continue;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    const photoItem = document.createElement('div');
                    photoItem.className = 'photo-preview-item';
                    photoItem.innerHTML = `
                        <img src="${e.target.result}" alt="新上傳照片" data-original="false">
                        <button type="button" class="remove-photo">&times;</button>
                    `;
                    photoPreview.appendChild(photoItem);
                    
                    // 添加刪除照片事件
                    photoItem.querySelector('.remove-photo').addEventListener('click', function() {
                        photoItem.remove();
                    });
                };
                reader.readAsDataURL(file);
            }
        });
        
        // 修正提交表單事件處理
        document.getElementById('edit-record-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            console.log('準備更新記錄...');
            
            // 獲取表單數據
            const title = document.getElementById('edit-title').value.trim();
            const date = document.getElementById('edit-date').value;
            const descriptionEditor = document.getElementById('edit-description');
            const linkItinerary = document.getElementById('edit-link-itinerary').checked;
            
            // 獲取富文本編輯器的HTML內容
            const description = descriptionEditor.innerHTML;
            
            // 收集所有照片（保持現有順序）
            const photos = [];
            const photoElements = document.querySelectorAll('#edit-photo-preview img');
            
            console.log('編輯記錄，找到照片元素數量:', photoElements.length);
            
            photoElements.forEach((img, idx) => {
                console.log(`處理照片 ${idx+1}，src長度:`, img.src.length);
                // 確保照片數據有效
                if (img.src && (img.src.startsWith('data:image/') || img.src.startsWith('http'))) {
                    photos.push(img.src);
                } else {
                    console.warn(`照片 ${idx+1} 格式異常，跳過:`, img.src.substring(0, 30) + '...');
                }
            });
            
            console.log('有效照片數量:', photos.length);
            
            console.log('更新前記錄狀態:', JSON.stringify({
                id: recordToEdit.id,
                title: recordToEdit.title,
                date: recordToEdit.date,
                photosCount: recordToEdit.photos ? recordToEdit.photos.length : 0
            }));
            
            // 更新記錄對象
            recordToEdit.title = title;
            recordToEdit.date = date;
            recordToEdit.description = description;
            recordToEdit.photos = photos;
            recordToEdit.updatedAt = new Date().toISOString();
            recordToEdit.linkedItinerary = linkItinerary ? getCurrentItinerary() : null;
            
            console.log('更新後記錄狀態:', JSON.stringify({
                id: recordToEdit.id,
                title: recordToEdit.title,
                date: recordToEdit.date,
                photosCount: recordToEdit.photos.length
            }));
            console.log('更新的記錄索引:', index);
            
            // 直接替換記錄數組中的對象
            records[index] = recordToEdit;
            
            // 保存到本地存儲
            saveRecordsToStorage();
            
            // 關閉編輯面板
            panel.remove();
            
            // 刷新記錄面板（如果已打開）
            const recordPanel = document.getElementById('travel-record-panel');
            if (recordPanel) {
                document.getElementById('records-list').innerHTML = renderRecordsList();
                bindRecordItemEvents();
            }
            
            // 顯示成功消息
            alert('記錄已成功更新！');
        });
    }
    
    // 添加匯出為Word的功能
    function exportRecordsToWord() {
        if (records.length === 0) {
            alert('沒有可匯出的旅行記錄');
            return;
        }
        
        // 創建選擇對話框
        showExportSelectionDialog();
    }
    
    // 顯示匯出選擇對話框
    function showExportSelectionDialog() {
        // 移除已存在的對話框（如果有）
        const existingDialog = document.getElementById('export-selection-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }
        
        // 創建對話框
        const dialog = document.createElement('div');
        dialog.id = 'export-selection-dialog';
        dialog.className = 'record-panel';
        dialog.style.zIndex = '1200';
        
        // 生成記錄選擇列表的HTML
        let recordsOptionsHtml = '';
        records.forEach((record, index) => {
            // 獲取第一張照片或使用默認圖標
            const hasPhotos = record.photos && record.photos.length > 0;
            const photoHtml = hasPhotos ? 
                `<img src="${record.photos[0]}" alt="${record.title}" class="selection-thumbnail">` : 
                `<div class="no-photo-small"><i class="fas fa-image"></i></div>`;
            
            recordsOptionsHtml += `
                <div class="selection-item">
                    <label class="selection-label">
                        <input type="checkbox" class="record-selection" value="${index}" checked>
                        <div class="selection-preview">
                            ${photoHtml}
                            <div class="selection-info">
                                <div class="selection-title">${record.title || '未命名記錄'}</div>
                                <div class="selection-date">${formatDate(record.date)}</div>
                            </div>
                        </div>
                    </label>
                </div>
            `;
        });
        
        // 設置對話框內容
        dialog.innerHTML = `
            <div class="record-panel-header">
                <h2>選擇要匯出的記錄</h2>
                <button id="close-export-dialog" class="close-btn">&times;</button>
            </div>
            <div class="export-dialog-content">
                <p class="dialog-instruction">請選擇您想要匯出到Word檔案的旅行記錄：</p>
                
                <div class="selection-actions">
                    <button id="select-all-records" class="secondary-btn">全選</button>
                    <button id="deselect-all-records" class="secondary-btn">取消全選</button>
                </div>
                
                <div class="records-selection-list">
                    ${recordsOptionsHtml}
                </div>
                
                <div class="dialog-footer">
                    <button id="export-selected-word" class="primary-btn">匯出選定記錄</button>
                    <button id="cancel-export-dialog" class="secondary-btn">取消</button>
                </div>
            </div>
        `;
        
        // 添加到頁面
        document.body.appendChild(dialog);
        
        // 添加事件監聽器
        document.getElementById('close-export-dialog').addEventListener('click', () => {
            dialog.remove();
        });
        
        document.getElementById('cancel-export-dialog').addEventListener('click', () => {
            dialog.remove();
        });
        
        document.getElementById('select-all-records').addEventListener('click', () => {
            const checkboxes = dialog.querySelectorAll('.record-selection');
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
        });
        
        document.getElementById('deselect-all-records').addEventListener('click', () => {
            const checkboxes = dialog.querySelectorAll('.record-selection');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        });
        
        document.getElementById('export-selected-word').addEventListener('click', () => {
            // 獲取選中的記錄索引
            const selectedIndices = [];
            const checkboxes = dialog.querySelectorAll('.record-selection');
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    selectedIndices.push(parseInt(checkbox.value));
                }
            });
            
            if (selectedIndices.length === 0) {
                alert('請至少選擇一條記錄');
                return;
            }
            
            // 關閉對話框
            dialog.remove();
            
            // 匯出選中的記錄
            generateWordDocument(selectedIndices);
        });
    }
    
    // 生成Word文檔
    function generateWordDocument(selectedIndices) {
        // 檢查依賴庫是否已經載入
        if (typeof window.htmlDocx === 'undefined' || typeof window.saveAs === 'undefined') {
            console.error('匯出Word所需的庫尚未載入');
            
            // 如果庫正在加載，保存請求以便稍後處理
            if (window.wordExportDependenciesLoading) {
                console.log('庫正在加載中，保存匯出請求，稍後處理');
                window.pendingExportIndices = selectedIndices;
                
                // 顯示載入中提示
                const loadingMessage = document.createElement('div');
                loadingMessage.id = 'word-export-loading';
                loadingMessage.style.position = 'fixed';
                loadingMessage.style.top = '50%';
                loadingMessage.style.left = '50%';
                loadingMessage.style.transform = 'translate(-50%, -50%)';
                loadingMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                loadingMessage.style.color = 'white';
                loadingMessage.style.padding = '20px';
                loadingMessage.style.borderRadius = '5px';
                loadingMessage.style.zIndex = '9999';
                loadingMessage.innerHTML = '正在準備Word匯出功能，請稍候...';
                document.body.appendChild(loadingMessage);
                
                // 10秒後如果還沒完成，顯示提示並移除載入提示
                setTimeout(() => {
                    if (!window.wordExportDependenciesLoaded) {
                        const loadingEl = document.getElementById('word-export-loading');
                        if (loadingEl) {
                            loadingEl.remove();
                        }
                        
                        // 提供備用選項
                        if (confirm('無法載入Word匯出功能，是否要使用備用方案匯出HTML格式？')) {
                            exportAsHTML(selectedIndices);
                        } else {
                            alert('匯出已取消。您可以稍後再試，或檢查網絡連接。');
                        }
                        window.pendingExportIndices = null;
                    }
                }, 10000);
                
                return;
            }
            
            // 如果庫未在加載，嘗試重新加載
            console.log('嘗試重新載入所需的庫...');
            loadDependencies();
            
            if (confirm('匯出Word功能尚未準備好，是否要使用備用方案匯出HTML格式？')) {
                exportAsHTML(selectedIndices);
            } else {
                alert('系統正在嘗試載入必要元件，請稍後再試');
            }
            return;
        }
        
        try {
            // 篩選選中的記錄
            const selectedRecords = selectedIndices.map(index => records[index]);
            
            // 創建HTML內容
            let htmlContent = generateHTMLContent(selectedRecords);
            
            console.log('生成Word檔案的HTML已準備好');
            
            // 在轉換前顯示載入中提示
            const loadingMessage = document.createElement('div');
            loadingMessage.style.position = 'fixed';
            loadingMessage.style.top = '50%';
            loadingMessage.style.left = '50%';
            loadingMessage.style.transform = 'translate(-50%, -50%)';
            loadingMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            loadingMessage.style.color = 'white';
            loadingMessage.style.padding = '20px';
            loadingMessage.style.borderRadius = '5px';
            loadingMessage.style.zIndex = '9999';
            loadingMessage.innerHTML = '正在生成Word文件，請稍候...';
            document.body.appendChild(loadingMessage);
            
            // 使用setTimeout來確保UI更新
            setTimeout(() => {
                try {
                    // 轉換為Word檔案
                    const converted = window.htmlDocx.asBlob(htmlContent, {
                        orientation: 'portrait',
                        margins: {
                            top: 1440,   // 上邊距 (1英吋 = 1440)
                            right: 1440, // 右邊距
                            bottom: 1440, // 下邊距
                            left: 1440,  // 左邊距
                            header: 720,  // 頁首
                            footer: 720   // 頁尾
                        }
                    });
                    
                    // 設置檔案名稱
                    const now = new Date();
                    const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
                    const fileName = `旅行記錄-${dateStr}.docx`;
                    
                    // 下載檔案
                    window.saveAs(converted, fileName);
                    
                    // 移除載入中提示
                    document.body.removeChild(loadingMessage);
                    
                    alert('旅行記錄已成功匯出為Word檔案');
                } catch (error) {
                    // 移除載入中提示
                    document.body.removeChild(loadingMessage);
                    console.error('匯出Word檔案時出錯:', error);
                    
                    // 提供備用選項
                    if (confirm('生成Word檔案時出錯，是否要使用備用方案匯出HTML格式？')) {
                        exportAsHTML(selectedIndices);
                    } else {
                        alert('匯出Word檔案時發生錯誤: ' + (error.message || '未知錯誤') + '\n請稍後再試');
                    }
                }
            }, 100);
        } catch (error) {
            console.error('準備匯出Word檔案時出錯:', error);
            
            // 提供備用選項
            if (confirm('準備匯出時出錯，是否要使用備用方案匯出HTML格式？')) {
                exportAsHTML(selectedIndices);
            } else {
                alert('準備匯出Word檔案時發生錯誤: ' + (error.message || '未知錯誤') + '\n請稍後再試');
            }
        }
    }
    
    // 生成HTML內容
    function generateHTMLContent(selectedRecords) {
        // 創建HTML內容
        let htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>旅行記錄匯出</title>
                <style>
                    body {
                        font-family: "微軟正黑體", "Microsoft JhengHei", Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        padding: 20px;
                    }
                    .record {
                        margin-bottom: 40px;
                        border-bottom: 1px solid #eaeaea;
                        padding-bottom: 30px;
                    }
                    .record:last-child {
                        border-bottom: none;
                    }
                    .record-title {
                        font-size: 24px;
                        color: #4a89dc;
                        margin-bottom: 10px;
                        font-weight: bold;
                    }
                    .record-date {
                        font-size: 14px;
                        color: #666;
                        margin-bottom: 15px;
                    }
                    .record-description {
                        font-size: 16px;
                        line-height: 1.6;
                        margin-bottom: 20px;
                        text-align: justify;
                    }
                    .record-photos {
                        margin-top: 20px;
                    }
                    .photo-container {
                        break-inside: avoid;
                        margin-bottom: 20px;
                    }
                    .record-photo {
                        max-width: 100%;
                        display: block;
                        margin-bottom: 8px;
                    }
                    .record-photo img {
                        max-width: 100%;
                        height: auto;
                        display: block;
                        margin: 0 auto;
                    }
                    .photo-caption {
                        font-size: 12px;
                        color: #666;
                        text-align: center;
                        margin-top: 5px;
                    }
                    h1.document-title {
                        text-align: center;
                        color: #4a89dc;
                        margin: 20px 0 40px 0;
                        font-size: 28px;
                        border-bottom: 2px solid #4a89dc;
                        padding-bottom: 10px;
                    }
                    .page-break {
                        page-break-after: always;
                    }
                    .header-info {
                        text-align: right;
                        color: #888;
                        font-size: 12px;
                        margin-bottom: 30px;
                    }
                </style>
            </head>
            <body>
                <h1 class="document-title">我的旅行記錄</h1>
                <div class="header-info">
                    匯出日期: ${formatDate(new Date().toISOString().slice(0, 10))}
                </div>
        `;
        
        // 添加每條記錄
        selectedRecords.forEach((record, index) => {
            htmlContent += `
                <div class="record">
                    <div class="record-title">${record.title || '未命名記錄'}</div>
                    <div class="record-date">旅行日期: ${formatDate(record.date)}</div>
                    <div class="record-description">${record.description || '沒有描述'}</div>
            `;
            
            // 添加照片（優化照片處理方式）
            if (record.photos && record.photos.length > 0) {
                htmlContent += `<div class="record-photos">`;
                
                // 限制每個記錄的照片數量，避免文件過大
                const maxPhotos = 10;
                const photos = record.photos.slice(0, maxPhotos);
                
                photos.forEach((photo, photoIndex) => {
                    // 確保照片URL有效
                    let photoSrc = photo;
                    
                    // 安全地處理照片URL
                    if (!photoSrc || (!photoSrc.startsWith('data:image/') && !photoSrc.startsWith('http'))) {
                        console.warn(`跳過無效照片URL: ${photoSrc && photoSrc.substring(0, 30)}...`);
                        return;
                    }
                    
                    try {
                        // 確保資料URL不超過一定長度，避免Word生成問題
                        if (photoSrc.startsWith('data:image/') && photoSrc.length > 500000) {
                            console.warn(`照片 ${photoIndex + 1} 資料過大，嘗試壓縮`);
                            // 這裡可以添加壓縮邏輯，但目前只是記錄警告
                        }
                        
                        htmlContent += `
                            <div class="photo-container">
                                <div class="record-photo">
                                    <img src="${photoSrc}" alt="${record.title}的照片 ${photoIndex + 1}">
                                </div>
                                <div class="photo-caption">${record.title}的照片 ${photoIndex + 1}</div>
                            </div>
                        `;
                    } catch (photoError) {
                        console.error(`處理照片 ${photoIndex + 1} 時出錯:`, photoError);
                    }
                });
                
                if (record.photos.length > maxPhotos) {
                    htmlContent += `
                        <div class="photo-container">
                            <div class="photo-caption">還有 ${record.photos.length - maxPhotos} 張照片未顯示</div>
                        </div>
                    `;
                }
                
                htmlContent += `</div>`;
            }
            
            htmlContent += `</div>`;
            
            // 添加分頁符(除了最後一條記錄)
            if (index < selectedRecords.length - 1) {
                htmlContent += `<div class="page-break"></div>`;
            }
        });
        
        htmlContent += `
            </body>
            </html>
        `;
        
        return htmlContent;
    }
    
    // 備用方案：匯出為HTML檔案
    function exportAsHTML(selectedIndices) {
        try {
            // 顯示載入中提示
            const loadingMessage = document.createElement('div');
            loadingMessage.style.position = 'fixed';
            loadingMessage.style.top = '50%';
            loadingMessage.style.left = '50%';
            loadingMessage.style.transform = 'translate(-50%, -50%)';
            loadingMessage.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
            loadingMessage.style.color = 'white';
            loadingMessage.style.padding = '20px';
            loadingMessage.style.borderRadius = '5px';
            loadingMessage.style.zIndex = '9999';
            loadingMessage.innerHTML = '正在生成HTML檔案，請稍候...';
            document.body.appendChild(loadingMessage);
            
            // 篩選選中的記錄
            const selectedRecords = selectedIndices.map(index => records[index]);
            
            // 創建HTML內容
            let htmlContent = generateHTMLContent(selectedRecords);
            
            // 創建Blob對象
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            
            // 創建下載連結
            const downloadLink = document.createElement('a');
            downloadLink.href = URL.createObjectURL(blob);
            
            // 設置檔案名稱
            const now = new Date();
            const dateStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
            downloadLink.download = `旅行記錄-${dateStr}.html`;
            
            // 添加到頁面並模擬點擊
            document.body.appendChild(downloadLink);
            downloadLink.click();
            
            // 清理
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(downloadLink.href);
            
            // 移除載入中提示
            document.body.removeChild(loadingMessage);
            
            alert('旅行記錄已成功匯出為HTML檔案！\n您可以使用瀏覽器開啟此檔案查看，或複製內容到Word中。');
        } catch (error) {
            console.error('匯出HTML檔案時出錯:', error);
            alert('匯出HTML檔案時發生錯誤: ' + (error.message || '未知錯誤'));
        }
    }
    
    // 添加直接匯出HTML的功能
    function exportRecordsToHTML() {
        if (records.length === 0) {
            alert('沒有可匯出的旅行記錄');
            return;
        }
        
        // 創建選擇對話框，讓用戶選擇要匯出的記錄
        const existingDialog = document.getElementById('export-selection-dialog');
        if (existingDialog) {
            existingDialog.remove();
        }
        
        // 創建對話框
        const dialog = document.createElement('div');
        dialog.id = 'export-selection-dialog';
        dialog.className = 'record-panel';
        dialog.style.zIndex = '1200';
        
        // 生成記錄選擇列表的HTML
        let recordsOptionsHtml = '';
        records.forEach((record, index) => {
            // 獲取第一張照片或使用默認圖標
            const hasPhotos = record.photos && record.photos.length > 0;
            const photoHtml = hasPhotos ? 
                `<img src="${record.photos[0]}" alt="${record.title}" class="selection-thumbnail">` : 
                `<div class="no-photo-small"><i class="fas fa-image"></i></div>`;
            
            recordsOptionsHtml += `
                <div class="selection-item">
                    <label class="selection-label">
                        <input type="checkbox" class="record-selection" value="${index}" checked>
                        <div class="selection-preview">
                            ${photoHtml}
                            <div class="selection-info">
                                <div class="selection-title">${record.title || '未命名記錄'}</div>
                                <div class="selection-date">${formatDate(record.date)}</div>
                            </div>
                        </div>
                    </label>
                </div>
            `;
        });
        
        // 設置對話框內容
        dialog.innerHTML = `
            <div class="record-panel-header">
                <h2>選擇要匯出的記錄</h2>
                <button id="close-export-dialog" class="close-btn">&times;</button>
            </div>
            <div class="export-dialog-content">
                <p class="dialog-instruction">請選擇您想要匯出到HTML檔案的旅行記錄：</p>
                
                <div class="selection-actions">
                    <button id="select-all-records" class="secondary-btn">全選</button>
                    <button id="deselect-all-records" class="secondary-btn">取消全選</button>
                </div>
                
                <div class="records-selection-list">
                    ${recordsOptionsHtml}
                </div>
                
                <div class="dialog-footer">
                    <button id="export-selected-html" class="primary-btn">匯出選定記錄</button>
                    <button id="cancel-export-dialog" class="secondary-btn">取消</button>
                </div>
            </div>
        `;
        
        // 添加到頁面
        document.body.appendChild(dialog);
        
        // 添加事件監聽器
        document.getElementById('close-export-dialog').addEventListener('click', () => {
            dialog.remove();
        });
        
        document.getElementById('cancel-export-dialog').addEventListener('click', () => {
            dialog.remove();
        });
        
        document.getElementById('select-all-records').addEventListener('click', () => {
            const checkboxes = dialog.querySelectorAll('.record-selection');
            checkboxes.forEach(checkbox => {
                checkbox.checked = true;
            });
        });
        
        document.getElementById('deselect-all-records').addEventListener('click', () => {
            const checkboxes = dialog.querySelectorAll('.record-selection');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
        });
        
        document.getElementById('export-selected-html').addEventListener('click', () => {
            // 獲取選中的記錄索引
            const selectedIndices = [];
            const checkboxes = dialog.querySelectorAll('.record-selection');
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    selectedIndices.push(parseInt(checkbox.value));
                }
            });
            
            if (selectedIndices.length === 0) {
                alert('請至少選擇一條記錄');
                return;
            }
            
            // 關閉對話框
            dialog.remove();
            
            // 直接匯出HTML
            exportAsHTML(selectedIndices);
        });
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
        },
        exportRecords: exportRecords,
        importRecords: importRecords,
        getRecordsCount: function() {
            return records.length;
        },
        clearAllRecords: function() {
            if (confirm('確定要清除所有旅行記錄嗎？此操作不可恢復。')) {
                records = [];
                saveRecordsToStorage();
                return true;
            }
            return false;
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

// 載入富文本編輯器功能腳本
function loadRichTextEditorScript() {
    if (window.richTextEditorLoaded) return;
    
    console.log('載入富文本編輯器相關資源...');
    
    // 添加字體圖標庫（如果尚未載入）
    if (!document.querySelector('link[href*="font-awesome"]')) {
        const fontAwesome = document.createElement('link');
        fontAwesome.rel = 'stylesheet';
        fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        fontAwesome.integrity = 'sha512-1ycn6IcaQQ40/MKBW2W4Rhis/DbILU74C1vSrLJxCq57o941Ym01SwNsOMqvEBFlcgUa6xLiPY/NS5R+E6ztJQ==';
        fontAwesome.crossOrigin = 'anonymous';
        fontAwesome.referrerPolicy = 'no-referrer';
        document.head.appendChild(fontAwesome);
        console.log('字體圖標庫已加載');
    }
    
    // 設置標記以避免重複加載
    window.richTextEditorLoaded = true;
}

// 初始化富文本編輯器
function initRichTextEditor() {
    loadRichTextEditorScript();
    
    const editor = document.getElementById('record-description');
    const toolbar = document.querySelector('.rich-text-toolbar');
    const hiddenInput = document.getElementById('record-description-html');
    
    if (!editor || !toolbar || !hiddenInput) {
        console.warn('找不到富文本編輯器元素，初始化失敗');
        return;
    }
    
    console.log('初始化富文本編輯器...');
    
    // 設置編輯器初始內容
    editor.innerHTML = '';
    hiddenInput.value = '';
    
    // 監聽編輯器內容變化，更新隱藏的input
    editor.addEventListener('input', function() {
        hiddenInput.value = editor.innerHTML;
        console.log('編輯器內容已更新');
    });
    
    // 處理粘貼純文本（避免粘貼時帶入不需要的格式）
    editor.addEventListener('paste', function(e) {
        e.preventDefault();
        
        // 獲取純文本
        let text = '';
        if (e.clipboardData || e.originalEvent.clipboardData) {
            text = (e.originalEvent || e).clipboardData.getData('text/plain');
        } else if (window.clipboardData) {
            text = window.clipboardData.getData('Text');
        }
        
        // 插入純文本
        if (document.queryCommandSupported('insertText')) {
            document.execCommand('insertText', false, text);
        } else {
            // 後備方案：插入HTML
            document.execCommand('insertHTML', false, text.replace(/\n/g, '<br>'));
        }
    });
    
    // 為工具欄按鈕添加事件
    toolbar.querySelectorAll('button.toolbar-item').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const command = this.dataset.command;
            
            // 切換按鈕的激活狀態 (適用於開關式功能)
            if (['bold', 'italic', 'underline'].includes(command)) {
                this.classList.toggle('active');
            }
            
            if (command === 'foreColor') {
                const colorPicker = toolbar.querySelector('.color-picker');
                document.execCommand(command, false, colorPicker.value);
            } else if (this.dataset.value) {
                document.execCommand(command, false, this.dataset.value);
            } else {
                document.execCommand(command, false, null);
            }
            
            editor.focus();
        });
    });
    
    // 字體下拉選單
    toolbar.querySelector('.font-family').addEventListener('change', function() {
        document.execCommand('fontName', false, this.value);
        editor.focus();
    });
    
    // 字體大小下拉選單
    toolbar.querySelector('.font-size').addEventListener('change', function() {
        document.execCommand('fontSize', false, this.value);
        editor.focus();
    });
    
    // 顏色選擇器
    const colorPicker = toolbar.querySelector('.color-picker');
    colorPicker.addEventListener('input', function() {
        const colorButton = toolbar.querySelector('[data-command="foreColor"]');
        colorButton.dataset.value = this.value;
        document.execCommand('foreColor', false, this.value);
        editor.focus();
    });
    
    // 點擊顏色按鈕時打開顏色選擇器
    toolbar.querySelector('[data-command="foreColor"]').addEventListener('click', function() {
        colorPicker.click();
    });
    
    // 添加鍵盤快捷鍵支持
    editor.addEventListener('keydown', function(e) {
        if (e.ctrlKey) {
            // Ctrl+B: 粗體
            if (e.key === 'b') {
                e.preventDefault();
                document.execCommand('bold', false, null);
                toolbar.querySelector('[data-command="bold"]').classList.toggle('active');
            }
            // Ctrl+I: 斜體
            else if (e.key === 'i') {
                e.preventDefault();
                document.execCommand('italic', false, null);
                toolbar.querySelector('[data-command="italic"]').classList.toggle('active');
            }
            // Ctrl+U: 底線
            else if (e.key === 'u') {
                e.preventDefault();
                document.execCommand('underline', false, null);
                toolbar.querySelector('[data-command="underline"]').classList.toggle('active');
            }
        }
    });
    
    console.log('富文本編輯器初始化完成');
}