/**
 * 全球主要城市交通卡資料庫
 * 提供各城市交通卡的詳細資訊，包括購買地點、價格和使用方法
 */

const TRANSIT_CARDS = {
    // 台灣
    '台灣': {
        '台北': [
            {
                id: 'easycard',
                name: '悠遊卡',
                image: 'https://upload.wikimedia.org/wikipedia/zh/9/95/Easycard_logo.svg',
                price: 'NT$100（卡片押金）',
                balance: '依購買時選擇加值金額',
                purchaseLocations: [
                    {
                        name: '捷運站售票機',
                        description: '台北捷運各站皆有售票機可購買',
                        coordinates: [25.0478, 121.5170],
                        mapUrl: 'https://goo.gl/maps/5QU8dLeRu3vA8Smw5'
                    },
                    {
                        name: '便利商店',
                        description: '7-11、全家、萊爾富、OK等便利商店皆可購買',
                        coordinates: [25.0478, 121.5170],
                        mapUrl: 'https://goo.gl/maps/5QU8dLeRu3vA8Smw5'
                    }
                ],
                rechargeLocations: [
                    '捷運站售票機',
                    '便利商店',
                    '悠遊卡加值機'
                ],
                validityPeriod: '無期限，但5年內未使用可能會被凍結',
                coverage: [
                    '捷運',
                    '公車',
                    '火車',
                    '部分計程車',
                    '便利商店',
                    '部分餐廳',
                    '停車場'
                ],
                discounts: '搭乘捷運享有8折優惠，轉乘優惠等',
                website: 'https://www.easycard.com.tw/',
                notes: '可用於小額支付，最高儲值額度為NT$10,000',
                howToUse: '靠近感應區，等待嗶聲確認'
            },
            {
                id: 'ipass',
                name: '一卡通',
                image: 'https://upload.wikimedia.org/wikipedia/zh/7/7b/IPASS_logo.svg',
                price: 'NT$100（卡片押金）',
                balance: '依購買時選擇加值金額',
                purchaseLocations: [
                    {
                        name: '捷運站售票機',
                        description: '台北捷運部分站點可購買',
                        coordinates: [25.0478, 121.5170],
                        mapUrl: 'https://goo.gl/maps/5QU8dLeRu3vA8Smw5'
                    },
                    {
                        name: '便利商店',
                        description: '7-11、全家等便利商店可購買',
                        coordinates: [25.0478, 121.5170],
                        mapUrl: 'https://goo.gl/maps/5QU8dLeRu3vA8Smw5'
                    }
                ],
                rechargeLocations: [
                    '捷運站售票機',
                    '便利商店'
                ],
                validityPeriod: '無期限',
                coverage: [
                    '捷運',
                    '公車',
                    '火車',
                    '部分計程車',
                    '便利商店'
                ],
                discounts: '搭乘捷運享有8折優惠，轉乘優惠等',
                website: 'https://www.i-pass.com.tw/',
                notes: '可用於小額支付',
                howToUse: '靠近感應區，等待嗶聲確認'
            }
        ],
        '高雄': [
            {
                id: 'ipass',
                name: '一卡通',
                image: 'https://upload.wikimedia.org/wikipedia/zh/7/7b/IPASS_logo.svg',
                price: 'NT$100（卡片押金）',
                balance: '依購買時選擇加值金額',
                purchaseLocations: [
                    {
                        name: '捷運站售票機',
                        description: '高雄捷運各站皆有售票機可購買',
                        coordinates: [22.6273, 120.3014],
                        mapUrl: 'https://goo.gl/maps/7JLsGQU8jvy7DH6H6'
                    },
                    {
                        name: '便利商店',
                        description: '7-11、全家等便利商店可購買',
                        coordinates: [22.6273, 120.3014],
                        mapUrl: 'https://goo.gl/maps/7JLsGQU8jvy7DH6H6'
                    }
                ],
                rechargeLocations: [
                    '捷運站售票機',
                    '便利商店'
                ],
                validityPeriod: '無期限',
                coverage: [
                    '捷運',
                    '公車',
                    '火車',
                    '部分計程車',
                    '便利商店'
                ],
                discounts: '搭乘捷運享有8折優惠，轉乘優惠等',
                website: 'https://www.i-pass.com.tw/',
                notes: '高雄的主要交通卡，可用於小額支付',
                howToUse: '靠近感應區，等待嗶聲確認'
            }
        ]
    },
    // 日本
    '日本': {
        '東京': [
            {
                id: 'suica',
                name: 'Suica（西瓜卡）',
                image: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Suica_Logo.svg',
                price: '¥2,000（含¥500押金和¥1,500儲值金）',
                balance: '依購買時選擇加值金額',
                purchaseLocations: [
                    {
                        name: 'JR東日本車站售票機',
                        description: '東京各JR車站的售票機可購買',
                        coordinates: [35.6812, 139.7671],
                        mapUrl: 'https://goo.gl/maps/DLUQWuRRbJtjU4Uw8'
                    },
                    {
                        name: '成田機場/羽田機場',
                        description: '機場內的JR售票處可購買',
                        coordinates: [35.5493, 139.7798],
                        mapUrl: 'https://goo.gl/maps/Ld2yoVJe3mJKFytD7'
                    }
                ],
                rechargeLocations: [
                    'JR車站售票機',
                    '便利商店',
                    '自動售賣機'
                ],
                validityPeriod: '最後使用日起10年內有效',
                coverage: [
                    'JR線',
                    '地鐵',
                    '公車',
                    '便利商店',
                    '自動售賣機',
                    '部分餐廳'
                ],
                discounts: '無特別折扣，但可節省購票時間',
                website: 'https://www.jreast.co.jp/suica/',
                notes: '可用於小額支付，最高儲值額度為¥20,000',
                howToUse: '靠近感應區，等待嗶聲確認'
            },
            {
                id: 'pasmo',
                name: 'PASMO',
                image: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Pasmo_logo.svg',
                price: '¥2,000（含¥500押金和¥1,500儲值金）',
                balance: '依購買時選擇加值金額',
                purchaseLocations: [
                    {
                        name: '東京地鐵站售票機',
                        description: '東京各地鐵站的售票機可購買',
                        coordinates: [35.6812, 139.7671],
                        mapUrl: 'https://goo.gl/maps/DLUQWuRRbJtjU4Uw8'
                    }
                ],
                rechargeLocations: [
                    '地鐵站售票機',
                    '便利商店'
                ],
                validityPeriod: '最後使用日起10年內有效',
                coverage: [
                    '地鐵',
                    '公車',
                    'JR線',
                    '便利商店',
                    '自動售賣機'
                ],
                discounts: '無特別折扣，但可節省購票時間',
                website: 'https://www.pasmo.co.jp/',
                notes: '功能與Suica相似，兩者可互通使用',
                howToUse: '靠近感應區，等待嗶聲確認'
            }
        ],
        '大阪': [
            {
                id: 'icoca',
                name: 'ICOCA（IC卡）',
                image: 'https://upload.wikimedia.org/wikipedia/commons/9/92/ICOCA_logo.svg',
                price: '¥2,000（含¥500押金和¥1,500儲值金）',
                balance: '依購買時選擇加值金額',
                purchaseLocations: [
                    {
                        name: 'JR西日本車站售票機',
                        description: '大阪各JR車站的售票機可購買',
                        coordinates: [34.7024, 135.4959],
                        mapUrl: 'https://goo.gl/maps/LtVyciEyUKgPB7Lz8'
                    },
                    {
                        name: '關西機場',
                        description: '機場內的JR售票處可購買',
                        coordinates: [34.4320, 135.2304],
                        mapUrl: 'https://goo.gl/maps/LtVyciEyUKgPB7Lz8'
                    }
                ],
                rechargeLocations: [
                    'JR車站售票機',
                    '便利商店'
                ],
                validityPeriod: '最後使用日起10年內有效',
                coverage: [
                    'JR線',
                    '地鐵',
                    '公車',
                    '便利商店',
                    '自動售賣機'
                ],
                discounts: '無特別折扣，但可節省購票時間',
                website: 'https://www.jr-odekake.net/icoca/',
                notes: '可與Suica和PASMO互通使用',
                howToUse: '靠近感應區，等待嗶聲確認'
            }
        ]
    },
    // 香港
    '香港': {
        '香港': [
            {
                id: 'octopus',
                name: '八達通（Octopus）',
                image: 'https://upload.wikimedia.org/wikipedia/zh/3/32/Octopus_cards_limited_logo.svg',
                price: 'HK$150（含HK$50押金和HK$100儲值金）',
                balance: '依購買時選擇加值金額',
                purchaseLocations: [
                    {
                        name: '港鐵客務中心',
                        description: '香港各地鐵站的客務中心可購買',
                        coordinates: [22.2988, 114.1722],
                        mapUrl: 'https://goo.gl/maps/LtVyciEyUKgPB7Lz8'
                    },
                    {
                        name: '便利商店',
                        description: '7-11、OK等便利商店可購買',
                        coordinates: [22.2988, 114.1722],
                        mapUrl: 'https://goo.gl/maps/LtVyciEyUKgPB7Lz8'
                    }
                ],
                rechargeLocations: [
                    '港鐵站加值機',
                    '便利商店',
                    '超市'
                ],
                validityPeriod: '無期限',
                coverage: [
                    '地鐵',
                    '公車',
                    '輕鐵',
                    '渡輪',
                    '便利商店',
                    '超市',
                    '餐廳',
                    '停車場'
                ],
                discounts: '部分交通工具和商店有折扣',
                website: 'https://www.octopus.com.hk/',
                notes: '香港最廣泛使用的電子支付卡，遊客可選擇購買「遊客八達通」',
                howToUse: '靠近感應區，等待嗶聲確認'
            }
        ]
    }
};

// 如果在 Node.js 環境中，導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TRANSIT_CARDS;
}
