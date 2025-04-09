// 智慧行程推薦系統
const SmartItineraryRecommender = (function() {
    // 私有變數
    let userPreferences = {
        travelStyles: [],
        preferredTypes: [],
        avoidTypes: [],
        season: null,
        duration: 3, // 預設行程天數
        pace: 'normal', // 行程節奏: relaxed, normal, intensive
        budget: 'medium', // 預算: low, medium, high
        withChildren: false, // 是否有兒童同行
        withElderly: false, // 是否有老人同行
        preferredCountries: [], // 偏好的國家
        preferredCities: [] // 偏好的城市
    };

    // 當前季節
    function getCurrentSeason() {
        const month = new Date().getMonth() + 1; // 1-12
        
        if (month >= 3 && month <= 5) return 'SPRING';
        if (month >= 6 && month <= 8) return 'SUMMER';
        if (month >= 9 && month <= 11) return 'AUTUMN';
        return 'WINTER';
    }

    // 設置使用者偏好
    function setUserPreferences(preferences) {
        userPreferences = { ...userPreferences, ...preferences };
    }

    // 獲取使用者偏好
    function getUserPreferences() {
        return { ...userPreferences };
    }

    // 重置使用者偏好
    function resetUserPreferences() {
        userPreferences = {
            travelStyles: [],
            preferredTypes: [],
            avoidTypes: [],
            season: null,
            duration: 3,
            pace: 'normal',
            budget: 'medium',
            withChildren: false,
            withElderly: false,
            preferredCountries: [],
            preferredCities: []
        };
    }

    // 計算景點與使用者偏好的匹配度 (0-100)
    function calculateMatchScore(attraction) {
        let score = 50; // 基礎分數
        
        // 季節匹配
        const currentSeason = userPreferences.season || getCurrentSeason();
        if (attraction.bestSeasons.includes(currentSeason)) {
            score += 10;
        }
        
        // 旅遊風格匹配
        const styleMatches = attraction.suitableStyles.filter(style => 
            userPreferences.travelStyles.includes(style)
        ).length;
        
        if (styleMatches > 0) {
            score += Math.min(styleMatches * 5, 15); // 最多加15分
        }
        
        // 景點類型匹配
        const typeMatches = attraction.types.filter(type => 
            userPreferences.preferredTypes.includes(type)
        ).length;
        
        if (typeMatches > 0) {
            score += Math.min(typeMatches * 5, 15); // 最多加15分
        }
        
        // 避免的景點類型
        const avoidMatches = attraction.types.filter(type => 
            userPreferences.avoidTypes.includes(type)
        ).length;
        
        if (avoidMatches > 0) {
            score -= avoidMatches * 10; // 每個避免類型減10分
        }
        
        // 評分和人氣加分
        score += (attraction.rating - 3) * 5; // 3分以上的評分加分
        score += (attraction.popularity - 5) * 2; // 5分以上的人氣加分
        
        // 國家和城市偏好
        if (userPreferences.preferredCountries.includes(attraction.country)) {
            score += 5;
        }
        
        if (userPreferences.preferredCities.includes(attraction.city)) {
            score += 5;
        }
        
        // 特殊需求調整
        if (userPreferences.withChildren) {
            // 如果有兒童，適合家庭的景點加分
            if (attraction.suitableStyles.includes('FAMILY')) {
                score += 10;
            }
            
            // 某些類型的景點可能不太適合兒童
            if (attraction.types.includes('MUSEUM') && attraction.stayDuration > 2) {
                score -= 5; // 長時間參觀博物館對兒童不友好
            }
        }
        
        if (userPreferences.withElderly) {
            // 如果有老人，輕鬆的景點加分
            if (attraction.suitableStyles.includes('RELAXED')) {
                score += 10;
            }
            
            // 某些類型的景點可能不太適合老人
            if (attraction.types.includes('ADVENTURE') || 
                attraction.types.includes('MOUNTAIN')) {
                score -= 10;
            }
        }
        
        // 根據預算調整
        if (userPreferences.budget === 'low') {
            if (attraction.suitableStyles.includes('BUDGET')) {
                score += 10;
            }
            if (attraction.suitableStyles.includes('LUXURY')) {
                score -= 10;
            }
        } else if (userPreferences.budget === 'high') {
            if (attraction.suitableStyles.includes('LUXURY')) {
                score += 10;
            }
        }
        
        // 確保分數在0-100之間
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    // 根據使用者偏好推薦景點
    function recommendAttractions(options = {}) {
        const allAttractions = AttractionDatabase.getAllAttractions();
        const limit = options.limit || 10;
        
        // 計算每個景點的匹配分數
        const scoredAttractions = allAttractions.map(attraction => ({
            ...attraction,
            matchScore: calculateMatchScore(attraction)
        }));
        
        // 根據匹配分數排序
        const sortedAttractions = scoredAttractions.sort((a, b) => b.matchScore - a.matchScore);
        
        // 返回前N個景點
        return sortedAttractions.slice(0, limit);
    }

    // 根據使用者偏好和起點生成行程建議
    function generateItinerary(startingPoint, options = {}) {
        // 預設選項
        const defaultOptions = {
            daysCount: userPreferences.duration || 3,
            attractionsPerDay: 3,
            includeRecommendedStayDuration: true
        };
        
        const settings = { ...defaultOptions, ...options };
        
        // 如果沒有提供起點，無法生成行程
        if (!startingPoint) {
            return {
                success: false,
                error: '需要提供起點才能生成行程'
            };
        }
        
        try {
            // 獲取推薦景點
            const recommendedAttractions = recommendAttractions({
                limit: settings.daysCount * settings.attractionsPerDay * 2 // 獲取足夠多的景點以便選擇
            });
            
            // 按城市分組景點
            const attractionsByCity = {};
            recommendedAttractions.forEach(attraction => {
                if (!attractionsByCity[attraction.city]) {
                    attractionsByCity[attraction.city] = [];
                }
                attractionsByCity[attraction.city].push(attraction);
            });
            
            // 確定起點城市
            let startingCity = null;
            if (startingPoint.city) {
                startingCity = startingPoint.city;
            } else {
                // 嘗試根據座標或名稱確定城市
                // 這裡簡化處理，實際應用中可能需要更複雜的地理編碼
                const nearestAttraction = recommendedAttractions[0];
                startingCity = nearestAttraction.city;
            }
            
            // 生成每天的行程
            const itinerary = [];
            let currentCity = startingCity;
            let remainingAttractions = [...recommendedAttractions];
            
            for (let day = 0; day < settings.daysCount; day++) {
                // 當天的景點
                let dayAttractions = [];
                
                // 優先選擇當前城市的景點
                const cityAttractions = remainingAttractions.filter(a => a.city === currentCity);
                
                // 如果當前城市的景點不足，則選擇其他城市的景點
                if (cityAttractions.length < settings.attractionsPerDay) {
                    // 先添加當前城市的所有景點
                    dayAttractions = [...cityAttractions];
                    
                    // 從剩餘景點中選擇評分最高的補充
                    const otherAttractions = remainingAttractions
                        .filter(a => a.city !== currentCity)
                        .sort((a, b) => b.matchScore - a.matchScore)
                        .slice(0, settings.attractionsPerDay - dayAttractions.length);
                    
                    dayAttractions = [...dayAttractions, ...otherAttractions];
                    
                    // 更新當前城市為下一個景點的城市
                    if (otherAttractions.length > 0) {
                        currentCity = otherAttractions[0].city;
                    }
                } else {
                    // 當前城市景點足夠，選擇評分最高的幾個
                    dayAttractions = cityAttractions
                        .sort((a, b) => b.matchScore - a.matchScore)
                        .slice(0, settings.attractionsPerDay);
                }
                
                // 從剩餘景點中移除已選景點
                dayAttractions.forEach(attraction => {
                    const index = remainingAttractions.findIndex(a => a.id === attraction.id);
                    if (index !== -1) {
                        remainingAttractions.splice(index, 1);
                    }
                });
                
                // 添加到行程中
                itinerary.push({
                    day: day + 1,
                    date: new Date(Date.now() + day * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    city: currentCity,
                    attractions: dayAttractions.map(attraction => ({
                        ...attraction,
                        stayDuration: settings.includeRecommendedStayDuration ? attraction.stayDuration : undefined
                    }))
                });
            }
            
            return {
                success: true,
                startingPoint,
                itinerary,
                totalDays: settings.daysCount,
                totalAttractions: itinerary.reduce((sum, day) => sum + day.attractions.length, 0)
            };
        } catch (error) {
            console.error('生成行程時發生錯誤:', error);
            return {
                success: false,
                error: '生成行程時發生錯誤: ' + error.message
            };
        }
    }

    // 公開API
    return {
        setUserPreferences,
        getUserPreferences,
        resetUserPreferences,
        recommendAttractions,
        generateItinerary,
        getCurrentSeason
    };
})();
