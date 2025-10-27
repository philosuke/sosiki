const { ipcRenderer } = require('electron');

// グローバルデータ
let appData = {
    employees: [],
    organizations: [],
    currentFile: null,
    lastSaved: null,
    editingEmployee: null,
    editingOrg: null
};

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
    loadSampleData();
    updateDashboard();
});

// アプリ初期化
function initializeApp() {
    console.log('アプリケーションを初期化中...');
}

// イベントリスナーのセットアップ
function setupEventListeners() {
    // ナビゲーション
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            const view = e.currentTarget.dataset.view;
            switchView(view);
        });
    });

    // ファイル操作
    document.getElementById('newFileBtn').addEventListener('click', newFile);
    document.getElementById('openFileBtn').addEventListener('click', openFile);
    document.getElementById('saveFileBtn').addEventListener('click', saveFile);

    // 社員管理
    document.getElementById('addEmployeeBtn').addEventListener('click', () => openEmployeeModal());
    document.getElementById('employeeForm').addEventListener('submit', saveEmployee);
    document.getElementById('employeeSearch').addEventListener('input', filterEmployees);

    // 組織管理
    document.getElementById('addOrgBtn').addEventListener('click', () => openOrgModal());
    document.getElementById('orgForm').addEventListener('submit', saveOrg);

    // 組織図操作
    document.getElementById('zoomInBtn').addEventListener('click', () => zoomChart(1.2));
    document.getElementById('zoomOutBtn').addEventListener('click', () => zoomChart(0.8));
    document.getElementById('resetZoomBtn').addEventListener('click', resetZoom);
    document.getElementById('exportHtmlBtn').addEventListener('click', exportHtml);
}

// ビュー切り替え
function switchView(viewName) {
    document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

    document.getElementById(`${viewName}View`).classList.add('active');
    document.querySelector(`[data-view="${viewName}"]`).classList.add('active');

    if (viewName === 'employees') {
        renderEmployeeTable();
    } else if (viewName === 'organizations') {
        renderOrgTree();
    } else if (viewName === 'orgchart') {
        renderOrgChart();
    } else if (viewName === 'dashboard') {
        updateDashboard();
    }
}

// ダッシュボード更新
function updateDashboard() {
    document.getElementById('employeeCount').textContent = appData.employees.length;
    document.getElementById('orgCount').textContent = appData.organizations.length;
    document.getElementById('lastUpdate').textContent = appData.lastSaved || '未保存';
}

// 社員テーブルのレンダリング
function renderEmployeeTable(filter = '') {
    const tbody = document.getElementById('employeeTableBody');
    tbody.innerHTML = '';

    const filteredEmployees = appData.employees.filter(emp => {
        if (!filter) return true;
        const searchStr = filter.toLowerCase();
        return emp.name.toLowerCase().includes(searchStr) ||
               emp.id.toLowerCase().includes(searchStr) ||
               emp.position.toLowerCase().includes(searchStr) ||
               emp.department.toLowerCase().includes(searchStr);
    });

    filteredEmployees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHtml(employee.id)}</td>
            <td>${escapeHtml(employee.name)}</td>
            <td>${escapeHtml(employee.position)}</td>
            <td>${escapeHtml(employee.department)}</td>
            <td>${escapeHtml(employee.managerId || '-')}</td>
            <td class="action-buttons">
                <button class="btn btn-small btn-primary" onclick="editEmployee('${employee.id}')">編集</button>
                <button class="btn btn-small btn-danger" onclick="deleteEmployee('${employee.id}')">削除</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    if (filteredEmployees.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">データがありません</td></tr>';
    }
}

// 社員検索フィルター
function filterEmployees(e) {
    renderEmployeeTable(e.target.value);
}

