# 旅行規劃網站

這是一個功能豐富的旅行規劃網站，包含行程規劃、預算追蹤、天氣預報、AR 導航等功能。

## 功能

1. **行程規劃**：規劃旅行路線、景點和交通方式
2. **預算追蹤**：設定旅行預算、記錄支出、分析花費
3. **天氣預報**：查看目的地天氣情況
4. **AR 導航**：使用擴增實境技術進行導航
5. **智慧行程建議**：根據使用者偏好提供行程建議
6. **交通延誤處理**：處理交通延誤情況，提供替代方案
7. **離線地圖**：下載地圖供離線使用

## 使用說明

### 重要提示：使用本地伺服器

由於 AR 功能和其他資源需要通過 HTTP 協議提供，直接從檔案系統開啟 HTML 檔案會導致錯誤。請使用以下方法之一來啟動本地伺服器：

#### 方法 1：使用 Python

如果您已安裝 Python，可以在命令提示字元中導航到專案目錄，然後執行：

```
# Python 3
python -m http.server

# Python 2
python -m SimpleHTTPServer
```

然後在瀏覽器中訪問 `http://localhost:8000`

#### 方法 2：使用 Node.js

如果您已安裝 Node.js，可以安裝 http-server 並運行：

```
# 安裝 http-server（只需執行一次）
npm install -g http-server

# 啟動伺服器
http-server
```

然後在瀏覽器中訪問 `http://localhost:8080`

#### 方法 3：使用 Visual Studio Code 的 Live Server

1. 安裝 Live Server 擴充功能
2. 右鍵點擊 HTML 檔案，選擇「Open with Live Server」

## 預算追蹤功能

預算追蹤功能可以幫助您控制旅行支出：

1. 點擊「預算追蹤」按鈕開啟預算追蹤面板
2. 在「預算設定」頁面設定總預算和分類預算
3. 在「記錄支出」頁面添加新的支出
4. 在「支出列表」頁面查看、編輯和刪除支出
5. 在「預算分析」頁面查看支出分析和統計
6. 在「預算概覽」頁面查看預算摘要和預算警告

## 技術說明

本專案使用以下技術：

- HTML, CSS, JavaScript
- Leaflet.js 地圖庫
- A-Frame VR/AR 框架
- AR.js 擴增實境框架
- 本地儲存 (localStorage) 用於資料持久化
