/**
 * QR 碼生成器輔助工具
 * 提供可靠的 QR 碼生成功能，並處理各種錯誤情況
 */
const QRCodeHelper = (function() {
    // 檢查是否已載入 QRCode 庫
    let isQRCodeLibraryLoaded = typeof QRCode !== 'undefined';
    
    // 嘗試載入 QR 碼庫的次數
    let loadAttempts = 0;
    const MAX_LOAD_ATTEMPTS = 3;
    
    // QR 碼庫的 URL 列表（按優先順序）
    const QR_CODE_LIBRARIES = [
        'https://cdn.rawgit.com/davidshimjs/qrcodejs/gh-pages/qrcode.min.js',
        'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
        'https://unpkg.com/qrcodejs@1.0.0/qrcode.min.js'
    ];
    
    /**
     * 初始化 QR 碼生成器
     */
    function init() {
        console.log('QR 碼生成器輔助工具初始化中...');
        
        if (isQRCodeLibraryLoaded) {
            console.log('QR 碼庫已載入，無需再次初始化');
            return Promise.resolve(true);
        }
        
        return loadQRCodeLibrary();
    }
    
    /**
     * 載入 QR 碼庫
     */
    function loadQRCodeLibrary() {
        if (loadAttempts >= MAX_LOAD_ATTEMPTS) {
            console.error(`已嘗試載入 QR 碼庫 ${MAX_LOAD_ATTEMPTS} 次，全部失敗`);
            return Promise.reject(new Error('QR 碼庫載入失敗'));
        }
        
        const libraryUrl = QR_CODE_LIBRARIES[loadAttempts % QR_CODE_LIBRARIES.length];
        loadAttempts++;
        
        return new Promise((resolve, reject) => {
            console.log(`嘗試載入 QR 碼庫: ${libraryUrl}`);
            
            const script = document.createElement('script');
            script.src = libraryUrl;
            
            script.onload = function() {
                console.log(`QR 碼庫載入成功: ${libraryUrl}`);
                isQRCodeLibraryLoaded = typeof QRCode !== 'undefined';
                
                if (isQRCodeLibraryLoaded) {
                    resolve(true);
                } else {
                    console.warn('QR 碼庫已載入，但 QRCode 對象未定義');
                    // 嘗試載入下一個庫
                    loadQRCodeLibrary().then(resolve).catch(reject);
                }
            };
            
            script.onerror = function() {
                console.error(`QR 碼庫載入失敗: ${libraryUrl}`);
                // 嘗試載入下一個庫
                loadQRCodeLibrary().then(resolve).catch(reject);
            };
            
            document.head.appendChild(script);
        });
    }
    
    /**
     * 生成 QR 碼
     * @param {string} elementId - 要放置 QR 碼的元素 ID
     * @param {string} text - 要編碼的文本
     * @param {Object} options - QR 碼選項
     * @returns {Promise} - 成功或失敗的 Promise
     */
    function generateQRCode(elementId, text, options = {}) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`找不到元素: ${elementId}`);
            return Promise.reject(new Error(`找不到元素: ${elementId}`));
        }
        
        // 顯示載入中訊息
        element.innerHTML = '<p>QR 碼生成中...</p>';
        
        // 確保 QR 碼庫已載入
        return init()
            .then(() => {
                // 設置默認選項
                const defaultOptions = {
                    text: text,
                    width: 128,
                    height: 128,
                    colorDark: '#000000',
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                };
                
                // 合併用戶選項
                const qrOptions = { ...defaultOptions, ...options };
                
                try {
                    // 清空元素
                    element.innerHTML = '';
                    
                    // 生成 QR 碼
                    new QRCode(element, qrOptions);
                    console.log(`QR 碼生成成功: ${elementId}`);
                    return Promise.resolve(true);
                } catch (error) {
                    console.error('QR 碼生成失敗:', error);
                    element.innerHTML = '<p>QR 碼生成失敗，請重新嘗試</p>';
                    return Promise.reject(error);
                }
            })
            .catch(error => {
                console.error('QR 碼生成過程中發生錯誤:', error);
                element.innerHTML = '<p>QR 碼生成失敗，請重新嘗試</p>';
                return Promise.reject(error);
            });
    }
    
    /**
     * 生成 QR 碼的備用方法（使用 Google Charts API）
     * 當主要方法失敗時使用
     * @param {string} elementId - 要放置 QR 碼的元素 ID
     * @param {string} text - 要編碼的文本
     * @param {number} size - QR 碼大小
     */
    function generateQRCodeFallback(elementId, text, size = 128) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.error(`找不到元素: ${elementId}`);
            return;
        }
        
        try {
            // 使用 Google Charts API 生成 QR 碼
            const googleChartsUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(text)}&chld=H|0`;
            
            element.innerHTML = `<img src="${googleChartsUrl}" alt="QR Code" style="width:${size}px; height:${size}px;">`;
            console.log(`備用 QR 碼生成成功: ${elementId}`);
        } catch (error) {
            console.error('備用 QR 碼生成失敗:', error);
            element.innerHTML = '<p>QR 碼生成失敗，請重新嘗試</p>';
        }
    }
    
    // 公開 API
    return {
        init,
        generateQRCode,
        generateQRCodeFallback,
        isLibraryLoaded: function() {
            return isQRCodeLibraryLoaded;
        }
    };
})();

// 頁面載入時初始化 QR 碼生成器
document.addEventListener('DOMContentLoaded', function() {
    QRCodeHelper.init()
        .then(() => console.log('QR 碼生成器輔助工具初始化成功'))
        .catch(error => console.warn('QR 碼生成器輔助工具初始化失敗，將在需要時再次嘗試', error));
});