// 社員モーダルを開く
function openEmployeeModal(employeeId = null) {
    const modal = document.getElementById('employeeModal');
    const form = document.getElementById('employeeForm');
    const title = document.getElementById('employeeModalTitle');

    form.reset();
    appData.editingEmployee = employeeId;

    if (employeeId) {
        const employee = appData.employees.find(e => e.id === employeeId);
        if (employee) {
            title.textContent = '社員を編集';
            document.getElementById('empId').value = employee.id;
            document.getElementById('empId').readOnly = true;
            document.getElementById('empName').value = employee.name;
            document.getElementById('empPosition').value = employee.position;
            document.getElementById('empDepartment').value = employee.department;
            document.getElementById('empManagerId').value = employee.managerId || '';
            document.getElementById('empEmail').value = employee.email || '';
            document.getElementById('empPhone').value = employee.phone || '';
            document.getElementById('empNotes').value = employee.notes || '';
        }
    } else {
        title.textContent = '社員を追加';
        document.getElementById('empId').readOnly = false;
    }

    modal.classList.add('active');
}

// 社員モーダルを閉じる
function closeEmployeeModal() {
    document.getElementById('employeeModal').classList.remove('active');
    appData.editingEmployee = null;
}

// 社員を保存
function saveEmployee(e) {
    e.preventDefault();

    const employee = {
        id: document.getElementById('empId').value.trim(),
        name: document.getElementById('empName').value.trim(),
        position: document.getElementById('empPosition').value.trim(),
        department: document.getElementById('empDepartment').value.trim(),
        managerId: document.getElementById('empManagerId').value.trim() || null,
        email: document.getElementById('empEmail').value.trim() || null,
        phone: document.getElementById('empPhone').value.trim() || null,
        notes: document.getElementById('empNotes').value.trim() || null
    };

    // バリデーション
    if (!employee.id || !employee.name || !employee.position || !employee.department) {
        showToast('必須項目を入力してください', 'error');
        return;
    }

    if (appData.editingEmployee) {
        // 編集
        const index = appData.employees.findIndex(e => e.id === appData.editingEmployee);
        if (index !== -1) {
            appData.employees[index] = employee;
            showToast('社員情報を更新しました', 'success');
        }
    } else {
        // 新規追加
        if (appData.employees.find(e => e.id === employee.id)) {
            showToast('この社員IDは既に使用されています', 'error');
            return;
        }
        appData.employees.push(employee);
        showToast('社員を追加しました', 'success');
    }

    closeEmployeeModal();
    renderEmployeeTable();
    updateDashboard();
}

// 社員を編集
function editEmployee(employeeId) {
    openEmployeeModal(employeeId);
}

// 社員を削除
function deleteEmployee(employeeId) {
    if (confirm('この社員を削除してもよろしいですか？')) {
        appData.employees = appData.employees.filter(e => e.id !== employeeId);
        showToast('社員を削除しました', 'success');
        renderEmployeeTable();
        updateDashboard();
    }
}

// 組織ツリーのレンダリング
function renderOrgTree() {
    const container = document.getElementById('orgTree');
    container.innerHTML = '';

    const topLevelOrgs = appData.organizations.filter(org => !org.parentId);

    if (topLevelOrgs.length === 0) {
        container.innerHTML = '<p style="padding: 20px; text-align: center;">組織データがありません</p>';
        return;
    }

    topLevelOrgs.forEach(org => {
        container.appendChild(createOrgTreeItem(org));
    });
}

// 組織ツリーアイテムを作成
function createOrgTreeItem(org) {
    const item = document.createElement('div');
    item.className = 'org-tree-item';

    const content = document.createElement('div');
    content.className = 'org-tree-item-content';
    content.innerHTML = `
        <div class="org-tree-item-color" style="background: ${org.color || '#3498db'}"></div>
        <strong>${escapeHtml(org.name)}</strong>
        <span style="color: #7f8c8d;">(${org.id})</span>
    `;

    const actions = document.createElement('div');
    actions.innerHTML = `
        <button class="btn btn-small btn-primary" onclick="editOrg('${org.id}')">編集</button>
        <button class="btn btn-small btn-danger" onclick="deleteOrg('${org.id}')">削除</button>
    `;

    item.appendChild(content);
    item.appendChild(actions);

    // 子組織を追加
    const children = appData.organizations.filter(o => o.parentId === org.id);
    if (children.length > 0) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'org-tree-children';
        children.forEach(child => {
            childrenContainer.appendChild(createOrgTreeItem(child));
        });
        item.appendChild(childrenContainer);
    }

    return item;
}

