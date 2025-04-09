// 本地景點圖片資料庫
const LocalAttractionImages = (function() {
    // 景點圖片映射表
    const attractionImages = {
        // 台灣景點
        'taipei101': 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=600&h=400&fit=crop',
        'national_palace_museum': 'https://images.unsplash.com/photo-1600506113428-5f52334716f5?w=600&h=400&fit=crop',
        'jiufen': 'https://images.unsplash.com/photo-1470004914212-05527e49370b?w=600&h=400&fit=crop',
        'taroko_gorge': 'https://images.unsplash.com/photo-1566907225472-1f52636c7a69?w=600&h=400&fit=crop',
        'sun_moon_lake': 'https://images.unsplash.com/photo-1558628116-7705404ff095?w=600&h=400&fit=crop',
        'alishan': 'https://images.unsplash.com/photo-1544042591-c8e93f4d54a2?w=600&h=400&fit=crop',
        'kenting': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
        'shilin_night_market': 'https://images.unsplash.com/photo-1518983546435-91f8b87fe561?w=600&h=400&fit=crop',
        'ximending': 'https://images.unsplash.com/photo-1516822003754-cca485356ecb?w=600&h=400&fit=crop',
        'yangmingshan': 'https://images.unsplash.com/photo-1501446529957-6226bd447c46?w=600&h=400&fit=crop',
        'longshan_temple': 'https://images.unsplash.com/photo-1518599807935-37015b9cefcb?w=600&h=400&fit=crop',
        'tamsui_old_street': 'https://images.unsplash.com/photo-1516822003754-cca485356ecb?w=600&h=400&fit=crop',

        // 日本景點
        'tokyo_tower': 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=600&h=400&fit=crop',
        'fushimi_inari': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop',
        'mount_fuji': 'https://images.unsplash.com/photo-1546529249-8de036dd3c9a?w=600&h=400&fit=crop',
        'arashiyama_bamboo_grove': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=600&h=400&fit=crop',
        'kinkakuji': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600&h=400&fit=crop',
        'akihabara': 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=600&h=400&fit=crop',
        'shinjuku_gyoen': 'https://images.unsplash.com/photo-1554797589-7241bb691973?w=600&h=400&fit=crop',

        // 韓國景點
        'gyeongbokgung': 'https://images.unsplash.com/photo-1548116137-c9ac24e446c9?w=600&h=400&fit=crop',
        'namsan_tower': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&h=400&fit=crop',
        'myeongdong': 'https://images.unsplash.com/photo-1519138154685-5e2e7a3b1c8a?w=600&h=400&fit=crop',
        'bukchon_hanok_village': 'https://images.unsplash.com/photo-1548116137-c9ac24e446c9?w=600&h=400&fit=crop',

        // 泰國景點
        'grand_palace': 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&h=400&fit=crop',
        'wat_arun': 'https://images.unsplash.com/photo-1528181304800-259b08848526?w=600&h=400&fit=crop',
        'chatuchak_market': 'https://images.unsplash.com/photo-1519138154685-5e2e7a3b1c8a?w=600&h=400&fit=crop',
        'phi_phi_islands': 'https://images.unsplash.com/photo-1468413253725-0d5181091126?w=600&h=400&fit=crop',

        // 中國景點
        'great_wall': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=600&h=400&fit=crop',
        'forbidden_city': 'https://images.unsplash.com/photo-1584646098378-0874589d76b1?w=600&h=400&fit=crop',
        'terracotta_army': 'https://images.unsplash.com/photo-1591122947157-26bad3a117d2?w=600&h=400&fit=crop',
        'west_lake': 'https://images.unsplash.com/photo-1598887142487-2e7829cda8c0?w=600&h=400&fit=crop',
        'li_river': 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?w=600&h=400&fit=crop',
        'victoria_harbour': 'https://images.unsplash.com/photo-1558686613-df95f16e0c67?w=600&h=400&fit=crop',
        'zhangjiajie': 'https://images.unsplash.com/photo-1513415564515-4e711743e5a9?w=600&h=400&fit=crop',
        'huangshan': 'https://images.unsplash.com/photo-1586767451503-a8e6a5b6a824?w=600&h=400&fit=crop',
        'jiuzhaigou': 'https://images.unsplash.com/photo-1546436836-07a91091f160?w=600&h=400&fit=crop',

        // 越南景點
        'ha_long_bay': 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop',
        'hoi_an': 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=600&h=400&fit=crop',
        'mekong_delta': 'https://images.unsplash.com/photo-1528127269322-539801943592?w=600&h=400&fit=crop',
        'hanoi_old_quarter': 'https://images.unsplash.com/photo-1555921015-5532091f6026?w=600&h=400&fit=crop',
        'sapa_terraces': 'https://images.unsplash.com/photo-1528642474498-1af0c17fd8c3?w=600&h=400&fit=crop',

        // 新加坡景點
        'gardens_by_the_bay': 'https://images.unsplash.com/photo-1506351421178-63b52a2d2562?w=600&h=400&fit=crop',
        'marina_bay_sands': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=600&h=400&fit=crop',
        'sentosa_island': 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=600&h=400&fit=crop',
        'singapore_botanic_gardens': 'https://images.unsplash.com/photo-1588935365434-e7a9f1f98ec9?w=600&h=400&fit=crop',
        'chinatown_singapore': 'https://images.unsplash.com/photo-1565192259022-0427b058f372?w=600&h=400&fit=crop',
        'singapore_zoo': 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=600&h=400&fit=crop',

        // 法國景點
        'eiffel_tower': 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e?w=600&h=400&fit=crop',
        'louvre_museum': 'https://images.unsplash.com/photo-1565099824688-e8c8a0b1bcd2?w=600&h=400&fit=crop',
        'mont_saint_michel': 'https://images.unsplash.com/photo-1591375782101-5db9d13b5d02?w=600&h=400&fit=crop',
        'versailles_palace': 'https://images.unsplash.com/photo-1551868230-3a8bdc6d9056?w=600&h=400&fit=crop',
        'notre_dame_cathedral': 'https://images.unsplash.com/photo-1541845157-a6d2d100c931?w=600&h=400&fit=crop',

        // 義大利景點
        'colosseum': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=600&h=400&fit=crop',
        'venice_canals': 'https://images.unsplash.com/photo-1534113414509-0eec2bfb493f?w=600&h=400&fit=crop',
        'florence_cathedral': 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=600&h=400&fit=crop',
        'pompeii': 'https://images.unsplash.com/photo-1516553566992-c4e83f8559e8?w=600&h=400&fit=crop',
        'amalfi_coast': 'https://images.unsplash.com/photo-1533676802871-eca1ae998cd5?w=600&h=400&fit=crop',
        'vatican_city': 'https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=600&h=400&fit=crop',

        // 英國景點
        'big_ben': 'https://images.unsplash.com/photo-1500380804539-4e1e8c1e7118?w=600&h=400&fit=crop',
        'tower_of_london': 'https://images.unsplash.com/photo-1589399516908-cf0cd3094e59?w=600&h=400&fit=crop',

        // 西班牙景點
        'sagrada_familia': 'https://images.unsplash.com/photo-1583779457094-ab6f9164a1c8?w=600&h=400&fit=crop',
        'park_guell': 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=600&h=400&fit=crop',

        // 美國景點
        'statue_of_liberty': 'https://images.unsplash.com/photo-1605130284535-11dd9eedc58a?w=600&h=400&fit=crop',
        'grand_canyon': 'https://images.unsplash.com/photo-1575527048208-933d8f52c3fa?w=600&h=400&fit=crop',
        'times_square': 'https://images.unsplash.com/photo-1534430480872-3498386e7856?w=600&h=400&fit=crop',
        'golden_gate_bridge': 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=600&h=400&fit=crop',
        'yellowstone': 'https://images.unsplash.com/photo-1576003262192-384ad5037f8e?w=600&h=400&fit=crop',

        // 澳洲景點
        'sydney_opera_house': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=600&h=400&fit=crop',
        'great_barrier_reef': 'https://images.unsplash.com/photo-1523554888454-84137e72c3ce?w=600&h=400&fit=crop',
        'uluru': 'https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?w=600&h=400&fit=crop',

        // 紐西蘭景點
        'milford_sound': 'https://images.unsplash.com/photo-1578284808834-e85c3e9e1990?w=600&h=400&fit=crop',
        'hobbiton': 'https://images.unsplash.com/photo-1578146189990-980fbe919e97?w=600&h=400&fit=crop',
        'rotorua': 'https://images.unsplash.com/photo-1601015565699-c5c2c5a1be2a?w=600&h=400&fit=crop'
    };

    // 獲取景點圖片
    function getImageUrl(attractionId, size = '600x400') {
        // 檢查是否有本地圖片
        if (attractionImages[attractionId]) {
            // 解析尺寸
            const [width, height] = size.split('x').map(dim => parseInt(dim, 10));

            // 返回適當尺寸的圖片
            const imageUrl = attractionImages[attractionId];

            // 如果圖片URL包含尺寸參數，則替換它們
            if (imageUrl.includes('w=') && imageUrl.includes('h=')) {
                return imageUrl.replace(/w=\d+/, `w=${width}`).replace(/h=\d+/, `h=${height}`);
            }

            return imageUrl;
        }

        // 如果沒有本地圖片，返回null
        return null;
    }

    // 檢查是否有本地圖片
    function hasLocalImage(attractionId) {
        return !!attractionImages[attractionId];
    }

    // 公開API
    return {
        getImageUrl,
        hasLocalImage
    };
})();
