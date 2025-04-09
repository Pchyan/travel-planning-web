/**
 * 緊急聯絡資訊模組
 * 提供旅遊目的地的緊急聯絡資訊，如大使館、醫院、警察局等
 */

const EmergencyContact = (function() {
    // 私有變數
    let isInitialized = false;
    let currentCountry = null;
    let currentCity = null;
    let currentTab = 'numbers';
    let map = null;
    let markers = [];

    // 本地儲存鍵
    const EMERGENCY_SETTINGS_KEY = 'emergency_contact_settings';

    // 初始化模組
    function init() {
        if (isInitialized) return;

        console.log('緊急聯絡資訊模組初始化中...');

        // 從本地儲存載入設定
        loadSettings();

        // 設置事件監聽器
        setupEventListeners();

        isInitialized = true;
        console.log('緊急聯絡資訊模組初始化完成');
    }

    // 從本地儲存載入設定
    function loadSettings() {
        try {
            const settings = localStorage.getItem(EMERGENCY_SETTINGS_KEY);
            if (settings) {
                const parsedSettings = JSON.parse(settings);
                currentCountry = parsedSettings.country || null;
                currentCity = parsedSettings.city || null;
            }
        } catch (error) {
            console.error('載入緊急聯絡資訊設定時出錯:', error);
        }
    }

    // 保存設定到本地儲存
    function saveSettings() {
        try {
            const settings = {
                country: currentCountry,
                city: currentCity
            };
            localStorage.setItem(EMERGENCY_SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('保存緊急聯絡資訊設定時出錯:', error);
        }
    }

    // 設置事件監聽器
    function setupEventListeners() {
        // 確保DOM已經載入完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', bindEvents);
        } else {
            // 如果DOM已經載入完成，直接綁定事件
            bindEvents();
        }
    }

    // 綁定事件
    function bindEvents() {
        // 綁定緊急聯絡資訊按鈕
        const emergencyButton = document.getElementById('open-emergency-contact');
        if (emergencyButton) {
            emergencyButton.addEventListener('click', openEmergencyContactPanel);
        } else {
            console.warn('未找到緊急聯絡資訊按鈕');
        }

        // 綁定測試按鈕（如果存在）
        const testButton = document.getElementById('test-emergency-contact');
        if (testButton) {
            testButton.addEventListener('click', testEmergencyContact);
        }
    }

    // 打開緊急聯絡資訊面板
    function openEmergencyContactPanel() {
        console.log('打開緊急聯絡資訊面板');

        // 檢查面板是否已存在
        let panel = document.getElementById('emergency-contact-dialog');
        if (panel) {
            panel.style.display = 'block';
            return;
        }

        // 創建面板
        panel = document.createElement('div');
        panel.id = 'emergency-contact-dialog';
        panel.className = 'emergency-contact-dialog';

        // 設置面板內容
        panel.innerHTML = createPanelHTML();

        // 添加面板到頁面
        document.body.appendChild(panel);

        // 顯示面板
        setTimeout(() => {
            panel.style.display = 'block';
        }, 0);

        // 綁定面板事件
        bindPanelEvents();

        // 初始化標籤頁
        switchTab(currentTab);

        // 初始化國家和城市選擇器
        initializeSelectors();

        // 初始化地圖
        initializeMap();
    }

    // 創建面板HTML
    function createPanelHTML() {
        return `
            <div class="emergency-contact-panel">
                <div class="emergency-contact-header">
                    <h2><i class="fas fa-exclamation-circle"></i> 緊急聯絡資訊</h2>
                    <button id="close-emergency-contact" class="emergency-contact-close">&times;</button>
                </div>
                <div class="emergency-contact-tabs">
                    <button id="numbers-tab" class="emergency-contact-tab active">緊急電話</button>
                    <button id="contacts-tab" class="emergency-contact-tab">聯絡資訊</button>
                    <button id="map-tab" class="emergency-contact-tab">地圖</button>
                    <button id="embassy-tab" class="emergency-contact-tab">大使館/領事館</button>
                </div>
                <div class="emergency-contact-content">
                    <!-- 緊急電話頁面 -->
                    <div id="numbers-content" class="emergency-contact-section active">
                        <h3>緊急聯絡電話</h3>
                        <div class="contact-filter">
                            <select id="emergency-country-select">
                                <option value="">選擇國家/地區</option>
                                <!-- 將由 JavaScript 動態填充 -->
                            </select>
                        </div>
                        <div id="emergency-numbers" class="emergency-numbers">
                            <!-- 將由 JavaScript 動態填充 -->
                        </div>
                    </div>

                    <!-- 聯絡資訊頁面 -->
                    <div id="contacts-content" class="emergency-contact-section">
                        <h3>緊急聯絡資訊</h3>
                        <div class="contact-filter">
                            <select id="contact-country-select">
                                <option value="">選擇國家/地區</option>
                                <!-- 將由 JavaScript 動態填充 -->
                            </select>
                            <select id="contact-city-select">
                                <option value="">選擇城市</option>
                                <!-- 將由 JavaScript 動態填充 -->
                            </select>
                            <select id="contact-type-select">
                                <option value="">所有類型</option>
                                <!-- 將由 JavaScript 動態填充 -->
                            </select>
                            <button id="filter-contacts"><i class="fas fa-filter"></i> 篩選</button>
                        </div>
                        <div id="contacts-list" class="contacts-list">
                            <!-- 將由 JavaScript 動態填充 -->
                        </div>
                    </div>

                    <!-- 地圖頁面 -->
                    <div id="map-content" class="emergency-contact-section">
                        <h3>緊急服務地圖</h3>
                        <div class="map-controls">
                            <select id="map-country-select">
                                <option value="">選擇國家/地區</option>
                                <!-- 將由 JavaScript 動態填充 -->
                            </select>
                            <select id="map-city-select">
                                <option value="">選擇城市</option>
                                <!-- 將由 JavaScript 動態填充 -->
                            </select>
                            <button id="show-all-on-map"><i class="fas fa-globe"></i> 顯示所有</button>
                            <button id="show-hospitals-on-map"><i class="fas fa-hospital"></i> 醫院</button>
                            <button id="show-police-on-map"><i class="fas fa-shield-alt"></i> 警察局</button>
                            <button id="show-embassy-on-map"><i class="fas fa-flag"></i> 大使館</button>
                        </div>
                        <div class="emergency-map-container">
                            <div id="emergency-map"></div>
                        </div>
                    </div>

                    <!-- 大使館/領事館頁面 -->
                    <div id="embassy-content" class="emergency-contact-section">
                        <h3>大使館/領事館資訊</h3>
                        <div class="contact-filter">
                            <select id="embassy-country-select">
                                <option value="">選擇國家/地區</option>
                                <!-- 將由 JavaScript 動態填充 -->
                            </select>
                            <button id="filter-embassy"><i class="fas fa-filter"></i> 篩選</button>
                        </div>
                        <div id="embassy-list" class="contacts-list">
                            <!-- 將由 JavaScript 動態填充 -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 綁定面板事件
    function bindPanelEvents() {
        // 關閉按鈕
        document.getElementById('close-emergency-contact').addEventListener('click', () => {
            const panel = document.getElementById('emergency-contact-dialog');
            if (panel) {
                panel.style.display = 'none';
            }
        });

        // 標籤頁切換
        document.getElementById('numbers-tab').addEventListener('click', () => switchTab('numbers'));
        document.getElementById('contacts-tab').addEventListener('click', () => switchTab('contacts'));
        document.getElementById('map-tab').addEventListener('click', () => switchTab('map'));
        document.getElementById('embassy-tab').addEventListener('click', () => switchTab('embassy'));

        // 國家選擇器事件
        document.getElementById('emergency-country-select').addEventListener('change', function() {
            currentCountry = this.value;
            saveSettings();
            updateEmergencyNumbers();
        });

        document.getElementById('contact-country-select').addEventListener('change', function() {
            currentCountry = this.value;
            saveSettings();
            updateCitySelector('contact-city-select');
            updateContactsList();
        });

        document.getElementById('map-country-select').addEventListener('change', function() {
            currentCountry = this.value;
            saveSettings();
            updateCitySelector('map-city-select');
            updateMap();
        });

        document.getElementById('embassy-country-select').addEventListener('change', function() {
            currentCountry = this.value;
            saveSettings();
            updateEmbassyList();
        });

        // 城市選擇器事件
        document.getElementById('contact-city-select').addEventListener('change', function() {
            currentCity = this.value;
            saveSettings();
            updateContactsList();
        });

        document.getElementById('map-city-select').addEventListener('change', function() {
            currentCity = this.value;
            saveSettings();
            updateMap();
        });

        // 篩選按鈕
        document.getElementById('filter-contacts').addEventListener('click', updateContactsList);
        document.getElementById('filter-embassy').addEventListener('click', updateEmbassyList);

        // 地圖控制按鈕
        document.getElementById('show-all-on-map').addEventListener('click', () => showOnMap('all'));
        document.getElementById('show-hospitals-on-map').addEventListener('click', () => showOnMap('HOSPITAL'));
        document.getElementById('show-police-on-map').addEventListener('click', () => showOnMap('POLICE'));
        document.getElementById('show-embassy-on-map').addEventListener('click', () => showOnMap('EMBASSY'));
    }

    // 切換標籤頁
    function switchTab(tabName) {
        currentTab = tabName;

        // 更新標籤樣式
        document.querySelectorAll('.emergency-contact-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // 更新內容顯示
        document.querySelectorAll('.emergency-contact-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${tabName}-content`).classList.add('active');

        // 根據標籤頁執行相應的初始化
        if (tabName === 'numbers' && currentCountry) {
            updateEmergencyNumbers();
        } else if (tabName === 'contacts' && currentCountry) {
            updateContactsList();
        } else if (tabName === 'map') {
            if (!map) {
                initializeMap();
            } else {
                updateMap();
            }
        } else if (tabName === 'embassy' && currentCountry) {
            updateEmbassyList();
        }

        console.log(`已切換到 ${tabName} 標籤頁`);
    }

    // 初始化選擇器
    function initializeSelectors() {
        // 獲取所有國家
        const countries = EmergencyContacts.getAllCountries();

        // 填充國家選擇器
        const countrySelectors = [
            'emergency-country-select',
            'contact-country-select',
            'map-country-select',
            'embassy-country-select'
        ];

        countrySelectors.forEach(selectorId => {
            const selector = document.getElementById(selectorId);
            if (!selector) return;

            // 清空現有選項（保留第一個預設選項）
            while (selector.options.length > 1) {
                selector.remove(1);
            }

            // 添加國家選項
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country;
                option.textContent = country;
                selector.appendChild(option);
            });

            // 設置當前選中的國家
            if (currentCountry) {
                selector.value = currentCountry;
            }
        });

        // 初始化城市選擇器
        if (currentCountry) {
            updateCitySelector('contact-city-select');
            updateCitySelector('map-city-select');
        }

        // 初始化聯絡類型選擇器
        const contactTypeSelector = document.getElementById('contact-type-select');
        if (contactTypeSelector) {
            // 清空現有選項（保留第一個預設選項）
            while (contactTypeSelector.options.length > 1) {
                contactTypeSelector.remove(1);
            }

            // 添加聯絡類型選項
            const contactTypes = EmergencyContacts.getAllContactTypes();
            for (const [key, value] of Object.entries(contactTypes)) {
                const option = document.createElement('option');
                option.value = key;
                option.textContent = value;
                contactTypeSelector.appendChild(option);
            }
        }
    }

    // 更新城市選擇器
    function updateCitySelector(selectorId) {
        const selector = document.getElementById(selectorId);
        if (!selector) return;

        // 清空現有選項（保留第一個預設選項）
        while (selector.options.length > 1) {
            selector.remove(1);
        }

        if (!currentCountry) return;

        // 獲取當前國家的聯絡資訊
        const countryData = EmergencyContacts.getContactsByCountry(currentCountry);
        if (!countryData) return;

        // 獲取城市列表
        const cities = [...new Set(countryData.contacts.map(contact => contact.city))].sort();

        // 添加城市選項
        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            selector.appendChild(option);
        });

        // 設置當前選中的城市
        if (currentCity && cities.includes(currentCity)) {
            selector.value = currentCity;
        } else {
            // 如果當前城市不在列表中，重置為空
            currentCity = null;
        }
    }

    // 更新緊急電話
    function updateEmergencyNumbers() {
        const container = document.getElementById('emergency-numbers');
        if (!container) return;

        // 清空容器
        container.innerHTML = '';

        if (!currentCountry) {
            container.innerHTML = '<p>請選擇國家/地區以查看緊急電話</p>';
            return;
        }

        // 獲取當前國家的緊急電話
        const countryData = EmergencyContacts.getContactsByCountry(currentCountry);
        if (!countryData || !countryData.emergencyNumbers) {
            container.innerHTML = `<p>沒有找到 ${currentCountry} 的緊急電話資訊</p>`;
            return;
        }

        // 創建緊急電話卡片
        const emergencyNumbers = countryData.emergencyNumbers;

        // 警察
        if (emergencyNumbers.police) {
            const card = document.createElement('div');
            card.className = 'emergency-number-card';
            card.innerHTML = `
                <h3>警察</h3>
                <div class="phone">${emergencyNumbers.police}</div>
                <div class="description">緊急時撥打警察電話</div>
                <button class="call-button" data-phone="${emergencyNumbers.police}">
                    <i class="fas fa-phone"></i> 撥打
                </button>
            `;
            container.appendChild(card);
        }

        // 救護車
        if (emergencyNumbers.ambulance) {
            const card = document.createElement('div');
            card.className = 'emergency-number-card';
            card.innerHTML = `
                <h3>救護車</h3>
                <div class="phone">${emergencyNumbers.ambulance}</div>
                <div class="description">醫療緊急時撥打救護車</div>
                <button class="call-button" data-phone="${emergencyNumbers.ambulance}">
                    <i class="fas fa-phone"></i> 撥打
                </button>
            `;
            container.appendChild(card);
        }

        // 消防隊
        if (emergencyNumbers.fire) {
            const card = document.createElement('div');
            card.className = 'emergency-number-card';
            card.innerHTML = `
                <h3>消防隊</h3>
                <div class="phone">${emergencyNumbers.fire}</div>
                <div class="description">火災或其他災害緊急時撥打</div>
                <button class="call-button" data-phone="${emergencyNumbers.fire}">
                    <i class="fas fa-phone"></i> 撥打
                </button>
            `;
            container.appendChild(card);
        }

        // 旅遊諮詢
        if (emergencyNumbers.tourist) {
            const card = document.createElement('div');
            card.className = 'emergency-number-card';
            card.innerHTML = `
                <h3>旅遊諮詢</h3>
                <div class="phone">${emergencyNumbers.tourist}</div>
                <div class="description">旅遊相關問題或緊急情況諮詢</div>
                <button class="call-button" data-phone="${emergencyNumbers.tourist}">
                    <i class="fas fa-phone"></i> 撥打
                </button>
            `;
            container.appendChild(card);
        }

        // 綁定撥打按鈕事件
        container.querySelectorAll('.call-button').forEach(button => {
            button.addEventListener('click', function() {
                const phone = this.getAttribute('data-phone');
                if (phone) {
                    // 在移動裝置上直接撥打電話
                    window.location.href = `tel:${phone}`;
                }
            });
        });
    }

    // 更新聯絡資訊列表
    function updateContactsList() {
        const container = document.getElementById('contacts-list');
        if (!container) return;

        // 清空容器
        container.innerHTML = '';

        if (!currentCountry) {
            container.innerHTML = '<p>請選擇國家/地區以查看緊急聯絡資訊</p>';
            return;
        }

        // 獲取當前國家的聯絡資訊
        let contacts;
        if (currentCity) {
            // 如果選擇了城市，只顯示該城市的聯絡資訊
            const cityData = EmergencyContacts.getContactsByCity(currentCountry, currentCity);
            contacts = cityData ? cityData.contacts : [];
        } else {
            // 否則顯示所有聯絡資訊
            const countryData = EmergencyContacts.getContactsByCountry(currentCountry);
            contacts = countryData ? countryData.contacts : [];
        }

        // 篩選聯絡類型
        const typeSelector = document.getElementById('contact-type-select');
        const selectedType = typeSelector ? typeSelector.value : '';
        if (selectedType) {
            contacts = contacts.filter(contact => contact.type === selectedType);
        }

        if (contacts.length === 0) {
            container.innerHTML = `<p>沒有找到符合條件的緊急聯絡資訊</p>`;
            return;
        }

        // 創建聯絡資訊卡片
        contacts.forEach(contact => {
            const card = document.createElement('div');
            card.className = 'contact-card';

            // 卡片頭部
            const header = document.createElement('div');
            header.className = 'contact-card-header';
            header.innerHTML = `
                <h3>${contact.name}</h3>
                <div class="type">${contact.type}</div>
            `;

            // 卡片內容
            const body = document.createElement('div');
            body.className = 'contact-card-body';

            // 城市
            if (contact.city) {
                const cityItem = document.createElement('div');
                cityItem.className = 'contact-info-item';
                cityItem.innerHTML = `
                    <i class="fas fa-city"></i>
                    <span>${contact.city}</span>
                `;
                body.appendChild(cityItem);
            }

            // 地址
            if (contact.address) {
                const addressItem = document.createElement('div');
                addressItem.className = 'contact-info-item';
                addressItem.innerHTML = `
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${contact.address}</span>
                `;
                body.appendChild(addressItem);
            }

            // 電話
            if (contact.phone) {
                const phoneItem = document.createElement('div');
                phoneItem.className = 'contact-info-item';
                phoneItem.innerHTML = `
                    <i class="fas fa-phone"></i>
                    <span>${contact.phone}</span>
                `;
                body.appendChild(phoneItem);
            }

            // 網站
            if (contact.website) {
                const websiteItem = document.createElement('div');
                websiteItem.className = 'contact-info-item';
                websiteItem.innerHTML = `
                    <i class="fas fa-globe"></i>
                    <span><a href="${contact.website}" target="_blank">${contact.website}</a></span>
                `;
                body.appendChild(websiteItem);
            }

            // 開放時間
            if (contact.openingHours) {
                const hoursItem = document.createElement('div');
                hoursItem.className = 'contact-info-item';
                hoursItem.innerHTML = `
                    <i class="fas fa-clock"></i>
                    <span>${contact.openingHours}</span>
                `;
                body.appendChild(hoursItem);
            }

            // 語言
            if (contact.languages && contact.languages.length > 0) {
                const langItem = document.createElement('div');
                langItem.className = 'contact-info-item';
                langItem.innerHTML = `
                    <i class="fas fa-language"></i>
                    <span>${contact.languages.join(', ')}</span>
                `;
                body.appendChild(langItem);
            }

            // 備註
            if (contact.notes) {
                const notesItem = document.createElement('div');
                notesItem.className = 'contact-info-item';
                notesItem.innerHTML = `
                    <i class="fas fa-sticky-note"></i>
                    <span>${contact.notes}</span>
                `;
                body.appendChild(notesItem);
            }

            // 卡片操作
            const actions = document.createElement('div');
            actions.className = 'contact-card-actions';

            // 撥打按鈕
            if (contact.phone) {
                const callButton = document.createElement('button');
                callButton.innerHTML = '<i class="fas fa-phone"></i> 撥打';
                callButton.addEventListener('click', () => {
                    window.location.href = `tel:${contact.phone}`;
                });
                actions.appendChild(callButton);
            }

            // 導航按鈕
            if (contact.coordinates && contact.coordinates.length === 2) {
                const navButton = document.createElement('button');
                navButton.innerHTML = '<i class="fas fa-directions"></i> 導航';
                navButton.addEventListener('click', () => {
                    const [lat, lng] = contact.coordinates;
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                });
                actions.appendChild(navButton);
            }

            // 顯示在地圖上按鈕
            if (contact.coordinates && contact.coordinates.length === 2) {
                const mapButton = document.createElement('button');
                mapButton.innerHTML = '<i class="fas fa-map"></i> 地圖';
                mapButton.addEventListener('click', () => {
                    switchTab('map');
                    showContactOnMap(contact);
                });
                actions.appendChild(mapButton);
            }

            // 組裝卡片
            card.appendChild(header);
            card.appendChild(body);
            card.appendChild(actions);

            // 添加卡片到容器
            container.appendChild(card);
        });
    }

    // 更新大使館/領事館列表
    function updateEmbassyList() {
        const container = document.getElementById('embassy-list');
        if (!container) return;

        // 清空容器
        container.innerHTML = '';

        if (!currentCountry) {
            container.innerHTML = '<p>請選擇國家/地區以查看大使館/領事館資訊</p>';
            return;
        }

        // 獲取當前國家的大使館/領事館資訊
        const countryData = EmergencyContacts.getContactsByType(currentCountry, 'EMBASSY');
        const embassies = countryData ? countryData.contacts : [];

        if (embassies.length === 0) {
            container.innerHTML = `<p>沒有找到 ${currentCountry} 的大使館/領事館資訊</p>`;
            return;
        }

        // 創建大使館/領事館卡片
        embassies.forEach(embassy => {
            const card = document.createElement('div');
            card.className = 'contact-card';

            // 卡片頭部
            const header = document.createElement('div');
            header.className = 'contact-card-header';
            header.innerHTML = `
                <h3>${embassy.name}</h3>
                <div class="type">${embassy.type}</div>
            `;

            // 卡片內容
            const body = document.createElement('div');
            body.className = 'contact-card-body';

            // 城市
            if (embassy.city) {
                const cityItem = document.createElement('div');
                cityItem.className = 'contact-info-item';
                cityItem.innerHTML = `
                    <i class="fas fa-city"></i>
                    <span>${embassy.city}</span>
                `;
                body.appendChild(cityItem);
            }

            // 地址
            if (embassy.address) {
                const addressItem = document.createElement('div');
                addressItem.className = 'contact-info-item';
                addressItem.innerHTML = `
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${embassy.address}</span>
                `;
                body.appendChild(addressItem);
            }

            // 電話
            if (embassy.phone) {
                const phoneItem = document.createElement('div');
                phoneItem.className = 'contact-info-item';
                phoneItem.innerHTML = `
                    <i class="fas fa-phone"></i>
                    <span>${embassy.phone}</span>
                `;
                body.appendChild(phoneItem);
            }

            // 網站
            if (embassy.website) {
                const websiteItem = document.createElement('div');
                websiteItem.className = 'contact-info-item';
                websiteItem.innerHTML = `
                    <i class="fas fa-globe"></i>
                    <span><a href="${embassy.website}" target="_blank">${embassy.website}</a></span>
                `;
                body.appendChild(websiteItem);
            }

            // 開放時間
            if (embassy.openingHours) {
                const hoursItem = document.createElement('div');
                hoursItem.className = 'contact-info-item';
                hoursItem.innerHTML = `
                    <i class="fas fa-clock"></i>
                    <span>${embassy.openingHours}</span>
                `;
                body.appendChild(hoursItem);
            }

            // 備註
            if (embassy.notes) {
                const notesItem = document.createElement('div');
                notesItem.className = 'contact-info-item';
                notesItem.innerHTML = `
                    <i class="fas fa-sticky-note"></i>
                    <span>${embassy.notes}</span>
                `;
                body.appendChild(notesItem);
            }

            // 卡片操作
            const actions = document.createElement('div');
            actions.className = 'contact-card-actions';

            // 撥打按鈕
            if (embassy.phone) {
                const callButton = document.createElement('button');
                callButton.innerHTML = '<i class="fas fa-phone"></i> 撥打';
                callButton.addEventListener('click', () => {
                    window.location.href = `tel:${embassy.phone}`;
                });
                actions.appendChild(callButton);
            }

            // 導航按鈕
            if (embassy.coordinates && embassy.coordinates.length === 2) {
                const navButton = document.createElement('button');
                navButton.innerHTML = '<i class="fas fa-directions"></i> 導航';
                navButton.addEventListener('click', () => {
                    const [lat, lng] = embassy.coordinates;
                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
                });
                actions.appendChild(navButton);
            }

            // 顯示在地圖上按鈕
            if (embassy.coordinates && embassy.coordinates.length === 2) {
                const mapButton = document.createElement('button');
                mapButton.innerHTML = '<i class="fas fa-map"></i> 地圖';
                mapButton.addEventListener('click', () => {
                    switchTab('map');
                    showContactOnMap(embassy);
                });
                actions.appendChild(mapButton);
            }

            // 組裝卡片
            card.appendChild(header);
            card.appendChild(body);
            card.appendChild(actions);

            // 添加卡片到容器
            container.appendChild(card);
        });
    }

    // 初始化地圖
    function initializeMap() {
        // 如果地圖已經初始化，則返回
        if (map) return;

        // 獲取地圖容器
        const mapContainer = document.getElementById('emergency-map');
        if (!mapContainer) return;

        // 初始化地圖
        map = L.map('emergency-map').setView([25.0330, 121.5654], 13); // 預設以台北為中心

        // 添加地圖圖層
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // 更新地圖
        updateMap();

        console.log('地圖已初始化');
    }

    // 更新地圖
    function updateMap() {
        if (!map) {
            initializeMap();
            return;
        }

        // 清除現有標記
        clearMarkers();

        // 如果沒有選擇國家，則返回
        if (!currentCountry) return;

        // 獲取當前國家的聯絡資訊
        let contacts;
        if (currentCity) {
            // 如果選擇了城市，只顯示該城市的聯絡資訊
            const cityData = EmergencyContacts.getContactsByCity(currentCountry, currentCity);
            contacts = cityData ? cityData.contacts : [];
        } else {
            // 否則顯示所有聯絡資訊
            const countryData = EmergencyContacts.getContactsByCountry(currentCountry);
            contacts = countryData ? countryData.contacts : [];
        }

        // 如果沒有聯絡資訊，則返回
        if (contacts.length === 0) return;

        // 添加標記
        const bounds = L.latLngBounds();
        contacts.forEach(contact => {
            if (contact.coordinates && contact.coordinates.length === 2) {
                const [lat, lng] = contact.coordinates;

                // 根據聯絡類型選擇圖標
                let icon;
                switch (contact.type) {
                    case 'HOSPITAL':
                        icon = L.divIcon({
                            html: '<i class="fas fa-hospital" style="color: #e74c3c;"></i>',
                            className: 'emergency-map-icon',
                            iconSize: [30, 30]
                        });
                        break;
                    case 'POLICE':
                        icon = L.divIcon({
                            html: '<i class="fas fa-shield-alt" style="color: #3498db;"></i>',
                            className: 'emergency-map-icon',
                            iconSize: [30, 30]
                        });
                        break;
                    case 'EMBASSY':
                        icon = L.divIcon({
                            html: '<i class="fas fa-flag" style="color: #2ecc71;"></i>',
                            className: 'emergency-map-icon',
                            iconSize: [30, 30]
                        });
                        break;
                    case 'FIRE':
                        icon = L.divIcon({
                            html: '<i class="fas fa-fire" style="color: #e67e22;"></i>',
                            className: 'emergency-map-icon',
                            iconSize: [30, 30]
                        });
                        break;
                    case 'TOURIST_POLICE':
                        icon = L.divIcon({
                            html: '<i class="fas fa-user-shield" style="color: #9b59b6;"></i>',
                            className: 'emergency-map-icon',
                            iconSize: [30, 30]
                        });
                        break;
                    case 'TOURIST_HELP':
                        icon = L.divIcon({
                            html: '<i class="fas fa-info-circle" style="color: #f1c40f;"></i>',
                            className: 'emergency-map-icon',
                            iconSize: [30, 30]
                        });
                        break;
                    default:
                        icon = L.divIcon({
                            html: '<i class="fas fa-map-marker-alt" style="color: #e74c3c;"></i>',
                            className: 'emergency-map-icon',
                            iconSize: [30, 30]
                        });
                }

                // 添加標記
                const marker = L.marker([lat, lng], { icon }).addTo(map);

                // 添加彈出說明
                marker.bindPopup(`
                    <div class="emergency-popup">
                        <h3>${contact.name}</h3>
                        <p><strong>類型:</strong> ${contact.type}</p>
                        ${contact.address ? `<p><strong>地址:</strong> ${contact.address}</p>` : ''}
                        ${contact.phone ? `<p><strong>電話:</strong> ${contact.phone}</p>` : ''}
                        ${contact.openingHours ? `<p><strong>開放時間:</strong> ${contact.openingHours}</p>` : ''}
                        ${contact.notes ? `<p><strong>備註:</strong> ${contact.notes}</p>` : ''}
                        <div class="popup-actions">
                            ${contact.phone ? `<a href="tel:${contact.phone}" class="popup-action"><i class="fas fa-phone"></i> 撥打</a>` : ''}
                            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" class="popup-action"><i class="fas fa-directions"></i> 導航</a>
                        </div>
                    </div>
                `);

                // 將標記添加到標記數組
                markers.push(marker);

                // 擴展地圖範圍
                bounds.extend([lat, lng]);
            }
        });

        // 如果有標記，則調整地圖範圍
        if (markers.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    // 清除地圖標記
    function clearMarkers() {
        // 如果沒有地圖，則返回
        if (!map) return;

        // 清除所有標記
        markers.forEach(marker => {
            map.removeLayer(marker);
        });

        // 清空標記數組
        markers = [];
    }

    // 在地圖上顯示指定的聯絡資訊
    function showContactOnMap(contact) {
        if (!map) {
            initializeMap();
        }

        // 清除現有標記
        clearMarkers();

        // 如果沒有坐標，則返回
        if (!contact.coordinates || contact.coordinates.length !== 2) return;

        const [lat, lng] = contact.coordinates;

        // 根據聯絡類型選擇圖標
        let icon;
        switch (contact.type) {
            case 'HOSPITAL':
                icon = L.divIcon({
                    html: '<i class="fas fa-hospital" style="color: #e74c3c;"></i>',
                    className: 'emergency-map-icon',
                    iconSize: [30, 30]
                });
                break;
            case 'POLICE':
                icon = L.divIcon({
                    html: '<i class="fas fa-shield-alt" style="color: #3498db;"></i>',
                    className: 'emergency-map-icon',
                    iconSize: [30, 30]
                });
                break;
            case 'EMBASSY':
                icon = L.divIcon({
                    html: '<i class="fas fa-flag" style="color: #2ecc71;"></i>',
                    className: 'emergency-map-icon',
                    iconSize: [30, 30]
                });
                break;
            default:
                icon = L.divIcon({
                    html: '<i class="fas fa-map-marker-alt" style="color: #e74c3c;"></i>',
                    className: 'emergency-map-icon',
                    iconSize: [30, 30]
                });
        }

        // 添加標記
        const marker = L.marker([lat, lng], { icon }).addTo(map);

        // 添加彈出說明
        marker.bindPopup(`
            <div class="emergency-popup">
                <h3>${contact.name}</h3>
                <p><strong>類型:</strong> ${contact.type}</p>
                ${contact.address ? `<p><strong>地址:</strong> ${contact.address}</p>` : ''}
                ${contact.phone ? `<p><strong>電話:</strong> ${contact.phone}</p>` : ''}
                ${contact.openingHours ? `<p><strong>開放時間:</strong> ${contact.openingHours}</p>` : ''}
                ${contact.notes ? `<p><strong>備註:</strong> ${contact.notes}</p>` : ''}
                <div class="popup-actions">
                    ${contact.phone ? `<a href="tel:${contact.phone}" class="popup-action"><i class="fas fa-phone"></i> 撥打</a>` : ''}
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" class="popup-action"><i class="fas fa-directions"></i> 導航</a>
                </div>
            </div>
        `).openPopup();

        // 將標記添加到標記數組
        markers.push(marker);

        // 調整地圖範圍
        map.setView([lat, lng], 15);
    }

    // 根據類型在地圖上顯示聯絡資訊
    function showOnMap(type) {
        if (!map) {
            initializeMap();
            return;
        }

        // 清除現有標記
        clearMarkers();

        // 如果沒有選擇國家，則返回
        if (!currentCountry) return;

        // 獲取當前國家的聯絡資訊
        const countryData = EmergencyContacts.getContactsByCountry(currentCountry);
        if (!countryData) return;

        let contacts = countryData.contacts;

        // 如果選擇了城市，只顯示該城市的聯絡資訊
        if (currentCity) {
            contacts = contacts.filter(contact => contact.city === currentCity);
        }

        // 如果選擇了類型，只顯示該類型的聯絡資訊
        if (type !== 'all') {
            contacts = contacts.filter(contact => contact.type === type);
        }

        // 如果沒有聯絡資訊，則返回
        if (contacts.length === 0) return;

        // 添加標記
        const bounds = L.latLngBounds();
        contacts.forEach(contact => {
            if (contact.coordinates && contact.coordinates.length === 2) {
                const [lat, lng] = contact.coordinates;

                // 根據聯絡類型選擇圖標
                let icon;
                switch (contact.type) {
                    case 'HOSPITAL':
                        icon = L.divIcon({
                            html: '<i class="fas fa-hospital" style="color: #e74c3c;"></i>',
                            className: 'emergency-map-icon',
                            iconSize: [30, 30]
                        });
                        break;
                    case 'POLICE':
                        icon = L.divIcon({
                            html: '<i class="fas fa-shield-alt" style="color: #3498db;"></i>',
                            className: 'emergency-map-icon',
                            iconSize: [30, 30]
                        });
                        break;
                    case 'EMBASSY':
                        icon = L.divIcon({
                            html: '<i class="fas fa-flag" style="color: #2ecc71;"></i>',
                            className: 'emergency-map-icon',
                            iconSize: [30, 30]
                        });
                        break;
                    default:
                        icon = L.divIcon({
                            html: '<i class="fas fa-map-marker-alt" style="color: #e74c3c;"></i>',
                            className: 'emergency-map-icon',
                            iconSize: [30, 30]
                        });
                }

                // 添加標記
                const marker = L.marker([lat, lng], { icon }).addTo(map);

                // 添加彈出說明
                marker.bindPopup(`
                    <div class="emergency-popup">
                        <h3>${contact.name}</h3>
                        <p><strong>類型:</strong> ${contact.type}</p>
                        ${contact.address ? `<p><strong>地址:</strong> ${contact.address}</p>` : ''}
                        ${contact.phone ? `<p><strong>電話:</strong> ${contact.phone}</p>` : ''}
                        ${contact.openingHours ? `<p><strong>開放時間:</strong> ${contact.openingHours}</p>` : ''}
                        ${contact.notes ? `<p><strong>備註:</strong> ${contact.notes}</p>` : ''}
                        <div class="popup-actions">
                            ${contact.phone ? `<a href="tel:${contact.phone}" class="popup-action"><i class="fas fa-phone"></i> 撥打</a>` : ''}
                            <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" class="popup-action"><i class="fas fa-directions"></i> 導航</a>
                        </div>
                    </div>
                `);

                // 將標記添加到標記數組
                markers.push(marker);

                // 擴展地圖範圍
                bounds.extend([lat, lng]);
            }
        });

        // 如果有標記，則調整地圖範圍
        if (markers.length > 0) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }

    // 測試緊急聯絡資訊功能
    function testEmergencyContact() {
        console.log('測試緊急聯絡資訊功能');

        // 打開緊急聯絡資訊面板
        openEmergencyContactPanel();

        // 預設選擇台灣
        currentCountry = '台灣';
        saveSettings();

        // 更新國家選擇器
        const countrySelectors = [
            'emergency-country-select',
            'contact-country-select',
            'map-country-select',
            'embassy-country-select'
        ];

        countrySelectors.forEach(selectorId => {
            const selector = document.getElementById(selectorId);
            if (selector) {
                selector.value = currentCountry;
            }
        });

        // 更新城市選擇器
        updateCitySelector('contact-city-select');
        updateCitySelector('map-city-select');

        // 預設選擇台北
        currentCity = '台北';
        saveSettings();

        // 更新城市選擇器
        const citySelectors = [
            'contact-city-select',
            'map-city-select'
        ];

        citySelectors.forEach(selectorId => {
            const selector = document.getElementById(selectorId);
            if (selector) {
                selector.value = currentCity;
            }
        });

        // 更新緊急電話
        updateEmergencyNumbers();

        // 更新聯絡資訊列表
        updateContactsList();

        // 更新地圖
        updateMap();

        // 更新大使館/領事館列表
        updateEmbassyList();

        console.log('緊急聯絡資訊功能測試完成');
    }

    // 公開 API
    return {
        init,
        openEmergencyContactPanel,
        testEmergencyContact
    };