// 組織モーダルを開く
function openOrgModal(orgId = null) {
    const modal = document.getElementById('orgModal');
    const form = document.getElementById('orgForm');
    const title = document.getElementById('orgModalTitle');

    form.reset();
    appData.editingOrg = orgId;

    if (orgId) {
        const org = appData.organizations.find(o => o.id === orgId);
        if (org) {
            title.textContent = '組織を編集';
            document.getElementById('orgId').value = org.id;
            document.getElementById('orgId').readOnly = true;
            document.getElementById('orgName').value = org.name;
            document.getElementById('orgParentId').value = org.parentId || '';
            document.getElementById('orgDescription').value = org.description || '';
            document.getElementById('orgColor').value = org.color || '#3498db';
        }
    } else {
        title.textContent = '組織を追加';
        document.getElementById('orgId').readOnly = false;
        document.getElementById('orgColor').value = '#3498db';
    }

    modal.classList.add('active');
}

// 組織モーダルを閉じる
function closeOrgModal() {
    document.getElementById('orgModal').classList.remove('active');
    appData.editingOrg = null;
}

// 組織を保存
function saveOrg(e) {
    e.preventDefault();

    const org = {
        id: document.getElementById('orgId').value.trim(),
        name: document.getElementById('orgName').value.trim(),
        parentId: document.getElementById('orgParentId').value.trim() || null,
        description: document.getElementById('orgDescription').value.trim() || null,
        color: document.getElementById('orgColor').value
    };

    // バリデーション
    if (!org.id || !org.name) {
        showToast('必須項目を入力してください', 'error');
        return;
    }

    // 循環参照チェック
    if (org.parentId && org.parentId === org.id) {
        showToast('自分自身を親組織に設定できません', 'error');
        return;
    }

    if (appData.editingOrg) {
        // 編集
        const index = appData.organizations.findIndex(o => o.id === appData.editingOrg);
        if (index !== -1) {
            appData.organizations[index] = org;
            showToast('組織情報を更新しました', 'success');
        }
    } else {
        // 新規追加
        if (appData.organizations.find(o => o.id === org.id)) {
            showToast('この組織IDは既に使用されています', 'error');
            return;
        }
        appData.organizations.push(org);
        showToast('組織を追加しました', 'success');
    }

    closeOrgModal();
    renderOrgTree();
    updateDashboard();
}

// 組織を編集
function editOrg(orgId) {
    openOrgModal(orgId);
}

// 組織を削除
function deleteOrg(orgId) {
    // 子組織がある場合は削除不可
    const hasChildren = appData.organizations.some(o => o.parentId === orgId);
    if (hasChildren) {
        showToast('子組織が存在するため削除できません', 'error');
        return;
    }

    if (confirm('この組織を削除してもよろしいですか？')) {
        appData.organizations = appData.organizations.filter(o => o.id !== orgId);
        showToast('組織を削除しました', 'success');
        renderOrgTree();
        updateDashboard();
    }
}

// 組織図のレンダリング
let currentZoom = 1;

function renderOrgChart() {
    const canvas = document.getElementById('orgChartCanvas');
    canvas.innerHTML = '';
    canvas.style.transform = `scale(${currentZoom})`;

    if (appData.employees.length === 0) {
        canvas.innerHTML = '<div style="padding: 40px; text-align: center; color: #7f8c8d;"><h2>社員データがありません</h2><p>社員管理から社員を追加してください</p></div>';
        return;
    }

    // 階層構造を構築
    const hierarchy = buildHierarchy();
    const container = document.createElement('div');
    container.className = 'chart-container-inner';

    hierarchy.forEach((level, index) => {
        const levelDiv = document.createElement('div');
        levelDiv.className = 'chart-level';
        levelDiv.style.marginTop = index > 0 ? '40px' : '0';

        level.forEach(employee => {
            levelDiv.appendChild(createChartNode(employee));
        });

        container.appendChild(levelDiv);
    });

    canvas.appendChild(container);
}

