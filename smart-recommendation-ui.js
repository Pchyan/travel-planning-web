// 智慧行程建議 UI 控制器
const SmartRecommendationUI = (function() {
    // 私有變數
    let isInitialized = false;
    let currentTab = 'preferences';
    let recommendedAttractions = [];
    let recommendedItinerary = null;

    // 初始化
    function init() {
        if (isInitialized) return;

        // 綁定按鈕事件
        document.getElementById('smart-recommendation').addEventListener('click', openRecommendationDialog);
        document.getElementById('close-recommendation').addEventListener('click', closeRecommendationDialog);

        // 綁定標籤切換事件
        document.getElementById('preferences-tab').addEventListener('click', () => switchTab('preferences'));
        document.getElementById('attractions-tab').addEventListener('click', () => switchTab('attractions'));
        document.getElementById('itinerary-tab').addEventListener('click', () => switchTab('itinerary'));

        // 綁定偏好設定按鈕事件
        document.getElementById('reset-preferences').addEventListener('click', resetPreferences);
        document.getElementById('apply-preferences').addEventListener('click', applyPreferences);

        // 綁定行程操作按鈕事件
        document.getElementById('modify-itinerary').addEventListener('click', modifyItinerary);
        document.getElementById('apply-itinerary').addEventListener('click', applyItinerary);

        // 填充選項
        populatePreferenceOptions();

        // 設置圖片錯誤處理
        setupImageErrorHandling();

        isInitialized = true;
        console.log('智慧行程建議 UI 已初始化');
    }

    // 填充偏好設定選項
    function populatePreferenceOptions() {
        // 填充旅遊風格選項
        const travelStyleSelect = document.getElementById('travel-style');
        const travelStyles = AttractionDatabase.getAllTravelStyles();

        for (const [key, value] of Object.entries(travelStyles)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value;
            travelStyleSelect.appendChild(option);
        }

        // 填充景點類型選項
        const preferredTypesSelect = document.getElementById('preferred-types');
        const avoidTypesSelect = document.getElementById('avoid-types');
        const attractionTypes = AttractionDatabase.getAllAttractionTypes();

        for (const [key, value] of Object.entries(attractionTypes)) {
            // 偏好景點類型
            const preferredOption = document.createElement('option');
            preferredOption.value = key;
            preferredOption.textContent = value;
            preferredTypesSelect.appendChild(preferredOption);

            // 避免景點類型
            const avoidOption = document.createElement('option');
            avoidOption.value = key;
            avoidOption.textContent = value;
            avoidTypesSelect.appendChild(avoidOption);
        }

        // 填充季節選項
        const seasonSelect = document.getElementById('travel-season');
        const seasons = AttractionDatabase.getAllSeasons();

        for (const [key, value] of Object.entries(seasons)) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = value;
            seasonSelect.appendChild(option);
        }

        // 填充國家選項
        const countriesSelect = document.getElementById('preferred-countries');
        const attractions = AttractionDatabase.getAllAttractions();
        const countries = [...new Set(attractions.map(a => a.country))].sort();

        countries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            option.textContent = country;
            countriesSelect.appendChild(option);
        });

        // 填充城市選項
        const citiesSelect = document.getElementById('preferred-cities');
        const cities = [...new Set(attractions.map(a => a.city))].sort();

        cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            option.textContent = city;
            citiesSelect.appendChild(option);
        });
    }

    // 打開推薦對話框
    function openRecommendationDialog() {
        // 顯示對話框
        document.getElementById('recommendation-dialog').classList.remove('hidden');

        // 預設顯示偏好設定標籤
        switchTab('preferences');

        console.log('已打開智慧行程建議對話框');
    }

    // 關閉推薦對話框
    function closeRecommendationDialog() {
        document.getElementById('recommendation-dialog').classList.add('hidden');
        console.log('已關閉智慧行程建議對話框');
    }

    // 切換標籤
    function switchTab(tabName) {
        // 更新當前標籤
        currentTab = tabName;

        // 更新標籤樣式
        document.querySelectorAll('.recommendation-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // 更新內容顯示
        document.querySelectorAll('.recommendation-section').forEach(section => {
            section.classList.add('hidden');
        });
        document.getElementById(`${tabName}-content`).classList.remove('hidden');

        // 如果切換到景點標籤，且尚未獲取推薦景點，則獲取推薦
        if (tabName === 'attractions' && recommendedAttractions.length === 0) {
            getRecommendedAttractions();
        }

        // 如果切換到行程標籤，且尚未生成行程建議，則生成行程
        if (tabName === 'itinerary' && !recommendedItinerary) {
            generateItinerary();
        }

        console.log(`已切換到 ${tabName} 標籤`);
    }

    // 重置偏好設定
    function resetPreferences() {
        // 重置旅遊風格
        document.getElementById('travel-style').selectedIndex = -1;

        // 重置偏好景點類型
        document.getElementById('preferred-types').selectedIndex = -1;

        // 重置避免景點類型
        document.getElementById('avoid-types').selectedIndex = -1;

        // 重置季節
        document.getElementById('travel-season').selectedIndex = 0;

        // 重置行程天數
        document.getElementById('travel-duration').value = 3;

        // 重置行程節奏
        document.getElementById('travel-pace').value = 'normal';

        // 重置旅遊預算
        document.getElementById('travel-budget').value = 'medium';

        // 重置特殊需求
        document.getElementById('with-children').checked = false;
        document.getElementById('with-elderly').checked = false;

        // 重置偏好國家
        document.getElementById('preferred-countries').selectedIndex = -1;

        // 重置偏好城市
        document.getElementById('preferred-cities').selectedIndex = -1;

        // 重置推薦器的偏好設定
        SmartItineraryRecommender.resetUserPreferences();

        // 清空推薦結果
        recommendedAttractions = [];
        recommendedItinerary = null;

        console.log('已重置偏好設定');
    }

    // 套用偏好設定
    function applyPreferences() {
        // 獲取用戶選擇的偏好
        const travelStyleSelect = document.getElementById('travel-style');
        const travelStyles = Array.from(travelStyleSelect.selectedOptions).map(option => option.value);

        const preferredTypesSelect = document.getElementById('preferred-types');
        const preferredTypes = Array.from(preferredTypesSelect.selectedOptions).map(option => option.value);

        const avoidTypesSelect = document.getElementById('avoid-types');
        const avoidTypes = Array.from(avoidTypesSelect.selectedOptions).map(option => option.value);

        const seasonSelect = document.getElementById('travel-season');
        const season = seasonSelect.value;

        const durationInput = document.getElementById('travel-duration');
        const duration = parseInt(durationInput.value, 10);

        const paceSelect = document.getElementById('travel-pace');
        const pace = paceSelect.value;

        const budgetSelect = document.getElementById('travel-budget');
        const budget = budgetSelect.value;

        const withChildren = document.getElementById('with-children').checked;
        const withElderly = document.getElementById('with-elderly').checked;

        const countriesSelect = document.getElementById('preferred-countries');
        const preferredCountries = Array.from(countriesSelect.selectedOptions).map(option => option.value);

        const citiesSelect = document.getElementById('preferred-cities');
        const preferredCities = Array.from(citiesSelect.selectedOptions).map(option => option.value);

        // 設置推薦器的偏好設定
        SmartItineraryRecommender.setUserPreferences({
            travelStyles,
            preferredTypes,
            avoidTypes,
            season,
            duration,
            pace,
            budget,
            withChildren,
            withElderly,
            preferredCountries,
            preferredCities
        });

        // 獲取推薦景點
        getRecommendedAttractions();

        // 切換到推薦景點標籤
        switchTab('attractions');

        console.log('已套用偏好設定');
    }

    // 獲取推薦景點
    function getRecommendedAttractions() {
        // 獲取推薦景點
        recommendedAttractions = SmartItineraryRecommender.recommendAttractions({ limit: 12 });

        // 顯示推薦景點
        displayRecommendedAttractions();

        console.log(`已獲取 ${recommendedAttractions.length} 個推薦景點`);
    }

    // 顯示推薦景點
    function displayRecommendedAttractions() {
        const attractionsGrid = document.querySelector('#attractions-content .attractions-grid');
        attractionsGrid.innerHTML = '';

        if (recommendedAttractions.length === 0) {
            attractionsGrid.innerHTML = '<p>沒有找到符合您偏好的景點，請調整偏好設定後重試。</p>';
            return;
        }

        recommendedAttractions.forEach(attraction => {
            const card = document.createElement('div');
            card.className = 'attraction-card';

            // 獲取景點圖片URL
            const imageUrl = getAttractionImageUrl(attraction);

            // 格式化景點類型
            const types = attraction.types.map(type => {
                const typeObj = AttractionDatabase.getAllAttractionTypes();
                return typeObj[type] || type;
            }).join(', ');

            card.innerHTML = `
                <img src="${imageUrl}" alt="${attraction.name}" class="attraction-image">
                <div class="attraction-content">
                    <h3 class="attraction-name">${attraction.name}</h3>
                    <div class="attraction-location">${attraction.city}, ${attraction.country}</div>
                    <div class="attraction-description">${attraction.description || '無描述'}</div>
                    <div class="attraction-tags">
                        ${types.split(', ').map(type => `<span class="attraction-tag">${type}</span>`).join('')}
                    </div>
                    <div class="attraction-meta">
                        <div class="attraction-rating">
                            <i class="fas fa-star"></i> ${attraction.rating.toFixed(1)}
                        </div>
                        <div class="attraction-duration">
                            <i class="far fa-clock"></i> ${attraction.stayDuration} 小時
                        </div>
                    </div>
                    <div class="attraction-actions">
                        <button class="add-to-itinerary" data-id="${attraction.id}">加入行程</button>
                        <button class="view-details" data-id="${attraction.id}">查看詳情</button>
                    </div>
                </div>
                <div class="attraction-match">${attraction.matchScore}% 匹配</div>
            `;

            // 綁定加入行程按鈕事件
            card.querySelector('.add-to-itinerary').addEventListener('click', () => {
                addAttractionToItinerary(attraction);
            });

            // 綁定查看詳情按鈕事件
            card.querySelector('.view-details').addEventListener('click', () => {
                showAttractionDetails(attraction);
            });

            attractionsGrid.appendChild(card);
        });
    }

    // 生成行程建議
    function generateItinerary() {
        // 檢查是否有出發點
        if (!startingPoint) {
            alert('請先設置出發點，再生成行程建議！');
            switchTab('preferences');
            return;
        }

        // 生成行程建議
        recommendedItinerary = SmartItineraryRecommender.generateItinerary(startingPoint);

        // 顯示行程建議
        displayRecommendedItinerary();

        console.log('已生成行程建議');
    }

    // 顯示行程建議
    function displayRecommendedItinerary() {
        const itineraryDays = document.querySelector('#itinerary-content .itinerary-days');
        itineraryDays.innerHTML = '';

        if (!recommendedItinerary || !recommendedItinerary.success) {
            itineraryDays.innerHTML = `<p>生成行程建議失敗：${recommendedItinerary ? recommendedItinerary.error : '未知錯誤'}</p>`;
            return;
        }

        recommendedItinerary.itinerary.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'itinerary-day';

            dayElement.innerHTML = `
                <div class="itinerary-day-header">
                    <h4 class="itinerary-day-title">第 ${day.day} 天</h4>
                    <div class="itinerary-day-date">${formatDate(day.date)}</div>
                </div>
                <div class="itinerary-attractions">
                    ${day.attractions.map(attraction => `
                        <div class="itinerary-attraction">
                            <img src="${getAttractionImageUrl(attraction, '80x80')}" alt="${attraction.name}" class="itinerary-attraction-image">
                            <div class="itinerary-attraction-details">
                                <h5 class="itinerary-attraction-name">${attraction.name}</h5>
                                <div class="itinerary-attraction-location">${attraction.city}, ${attraction.country}</div>
                                <div class="itinerary-attraction-meta">
                                    <div class="itinerary-attraction-rating">
                                        <i class="fas fa-star"></i> ${attraction.rating.toFixed(1)}
                                    </div>
                                    <div class="itinerary-attraction-duration">
                                        <i class="far fa-clock"></i> ${attraction.stayDuration} 小時
                                    </div>
                                    <div class="itinerary-attraction-match">
                                        <i class="fas fa-percentage"></i> ${attraction.matchScore}% 匹配
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

            itineraryDays.appendChild(dayElement);
        });
    }

    // 修改行程
    function modifyItinerary() {
        // 切換回偏好設定標籤
        switchTab('preferences');

        console.log('返回修改行程偏好設定');
    }

    // 套用行程
    function applyItinerary() {
        if (!recommendedItinerary || !recommendedItinerary.success) {
            alert('沒有可套用的行程建議！');
            return;
        }

        // 確認是否要套用行程
        if (!confirm('確定要套用此行程建議嗎？這將替換您當前的行程。')) {
            return;
        }

        try {
            // 清空當前行程
            destinations = [];

            // 添加推薦的景點
            recommendedItinerary.itinerary.forEach(day => {
                day.attractions.forEach(attraction => {
                    // 跳過第一天的第一個景點，因為它通常是出發點
                    if (day.day === 1 && day.attractions.indexOf(attraction) === 0) {
                        return;
                    }

                    // 添加景點到行程
                    destinations.push({
                        name: attraction.name,
                        coordinates: attraction.coordinates,
                        stayDuration: attraction.stayDuration,
                        country: attraction.country,
                        city: attraction.city
                    });
                });
            });

            // 更新地圖和行程
            updateMap();
            updateItinerary();

            // 關閉對話框
            closeRecommendationDialog();

            // 提示用戶
            alert('已成功套用行程建議！');

            console.log('已套用行程建議');
        } catch (error) {
            console.error('套用行程建議時出錯:', error);
            alert(`套用行程建議失敗: ${error.message}`);
        }
    }

    // 添加景點到行程
    function addAttractionToItinerary(attraction) {
        // 檢查是否有出發點
        if (!startingPoint) {
            alert('請先設置出發點，再添加景點！');
            return;
        }

        // 檢查景點是否已在行程中
        const isAlreadyAdded = destinations.some(dest =>
            dest.name === attraction.name &&
            dest.coordinates[0] === attraction.coordinates[0] &&
            dest.coordinates[1] === attraction.coordinates[1]
        );

        if (isAlreadyAdded) {
            alert('此景點已在您的行程中！');
            return;
        }

        // 添加景點到行程
        destinations.push({
            name: attraction.name,
            coordinates: attraction.coordinates,
            stayDuration: attraction.stayDuration,
            country: attraction.country,
            city: attraction.city
        });

        // 更新地圖和行程
        updateMap();
        updateItinerary();

        // 提示用戶
        alert(`已成功添加「${attraction.name}」到行程！`);

        console.log(`已添加景點 ${attraction.name} 到行程`);
    }

    // 顯示景點詳情
    function showAttractionDetails(attraction) {
        // 創建詳情對話框
        const detailsDialog = document.createElement('div');
        detailsDialog.className = 'recommendation-dialog';
        detailsDialog.style.zIndex = '1001'; // 確保在推薦對話框之上

        // 格式化景點類型
        const types = attraction.types.map(type => {
            const typeObj = AttractionDatabase.getAllAttractionTypes();
            return typeObj[type] || type;
        }).join(', ');

        // 格式化最佳季節
        const seasons = attraction.bestSeasons.map(season => {
            const seasonObj = AttractionDatabase.getAllSeasons();
            return seasonObj[season] || season;
        }).join(', ');

        // 格式化適合風格
        const styles = attraction.suitableStyles.map(style => {
            const styleObj = AttractionDatabase.getAllTravelStyles();
            return styleObj[style] || style;
        }).join(', ');

        detailsDialog.innerHTML = `
            <div class="recommendation-panel" style="max-width: 600px;">
                <div class="recommendation-header">
                    <h2>${attraction.name}</h2>
                    <button class="recommendation-close">&times;</button>
                </div>
                <div class="recommendation-content" style="padding: 20px;">
                    <img src="${getAttractionImageUrl(attraction, '600x300')}" alt="${attraction.name}" style="width: 100%; height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">

                    <div style="margin-bottom: 15px;">
                        <div style="font-size: 1.1rem; color: #666; margin-bottom: 5px;">
                            <i class="fas fa-map-marker-alt"></i> ${attraction.location || `${attraction.city}, ${attraction.country}`}
                        </div>
                        <div style="display: flex; gap: 15px; margin-bottom: 10px;">
                            <div style="display: flex; align-items: center;">
                                <i class="fas fa-star" style="color: #ffc107; margin-right: 5px;"></i>
                                <span>${attraction.rating.toFixed(1)} 分</span>
                            </div>
                            <div style="display: flex; align-items: center;">
                                <i class="far fa-clock" style="margin-right: 5px;"></i>
                                <span>建議停留 ${attraction.stayDuration} 小時</span>
                            </div>
                            <div style="display: flex; align-items: center;">
                                <i class="fas fa-percentage" style="margin-right: 5px;"></i>
                                <span>${attraction.matchScore}% 匹配度</span>
                            </div>
                        </div>
                    </div>

                    <div style="margin-bottom: 20px;">
                        <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 1.2rem;">景點描述</h3>
                        <p style="margin: 0; line-height: 1.6;">${attraction.description || '無描述'}</p>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                        <div>
                            <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 1.2rem;">景點類型</h3>
                            <p style="margin: 0;">${types}</p>
                        </div>
                        <div>
                            <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 1.2rem;">最佳季節</h3>
                            <p style="margin: 0;">${seasons}</p>
                        </div>
                        <div>
                            <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 1.2rem;">適合風格</h3>
                            <p style="margin: 0;">${styles}</p>
                        </div>
                        <div>
                            <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 1.2rem;">旅遊小提示</h3>
                            <p style="margin: 0;">${attraction.tips || '無特別提示'}</p>
                        </div>
                    </div>

                    <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
                        <button class="view-on-map" style="padding: 8px 15px; background-color: #f0f0f0; color: #555; border: none; border-radius: 4px; cursor: pointer;">在地圖上查看</button>
                        <button class="add-to-itinerary" style="padding: 8px 15px; background-color: #4a89dc; color: white; border: none; border-radius: 4px; cursor: pointer;">加入行程</button>
                    </div>
                </div>
            </div>
        `;

        // 添加到頁面
        document.body.appendChild(detailsDialog);

        // 綁定關閉按鈕事件
        detailsDialog.querySelector('.recommendation-close').addEventListener('click', () => {
            document.body.removeChild(detailsDialog);
        });

        // 綁定加入行程按鈕事件
        detailsDialog.querySelector('.add-to-itinerary').addEventListener('click', () => {
            addAttractionToItinerary(attraction);
            document.body.removeChild(detailsDialog);
        });

        // 綁定在地圖上查看按鈕事件
        detailsDialog.querySelector('.view-on-map').addEventListener('click', () => {
            // 在地圖上顯示景點位置
            map.setView(attraction.coordinates, 15);

            // 添加臨時標記
            const marker = L.marker(attraction.coordinates)
                .addTo(map)
                .bindPopup(`<b>${attraction.name}</b><br>${attraction.city}, ${attraction.country}`)
                .openPopup();

            // 5秒後移除標記
            setTimeout(() => {
                map.removeLayer(marker);
            }, 5000);

            // 關閉詳情對話框
            document.body.removeChild(detailsDialog);

            // 關閉推薦對話框
            closeRecommendationDialog();
        });

        console.log(`已顯示景點 ${attraction.name} 的詳情`);
    }

    // 格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // 獲取景點圖片URL
    function getAttractionImageUrl(attraction, size = '300x180') {
        // 將尺寸分解為寬和高
        const [width, height] = size.split('x').map(dim => parseInt(dim, 10));

        // 預設圖片，使用更可靠的備用圖片服務
        let imageUrl = `https://placehold.co/${width}x${height}/DEDEDE/333333?text=${encodeURIComponent(attraction.name)}`;

        // 檢查是否有本地圖片
        if (typeof LocalAttractionImages !== 'undefined' && attraction.id && LocalAttractionImages.hasLocalImage(attraction.id)) {
            // 使用本地圖片
            return LocalAttractionImages.getImageUrl(attraction.id, size);
        }

        // 根據景點類型選擇適合的備用圖片
        let backupImageUrl = '';

        // 備用圖片庫，使用更可靠的圖片服務
        if (attraction.types.includes(ATTRACTION_TYPES.NATURE)) {
            backupImageUrl = `https://source.unsplash.com/featured/${width}x${height}/?nature,landscape`;
        } else if (attraction.types.includes(ATTRACTION_TYPES.BEACH)) {
            backupImageUrl = `https://source.unsplash.com/featured/${width}x${height}/?beach,ocean`;
        } else if (attraction.types.includes(ATTRACTION_TYPES.MOUNTAIN)) {
            backupImageUrl = `https://source.unsplash.com/featured/${width}x${height}/?mountain,hiking`;
        } else if (attraction.types.includes(ATTRACTION_TYPES.HISTORICAL)) {
            backupImageUrl = `https://source.unsplash.com/featured/${width}x${height}/?historical,monument`;
        } else if (attraction.types.includes(ATTRACTION_TYPES.CULTURE)) {
            backupImageUrl = `https://source.unsplash.com/featured/${width}x${height}/?culture,art`;
        } else if (attraction.types.includes(ATTRACTION_TYPES.RELIGIOUS)) {
            backupImageUrl = `https://source.unsplash.com/featured/${width}x${height}/?temple,church`;
        } else if (attraction.types.includes(ATTRACTION_TYPES.FOOD)) {
            backupImageUrl = `https://source.unsplash.com/featured/${width}x${height}/?food,restaurant`;
        } else if (attraction.types.includes(ATTRACTION_TYPES.NIGHT_MARKET)) {
            backupImageUrl = `https://source.unsplash.com/featured/${width}x${height}/?market,street-food`;
        } else if (attraction.types.includes(ATTRACTION_TYPES.SHOPPING)) {
            backupImageUrl = `https://source.unsplash.com/featured/${width}x${height}/?shopping,mall`;
        } else if (attraction.types.includes(ATTRACTION_TYPES.ENTERTAINMENT)) {
            backupImageUrl = `https://source.unsplash.com/featured/${width}x${height}/?entertainment,concert`;
        } else if (attraction.types.includes(ATTRACTION_TYPES.PARK)) {
            backupImageUrl = `https://source.unsplash.com/featured/${width}x${height}/?park,garden`;
        } else if (attraction.types.includes(ATTRACTION_TYPES.MUSEUM)) {
            backupImageUrl = `https://source.unsplash.com/featured/${width}x${height}/?museum,exhibition`;
        } else if (attraction.types.includes(ATTRACTION_TYPES.SCENIC_SPOT)) {
            backupImageUrl = `https://source.unsplash.com/featured/${width}x${height}/?scenic,view`;
        } else {
            // 預設備用圖片
            backupImageUrl = `https://source.unsplash.com/featured/${width}x${height}/?travel,destination`;
        }

        // 如果有提供圖片URL，則嘗試使用它
        if (attraction.imageUrl) {
            // 檢查是否為維基百科圖片或其他不可靠的圖片來源
            if (attraction.imageUrl.includes('wikipedia.org') || attraction.imageUrl.includes('wikimedia.org')) {
                // 對於維基百科圖片，直接使用備用圖片
                imageUrl = backupImageUrl;
            } else {
                // 非維基百科圖片，嘗試使用原始圖片，但添加錯誤處理
                imageUrl = attraction.imageUrl;
            }
        } else {
            // 沒有提供圖片URL，使用備用圖片
            imageUrl = backupImageUrl;
        }

        // 返回圖片URL
        return imageUrl;
    }

    // 添加圖片錯誤處理函數
    function setupImageErrorHandling() {
        // 為所有景點圖片添加錯誤處理
        document.addEventListener('error', function(e) {
            const target = e.target;
            if (target.tagName.toLowerCase() === 'img' && target.classList.contains('attraction-image')) {
                // 獲取圖片尺寸
                const width = target.width || 300;
                const height = target.height || 180;

                // 如果圖片載入失敗，使用備用圖片
                const attractionName = target.alt || 'Attraction';
                const attractionCard = target.closest('.attraction-card');

                if (attractionCard) {
                    // 嘗試獲取景點類型
                    const typeElements = attractionCard.querySelectorAll('.attraction-tag');
                    let type = 'travel';

                    if (typeElements.length > 0) {
                        type = typeElements[0].textContent.toLowerCase();
                    }

                    // 設置備用圖片
                    target.src = `https://source.unsplash.com/featured/${width}x${height}/?${type},travel`;
                } else {
                    // 如果無法確定類型，使用通用旅遊圖片
                    target.src = `https://source.unsplash.com/featured/${width}x${height}/?travel,destination`;
                }
            } else if (target.tagName.toLowerCase() === 'img' && target.classList.contains('itinerary-attraction-image')) {
                // 處理行程建議中的圖片
                const width = target.width || 80;
                const height = target.height || 80;
                target.src = `https://source.unsplash.com/featured/${width}x${height}/?travel,destination`;
            }
        }, true);
    }

    // 公開API
    return {
        init
    };
})();
