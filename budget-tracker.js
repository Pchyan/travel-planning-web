/**
 * 預算追蹤模組 - 提供旅行預算設定、支出記錄和預算分析功能
 */

const BudgetTracker = (function() {
    // 私有變數
    let isInitialized = false;
    let budgets = {}; // 格式: {itineraryId: {total: 1000, currency: 'TWD', categories: {住宿: 400, 交通: 200, ...}}}
    let expenses = {}; // 格式: {itineraryId: [{id: '1', name: '台北飯店', amount: 500, category: '住宿', date: '2025-03-15', notes: ''}]}

    // 支出類別
    const EXPENSE_CATEGORIES = {
        ACCOMMODATION: '住宿',
        TRANSPORTATION: '交通',
        FOOD: '餐飲',
        ATTRACTIONS: '景點門票',
        SHOPPING: '購物',
        ENTERTAINMENT: '娛樂',
        OTHERS: '其他'
    };

    // 貨幣選項
    const CURRENCY_OPTIONS = [
        { code: 'TWD', symbol: 'NT$', name: '新台幣' },
        { code: 'USD', symbol: '$', name: '美元' },
        { code: 'EUR', symbol: '€', name: '歐元' },
        { code: 'JPY', symbol: '¥', name: '日圓' },
        { code: 'CNY', symbol: '¥', name: '人民幣' },
        { code: 'KRW', symbol: '₩', name: '韓元' },
        { code: 'GBP', symbol: '£', name: '英鎊' },
        { code: 'AUD', symbol: 'A$', name: '澳幣' },
        { code: 'CAD', symbol: 'C$', name: '加幣' },
        { code: 'HKD', symbol: 'HK$', name: '港幣' },
        { code: 'SGD', symbol: 'S$', name: '新加坡幣' }
    ];

    // 本地儲存鍵
    const BUDGETS_STORAGE_KEY = 'travel_budgets';
    const EXPENSES_STORAGE_KEY = 'travel_expenses';

    // 初始化模組
    function init() {
        if (isInitialized) return;

        console.log('預算追蹤模組初始化中...');

        // 從本地儲存載入資料
        loadFromStorage();

        // 設置事件監聽器
        setupEventListeners();

        isInitialized = true;
        console.log('預算追蹤模組初始化完成');
    }

    // 從本地儲存載入資料
    function loadFromStorage() {
        try {
            const savedBudgets = localStorage.getItem(BUDGETS_STORAGE_KEY);
            if (savedBudgets) {
                budgets = JSON.parse(savedBudgets);
                console.log('已從本地儲存載入預算資料');
            }

            const savedExpenses = localStorage.getItem(EXPENSES_STORAGE_KEY);
            if (savedExpenses) {
                expenses = JSON.parse(savedExpenses);
                console.log('已從本地儲存載入支出資料');
            }
        } catch (error) {
            console.error('載入預算資料時出錯:', error);
            budgets = {};
            expenses = {};
        }
    }

    // 儲存資料到本地儲存
    function saveToStorage() {
        try {
            localStorage.setItem(BUDGETS_STORAGE_KEY, JSON.stringify(budgets));
            localStorage.setItem(EXPENSES_STORAGE_KEY, JSON.stringify(expenses));
            console.log('已儲存預算資料到本地儲存');
        } catch (error) {
            console.error('儲存預算資料時出錯:', error);
            alert('儲存預算資料時出錯，請檢查本地儲存空間');
        }
    }

    // 設置事件監聽器
    function setupEventListeners() {
        // 確保DOM已經載入完成
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', attachEventListeners);
        } else {
            // 如果DOM已經載入完成，直接設置事件
            attachEventListeners();
        }
    }

    // 附加事件監聽器
    function attachEventListeners() {
        console.log('設置預算追蹤按鈕事件監聽器...');

        // 尋找預算追蹤按鈕
        const budgetButton = document.getElementById('open-budget-tracker');
        if (budgetButton) {
            budgetButton.addEventListener('click', openBudgetTracker);
            console.log('已設置預算追蹤按鈕事件');
        } else {
            console.warn('找不到預算追蹤按鈕');
        }

        // 設置關閉預算追蹤對話框按鈕
        const closeButton = document.getElementById('close-budget-tracker');
        if (closeButton) {
            closeButton.addEventListener('click', closeBudgetTracker);
            console.log('已設置關閉預算追蹤對話框按鈕事件');
        }

        // 設置預算追蹤頁籤切換
        setupBudgetTabs();

        // 設置添加支出按鈕
        setupAddExpenseButton();

        // 設置篩選按鈕
        setupFilterButtons();
    }

    // 關閉預算追蹤對話框
    function closeBudgetTracker() {
        const dialog = document.getElementById('budget-tracker-dialog');
        if (dialog) {
            dialog.classList.remove('active');
        }
    }

    // 設置預算追蹤頁籤切換
    function setupBudgetTabs() {
        const tabs = document.querySelectorAll('.budget-tracker-tab');
        const sections = document.querySelectorAll('.budget-tracker-section');

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // 移除所有頁籤的活躍狀態
                tabs.forEach(t => t.classList.remove('active'));

                // 添加當前頁籤的活躍狀態
                this.classList.add('active');

                // 隱藏所有內容區域
                sections.forEach(section => section.classList.remove('active'));

                // 顯示對應的內容區域
                const targetId = this.id.replace('-tab', '-content');
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        });
    }

    // 設置添加支出按鈕
    function setupAddExpenseButton() {
        const addButton = document.getElementById('add-expense-btn');
        if (!addButton) return;

        addButton.addEventListener('click', function() {
            const currentItineraryId = getCurrentItineraryId();

            // 獲取表單資料
            const nameInput = document.getElementById('expense-name');
            const amountInput = document.getElementById('expense-amount');
            const categorySelect = document.getElementById('expense-category');
            const dateInput = document.getElementById('expense-date');
            const notesInput = document.getElementById('expense-notes');

            // 驗證表單
            if (!nameInput || !nameInput.value.trim()) {
                alert('請輸入支出名稱');
                return;
            }

            if (!amountInput || !amountInput.value || isNaN(parseFloat(amountInput.value)) || parseFloat(amountInput.value) <= 0) {
                alert('請輸入有效的支出金額');
                return;
            }

            if (!dateInput || !dateInput.value) {
                alert('請選擇支出日期');
                return;
            }

            // 檢查是否為編輯模式
            const isEditMode = addButton.getAttribute('data-mode') === 'edit';
            const expenseId = isEditMode ? addButton.getAttribute('data-id') : null;

            // 創建支出資料
            const expenseData = {
                name: nameInput.value.trim(),
                amount: parseFloat(amountInput.value),
                category: categorySelect ? categorySelect.value : '其他',
                date: dateInput.value,
                notes: notesInput ? notesInput.value : ''
            };

            // 添加或編輯支出
            if (isEditMode) {
                // 編輯現有支出
                if (editExpense(currentItineraryId, expenseId, expenseData)) {
                    // 更新預算追蹤面板
                    updateBudgetTrackerContent(currentItineraryId);

                    // 儲存資料
                    saveToStorage();

                    // 重置表單
                    resetExpenseForm();

                    alert('支出已更新');
                }
            } else {
                // 添加新支出
                if (addExpense(currentItineraryId, expenseData)) {
                    // 更新預算追蹤面板
                    updateBudgetTrackerContent(currentItineraryId);

                    // 儲存資料
                    saveToStorage();

                    // 重置表單
                    resetExpenseForm();

                    alert('支出已添加');
                }
            }
        });
    }

    // 重置支出表單
    function resetExpenseForm() {
        const nameInput = document.getElementById('expense-name');
        const amountInput = document.getElementById('expense-amount');
        const categorySelect = document.getElementById('expense-category');
        const dateInput = document.getElementById('expense-date');
        const notesInput = document.getElementById('expense-notes');
        const addButton = document.getElementById('add-expense-btn');

        if (nameInput) nameInput.value = '';
        if (amountInput) amountInput.value = '';
        if (categorySelect) categorySelect.selectedIndex = 0;
        if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
        if (notesInput) notesInput.value = '';

        // 重置按鈕狀態
        if (addButton) {
            addButton.innerHTML = '<i class="fas fa-plus"></i>';
            addButton.removeAttribute('data-mode');
            addButton.removeAttribute('data-id');
        }
    }

    // 設置篩選按鈕
    function setupFilterButtons() {
        const applyFilterButton = document.getElementById('apply-filter');
        const clearFilterButton = document.getElementById('clear-filter');

        if (applyFilterButton) {
            applyFilterButton.addEventListener('click', function() {
                const currentItineraryId = getCurrentItineraryId();
                updateAllExpensesList(currentItineraryId);
            });
        }

        if (clearFilterButton) {
            clearFilterButton.addEventListener('click', function() {
                const filterCategory = document.getElementById('filter-category');
                const filterStartDate = document.getElementById('filter-start-date');
                const filterEndDate = document.getElementById('filter-end-date');

                if (filterCategory) filterCategory.value = 'all';
                if (filterStartDate) filterStartDate.value = '';
                if (filterEndDate) filterEndDate.value = '';

                const currentItineraryId = getCurrentItineraryId();
                updateAllExpensesList(currentItineraryId);
            });
        }
    }

    // 開啟預算追蹤面板
    function openBudgetTracker() {
        console.log('開啟預算追蹤面板');

        // 獲取當前行程ID
        const currentItineraryId = getCurrentItineraryId();

        // 顯示預算追蹤對話框
        const dialog = document.getElementById('budget-tracker-dialog');
        if (dialog) {
            dialog.classList.add('active');

            // 更新預算追蹤面板內容
            updateBudgetTrackerContent(currentItineraryId);
        } else {
            console.error('找不到預算追蹤對話框元素');
        }
    }

    // 更新預算追蹤面板內容
    function updateBudgetTrackerContent(itineraryId) {
        // 更新預算摘要
        updateBudgetSummary(itineraryId);

        // 更新支出列表
        updateExpensesList(itineraryId);

        // 更新預算分析
        updateBudgetAnalysis(itineraryId);

        // 更新預算設定表單
        updateBudgetSettingsForm(itineraryId);
    }

    // 更新預算摘要
    function updateBudgetSummary(itineraryId) {
        const budget = budgets[itineraryId];
        const totalExpenses = calculateTotalExpenses(itineraryId);
        const totalBudgetElement = document.getElementById('total-budget');
        const totalExpensesElement = document.getElementById('total-expenses');
        const remainingBudgetElement = document.getElementById('remaining-budget');
        const budgetProgressBar = document.getElementById('budget-progress-bar');

        if (!budget) {
            // 如果沒有預算資料，顯示預設值
            if (totalBudgetElement) totalBudgetElement.textContent = 'NT$0';
            if (totalExpensesElement) totalExpensesElement.textContent = formatCurrency(totalExpenses, 'TWD');
            if (remainingBudgetElement) {
                remainingBudgetElement.textContent = 'NT$0';
                remainingBudgetElement.className = 'budget-summary-value';
            }
            if (budgetProgressBar) {
                budgetProgressBar.style.width = '0%';
                budgetProgressBar.className = 'budget-progress-bar';
            }
        } else {
            // 更新預算摘要資訊
            const currency = budget.currency;
            const remainingBudget = budget.total - totalExpenses;
            const budgetPercentage = (totalExpenses / budget.total) * 100;

            if (totalBudgetElement) totalBudgetElement.textContent = formatCurrency(budget.total, currency);
            if (totalExpensesElement) totalExpensesElement.textContent = formatCurrency(totalExpenses, currency);

            if (remainingBudgetElement) {
                remainingBudgetElement.textContent = formatCurrency(remainingBudget, currency);

                // 根據剩餘預算設定樣式
                if (remainingBudget < 0) {
                    remainingBudgetElement.className = 'budget-summary-value over-budget';
                } else {
                    remainingBudgetElement.className = 'budget-summary-value under-budget';
                }
            }

            if (budgetProgressBar) {
                budgetProgressBar.style.width = `${Math.min(budgetPercentage, 100)}%`;

                // 根據預算使用百分比設定樣式
                if (budgetPercentage >= 100) {
                    budgetProgressBar.className = 'budget-progress-bar danger';
                } else if (budgetPercentage >= budget.warningThreshold * 100) {
                    budgetProgressBar.className = 'budget-progress-bar warning';
                } else {
                    budgetProgressBar.className = 'budget-progress-bar';
                }
            }
        }

        // 更新預算警告
        updateBudgetAlerts(itineraryId);
    }

    // 更新預算警告
    function updateBudgetAlerts(itineraryId) {
        const alertsContainer = document.getElementById('budget-alerts-container');
        if (!alertsContainer) return;

        // 清除現有警告
        alertsContainer.innerHTML = '';

        // 獲取預算警告
        const warnings = checkBudgetWarnings(itineraryId);

        // 顯示警告
        warnings.forEach(warning => {
            const alertElement = document.createElement('div');
            alertElement.className = `budget-alert ${warning.type}`;

            const titleElement = document.createElement('div');
            titleElement.className = 'budget-alert-title';
            titleElement.innerHTML = `<i class="fas fa-${warning.type === 'danger' ? 'exclamation-circle' : 'exclamation-triangle'}"></i> ${warning.category ? `${warning.category} 預算警告` : '預算警告'}`;

            const messageElement = document.createElement('div');
            messageElement.textContent = warning.message;

            alertElement.appendChild(titleElement);
            alertElement.appendChild(messageElement);
            alertsContainer.appendChild(alertElement);
        });
    }

    // 更新支出列表
    function updateExpensesList(itineraryId) {
        // 更新最近支出列表
        updateRecentExpensesList(itineraryId);

        // 更新最近添加的支出
        updateRecentAddedExpenses(itineraryId);

        // 更新所有支出列表
        updateAllExpensesList(itineraryId);
    }

    // 更新最近支出列表
    function updateRecentExpensesList(itineraryId) {
        const recentExpensesContainer = document.getElementById('recent-expenses-list');
        if (!recentExpensesContainer) return;

        // 清除現有內容
        recentExpensesContainer.innerHTML = '';

        // 獲取行程的支出
        const itineraryExpenses = expenses[itineraryId] || [];

        // 如果沒有支出，顯示提示訊息
        if (itineraryExpenses.length === 0) {
            recentExpensesContainer.innerHTML = '<div class="no-expenses">沒有支出記錄</div>';
            return;
        }

        // 排序支出，最近的先顯示
        const sortedExpenses = [...itineraryExpenses].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        // 只顯示最近的5筆支出
        const recentExpenses = sortedExpenses.slice(0, 5);

        // 獲取預算資料以格式化貨幣
        const budget = budgets[itineraryId];
        const currency = budget ? budget.currency : 'TWD';

        // 創建支出列表
        recentExpenses.forEach(expense => {
            const expenseElement = document.createElement('div');
            expenseElement.className = 'expense-item';

            expenseElement.innerHTML = `
                <div class="expense-name">${expense.name}</div>
                <div class="expense-amount">${formatCurrency(expense.amount, currency)}</div>
                <div class="expense-category">${expense.category}</div>
                <div class="expense-date">${formatDate(expense.date)}</div>
                <div class="expense-actions">
                    <button class="edit-expense" data-id="${expense.id}" title="編輯支出"><i class="fas fa-edit"></i></button>
                    <button class="delete-expense" data-id="${expense.id}" title="刪除支出"><i class="fas fa-trash"></i></button>
                </div>
            `;

            recentExpensesContainer.appendChild(expenseElement);
        });

        // 綁定編輯和刪除按鈕事件
        bindExpenseActions(recentExpensesContainer, itineraryId);
    }



    // 更新最近支出列表
    function updateRecentExpensesList(itineraryId) {
        const recentExpensesContainer = document.getElementById('recent-expenses-list');
        if (!recentExpensesContainer) return;

        // 清除現有內容
        recentExpensesContainer.innerHTML = '';

        // 獲取行程的支出
        const itineraryExpenses = expenses[itineraryId] || [];

        // 如果沒有支出，顯示提示訊息
        if (itineraryExpenses.length === 0) {
            recentExpensesContainer.innerHTML = '<div class="no-expenses">沒有支出記錄</div>';
            return;
        }

        // 排序支出，最近的先顯示
        const sortedExpenses = [...itineraryExpenses].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        // 只顯示最近的5筆支出
        const recentExpenses = sortedExpenses.slice(0, 5);

        // 獲取預算資料以格式化貨幣
        const budget = budgets[itineraryId];
        const currency = budget ? budget.currency : 'TWD';

        // 創建支出列表
        recentExpenses.forEach(expense => {
            const expenseElement = document.createElement('div');
            expenseElement.className = 'expense-item';

            expenseElement.innerHTML = `
                <div class="expense-name">${expense.name}</div>
                <div class="expense-amount">${formatCurrency(expense.amount, currency)}</div>
                <div class="expense-category">${expense.category}</div>
                <div class="expense-date">${formatDate(expense.date)}</div>
                <div class="expense-actions">
                    <button class="edit-expense" data-id="${expense.id}" title="編輯支出"><i class="fas fa-edit"></i></button>
                    <button class="delete-expense" data-id="${expense.id}" title="刪除支出"><i class="fas fa-trash"></i></button>
                </div>
            `;

            recentExpensesContainer.appendChild(expenseElement);
        });

        // 綁定編輯和刪除按鈕事件
        bindExpenseActions(recentExpensesContainer, itineraryId);
    }

    // 更新最近添加的支出
    function updateRecentAddedExpenses(itineraryId) {
        const recentAddedContainer = document.getElementById('recent-added-expenses');
        if (!recentAddedContainer) return;

        // 清除現有內容
        recentAddedContainer.innerHTML = '';

        // 獲取行程的支出
        const itineraryExpenses = expenses[itineraryId] || [];

        // 如果沒有支出，顯示提示訊息
        if (itineraryExpenses.length === 0) {
            recentAddedContainer.innerHTML = '<div class="no-expenses">沒有支出記錄</div>';
            return;
        }

        // 排序支出，最近添加的先顯示
        const sortedExpenses = [...itineraryExpenses].sort((a, b) => {
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // 只顯示最近添加的5筆支出
        const recentExpenses = sortedExpenses.slice(0, 5);

        // 獲取預算資料以格式化貨幣
        const budget = budgets[itineraryId];
        const currency = budget ? budget.currency : 'TWD';

        // 創建支出列表
        recentExpenses.forEach(expense => {
            const expenseElement = document.createElement('div');
            expenseElement.className = 'expense-item';

            expenseElement.innerHTML = `
                <div class="expense-name">${expense.name}</div>
                <div class="expense-amount">${formatCurrency(expense.amount, currency)}</div>
                <div class="expense-category">${expense.category}</div>
                <div class="expense-date">${formatDate(expense.date)}</div>
                <div class="expense-actions">
                    <button class="edit-expense" data-id="${expense.id}" title="編輯支出"><i class="fas fa-edit"></i></button>
                    <button class="delete-expense" data-id="${expense.id}" title="刪除支出"><i class="fas fa-trash"></i></button>
                </div>
            `;

            recentAddedContainer.appendChild(expenseElement);
        });

        // 綁定編輯和刪除按鈕事件
        bindExpenseActions(recentAddedContainer, itineraryId);
    }

    // 更新所有支出列表
    function updateAllExpensesList(itineraryId) {
        const allExpensesContainer = document.getElementById('all-expenses-list');
        if (!allExpensesContainer) return;

        // 清除現有內容
        allExpensesContainer.innerHTML = '';

        // 獲取行程的支出
        const itineraryExpenses = expenses[itineraryId] || [];

        // 如果沒有支出，顯示提示訊息
        if (itineraryExpenses.length === 0) {
            allExpensesContainer.innerHTML = '<div class="no-expenses">沒有支出記錄</div>';
            return;
        }

        // 排序支出，最近的先顯示
        const sortedExpenses = [...itineraryExpenses].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        // 獲取篩選條件
        const filterCategory = document.getElementById('filter-category');
        const filterStartDate = document.getElementById('filter-start-date');
        const filterEndDate = document.getElementById('filter-end-date');

        const category = filterCategory ? filterCategory.value : 'all';
        const startDate = filterStartDate ? filterStartDate.value : '';
        const endDate = filterEndDate ? filterEndDate.value : '';

        // 應用篩選
        let filteredExpenses = sortedExpenses;

        if (category !== 'all') {
            filteredExpenses = filteredExpenses.filter(expense => expense.category === category);
        }

        if (startDate) {
            filteredExpenses = filteredExpenses.filter(expense => expense.date >= startDate);
        }

        if (endDate) {
            filteredExpenses = filteredExpenses.filter(expense => expense.date <= endDate);
        }

        // 獲取預算資料以格式化貨幣
        const budget = budgets[itineraryId];
        const currency = budget ? budget.currency : 'TWD';

        // 創建支出列表
        filteredExpenses.forEach(expense => {
            const expenseElement = document.createElement('div');
            expenseElement.className = 'expense-item';

            expenseElement.innerHTML = `
                <div class="expense-name">${expense.name}</div>
                <div class="expense-amount">${formatCurrency(expense.amount, currency)}</div>
                <div class="expense-category">${expense.category}</div>
                <div class="expense-date">${formatDate(expense.date)}</div>
                <div class="expense-actions">
                    <button class="edit-expense" data-id="${expense.id}" title="編輯支出"><i class="fas fa-edit"></i></button>
                    <button class="delete-expense" data-id="${expense.id}" title="刪除支出"><i class="fas fa-trash"></i></button>
                </div>
            `;

            allExpensesContainer.appendChild(expenseElement);
        });

        // 綁定編輯和刪除按鈕事件
        bindExpenseActions(allExpensesContainer, itineraryId);
    }

    // 綁定支出項目的編輯和刪除按鈕事件
    function bindExpenseActions(container, itineraryId) {
        // 綁定編輯按鈕事件
        const editButtons = container.querySelectorAll('.edit-expense');
        editButtons.forEach(button => {
            button.addEventListener('click', function() {
                const expenseId = this.getAttribute('data-id');
                editExpenseItem(itineraryId, expenseId);
            });
        });

        // 綁定刪除按鈕事件
        const deleteButtons = container.querySelectorAll('.delete-expense');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function() {
                const expenseId = this.getAttribute('data-id');
                deleteExpenseItem(itineraryId, expenseId);
            });
        });
    }

    // 編輯支出項目
    function editExpenseItem(itineraryId, expenseId) {
        // 尋找支出項目
        const expense = expenses[itineraryId]?.find(exp => exp.id === expenseId);
        if (!expense) {
            console.error(`找不到支出 ID ${expenseId}`);
            return;
        }

        // 切換到記錄支出頁面
        const addExpenseTab = document.getElementById('add-expense-tab');
        if (addExpenseTab) {
            addExpenseTab.click();
        }

        // 填充表單
        const nameInput = document.getElementById('expense-name');
        const amountInput = document.getElementById('expense-amount');
        const categorySelect = document.getElementById('expense-category');
        const dateInput = document.getElementById('expense-date');
        const notesInput = document.getElementById('expense-notes');

        if (nameInput) nameInput.value = expense.name;
        if (amountInput) amountInput.value = expense.amount;
        if (categorySelect) categorySelect.value = expense.category;
        if (dateInput) dateInput.value = expense.date;
        if (notesInput) notesInput.value = expense.notes || '';

        // 將按鈕更改為更新模式
        const addButton = document.getElementById('add-expense-btn');
        if (addButton) {
            addButton.innerHTML = '<i class="fas fa-check"></i>';
            addButton.setAttribute('data-mode', 'edit');
            addButton.setAttribute('data-id', expenseId);
        }
    }

    // 刪除支出項目
    function deleteExpenseItem(itineraryId, expenseId) {
        // 確認刪除
        const confirmed = confirm('確定要刪除這筆支出嗎？');
        if (!confirmed) return;

        // 刪除支出
        if (deleteExpense(itineraryId, expenseId)) {
            // 更新預算追蹤面板
            updateBudgetTrackerContent(itineraryId);
            // 儲存資料
            saveToStorage();
        }
    }

    // 格式化日期
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('zh-TW');
    }

    // 更新預算分析
    function updateBudgetAnalysis(itineraryId) {
        // 更新分類支出列表
        updateCategoriesList(itineraryId);

        // 更新分析詳情
        updateAnalysisDetails(itineraryId);
    }

    // 更新分類支出列表
    function updateCategoriesList(itineraryId) {
        const categoriesContainer = document.getElementById('categories-list');
        if (!categoriesContainer) return;

        // 清除現有內容
        categoriesContainer.innerHTML = '';

        // 獲取分類支出
        const categoryExpenses = calculateCategoryExpenses(itineraryId);

        // 如果沒有支出，顯示提示訊息
        if (Object.keys(categoryExpenses).length === 0) {
            categoriesContainer.innerHTML = '<div class="no-expenses">沒有支出記錄</div>';
            return;
        }

        // 獲取總支出
        const totalExpenses = calculateTotalExpenses(itineraryId);

        // 獲取預算資料以格式化貨幣
        const budget = budgets[itineraryId];
        const currency = budget ? budget.currency : 'TWD';

        // 定義分類顏色
        const categoryColors = {
            '住宿': '#4a89dc',
            '交通': '#5cb85c',
            '餐飲': '#f0ad4e',
            '景點門票': '#5bc0de',
            '購物': '#d9534f',
            '娛樂': '#9b59b6',
            '其他': '#95a5a6'
        };

        // 排序分類，金額大的先顯示
        const sortedCategories = Object.entries(categoryExpenses).sort((a, b) => b[1] - a[1]);

        // 創建分類列表
        sortedCategories.forEach(([category, amount]) => {
            const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-item';

            const color = categoryColors[category] || '#95a5a6';

            categoryElement.innerHTML = `
                <div class="category-name">
                    <div class="category-color" style="background-color: ${color}"></div>
                    ${category}
                </div>
                <div class="category-info">
                    <span class="category-amount">${formatCurrency(amount, currency)}</span>
                    <span class="category-percentage">${percentage.toFixed(1)}%</span>
                </div>
            `;

            categoriesContainer.appendChild(categoryElement);
        });
    }

    // 更新分析詳情
    function updateAnalysisDetails(itineraryId) {
        const analysisContainer = document.getElementById('budget-analysis-details-content');
        if (!analysisContainer) return;

        // 清除現有內容
        analysisContainer.innerHTML = '';

        // 獲取行程的支出
        const itineraryExpenses = expenses[itineraryId] || [];

        // 如果沒有支出，顯示提示訊息
        if (itineraryExpenses.length === 0) {
            analysisContainer.innerHTML = '<div class="no-expenses">沒有支出記錄可供分析</div>';
            return;
        }

        // 獲取預算資料
        const budget = budgets[itineraryId];
        const currency = budget ? budget.currency : 'TWD';

        // 計算各種分析數據
        const totalExpenses = calculateTotalExpenses(itineraryId);
        const categoryExpenses = calculateCategoryExpenses(itineraryId);

        // 找出最大支出分類
        let maxCategory = '';
        let maxAmount = 0;

        Object.entries(categoryExpenses).forEach(([category, amount]) => {
            if (amount > maxAmount) {
                maxCategory = category;
                maxAmount = amount;
            }
        });

        // 計算平均每日支出
        const dates = [...new Set(itineraryExpenses.map(exp => exp.date))];
        const daysWithExpenses = dates.length;
        const avgDailyExpense = daysWithExpenses > 0 ? totalExpenses / daysWithExpenses : 0;

        // 創建分析詳情
        const analysisHTML = `
            <div class="analysis-item">
                <div class="analysis-label">總支出</div>
                <div class="analysis-value">${formatCurrency(totalExpenses, currency)}</div>
            </div>
            <div class="analysis-item">
                <div class="analysis-label">最大支出分類</div>
                <div class="analysis-value">${maxCategory} (${formatCurrency(maxAmount, currency)})</div>
            </div>
            <div class="analysis-item">
                <div class="analysis-label">平均每日支出</div>
                <div class="analysis-value">${formatCurrency(avgDailyExpense, currency)}</div>
            </div>
            <div class="analysis-item">
                <div class="analysis-label">支出天數</div>
                <div class="analysis-value">${daysWithExpenses} 天</div>
            </div>
            <div class="analysis-item">
                <div class="analysis-label">支出筆數</div>
                <div class="analysis-value">${itineraryExpenses.length} 筆</div>
            </div>
        `;

        analysisContainer.innerHTML = analysisHTML;
    }

    // 更新預算設定表單
    function updateBudgetSettingsForm(itineraryId) {
        const budget = budgets[itineraryId];

        // 更新預算設定表單
        const totalInput = document.getElementById('budget-total');
        const currencySelect = document.getElementById('budget-currency');
        const warningThresholdSelect = document.getElementById('budget-warning-threshold');

        // 分類預算輸入框
        const accommodationInput = document.getElementById('budget-accommodation');
        const transportationInput = document.getElementById('budget-transportation');
        const foodInput = document.getElementById('budget-food');
        const attractionsInput = document.getElementById('budget-attractions');
        const shoppingInput = document.getElementById('budget-shopping');
        const entertainmentInput = document.getElementById('budget-entertainment');
        const othersInput = document.getElementById('budget-others');

        if (budget) {
            // 填充預算設定
            if (totalInput) totalInput.value = budget.total;
            if (currencySelect) currencySelect.value = budget.currency;
            if (warningThresholdSelect) warningThresholdSelect.value = budget.warningThreshold;

            // 填充分類預算
            const categories = budget.categories || {};
            if (accommodationInput) accommodationInput.value = categories['住宿'] || '';
            if (transportationInput) transportationInput.value = categories['交通'] || '';
            if (foodInput) foodInput.value = categories['餐飲'] || '';
            if (attractionsInput) attractionsInput.value = categories['景點門票'] || '';
            if (shoppingInput) shoppingInput.value = categories['購物'] || '';
            if (entertainmentInput) entertainmentInput.value = categories['娛樂'] || '';
            if (othersInput) othersInput.value = categories['其他'] || '';
        } else {
            // 清除表單
            if (totalInput) totalInput.value = '';
            if (currencySelect) currencySelect.value = 'TWD';
            if (warningThresholdSelect) warningThresholdSelect.value = '0.7';

            if (accommodationInput) accommodationInput.value = '';
            if (transportationInput) transportationInput.value = '';
            if (foodInput) foodInput.value = '';
            if (attractionsInput) attractionsInput.value = '';
            if (shoppingInput) shoppingInput.value = '';
            if (entertainmentInput) entertainmentInput.value = '';
            if (othersInput) othersInput.value = '';
        }

        // 綁定儲存預算按鈕事件
        const saveButton = document.getElementById('save-budget');
        if (saveButton) {
            // 移除現有事件監聽器
            const newSaveButton = saveButton.cloneNode(true);
            saveButton.parentNode.replaceChild(newSaveButton, saveButton);

            // 添加新的事件監聽器
            newSaveButton.addEventListener('click', function() {
                saveBudgetSettings(itineraryId);
            });
        }

        // 綁定重置預算按鈕事件
        const resetButton = document.getElementById('reset-budget');
        if (resetButton) {
            // 移除現有事件監聽器
            const newResetButton = resetButton.cloneNode(true);
            resetButton.parentNode.replaceChild(newResetButton, resetButton);

            // 添加新的事件監聽器
            newResetButton.addEventListener('click', function() {
                resetBudgetSettings(itineraryId);
            });
        }
    }

    // 獲取當前行程ID
    function getCurrentItineraryId() {
        // 從localStorage獲取最後使用的行程名稱
        const lastItineraryName = localStorage.getItem('last_itinerary_name');
        return lastItineraryName || 'default';
    }

    // 儲存預算設定
    function saveBudgetSettings(itineraryId) {
        // 獲取表單資料
        const totalInput = document.getElementById('budget-total');
        const currencySelect = document.getElementById('budget-currency');
        const warningThresholdSelect = document.getElementById('budget-warning-threshold');

        // 分類預算輸入框
        const accommodationInput = document.getElementById('budget-accommodation');
        const transportationInput = document.getElementById('budget-transportation');
        const foodInput = document.getElementById('budget-food');
        const attractionsInput = document.getElementById('budget-attractions');
        const shoppingInput = document.getElementById('budget-shopping');
        const entertainmentInput = document.getElementById('budget-entertainment');
        const othersInput = document.getElementById('budget-others');

        // 驗證總預算
        if (!totalInput || !totalInput.value || isNaN(parseFloat(totalInput.value)) || parseFloat(totalInput.value) < 0) {
            alert('請輸入有效的總預算金額');
            return;
        }

        // 收集分類預算
        const categories = {};

        if (accommodationInput && accommodationInput.value && !isNaN(parseFloat(accommodationInput.value))) {
            categories['住宿'] = parseFloat(accommodationInput.value);
        }

        if (transportationInput && transportationInput.value && !isNaN(parseFloat(transportationInput.value))) {
            categories['交通'] = parseFloat(transportationInput.value);
        }

        if (foodInput && foodInput.value && !isNaN(parseFloat(foodInput.value))) {
            categories['餐飲'] = parseFloat(foodInput.value);
        }

        if (attractionsInput && attractionsInput.value && !isNaN(parseFloat(attractionsInput.value))) {
            categories['景點門票'] = parseFloat(attractionsInput.value);
        }

        if (shoppingInput && shoppingInput.value && !isNaN(parseFloat(shoppingInput.value))) {
            categories['購物'] = parseFloat(shoppingInput.value);
        }

        if (entertainmentInput && entertainmentInput.value && !isNaN(parseFloat(entertainmentInput.value))) {
            categories['娛樂'] = parseFloat(entertainmentInput.value);
        }

        if (othersInput && othersInput.value && !isNaN(parseFloat(othersInput.value))) {
            categories['其他'] = parseFloat(othersInput.value);
        }

        // 創建預算資料
        const budgetData = {
            total: parseFloat(totalInput.value),
            currency: currencySelect ? currencySelect.value : 'TWD',
            warningThreshold: warningThresholdSelect ? parseFloat(warningThresholdSelect.value) : 0.7,
            categories: categories
        };

        // 設定預算
        if (setBudget(itineraryId, budgetData)) {
            // 儲存資料
            saveToStorage();

            // 更新預算追蹤面板
            updateBudgetTrackerContent(itineraryId);

            // 切換到預算概覽頁面
            const overviewTab = document.getElementById('budget-overview-tab');
            if (overviewTab) {
                overviewTab.click();
            }

            alert('預算設定已儲存');
        }
    }

    // 重置預算設定
    function resetBudgetSettings(itineraryId) {
        // 確認重置
        const confirmed = confirm('確定要重置預算設定嗎？');
        if (!confirmed) return;

        // 清除預算資料
        delete budgets[itineraryId];

        // 儲存資料
        saveToStorage();

        // 更新預算追蹤面板
        updateBudgetTrackerContent(itineraryId);

        alert('預算設定已重置');
    }

    // 設定預算
    function setBudget(itineraryId, budgetData) {
        // 確保預算資料有效
        if (!budgetData || typeof budgetData.total !== 'number' || budgetData.total < 0) {
            console.error('無效的預算資料:', budgetData);
            return false;
        }

        // 建立預算物件
        budgets[itineraryId] = {
            total: budgetData.total,
            currency: budgetData.currency || 'TWD',
            categories: budgetData.categories || {},
            warningThreshold: budgetData.warningThreshold || 0.7,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        console.log(`已設定行程 ${itineraryId} 的預算:`, budgets[itineraryId]);
        return true;
    }

    // 添加支出
    function addExpense(itineraryId, expenseData) {
        // 確保支出資料有效
        if (!expenseData || typeof expenseData.amount !== 'number' || expenseData.amount < 0 || !expenseData.name) {
            console.error('無效的支出資料:', expenseData);
            return false;
        }

        // 確保行程的支出陣列存在
        if (!expenses[itineraryId]) {
            expenses[itineraryId] = [];
        }

        // 建立支出物件
        const newExpense = {
            id: Date.now().toString(),
            name: expenseData.name,
            amount: expenseData.amount,
            category: expenseData.category || EXPENSE_CATEGORIES.OTHERS,
            date: expenseData.date || new Date().toISOString().split('T')[0],
            notes: expenseData.notes || '',
            createdAt: new Date().toISOString()
        };

        // 添加到支出陣列
        expenses[itineraryId].push(newExpense);

        console.log(`已添加行程 ${itineraryId} 的支出:`, newExpense);
        return newExpense.id;
    }

    // 編輯支出
    function editExpense(itineraryId, expenseId, expenseData) {
        // 確保行程的支出陣列存在
        if (!expenses[itineraryId]) {
            console.error(`找不到行程 ${itineraryId} 的支出資料`);
            return false;
        }

        // 尋找支出項目
        const expenseIndex = expenses[itineraryId].findIndex(exp => exp.id === expenseId);
        if (expenseIndex === -1) {
            console.error(`找不到支出 ID ${expenseId}`);
            return false;
        }

        // 更新支出項目
        const updatedExpense = {
            ...expenses[itineraryId][expenseIndex],
            ...expenseData,
            updatedAt: new Date().toISOString()
        };

        // 確保 ID 不變
        updatedExpense.id = expenseId;

        // 更新支出陣列
        expenses[itineraryId][expenseIndex] = updatedExpense;

        console.log(`已更新行程 ${itineraryId} 的支出:`, updatedExpense);
        return true;
    }

    // 刪除支出
    function deleteExpense(itineraryId, expenseId) {
        // 確保行程的支出陣列存在
        if (!expenses[itineraryId]) {
            console.error(`找不到行程 ${itineraryId} 的支出資料`);
            return false;
        }

        // 尋找支出項目
        const expenseIndex = expenses[itineraryId].findIndex(exp => exp.id === expenseId);
        if (expenseIndex === -1) {
            console.error(`找不到支出 ID ${expenseId}`);
            return false;
        }

        // 刪除支出項目
        expenses[itineraryId].splice(expenseIndex, 1);

        console.log(`已刪除行程 ${itineraryId} 的支出 ID ${expenseId}`);
        return true;
    }

    // 計算總支出
    function calculateTotalExpenses(itineraryId) {
        // 確保行程的支出陣列存在
        if (!expenses[itineraryId]) {
            return 0;
        }

        // 計算總支出
        return expenses[itineraryId].reduce((total, expense) => total + expense.amount, 0);
    }

    // 計算各類別支出
    function calculateCategoryExpenses(itineraryId) {
        // 確保行程的支出陣列存在
        if (!expenses[itineraryId]) {
            return {};
        }

        // 初始化分類支出物件
        const categoryExpenses = {};

        // 計算各類別支出
        expenses[itineraryId].forEach(expense => {
            const category = expense.category || EXPENSE_CATEGORIES.OTHERS;
            if (!categoryExpenses[category]) {
                categoryExpenses[category] = 0;
            }
            categoryExpenses[category] += expense.amount;
        });

        return categoryExpenses;
    }

    // 檢查預算警告
    function checkBudgetWarnings(itineraryId) {
        // 確保行程的預算和支出陣列存在
        if (!budgets[itineraryId] || !expenses[itineraryId]) {
            return [];
        }

        const warnings = [];
        const budget = budgets[itineraryId];
        const totalExpenses = calculateTotalExpenses(itineraryId);
        const categoryExpenses = calculateCategoryExpenses(itineraryId);

        // 檢查總預算警告
        const totalBudgetPercentage = totalExpenses / budget.total;
        if (totalBudgetPercentage >= 1) {
            warnings.push({
                type: 'danger',
                message: `您已經超出總預算! 已支出 ${formatCurrency(totalExpenses, budget.currency)}, 超出 ${formatCurrency(totalExpenses - budget.total, budget.currency)}`
            });
        } else if (totalBudgetPercentage >= budget.warningThreshold) {
            warnings.push({
                type: 'warning',
                message: `您已經使用了 ${Math.round(totalBudgetPercentage * 100)}% 的總預算`
            });
        }

        // 檢查分類預算警告
        Object.entries(categoryExpenses).forEach(([category, amount]) => {
            if (budget.categories[category]) {
                const categoryBudgetPercentage = amount / budget.categories[category];
                if (categoryBudgetPercentage >= 1) {
                    warnings.push({
                        type: 'danger',
                        category: category,
                        message: `您已經超出 ${category} 預算! 已支出 ${formatCurrency(amount, budget.currency)}, 超出 ${formatCurrency(amount - budget.categories[category], budget.currency)}`
                    });
                } else if (categoryBudgetPercentage >= budget.warningThreshold) {
                    warnings.push({
                        type: 'warning',
                        category: category,
                        message: `您已經使用了 ${Math.round(categoryBudgetPercentage * 100)}% 的 ${category} 預算`
                    });
                }
            }
        });

        return warnings;
    }

    // 格式化貨幣
    function formatCurrency(amount, currencyCode) {
        const currency = CURRENCY_OPTIONS.find(c => c.code === currencyCode) || CURRENCY_OPTIONS[0];
        return `${currency.symbol}${amount.toLocaleString()}`;
    }

    // 公開API
    return {
        init: init,
        openBudgetTracker: openBudgetTracker,
        EXPENSE_CATEGORIES: EXPENSE_CATEGORIES,
        CURRENCY_OPTIONS: CURRENCY_OPTIONS,
        setBudget: function(itineraryId, budgetData) {
            setBudget(itineraryId, budgetData);
            saveToStorage();
        },
        addExpense: function(itineraryId, expenseData) {
            addExpense(itineraryId, expenseData);
            saveToStorage();
        },
        editExpense: function(itineraryId, expenseId, expenseData) {
            editExpense(itineraryId, expenseId, expenseData);
            saveToStorage();
        },
        deleteExpense: function(itineraryId, expenseId) {
            deleteExpense(itineraryId, expenseId);
            saveToStorage();
        },
        getBudget: function(itineraryId) {
            return budgets[itineraryId] || null;
        },
        getExpenses: function(itineraryId) {
            return expenses[itineraryId] || [];
        },
        calculateTotalExpenses: calculateTotalExpenses,
        calculateCategoryExpenses: calculateCategoryExpenses,
        checkBudgetWarnings: checkBudgetWarnings,
        formatCurrency: formatCurrency
    };
})();

// 如果在 Node.js 環境中，導出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BudgetTracker;
}