// 階層構造を構築
function buildHierarchy() {
    const levels = [];
    const processed = new Set();

    // トップレベル（上司がいない、または上司が存在しない社員）
    const topLevel = appData.employees.filter(emp =>
        !emp.managerId || !appData.employees.find(e => e.id === emp.managerId)
    );

    if (topLevel.length === 0) {
        // 循環参照の可能性があるため、全員をトップレベルに配置
        return [appData.employees];
    }

    levels.push(topLevel);
    topLevel.forEach(emp => processed.add(emp.id));

    // 各レベルの部下を追加
    let currentLevel = 0;
    while (currentLevel < levels.length && processed.size < appData.employees.length) {
        const nextLevel = [];

        levels[currentLevel].forEach(manager => {
            const subordinates = appData.employees.filter(emp =>
                emp.managerId === manager.id && !processed.has(emp.id)
            );
            subordinates.forEach(emp => {
                nextLevel.push(emp);
                processed.add(emp.id);
            });
        });

        if (nextLevel.length > 0) {
            levels.push(nextLevel);
        }
        currentLevel++;
    }

    // 未処理の社員を最後のレベルに追加
    const unprocessed = appData.employees.filter(emp => !processed.has(emp.id));
    if (unprocessed.length > 0) {
        levels.push(unprocessed);
    }

    return levels;
}

// チャートノードを作成
function createChartNode(employee) {
    const node = document.createElement('div');
    node.className = 'chart-node';

    // 組織の色を適用
    const org = appData.organizations.find(o => o.name === employee.department);
    if (org && org.color) {
        node.style.borderColor = org.color;
    }

    node.innerHTML = `
        <div class="chart-node-name">${escapeHtml(employee.name)}</div>
        <div class="chart-node-position">${escapeHtml(employee.position)}</div>
        <div class="chart-node-department">${escapeHtml(employee.department)}</div>
    `;

    return node;
}

// ズーム機能
function zoomChart(factor) {
    currentZoom *= factor;
    currentZoom = Math.max(0.5, Math.min(currentZoom, 3)); // 0.5倍から3倍まで
    document.getElementById('orgChartCanvas').style.transform = `scale(${currentZoom})`;
}

function resetZoom() {
    currentZoom = 1;
    document.getElementById('orgChartCanvas').style.transform = `scale(1)`;
}

// HTML出力
async function exportHtml() {
    const result = await ipcRenderer.invoke('save-html-dialog', 'organization-chart.html');

    if (result.canceled) {
        return;
    }

    const htmlContent = generateHtmlExport();
    const writeResult = await ipcRenderer.invoke('write-file', result.filePath, htmlContent);

    if (writeResult.success) {
        showToast('HTMLファイルを出力しました', 'success');
    } else {
        showToast('HTMLファイルの出力に失敗しました: ' + writeResult.error, 'error');
    }
}

