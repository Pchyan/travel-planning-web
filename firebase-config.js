/**
 * Firebase 配置文件
 * 用於即時同步行程分享功能
 */

// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyDXYD5F8miS_rpV9VdRKFmHeV5l-JQjnmw",
    authDomain: "travel-planner-demo-b6d3b.firebaseapp.com",
    databaseURL: "https://travel-planner-demo-b6d3b-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "travel-planner-demo-b6d3b",
    storageBucket: "travel-planner-demo-b6d3b.appspot.com",
    messagingSenderId: "1075642970516",
    appId: "1:1075642970516:web:b7c1a9f4a7e3e1c0b8c9d0"
};

// 初始化 Firebase
const FirebaseService = (function() {
    let app;
    let database;
    let isInitialized = false;

    // 初始化 Firebase
    function init() {
        if (isInitialized) {
            console.log('Firebase 已經初始化，不需要再次初始化');
            return Promise.resolve(true);
        }

        console.log('開始初始化 Firebase...');

        // 檢查 Firebase SDK 是否已載入
        if (typeof firebase === 'undefined') {
            const errorMsg = 'Firebase SDK 未載入，即時同步功能將無法使用';
            console.error(errorMsg);
            alert(errorMsg);
            return Promise.reject(new Error(errorMsg));
        }

        return new Promise((resolve, reject) => {
            try {
                // 初始化 Firebase 應用
                app = firebase.initializeApp(firebaseConfig);

                // 獲取 Realtime Database 實例
                database = firebase.database();

                // 測試資料庫連接
                const connectedRef = database.ref('.info/connected');

                // 設置逾時處理
                const connectionTimeout = setTimeout(() => {
                    if (!isInitialized) {
                        console.warn('Firebase 連接逾時，嘗試強制初始化...');
                        isInitialized = true;
                        resolve(true);
                    }
                }, 15000); // 15 秒逾時

                connectedRef.once('value', (snap) => {
                    clearTimeout(connectionTimeout); // 清除逾時計時器

                    if (snap.val() === true) {
                        console.log('Firebase 已成功連接到資料庫');
                        isInitialized = true;
                        resolve(true);
                    } else {
                        // 即使連接狀態為 false，也強制初始化
                        console.warn('Firebase 連接狀態為 false，但仍然繼續初始化');
                        isInitialized = true;
                        resolve(true);
                    }
                });

                // 設置連接狀態監聽
                connectedRef.on('value', (snap) => {
                    if (snap.val() === true) {
                        console.log('Firebase 連接已建立');
                    } else {
                        console.warn('Firebase 連接已斷開，即時同步功能可能受影響');
                    }
                });

                console.log('Firebase 已成功初始化');
            } catch (error) {
                console.error('Firebase 初始化失敗:', error);
                alert('即時同步功能初始化失敗\n\n錯誤訊息: ' + error.message + '\n\n將使用本地儲存模式。');
                reject(error);
            }
        });
    }

    // 檢查是否已初始化
    function isReady() {
        return isInitialized;
    }

    // 獲取資料庫參考
    function getDatabase() {
        if (!isInitialized) {
            console.error('Firebase 尚未初始化');
            return null;
        }

        return database;
    }

    // 獲取特定路徑的參考
    function getRef(path) {
        if (!isInitialized) {
            console.error('Firebase 尚未初始化');
            return null;
        }

        return database.ref(path);
    }

    // 設置資料
    function setData(path, data) {
        if (!isInitialized) {
            console.error('Firebase 尚未初始化');
            return Promise.reject(new Error('Firebase 尚未初始化'));
        }

        return database.ref(path).set(data);
    }

    // 更新資料
    function updateData(path, data) {
        if (!isInitialized) {
            console.error('Firebase 尚未初始化');
            return Promise.reject(new Error('Firebase 尚未初始化'));
        }

        return database.ref(path).update(data);
    }

    // 監聽資料變更
    function onDataChange(path, callback) {
        if (!isInitialized) {
            console.error('Firebase 尚未初始化');
            return null;
        }

        const ref = database.ref(path);
        ref.on('value', (snapshot) => {
            callback(snapshot.val());
        });

        // 返回取消監聽的函數
        return () => ref.off('value');
    }

    // 公開 API
    return {
        init,
        isReady,
        getDatabase,
        getRef,
        setData,
        updateData,
        onDataChange
    };
})();

// 當文檔載入完成後初始化 Firebase
document.addEventListener('DOMContentLoaded', function() {
    console.log('開始初始化 Firebase 服務...');
    FirebaseService.init()
        .then(() => {
            console.log('Firebase 服務初始化成功，即時同步功能已就緒');
            // 觸發自定義事件，通知其他模組 Firebase 已就緒
            const event = new CustomEvent('firebase-ready');
            window.dispatchEvent(event);
        })
        .catch(error => {
            console.error('Firebase 服務初始化失敗:', error);
            // 觸發自定義事件，通知其他模組 Firebase 初始化失敗
            const event = new CustomEvent('firebase-error', { detail: error });
            window.dispatchEvent(event);
        });
});
