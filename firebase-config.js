/**
 * Firebase 配置文件
 * 用於即時同步行程分享功能
 */

// Firebase 配置
const firebaseConfig = {
    apiKey: "AIzaSyDummyKeyForDemonstration",
    authDomain: "travel-planner-demo.firebaseapp.com",
    databaseURL: "https://travel-planner-demo-default-rtdb.firebaseio.com",
    projectId: "travel-planner-demo",
    storageBucket: "travel-planner-demo.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// 初始化 Firebase
const FirebaseService = (function() {
    let app;
    let database;
    let isInitialized = false;
    
    // 初始化 Firebase
    function init() {
        if (isInitialized) return;
        
        try {
            // 初始化 Firebase 應用
            app = firebase.initializeApp(firebaseConfig);
            
            // 獲取 Realtime Database 實例
            database = firebase.database();
            
            isInitialized = true;
            console.log('Firebase 已成功初始化');
        } catch (error) {
            console.error('Firebase 初始化失敗:', error);
            alert('即時同步功能初始化失敗，將使用本地儲存模式。');
        }
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
    FirebaseService.init();
});
