// 全球主要城市交通系統資料庫
const TRANSPORTATION_SYSTEMS = {
    // 台灣
    '台灣': {
        '台北': {
            '公車': 'https://ebus.gov.taipei/?fromStation={from}&toStation={to}',
            '捷運': 'https://web.metro.taipei/pages/tw/tickettime1?fromStation={from}&toStation={to}',
            '火車': 'https://www.railway.gov.tw/tra-tip-web/tip/tip001/tip112/gobytime?startStation={from}&endStation={to}',
            '高鐵': 'https://www.thsrc.com.tw/ArticleContent/a3b630bb-1066-4352-a1ef-58c7b4e8ef7c?from={from}&to={to}',
            '飛機': 'https://www.taoyuan-airport.com/main_ch/flight.aspx?from={from}&to={to}'
        },
        '高雄': {
            '公車': 'https://ibus.tbkc.gov.tw/bus/RealRoute?rid={from}',
            '捷運': 'https://www.krtco.com.tw/train_info/service-1.aspx',
            '火車': 'https://www.railway.gov.tw/tra-tip-web/tip/tip001/tip112/gobytime?startStation={from}&endStation={to}',
            '高鐵': 'https://www.thsrc.com.tw/ArticleContent/a3b630bb-1066-4352-a1ef-58c7b4e8ef7c?from={from}&to={to}',
            '飛機': 'https://www.kia.gov.tw/home/index.aspx'
        },
        '台中': {
            '公車': 'https://citybus.taichung.gov.tw/ebus/driving-map',
            '火車': 'https://www.railway.gov.tw/tra-tip-web/tip/tip001/tip112/gobytime?startStation={from}&endStation={to}',
            '高鐵': 'https://www.thsrc.com.tw/ArticleContent/a3b630bb-1066-4352-a1ef-58c7b4e8ef7c?from={from}&to={to}',
            '飛機': 'https://www.tca.gov.tw/'
        },
        '默認': {
            '公車': 'https://ebus.gov.taipei/?fromStation={from}&toStation={to}',
            '捷運': 'https://web.metro.taipei/pages/tw/tickettime1?fromStation={from}&toStation={to}',
            '火車': 'https://www.railway.gov.tw/tra-tip-web/tip/tip001/tip112/gobytime?startStation={from}&endStation={to}',
            '高鐵': 'https://www.thsrc.com.tw/ArticleContent/a3b630bb-1066-4352-a1ef-58c7b4e8ef7c?from={from}&to={to}',
            '飛機': 'https://www.taoyuan-airport.com/main_ch/flight.aspx?from={from}&to={to}'
        }
    },
    
    // 日本
    '日本': {
        '東京': {
            '地鐵': 'https://www.tokyometro.jp/cn/index.html',
            '電車': 'https://www.jreast.co.jp/tc/',
            '公車': 'https://www.kotsu.metro.tokyo.jp/eng/',
            '新幹線': 'https://www.jreast.co.jp/tc/shinkansen/',
            '飛機': 'https://www.tokyo-airport-bldg.co.jp/cn/'
        },
        '大阪': {
            '地鐵': 'https://www.osakametro.co.jp/cn/',
            '電車': 'https://www.westjr.co.jp/global/tc/',
            '公車': 'https://www.osakametro.co.jp/cn/guide/bus.php',
            '新幹線': 'https://www.westjr.co.jp/global/tc/travel-information/routemap/',
            '飛機': 'https://www.kansai-airport.or.jp/cn/'
        },
        '京都': {
            '地鐵': 'https://www.kyotosubway.jp/en/',
            '電車': 'https://www.westjr.co.jp/global/tc/',
            '公車': 'https://www2.city.kyoto.lg.jp/kotsu/webguide/en/index.html',
            '新幹線': 'https://www.westjr.co.jp/global/tc/travel-information/routemap/',
            '飛機': 'https://www.kansai-airport.or.jp/cn/'
        },
        '默認': {
            '地鐵': 'https://www.tokyometro.jp/cn/index.html',
            '電車': 'https://www.jreast.co.jp/tc/',
            '公車': 'https://www.kotsu.metro.tokyo.jp/eng/',
            '新幹線': 'https://www.jreast.co.jp/tc/shinkansen/',
            '飛機': 'https://www.japan-guide.com/e/e2025.html'
        }
    },
    
    // 美國
    '美國': {
        '紐約': {
            '地鐵': 'https://new.mta.info/',
            '公車': 'https://new.mta.info/agency/new-york-city-transit/bus-service',
            '火車': 'https://www.amtrak.com/home.html',
            '飛機': 'https://www.panynj.gov/airports/en/jfk.html'
        },
        '洛杉磯': {
            '地鐵': 'https://www.metro.net/',
            '公車': 'https://www.metro.net/riding/schedules/',
            '火車': 'https://www.amtrak.com/home.html',
            '飛機': 'https://www.flylax.com/'
        },
        '舊金山': {
            '地鐵': 'https://www.bart.gov/',
            '公車': 'https://www.sfmta.com/getting-around/muni/routes-stops',
            '火車': 'https://www.amtrak.com/home.html',
            '飛機': 'https://www.flysfo.com/'
        },
        '默認': {
            '地鐵': 'https://www.transit.dot.gov/ntd/transit-agency-profiles',
            '公車': 'https://www.transit.dot.gov/ntd/transit-agency-profiles',
            '火車': 'https://www.amtrak.com/home.html',
            '飛機': 'https://www.transportation.gov/policy/aviation-policy/airports-airlines'
        }
    },
    
    // 中國
    '中國': {
        '北京': {
            '地鐵': 'https://www.bjsubway.com/',
            '公車': 'https://www.bjbus.com/',
            '火車': 'https://www.12306.cn/index/',
            '高鐵': 'https://www.12306.cn/index/',
            '飛機': 'https://www.bcia.com.cn/'
        },
        '上海': {
            '地鐵': 'https://www.shmetro.com/',
            '公車': 'https://www.jt.sh.cn/',
            '火車': 'https://www.12306.cn/index/',
            '高鐵': 'https://www.12306.cn/index/',
            '飛機': 'https://www.shanghaiairport.com/'
        },
        '廣州': {
            '地鐵': 'https://www.gzmtr.com/',
            '公車': 'http://www.gzbus.com/',
            '火車': 'https://www.12306.cn/index/',
            '高鐵': 'https://www.12306.cn/index/',
            '飛機': 'https://www.baiyunairport.com/'
        },
        '默認': {
            '地鐵': 'https://www.12306.cn/index/',
            '公車': 'https://www.12306.cn/index/',
            '火車': 'https://www.12306.cn/index/',
            '高鐵': 'https://www.12306.cn/index/',
            '飛機': 'http://www.caac.gov.cn/'
        }
    },
    
    // 韓國
    '韓國': {
        '首爾': {
            '地鐵': 'https://www.smrt.co.kr/program/cyberStation/main2.jsp?lang=c2',
            '公車': 'https://www.t-money.co.kr/',
            '火車': 'https://www.letskorail.com/ebizbf/EbizBfTicketSearch.do',
            '高鐵': 'https://www.letskorail.com/ebizbf/EbizBfKrPassAbout.do',
            '飛機': 'https://www.airport.kr/ap/zh/index.do'
        },
        '釜山': {
            '地鐵': 'https://www.humetro.busan.kr/homepage/foreign/cn/index.do',
            '公車': 'https://bus.busan.go.kr/bhome',
            '火車': 'https://www.letskorail.com/ebizbf/EbizBfTicketSearch.do',
            '高鐵': 'https://www.letskorail.com/ebizbf/EbizBfKrPassAbout.do',
            '飛機': 'https://www.airport.co.kr/gimhae/index.do'
        },
        '默認': {
            '地鐵': 'https://www.smrt.co.kr/program/cyberStation/main2.jsp?lang=c2',
            '公車': 'https://www.t-money.co.kr/',
            '火車': 'https://www.letskorail.com/ebizbf/EbizBfTicketSearch.do',
            '高鐵': 'https://www.letskorail.com/ebizbf/EbizBfKrPassAbout.do',
            '飛機': 'https://www.airport.kr/ap/zh/index.do'
        }
    },
    
    // 默認國家/地區
    '默認': {
        '默認': {
            '公車': 'https://www.google.com/maps/dir/?api=1&travelmode=transit&dir_action=navigate&from={from}&to={to}',
            '地鐵': 'https://www.google.com/maps/dir/?api=1&travelmode=transit&dir_action=navigate&from={from}&to={to}',
            '捷運': 'https://www.google.com/maps/dir/?api=1&travelmode=transit&dir_action=navigate&from={from}&to={to}',
            '電車': 'https://www.google.com/maps/dir/?api=1&travelmode=transit&dir_action=navigate&from={from}&to={to}',
            '火車': 'https://www.google.com/maps/dir/?api=1&travelmode=transit&dir_action=navigate&from={from}&to={to}',
            '高鐵': 'https://www.google.com/maps/dir/?api=1&travelmode=transit&dir_action=navigate&from={from}&to={to}',
            '新幹線': 'https://www.google.com/maps/dir/?api=1&travelmode=transit&dir_action=navigate&from={from}&to={to}',
            '飛機': 'https://www.google.com/flights?hl=zh-TW&gl=tw'
        }
    }
};

