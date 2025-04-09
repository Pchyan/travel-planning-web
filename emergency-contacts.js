/**
 * 緊急聯絡資訊資料庫
 * 提供各國家/地區的大使館、醫院、警察局等緊急聯絡資訊
 */

const EmergencyContacts = (function() {
    // 緊急聯絡資訊類型
    const CONTACT_TYPES = {
        EMBASSY: '大使館/領事館',
        HOSPITAL: '醫院',
        POLICE: '警察局',
        FIRE: '消防局',
        AMBULANCE: '救護車',
        TOURIST_POLICE: '觀光警察',
        EMERGENCY_HOTLINE: '緊急熱線',
        TOURIST_HELP: '旅遊協助',
        LOST_PROPERTY: '失物招領',
        DISASTER: '災害應變中心'
    };

    // 緊急聯絡資訊資料庫
    const emergencyContacts = [
        // 台灣
        {
            country: '台灣',
            countryCode: 'TW',
            emergencyNumbers: {
                police: '110',
                ambulance: '119',
                fire: '119',
                tourist: '0800-011-765'
            },
            contacts: [
                {
                    name: '台北市立聯合醫院',
                    type: CONTACT_TYPES.HOSPITAL,
                    city: '台北',
                    address: '台北市大同區鄭州路145號',
                    phone: '+886-2-2555-3000',
                    website: 'https://tpech.gov.taipei/',
                    coordinates: [25.0504, 121.5150],
                    description: '台北市立聯合醫院為台北市政府衛生局所屬的公立醫院，提供24小時急診服務。',
                    languages: ['中文', '英文'],
                    openingHours: '24小時',
                    notes: '急診部提供全天候服務'
                },
                {
                    name: '台北市政府警察局',
                    type: CONTACT_TYPES.POLICE,
                    city: '台北',
                    address: '台北市中正區延平南路96號',
                    phone: '+886-2-2331-3561',
                    website: 'https://police.gov.taipei/',
                    coordinates: [25.0383, 121.5101],
                    description: '台北市政府警察局為台北市的警察總部，負責維護台北市的治安。',
                    languages: ['中文', '英文'],
                    openingHours: '24小時',
                    notes: '提供英語服務'
                },
                {
                    name: '台北市政府消防局',
                    type: CONTACT_TYPES.FIRE,
                    city: '台北',
                    address: '台北市松山區八德路四段421號',
                    phone: '+886-2-2729-7668',
                    website: 'https://fire.gov.taipei/',
                    coordinates: [25.0504, 121.5679],
                    description: '台北市政府消防局負責台北市的消防及災害防救工作。',
                    languages: ['中文'],
                    openingHours: '24小時',
                    notes: '緊急情況請撥打119'
                },
                {
                    name: '台灣觀光警察大隊',
                    type: CONTACT_TYPES.TOURIST_POLICE,
                    city: '台北',
                    address: '台北市中正區忠孝東路一段7號',
                    phone: '+886-2-2331-3561',
                    website: 'https://www.npa.gov.tw/',
                    coordinates: [25.0461, 121.5212],
                    description: '台灣觀光警察大隊專責處理觀光旅遊相關治安問題，提供外語服務。',
                    languages: ['中文', '英文', '日文'],
                    openingHours: '24小時',
                    notes: '提供英語和日語服務'
                },
                {
                    name: '交通部觀光局旅遊服務中心',
                    type: CONTACT_TYPES.TOURIST_HELP,
                    city: '台北',
                    address: '台北市中正區忠孝東路一段4號',
                    phone: '+886-2-2717-3737',
                    website: 'https://www.taiwan.net.tw/',
                    coordinates: [25.0461, 121.5200],
                    description: '提供旅遊資訊、諮詢服務及旅遊糾紛協助。',
                    languages: ['中文', '英文', '日文'],
                    openingHours: '09:00-17:00',
                    notes: '旅遊諮詢熱線：0800-011-765'
                }
            ]
        },
        // 日本
        {
            country: '日本',
            countryCode: 'JP',
            emergencyNumbers: {
                police: '110',
                ambulance: '119',
                fire: '119',
                tourist: '050-3816-2787'
            },
            contacts: [
                {
                    name: '台北駐日經濟文化代表處',
                    type: CONTACT_TYPES.EMBASSY,
                    city: '東京',
                    address: '東京都港區白金台5-20-2',
                    phone: '+81-3-3280-7811',
                    website: 'https://www.roc-taiwan.org/jp/',
                    coordinates: [35.6379, 139.7264],
                    description: '台灣在日本的官方代表機構，提供領事服務及緊急協助。',
                    languages: ['中文', '日文', '英文'],
                    openingHours: '週一至週五 09:00-17:00',
                    notes: '緊急聯絡電話：+81-90-3208-7964'
                },
                {
                    name: '東京都立病院',
                    type: CONTACT_TYPES.HOSPITAL,
                    city: '東京',
                    address: '東京都新宿區西新宿2-8-1',
                    phone: '+81-3-5320-5838',
                    website: 'https://www.byouin.metro.tokyo.lg.jp/',
                    coordinates: [35.6895, 139.6917],
                    description: '東京都立醫院提供24小時急診服務，部分醫護人員可使用英語。',
                    languages: ['日文', '英文'],
                    openingHours: '24小時',
                    notes: '建議攜帶護照和保險資訊'
                },
                {
                    name: '東京警視廳',
                    type: CONTACT_TYPES.POLICE,
                    city: '東京',
                    address: '東京都千代田區霞が関2-1-1',
                    phone: '+81-3-3581-4321',
                    website: 'https://www.keishicho.metro.tokyo.jp/',
                    coordinates: [35.6769, 139.7494],
                    description: '東京警視廳是日本最大的警察機關，負責東京都的治安維護。',
                    languages: ['日文', '英文'],
                    openingHours: '24小時',
                    notes: '緊急情況請撥打110'
                },
                {
                    name: 'Japan Visitor Hotline',
                    type: CONTACT_TYPES.TOURIST_HELP,
                    city: '全國',
                    address: '',
                    phone: '+81-50-3816-2787',
                    website: 'https://www.japan.travel/en/',
                    coordinates: [35.6762, 139.6503],
                    description: '日本國家旅遊局提供的24小時多語言旅遊諮詢熱線。',
                    languages: ['英文', '中文', '韓文', '日文'],
                    openingHours: '24小時',
                    notes: '提供旅遊資訊、緊急協助和翻譯服務'
                }
            ]
        },
        // 美國
        {
            country: '美國',
            countryCode: 'US',
            emergencyNumbers: {
                police: '911',
                ambulance: '911',
                fire: '911',
                tourist: ''
            },
            contacts: [
                {
                    name: '駐美國台北經濟文化代表處',
                    type: CONTACT_TYPES.EMBASSY,
                    city: '華盛頓',
                    address: '4201 Wisconsin Avenue, N.W., Washington, D.C. 20016, U.S.A.',
                    phone: '+1-202-895-1800',
                    website: 'https://www.roc-taiwan.org/us/',
                    coordinates: [38.9410, -77.0794],
                    description: '台灣在美國的官方代表機構，提供領事服務及緊急協助。',
                    languages: ['中文', '英文'],
                    openingHours: '週一至週五 09:00-17:00',
                    notes: '緊急聯絡電話：+1-202-669-0180'
                },
                {
                    name: 'George Washington University Hospital',
                    type: CONTACT_TYPES.HOSPITAL,
                    city: '華盛頓',
                    address: '900 23rd St NW, Washington, DC 20037',
                    phone: '+1-202-715-4000',
                    website: 'https://www.gwhospital.com/',
                    coordinates: [38.9010, -77.0503],
                    description: '喬治華盛頓大學醫院提供24小時急診服務。',
                    languages: ['英文'],
                    openingHours: '24小時',
                    notes: '建議攜帶護照和保險資訊'
                },
                {
                    name: 'New York Presbyterian Hospital',
                    type: CONTACT_TYPES.HOSPITAL,
                    city: '紐約',
                    address: '525 E 68th St, New York, NY 10065',
                    phone: '+1-212-746-5454',
                    website: 'https://www.nyp.org/',
                    coordinates: [40.7644, -73.9546],
                    description: '紐約長老會醫院是紐約市的主要醫療中心之一，提供24小時急診服務。',
                    languages: ['英文', '西班牙文', '中文'],
                    openingHours: '24小時',
                    notes: '提供翻譯服務'
                },
                {
                    name: 'NYPD - New York Police Department',
                    type: CONTACT_TYPES.POLICE,
                    city: '紐約',
                    address: 'One Police Plaza, New York, NY 10038',
                    phone: '+1-646-610-5000',
                    website: 'https://www1.nyc.gov/site/nypd/index.page',
                    coordinates: [40.7128, -74.0060],
                    description: '紐約市警察局總部，負責紐約市的治安維護。',
                    languages: ['英文'],
                    openingHours: '24小時',
                    notes: '緊急情況請撥打911'
                }
            ]
        },
        // 中國
        {
            country: '中國',
            countryCode: 'CN',
            emergencyNumbers: {
                police: '110',
                ambulance: '120',
                fire: '119',
                tourist: ''
            },
            contacts: [
                {
                    name: '北京協和醫院',
                    type: CONTACT_TYPES.HOSPITAL,
                    city: '北京',
                    address: '北京市東城區帥府園一號',
                    phone: '+86-10-6915-6114',
                    website: 'http://www.pumch.cn/',
                    coordinates: [39.9139, 116.4174],
                    description: '北京協和醫院是中國頂尖的醫療機構之一，提供24小時急診服務。',
                    languages: ['中文', '英文'],
                    openingHours: '24小時',
                    notes: '國際醫療部可提供英語服務'
                },
                {
                    name: '上海瑞金醫院',
                    type: CONTACT_TYPES.HOSPITAL,
                    city: '上海',
                    address: '上海市瑞金二路197號',
                    phone: '+86-21-6437-0045',
                    website: 'http://www.rjh.com.cn/',
                    coordinates: [31.2165, 121.4686],
                    description: '上海瑞金醫院是上海的主要醫療機構之一，提供24小時急診服務。',
                    languages: ['中文', '英文'],
                    openingHours: '24小時',
                    notes: '國際醫療部可提供英語服務'
                },
                {
                    name: '北京市公安局',
                    type: CONTACT_TYPES.POLICE,
                    city: '北京',
                    address: '北京市東城區前門東大街9號',
                    phone: '+86-10-8402-0101',
                    website: 'http://gaj.beijing.gov.cn/',
                    coordinates: [39.9042, 116.4074],
                    description: '北京市公安局負責北京市的治安維護。',
                    languages: ['中文'],
                    openingHours: '24小時',
                    notes: '緊急情況請撥打110'
                },
                {
                    name: '上海市公安局',
                    type: CONTACT_TYPES.POLICE,
                    city: '上海',
                    address: '上海市黃浦區福州路185號',
                    phone: '+86-21-2411-1000',
                    website: 'http://gaj.sh.gov.cn/',
                    coordinates: [31.2304, 121.4737],
                    description: '上海市公安局負責上海市的治安維護。',
                    languages: ['中文'],
                    openingHours: '24小時',
                    notes: '緊急情況請撥打110'
                }
            ]
        },
        // 泰國
        {
            country: '泰國',
            countryCode: 'TH',
            emergencyNumbers: {
                police: '191',
                ambulance: '1669',
                fire: '199',
                tourist: '1155'
            },
            contacts: [
                {
                    name: '駐泰國台北經濟文化辦事處',
                    type: CONTACT_TYPES.EMBASSY,
                    city: '曼谷',
                    address: '20th Fl., Empire Tower, 195 South Sathorn Rd., Bangkok 10120, Thailand',
                    phone: '+66-2-670-0200',
                    website: 'https://www.roc-taiwan.org/th/',
                    coordinates: [13.7215, 100.5293],
                    description: '台灣在泰國的官方代表機構，提供領事服務及緊急協助。',
                    languages: ['中文', '泰文', '英文'],
                    openingHours: '週一至週五 09:00-17:00',
                    notes: '緊急聯絡電話：+66-81-666-4006'
                },
                {
                    name: 'Bumrungrad International Hospital',
                    type: CONTACT_TYPES.HOSPITAL,
                    city: '曼谷',
                    address: '33 Sukhumvit 3, Khlong Toei Nuea, Watthana, Bangkok 10110',
                    phone: '+66-2-066-8888',
                    website: 'https://www.bumrungrad.com/',
                    coordinates: [13.7437, 100.5548],
                    description: 'Bumrungrad國際醫院是泰國最大的私立醫院之一，提供國際標準的醫療服務。',
                    languages: ['泰文', '英文', '中文', '日文', '阿拉伯文'],
                    openingHours: '24小時',
                    notes: '提供多語言服務，包括中文'
                },
                {
                    name: 'Tourist Police',
                    type: CONTACT_TYPES.TOURIST_POLICE,
                    city: '曼谷',
                    address: '1st Division, Tourist Police, Phaya Thai Rd., Bangkok',
                    phone: '1155',
                    website: 'https://tourist.police.go.th/',
                    coordinates: [13.7563, 100.5018],
                    description: '泰國觀光警察專責處理觀光旅遊相關治安問題，提供外語服務。',
                    languages: ['泰文', '英文'],
                    openingHours: '24小時',
                    notes: '緊急情況請撥打1155'
                }
            ]
        },
        // 新加坡
        {
            country: '新加坡',
            countryCode: 'SG',
            emergencyNumbers: {
                police: '999',
                ambulance: '995',
                fire: '995',
                tourist: ''
            },
            contacts: [
                {
                    name: '駐新加坡台北代表處',
                    type: CONTACT_TYPES.EMBASSY,
                    city: '新加坡',
                    address: '460 Alexandra Road, #23-00 PSA Building, Singapore 119963',
                    phone: '+65-6500-0100',
                    website: 'https://www.roc-taiwan.org/sg/',
                    coordinates: [1.2741, 103.8003],
                    description: '台灣在新加坡的官方代表機構，提供領事服務及緊急協助。',
                    languages: ['中文', '英文'],
                    openingHours: '週一至週五 09:00-17:00',
                    notes: '緊急聯絡電話：+65-9229-9722'
                },
                {
                    name: 'Singapore General Hospital',
                    type: CONTACT_TYPES.HOSPITAL,
                    city: '新加坡',
                    address: 'Outram Road, Singapore 169608',
                    phone: '+65-6222-3322',
                    website: 'https://www.sgh.com.sg/',
                    coordinates: [1.2795, 103.8347],
                    description: '新加坡中央醫院是新加坡最大的公立醫院，提供24小時急診服務。',
                    languages: ['英文', '中文', '馬來文', '泰米爾文'],
                    openingHours: '24小時',
                    notes: '提供多語言服務'
                },
                {
                    name: 'Singapore Police Force',
                    type: CONTACT_TYPES.POLICE,
                    city: '新加坡',
                    address: 'New Phoenix Park, 28 Irrawaddy Road, Singapore 329560',
                    phone: '+65-6555-0000',
                    website: 'https://www.police.gov.sg/',
                    coordinates: [1.3236, 103.8433],
                    description: '新加坡警察部隊負責新加坡的治安維護。',
                    languages: ['英文', '中文', '馬來文', '泰米爾文'],
                    openingHours: '24小時',
                    notes: '緊急情況請撥打999'
                }
            ]
        },
        // 韓國
        {
            country: '韓國',
            countryCode: 'KR',
            emergencyNumbers: {
                police: '112',
                ambulance: '119',
                fire: '119',
                tourist: '1330'
            },
            contacts: [
                {
                    name: '駐韓國台北代表部',
                    type: CONTACT_TYPES.EMBASSY,
                    city: '首爾',
                    address: '6-1, Sunhwa-dong, Jung-gu, Seoul, Republic of Korea',
                    phone: '+82-2-6329-6000',
                    website: 'https://www.roc-taiwan.org/kr/',
                    coordinates: [37.5605, 126.9780],
                    description: '台灣在韓國的官方代表機構，提供領事服務及緊急協助。',
                    languages: ['中文', '韓文', '英文'],
                    openingHours: '週一至週五 09:00-17:00',
                    notes: '緊急聯絡電話：+82-10-8751-0601'
                },
                {
                    name: 'Seoul National University Hospital',
                    type: CONTACT_TYPES.HOSPITAL,
                    city: '首爾',
                    address: '101 Daehak-ro, Jongno-gu, Seoul, Republic of Korea',
                    phone: '+82-2-2072-2114',
                    website: 'http://www.snuh.org/global/en/',
                    coordinates: [37.5798, 126.9989],
                    description: '首爾大學醫院是韓國最大的醫療機構之一，提供24小時急診服務。',
                    languages: ['韓文', '英文'],
                    openingHours: '24小時',
                    notes: '國際醫療中心可提供英語服務'
                },
                {
                    name: 'Seoul Metropolitan Police Agency',
                    type: CONTACT_TYPES.POLICE,
                    city: '首爾',
                    address: '31, Sajik-ro 8-gil, Jongno-gu, Seoul, Republic of Korea',
                    phone: '+82-2-112',
                    website: 'https://www.smpa.go.kr/',
                    coordinates: [37.5759, 126.9769],
                    description: '首爾警察廳負責首爾市的治安維護。',
                    languages: ['韓文', '英文'],
                    openingHours: '24小時',
                    notes: '緊急情況請撥打112'
                },
                {
                    name: 'Korea Tourism Organization Tourist Information Center',
                    type: CONTACT_TYPES.TOURIST_HELP,
                    city: '首爾',
                    address: '40, Cheonggyecheon-ro, Jung-gu, Seoul, Republic of Korea',
                    phone: '+82-2-1330',
                    website: 'https://english.visitkorea.or.kr/',
                    coordinates: [37.5680, 126.9830],
                    description: '韓國觀光公社提供的旅遊資訊中心，提供多語言旅遊諮詢服務。',
                    languages: ['韓文', '英文', '中文', '日文'],
                    openingHours: '09:00-20:00',
                    notes: '旅遊諮詢熱線：1330（提供英語、中文、日語服務）'
                }
            ]
        }
    ];

    // 根據國家獲取緊急聯絡資訊
    function getContactsByCountry(country) {
        const countryData = emergencyContacts.find(c => c.country === country);
        return countryData || null;
    }

    // 根據國家和城市獲取緊急聯絡資訊
    function getContactsByCity(country, city) {
        const countryData = getContactsByCountry(country);
        if (!countryData) return null;

        const cityContacts = countryData.contacts.filter(contact => contact.city === city);
        return {
            country: countryData.country,
            countryCode: countryData.countryCode,
            emergencyNumbers: countryData.emergencyNumbers,
            contacts: cityContacts
        };
    }

    // 根據國家和類型獲取緊急聯絡資訊
    function getContactsByType(country, type) {
        const countryData = getContactsByCountry(country);
        if (!countryData) return null;

        const typeContacts = countryData.contacts.filter(contact => contact.type === type);
        return {
            country: countryData.country,
            countryCode: countryData.countryCode,
            emergencyNumbers: countryData.emergencyNumbers,
            contacts: typeContacts
        };
    }

    // 獲取所有國家列表
    function getAllCountries() {
        return emergencyContacts.map(c => c.country);
    }

    // 獲取所有聯絡類型
    function getAllContactTypes() {
        return CONTACT_TYPES;
    }

    // 獲取所有緊急聯絡資訊
    function getAllContacts() {
        return emergencyContacts;
    }

    // 公開API
    return {
        getContactsByCountry,
        getContactsByCity,
        getContactsByType,
        getAllCountries,
        getAllContactTypes,
        getAllContacts
    };
})();
