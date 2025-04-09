/**
 * 交通卡資訊模組 - 提供全球主要城市的交通卡資訊
 * 包括購買地點、價格和使用方法
 */

const TransitCardService = (function() {
    // 私有變數
    let isInitialized = false;
    let currentCountry = null;
    let currentCity = null;
    let transitCardMap = null;
    let markers = [];

    // 初始化模組
    function init() {
        if (isInitialized) return;

        // 檢查交通卡資料庫是否已載入
        if (typeof TRANSIT_CARDS === 'undefined') {
            console.error('交通卡資料庫未載入');
            return false;
        }

        // 從本地儲存載入設定
        loadSettings();

        // 註冊事件監聽器
        registerEventListeners();

        isInitialized = true;
        console.log('交通卡資訊模組已初始化');
        return true;
    }

    // 從本地儲存載入設定
    function loadSettings() {
        try {
            const settings = localStorage.getItem('transitCardSettings');
            if (settings) {
                const parsedSettings = JSON.parse(settings);
                currentCountry = parsedSettings.country || null;
                currentCity = parsedSettings.city || null;
            }
        } catch (error) {
            console.error('載入交通卡設定時出錯:', error);
        }
    }

    // 保存設定到本地儲存
    function saveSettings() {
        try {
            const settings = {
                country: currentCountry,
                city: currentCity
            };
            localStorage.setItem('transitCardSettings', JSON.stringify(settings));
        } catch (error) {
            console.error('保存交通卡設定時出錯:', error);
        }
    }

    // 註冊事件監聽器
    function registerEventListeners() {
        // 這裡可以添加全局事件監聽器
        console.log('註冊交通卡資訊模組事件監聽器');
    }

    // 顯示交通卡資訊面板
    function showTransitCardPanel(country, city) {
        // 更新當前國家和城市
        if (country) currentCountry = country;
        if (city) currentCity = city;

        // 保存設定
        saveSettings();

        // 創建面板
        const panel = document.createElement('div');
        panel.className = 'transit-card-container';
        panel.id = 'transit-card-container';

        // 設置面板內容
        panel.innerHTML = `
            <div class="transit-card-panel">
                <div class="transit-card-header">
                    <h2><i class="fas fa-subway"></i> 當地交通卡資訊</h2>
                    <button class="transit-card-close"><i class="fas fa-times"></i></button>
                </div>
                <div class="transit-card-content">
                    <div class="transit-card-search">
                        <select id="transit-card-country" aria-label="選擇國家">
                            <option value="">選擇國家</option>
                            ${getCountryOptions()}
                        </select>
                        <select id="transit-card-city" aria-label="選擇城市">
                            <option value="">選擇城市</option>
                            ${getCityOptions(currentCountry)}
                        </select>
                        <button id="transit-card-search"><i class="fas fa-search"></i> 查詢</button>
                    </div>
                    <div id="transit-card-results">
                        ${renderTransitCards(currentCountry, currentCity)}
                    </div>
                </div>
            </div>
            <div class="transit-card-detail" id="transit-card-detail">
                <!-- 交通卡詳細資訊將在這裡動態生成 -->
            </div>
        `;

        // 添加到文檔
        document.body.appendChild(panel);

        // 設置事件監聽器
        setupPanelEventListeners();

        // 設置選擇框的預設值
        if (currentCountry) {
            document.getElementById('transit-card-country').value = currentCountry;
        }
        if (currentCity) {
            document.getElementById('transit-card-city').value = currentCity;
        }
    }

    // 設置面板事件監聽器
    function setupPanelEventListeners() {
        // 關閉按鈕
        const closeButton = document.querySelector('.transit-card-close');
        if (closeButton) {
            closeButton.addEventListener('click', closeTransitCardPanel);
        }

        // 國家選擇變更
        const countrySelect = document.getElementById('transit-card-country');
        if (countrySelect) {
            countrySelect.addEventListener('change', function() {
                currentCountry = this.value;
                updateCitySelect(currentCountry);
                saveSettings();
            });
        }

        // 查詢按鈕
        const searchButton = document.getElementById('transit-card-search');
        if (searchButton) {
            searchButton.addEventListener('click', function() {
                const country = document.getElementById('transit-card-country').value;
                const city = document.getElementById('transit-card-city').value;
                
                // 更新結果
                document.getElementById('transit-card-results').innerHTML = renderTransitCards(country, city);
                
                // 綁定卡片事件
                bindCardEvents();
            });
        }
    }

    // 關閉交通卡資訊面板
    function closeTransitCardPanel() {
        const panel = document.getElementById('transit-card-container');
        if (panel) {
            // 添加關閉動畫
            panel.style.opacity = '0';
            panel.style.transform = 'scale(0.9)';
            panel.style.transition = 'opacity 0.3s, transform 0.3s';
            
            // 動畫結束後移除面板
            setTimeout(() => {
                panel.remove();
            }, 300);
        }
    }

    // 獲取國家選項
    function getCountryOptions() {
        let options = '';
        for (const country in TRANSIT_CARDS) {
            options += `<option value="${country}">${country}</option>`;
        }
        return options;
    }

    // 獲取城市選項
    function getCityOptions(country) {
        let options = '';
        if (country && TRANSIT_CARDS[country]) {
            for (const city in TRANSIT_CARDS[country]) {
                options += `<option value="${city}">${city}</option>`;
            }
        }
        return options;
    }

    // 更新城市選擇框
    function updateCitySelect(country) {
        const citySelect = document.getElementById('transit-card-city');
        if (citySelect) {
            citySelect.innerHTML = `<option value="">選擇城市</option>${getCityOptions(country)}`;
            citySelect.value = '';
            currentCity = '';
        }
    }

    // 渲染交通卡列表
    function renderTransitCards(country, city) {
        // 如果沒有選擇國家或城市
        if (!country || !city) {
            return `
                <div class="transit-card-empty">
                    <i class="fas fa-info-circle"></i>
                    <p>請選擇國家和城市以查看當地交通卡資訊</p>
                </div>
            `;
        }

        // 檢查是否有該國家和城市的資料
        if (!TRANSIT_CARDS[country] || !TRANSIT_CARDS[country][city]) {
            return `
                <div class="transit-card-empty">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>抱歉，目前沒有 ${country} ${city} 的交通卡資訊</p>
                </div>
            `;
        }

        // 獲取該城市的交通卡
        const cards = TRANSIT_CARDS[country][city];
        
        // 如果沒有交通卡資訊
        if (!cards || cards.length === 0) {
            return `
                <div class="transit-card-empty">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>抱歉，目前沒有 ${country} ${city} 的交通卡資訊</p>
                </div>
            `;
        }

        // 渲染交通卡列表
        let html = '<div class="transit-card-list">';
        
        cards.forEach((card, index) => {
            html += `
                <div class="transit-card-item" data-card-id="${card.id}" data-card-index="${index}">
                    <div class="transit-card-item-header">
                        <img src="${card.image}" alt="${card.name}" class="transit-card-logo">
                        <div class="transit-card-name">
                            <h3>${card.name}</h3>
                            <p>${country} - ${city}</p>
                        </div>
                    </div>
                    <div class="transit-card-item-body">
                        <div class="transit-card-info">
                            <h4><i class="fas fa-money-bill-wave"></i> 價格</h4>
                            <p>${card.price}</p>
                        </div>
                        <div class="transit-card-info">
                            <h4><i class="fas fa-bus"></i> 適用範圍</h4>
                            <p>${card.coverage.slice(0, 3).join(', ')}${card.coverage.length > 3 ? '...' : ''}</p>
                        </div>
                        <div class="transit-card-actions">
                            <button class="view-details" data-card-id="${card.id}" data-card-index="${index}">
                                <i class="fas fa-info-circle"></i> 詳細資訊
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    // 綁定卡片事件
    function bindCardEvents() {
        // 綁定詳細資訊按鈕
        const detailButtons = document.querySelectorAll('.view-details');
        detailButtons.forEach(button => {
            button.addEventListener('click', function() {
                const cardId = this.getAttribute('data-card-id');
                const cardIndex = parseInt(this.getAttribute('data-card-index'));
                const country = document.getElementById('transit-card-country').value;
                const city = document.getElementById('transit-card-city').value;
                
                showCardDetails(country, city, cardIndex);
            });
        });
    }

    // 顯示卡片詳細資訊
    function showCardDetails(country, city, cardIndex) {
        // 獲取卡片資訊
        const card = TRANSIT_CARDS[country][city][cardIndex];
        if (!card) {
            console.error('找不到指定的交通卡資訊');
            return;
        }

        // 獲取詳細資訊面板
        const detailPanel = document.getElementById('transit-card-detail');
        if (!detailPanel) {
            console.error('找不到詳細資訊面板');
            return;
        }

        // 設置詳細資訊內容
        detailPanel.innerHTML = `
            <div class="transit-card-detail-header">
                <h2><i class="fas fa-subway"></i> ${card.name} 詳細資訊</h2>
                <button class="transit-card-close" id="detail-close"><i class="fas fa-times"></i></button>
            </div>
            <div class="transit-card-detail-content">
                <div class="transit-card-detail-info">
                    <img src="${card.image}" alt="${card.name}" class="transit-card-detail-logo">
                    <div class="transit-card-detail-name">
                        <h3>${card.name}</h3>
                        <p>${country} - ${city}</p>
                    </div>
                </div>
                
                <div class="transit-card-detail-section">
                    <h4><i class="fas fa-money-bill-wave"></i> 價格與儲值</h4>
                    <p><strong>卡片價格:</strong> ${card.price}</p>
                    <p><strong>初始儲值:</strong> ${card.balance}</p>
                </div>
                
                <div class="transit-card-detail-section">
                    <h4><i class="fas fa-bus"></i> 適用範圍</h4>
                    <ul>
                        ${card.coverage.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="transit-card-detail-section">
                    <h4><i class="fas fa-percentage"></i> 優惠資訊</h4>
                    <p>${card.discounts}</p>
                </div>
                
                <div class="transit-card-detail-section">
                    <h4><i class="fas fa-map-marker-alt"></i> 購買地點</h4>
                    <div class="purchase-locations">
                        ${card.purchaseLocations.map((location, idx) => `
                            <div class="purchase-location-item">
                                <h5>${location.name}</h5>
                                <p>${location.description}</p>
                                <div class="purchase-location-actions">
                                    <button class="view-on-map" data-location-index="${idx}" data-lat="${location.coordinates[0]}" data-lng="${location.coordinates[1]}">
                                        <i class="fas fa-map"></i> 在地圖上查看
                                    </button>
                                    <button class="get-directions" data-map-url="${location.mapUrl}">
                                        <i class="fas fa-directions"></i> 獲取路線
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="transit-card-detail-section">
                    <h4><i class="fas fa-sync-alt"></i> 儲值地點</h4>
                    <ul>
                        ${card.rechargeLocations.map(location => `<li>${location}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="transit-card-detail-section">
                    <h4><i class="fas fa-info-circle"></i> 使用方法</h4>
                    <p>${card.howToUse}</p>
                </div>
                
                <div class="transit-card-detail-section">
                    <h4><i class="fas fa-sticky-note"></i> 備註</h4>
                    <p>${card.notes}</p>
                </div>
                
                <div id="transit-card-map" class="transit-card-map"></div>
                
                <button class="transit-card-back-button" id="back-to-list">
                    <i class="fas fa-arrow-left"></i> 返回交通卡列表
                </button>
            </div>
        `;

        // 顯示詳細資訊面板
        detailPanel.style.display = 'block';
        
        // 隱藏主面板
        const mainPanel = document.querySelector('.transit-card-panel');
        if (mainPanel) {
            mainPanel.style.display = 'none';
        }

        // 設置詳細資訊面板事件監聽器
        setupDetailPanelEventListeners(card);
        
        // 初始化地圖
        setTimeout(() => {
            initMap(card.purchaseLocations[0].coordinates[0], card.purchaseLocations[0].coordinates[1]);
            addPurchaseLocationMarkers(card.purchaseLocations);
        }, 300);
    }

    // 設置詳細資訊面板事件監聽器
    function setupDetailPanelEventListeners(card) {
        // 關閉按鈕
        const closeButton = document.getElementById('detail-close');
        if (closeButton) {
            closeButton.addEventListener('click', closeDetailPanel);
        }

        // 返回按鈕
        const backButton = document.getElementById('back-to-list');
        if (backButton) {
            backButton.addEventListener('click', closeDetailPanel);
        }

        // 在地圖上查看按鈕
        const mapButtons = document.querySelectorAll('.view-on-map');
        mapButtons.forEach(button => {
            button.addEventListener('click', function() {
                const lat = parseFloat(this.getAttribute('data-lat'));
                const lng = parseFloat(this.getAttribute('data-lng'));
                const locationIndex = parseInt(this.getAttribute('data-location-index'));
                
                // 移動地圖到該位置
                if (transitCardMap) {
                    transitCardMap.setView([lat, lng], 15);
                    
                    // 打開對應的標記彈出窗口
                    if (markers[locationIndex]) {
                        markers[locationIndex].openPopup();
                    }
                }
                
                // 滾動到地圖
                document.getElementById('transit-card-map').scrollIntoView({ behavior: 'smooth' });
            });
        });

        // 獲取路線按鈕
        const directionButtons = document.querySelectorAll('.get-directions');
        directionButtons.forEach(button => {
            button.addEventListener('click', function() {
                const mapUrl = this.getAttribute('data-map-url');
                window.open(mapUrl, '_blank');
            });
        });
    }

    // 關閉詳細資訊面板
    function closeDetailPanel() {
        // 隱藏詳細資訊面板
        const detailPanel = document.getElementById('transit-card-detail');
        if (detailPanel) {
            detailPanel.style.display = 'none';
        }
        
        // 顯示主面板
        const mainPanel = document.querySelector('.transit-card-panel');
        if (mainPanel) {
            mainPanel.style.display = 'block';
        }
        
        // 清除地圖
        clearMap();
    }

    // 初始化地圖
    function initMap(lat, lng) {
        // 檢查 Leaflet 是否已載入
        if (typeof L === 'undefined') {
            console.error('Leaflet 地圖庫未載入');
            return;
        }
        
        // 清除現有地圖
        clearMap();
        
        // 創建新地圖
        transitCardMap = L.map('transit-card-map').setView([lat, lng], 13);
        
        // 添加底圖
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(transitCardMap);
        
        // 調整地圖大小
        setTimeout(() => {
            transitCardMap.invalidateSize();
        }, 100);
    }

    // 添加購買地點標記
    function addPurchaseLocationMarkers(locations) {
        if (!transitCardMap) return;
        
        // 清除現有標記
        clearMarkers();
        
        // 添加新標記
        locations.forEach((location, index) => {
            const marker = L.marker(location.coordinates)
                .addTo(transitCardMap)
                .bindPopup(`
                    <strong>${location.name}</strong><br>
                    ${location.description}<br>
                    <a href="${location.mapUrl}" target="_blank" style="color: #4a89dc;">在 Google Maps 中查看</a>
                `);
            
            markers.push(marker);
        });
        
        // 如果有多個標記，調整地圖視圖以顯示所有標記
        if (markers.length > 1) {
            const group = new L.featureGroup(markers);
            transitCardMap.fitBounds(group.getBounds().pad(0.1));
        }
    }

    // 清除標記
    function clearMarkers() {
        if (transitCardMap) {
            markers.forEach(marker => {
                transitCardMap.removeLayer(marker);
            });
        }
        markers = [];
    }

    // 清除地圖
    function clearMap() {
        clearMarkers();
        
        if (transitCardMap) {
            transitCardMap.remove();
            transitCardMap = null;
        }
    }

    // 測試交通卡資訊功能
    function testTransitCardInfo() {
        console.log('測試交通卡資訊功能');
        showTransitCardPanel('台灣', '台北');
    }

    // 公開 API
    return {
        init: init,
        showTransitCardPanel: showTransitCardPanel,
        testTransitCardInfo: testTransitCardInfo
    };
})();

// 當文檔載入完成後初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化交通卡資訊模組
    if (typeof TransitCardService !== 'undefined') {
        console.log('初始化交通卡資訊模組...');
        TransitCardService.init();
    } else {
        console.warn('找不到交通卡資訊模組');
    }
});