// 交通方式對應表 - 用於不同國家/地區的交通方式名稱映射
const TRANSPORTATION_MODE_MAPPING = {
    // 台灣
    '台灣': {
        '步行': '步行',
        '公車': '公車',
        '捷運': '捷運',
        '火車': '火車',
        '高鐵': '高鐵',
        '飛機': '飛機'
    },
    // 日本
    '日本': {
        '步行': '步行',
        '公車': '公車',
        '捷運': '地鐵',
        '火車': '電車',
        '高鐵': '新幹線',
        '飛機': '飛機'
    },
    // 美國
    '美國': {
        '步行': '步行',
        '公車': '公車',
        '捷運': '地鐵',
        '火車': '火車',
        '高鐵': '火車',
        '飛機': '飛機'
    },
    // 中國
    '中國': {
        '步行': '步行',
        '公車': '公車',
        '捷運': '地鐵',
        '火車': '火車',
        '高鐵': '高鐵',
        '飛機': '飛機'
    },
    // 韓國
    '韓國': {
        '步行': '步行',
        '公車': '公車',
        '捷運': '地鐵',
        '火車': '火車',
        '高鐵': '高鐵',
        '飛機': '飛機'
    },
    // 默認映射
    '默認': {
        '步行': '步行',
        '公車': '公車',
        '捷運': '地鐵',
        '火車': '火車',
        '高鐵': '火車',
        '飛機': '飛機',
        '自行車': '自行車',
        '機車': '機車',
        '汽車': '汽車',
        '電車': '火車',
        '新幹線': '高鐵',
        '地鐵': '地鐵'
    }
};

// 導出模塊
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        TRANSPORTATION_SYSTEMS,
        TRANSPORTATION_MODE_MAPPING
    };
}