// HTML出力用のコンテンツ生成
function generateHtmlExport() {
    const hierarchy = buildHierarchy();

    let nodesHtml = '';
    hierarchy.forEach((level, index) => {
        nodesHtml += `<div class="chart-level" style="margin-top: ${index > 0 ? '40px' : '0'}">`;
        level.forEach(employee => {
            const org = appData.organizations.find(o => o.name === employee.department);
            const borderColor = org && org.color ? org.color : '#3498db';

            nodesHtml += `
                <div class="chart-node" style="border-color: ${borderColor}">
                    <div class="chart-node-name">${escapeHtml(employee.name)}</div>
                    <div class="chart-node-position">${escapeHtml(employee.position)}</div>
                    <div class="chart-node-department">${escapeHtml(employee.department)}</div>
                </div>
            `;
        });
        nodesHtml += '</div>';
    });

    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>組織図</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            padding: 40px;
            background: #f5f5f5;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        h1 {
            text-align: center;
            color: #2c3e50;
            margin-bottom: 40px;
            font-size: 32px;
        }

        .chart-container {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .chart-level {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 20px;
        }

        .chart-node {
            background: white;
            border: 2px solid #3498db;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            min-width: 200px;
            text-align: center;
        }

        .chart-node-name {
            font-weight: 600;
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 8px;
        }

        .chart-node-position {
            font-size: 14px;
            color: #7f8c8d;
            margin-bottom: 4px;
        }

        .chart-node-department {
            font-size: 12px;
            color: #95a5a6;
        }

        @media print {
            body {
                background: white;
                padding: 20px;
            }
            .container {
                box-shadow: none;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>組織図</h1>
        <div class="chart-container">
            ${nodesHtml}
        </div>
    </div>
</body>
</html>`;
}

// ファイル操作
function newFile() {
    if (confirm('新しいファイルを作成しますか？保存していないデータは失われます。')) {
        appData.employees = [];
        appData.organizations = [];
        appData.currentFile = null;
        appData.lastSaved = null;
        showToast('新しいファイルを作成しました', 'success');
        updateDashboard();
        renderEmployeeTable();
        renderOrgTree();
    }
}

async function openFile() {
    const result = await ipcRenderer.invoke('open-file-dialog');

    if (result.canceled) {
        return;
    }

    const readResult = await ipcRenderer.invoke('read-file', result.filePaths[0]);

    if (readResult.success) {
        try {
            const data = JSON.parse(readResult.data);
            appData.employees = data.employees || [];
            appData.organizations = data.organizations || [];
            appData.currentFile = result.filePaths[0];
            appData.lastSaved = new Date().toLocaleString('ja-JP');
            showToast('ファイルを読み込みました', 'success');
            updateDashboard();
            renderEmployeeTable();
            renderOrgTree();
        } catch (error) {
            showToast('ファイルの読み込みに失敗しました: ' + error.message, 'error');
        }
    } else {
        showToast('ファイルの読み込みに失敗しました: ' + readResult.error, 'error');
    }
}

async function saveFile() {
    let filePath = appData.currentFile;

    if (!filePath) {
        const result = await ipcRenderer.invoke('save-file-dialog', 'organization-data.json');
        if (result.canceled) {
            return;
        }
        filePath = result.filePath;
    }

    const data = JSON.stringify({
        employees: appData.employees,
        organizations: appData.organizations,
        savedAt: new Date().toISOString()
    }, null, 2);

    const writeResult = await ipcRenderer.invoke('write-file', filePath, data);

    if (writeResult.success) {
        appData.currentFile = filePath;
        appData.lastSaved = new Date().toLocaleString('ja-JP');
        showToast('ファイルを保存しました', 'success');
        updateDashboard();
    } else {
        showToast('ファイルの保存に失敗しました: ' + writeResult.error, 'error');
    }
}

// サンプルデータの読み込み
function loadSampleData() {
    appData.organizations = [
        { id: 'ORG001', name: '経営企画部', parentId: null, description: '経営戦略の立案', color: '#e74c3c' },
        { id: 'ORG002', name: '営業部', parentId: null, description: '営業活動全般', color: '#3498db' },
        { id: 'ORG003', name: '開発部', parentId: null, description: '製品開発', color: '#2ecc71' },
        { id: 'ORG004', name: '管理部', parentId: null, description: '総務・人事', color: '#f39c12' }
    ];

    appData.employees = [
        { id: 'EMP001', name: '山田太郎', position: '代表取締役社長', department: '経営企画部', managerId: null, email: 'yamada@example.com', phone: '03-1234-5678', notes: '' },
        { id: 'EMP002', name: '佐藤花子', position: '営業部長', department: '営業部', managerId: 'EMP001', email: 'sato@example.com', phone: '03-1234-5679', notes: '' },
        { id: 'EMP003', name: '鈴木一郎', position: '開発部長', department: '開発部', managerId: 'EMP001', email: 'suzuki@example.com', phone: '03-1234-5680', notes: '' },
        { id: 'EMP004', name: '田中美咲', position: '管理部長', department: '管理部', managerId: 'EMP001', email: 'tanaka@example.com', phone: '03-1234-5681', notes: '' },
        { id: 'EMP005', name: '高橋健太', position: '営業課長', department: '営業部', managerId: 'EMP002', email: 'takahashi@example.com', phone: '03-1234-5682', notes: '' },
        { id: 'EMP006', name: '伊藤さくら', position: '営業担当', department: '営業部', managerId: 'EMP005', email: 'ito@example.com', phone: '03-1234-5683', notes: '' },
        { id: 'EMP007', name: '渡辺大輔', position: 'シニアエンジニア', department: '開発部', managerId: 'EMP003', email: 'watanabe@example.com', phone: '03-1234-5684', notes: '' },
        { id: 'EMP008', name: '中村愛', position: 'エンジニア', department: '開発部', managerId: 'EMP003', email: 'nakamura@example.com', phone: '03-1234-5685', notes: '' }
    ];
}

// ユーティリティ関数
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
