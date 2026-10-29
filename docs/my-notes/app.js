// ============================================
// かおるのメモ帳 — app.js
// ============================================

const FIREBASE_CONFIG = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

const CATEGORIES = [
    { id: "immediate-todo", short: "🔥 直近",      label: "🔥 直近のやること",   type: "task", color: "#e85d04" },
    { id: "long-term-todo", short: "📅 長期",      label: "📅 長期のやること",   type: "task", color: "#4a90d9" },
    { id: "ideas",          short: "💡 アイデア",   label: "💡 アイデア",         type: "note", color: "#f5a623" },
    { id: "quotes",         short: "📖 大切な言葉", label: "📖 大切な言葉",       type: "note", color: "#27ae60" },
    { id: "family",         short: "👨‍👩‍👧 家族",      label: "👨‍👩‍👧 家族の思い出",   type: "note", color: "#c0392b" },
    { id: "study",          short: "📚 学習メモ",   label: "📚 学習メモ",         type: "note", color: "#8e44ad" },
    { id: "shopping",       short: "🛒 買い物",     label: "🛒 買い物リスト",     type: "task", color: "#16a085" },
    { id: "wishlist",       short: "🛍️ 欲しいもの", label: "🛍️ 買いたいものリスト", type: "task", color: "#d35400" },
];

const TRASH_CATEGORY = { id: "trash", short: "🗑️ ゴミ箱", label: "🗑️ ゴミ箱", type: "trash", color: "#999" };

const SEED_DATA = [
    { category: "immediate-todo", text: "アムスのビデオダウンロード" },
    { category: "immediate-todo", text: "YouTubeのグーグルアドセンスがどうなってるか確認" },
    { category: "immediate-todo", text: "グーグルアナリティクス：契約ブログ4つ、どれがどれか整理" },
    { category: "immediate-todo", text: "年間生活費の25倍に持ち家は入るか確認" },
    { category: "immediate-todo", text: "プライバシーポリシーをブログのフッターに入れる" },
    { category: "immediate-todo", text: "FWD収入保障保険（学長お薦め）を検討" },
    { category: "immediate-todo", text: "掛け捨て保険：ネットライフ or FWD を比較検討" },
    { category: "immediate-todo", text: "確定申告の整理：支払い手数料・研究費・研修費・経費・給与・会議費・交通費" },
    { category: "long-term-todo", text: "MacBook Air M1チップ以上（13インチ）購入検討\n値段によってはM2・M3は不要。アップルサポートで質問可能" },
    { category: "long-term-todo", text: "格安スマホへの乗り換え検討\n日本通信 or 楽天モバイル。1人2Gあれば十分（クイックペイがidで支払い）" },
    { category: "quotes", text: "落ちていくことが悪でもなく、上がっていくことが善でもない" },
    { category: "quotes", text: "チャンスの神様は前髪しかない\n— ギリシャ神話のカイロ" },
    { category: "quotes", text: "明日やろうはバカやろう" },
    { category: "quotes", text: "どう思われたいかで生きるのではなく、\nどうありたいか、で生きる哲学" },
    { category: "quotes", text: "情報は欲望の母" },
    { category: "quotes", text: "自己表現は自己治癒。\n満点取れなかった批判され続けたじぶんを、助けに行く旅" },
    { category: "quotes", text: "死ぬことに比べれば大丈夫\n— 父の言葉" },
    { category: "quotes", text: "学びは力になり、知識は武器になる\n— 父の言葉" },
    { category: "quotes", text: "自分を受け入れると相手を許せる、らくになれる\n— 父の言葉" },
    { category: "quotes", text: "人が持てる3つの資本\n①金融資本　②人的資本　③社会資本" },
    { category: "quotes", text: "BIG FIVE・ストレングスファインダー\n— 思考の癖に気づくことの大切さ" },
    { category: "quotes", text: "セールスで一番最初のお客様は自分だから、\n自分が感動して心が震えるものを売ること" },
    { category: "family", text: "母・ヒサコ：56才までトロントで働いていた" },
    { category: "family", text: "母・ヒサコ：44才からゲームセンター。\nその前は池田建具で3年、8時〜13時の5時間勤務" },
    { category: "family", text: "母の遺言：知恵と知識を残すことが大事。\n学ぶこと・人と会うこと" },
    { category: "family", text: "母の言葉：ないではなく「ある」に視点を置く。\n右手を失えば左手がある、左手を失えば足がある、足を失えば口がある。\n自分の可能性を最大限に活かして" },
    { category: "family", text: "母の言葉：悪い時ばかりじゃない、いつかいい時がある" },
    { category: "family", text: "父の言葉：幸せな家庭にする為に自分は何ができるか？を常に考える" },
    { category: "family", text: "父の言葉：幸せな夕飯のためにできることを具体的にやっていく" },
    { category: "family", text: "倉重ヒサコ（母）\n要介護1 / スマホ: 090-5934-3463\n住所: 東京都中央区佃2丁目11-6 クレストタワー3203（〒104-0051）" },
    { category: "study", text: "Claude Code活用法\n税理士・弁護士・会計士・FP の4人を配属 → 出力時に自動チェック → 回答精度が劇的向上" },
    { category: "study", text: "WEB用語まとめ\n・リスティング広告＝ググった時に「スポンサー」と出るもの\n・MEO＝地図でのSEO\n・インプレッション＝表示回数\n・リーチ数＝何人に表示されたか\n・フリークエンシー＝1人あたりの表示回数\n・コンバージョン＝成果のこと\n・メタディスクリプション＝検索結果に出る文字" },
    { category: "study", text: "参考サイト\nイケサイ / SANKO / WAY BACK MACHINE / eMaRl / similarweb / ウーバーサジェスト（有料）/ ネトラボ" },
    { category: "study", text: "コンテンツ作成：prep法\n結論 → 理由 → 具体例 → 結論 の順で書く" },
    { category: "study", text: "マーケティングの基本\n・ペルソナを作って拡散すると3倍の力がある\n・マーケティングはデジタル化してきている\n・パーミッションデータ・データメディアが大事な時代" },
];

let currentCategory = "immediate-todo";
let items = [];
let trashItems = [];
let useFirebase = false;
let firestoreDb = null;
let editingId = null;

window.addEventListener('DOMContentLoaded', () => {
    displayDate();
    buildTabs();
    setupTextarea();
    loadTrash();

    useFirebase = FIREBASE_CONFIG.apiKey !== "";

    if (useFirebase) {
        try {
            firebase.initializeApp(FIREBASE_CONFIG);
            firestoreDb = firebase.firestore();
            initFirebase();
        } catch (e) {
            console.error("Firebase初期化エラー:", e);
            useFirebase = false;
            initLocal();
        }
    } else {
        initLocal();
    }
});

function displayDate() {
    const d = new Date();
    const weekDays = ['日', '月', '火', '水', '木', '金', '土'];
    const str = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}（${weekDays[d.getDay()]}）`;
    document.getElementById('today-date').textContent = str;
}

function pad(n) { return String(n).padStart(2, '0'); }

function formatDate(d) {
    return `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())}`;
}

function loadTrash() {
    try {
        const stored = localStorage.getItem('kaoru-notes-trash-v1');
        trashItems = stored ? JSON.parse(stored) : [];
    } catch (_) { trashItems = []; }
}

function saveTrash() {
    localStorage.setItem('kaoru-notes-trash-v1', JSON.stringify(trashItems));
}

function buildTabs() {
    const wrapper = document.getElementById('tabs-wrapper');
    wrapper.innerHTML = '';
    [...CATEGORIES, TRASH_CATEGORY].forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'tab' + (cat.id === currentCategory ? ' active' : '');
        btn.dataset.category = cat.id;
        btn.textContent = cat.short;
        btn.style.setProperty('--cat-color', cat.color);
        btn.onclick = () => selectCategory(cat.id);
        wrapper.appendChild(btn);
    });
}

function selectCategory(categoryId) {
    currentCategory = categoryId;
    editingId = null;
    document.querySelectorAll('.tab').forEach(t => {
        t.classList.toggle('active', t.dataset.category === categoryId);
    });
    renderItems();
}

function initLocal() {
    try {
        const stored = localStorage.getItem('kaoru-notes-v1');
        if (stored) {
            items = JSON.parse(stored);
        } else {
            items = buildSeedItems();
            saveLocal();
        }
    } catch (_) {
        items = buildSeedItems();
        saveLocal();
    }
    renderItems();
}

function buildSeedItems() {
    const today = formatDate(new Date());
    return SEED_DATA.map((d, i) => ({
        id: 'loc-' + (Date.now() + i),
        category: d.category,
        text: d.text,
        completed: false,
        date: today,
        ts: Date.now() + i
    }));
}

function saveLocal() {
    localStorage.setItem('kaoru-notes-v1', JSON.stringify(items));
}

async function initFirebase() {
    try {
        const snap = await firestoreDb.collection('notes').limit(1).get();
        if (snap.empty) await seedFirebase();
        startListener();
    } catch (e) {
        console.error("Firestore接続エラー:", e);
        useFirebase = false;
        initLocal();
    }
}

async function seedFirebase() {
    const today = formatDate(new Date());
    const batch = firestoreDb.batch();
    SEED_DATA.forEach((d, i) => {
        const ref = firestoreDb.collection('notes').doc();
        batch.set(ref, { category: d.category, text: d.text, completed: false, date: today, ts: Date.now() - i * 100 });
    });
    await batch.commit();
}

function startListener() {
    firestoreDb.collection('notes').orderBy('ts', 'desc').onSnapshot(snapshot => {
        items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderItems();
    });
}

function setupTextarea() {
    const ta = document.getElementById('new-item-text');
    ta.addEventListener('input', () => {
        ta.style.height = 'auto';
        ta.style.height = Math.min(ta.scrollHeight, 110) + 'px';
    });
    ta.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') addItem();
    });
}

async function addItem() {
    const ta = document.getElementById('new-item-text');
    const text = ta.value.trim();
    if (!text) return;
    const today = formatDate(new Date());
    const newItem = { category: currentCategory, text, completed: false, date: today, ts: Date.now() };
    ta.value = '';
    ta.style.height = 'auto';
    ta.blur();
    if (useFirebase && firestoreDb) {
        await firestoreDb.collection('notes').add(newItem);
    } else {
        newItem.id = 'loc-' + Date.now();
        items.unshift(newItem);
        saveLocal();
        renderItems();
    }
}

async function toggleComplete(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const next = !item.completed;
    if (useFirebase && firestoreDb) {
        await firestoreDb.collection('notes').doc(id).update({ completed: next });
    } else {
        item.completed = next;
        saveLocal();
        renderItems();
    }
}

async function deleteItem(id) {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const trashedItem = { ...item, deletedDate: formatDate(new Date()) };
    trashItems.unshift(trashedItem);
    saveTrash();
    if (useFirebase && firestoreDb) {
        await firestoreDb.collection('notes').doc(id).delete();
    } else {
        items = items.filter(i => i.id !== id);
        saveLocal();
        renderItems();
    }
}

async function restoreFromTrash(id) {
    const item = trashItems.find(i => i.id === id);
    if (!item) return;
    trashItems = trashItems.filter(i => i.id !== id);
    saveTrash();
    const restored = { ...item };
    delete restored.deletedDate;
    if (useFirebase && firestoreDb) {
        await firestoreDb.collection('notes').add(restored);
    } else {
        items.unshift(restored);
        saveLocal();
    }
    renderItems();
}

function deleteFromTrash(id) {
    if (!confirm('完全に削除しますか？')) return;
    trashItems = trashItems.filter(i => i.id !== id);
    saveTrash();
    renderItems();
}

function clearTrash() {
    if (!confirm('ゴミ箱を空にしますか？元に戻せません。')) return;
    trashItems = [];
    saveTrash();
    renderItems();
}

async function saveEdit(id, newText) {
    const trimmed = newText.trim();
    if (!trimmed) { editingId = null; renderItems(); return; }
    editingId = null;
    if (useFirebase && firestoreDb) {
        await firestoreDb.collection('notes').doc(id).update({ text: trimmed });
    } else {
        const item = items.find(i => i.id === id);
        if (item) { item.text = trimmed; saveLocal(); }
        renderItems();
    }
}

function renderItems() {
    const listEl = document.getElementById('items-list');
    listEl.innerHTML = '';

    const footer = document.querySelector('footer');
    if (footer) footer.style.display = currentCategory === 'trash' ? 'none' : '';

    const completedSection = document.getElementById('completed-section');
    if (completedSection) completedSection.style.display = 'none';

    if (currentCategory === 'trash') {
        renderTrash(listEl);
        return;
    }

    const cat = CATEGORIES.find(c => c.id === currentCategory);
    const isTask = cat && cat.type === 'task';
    const catItems = items.filter(i => i.category === currentCategory);
    const active = catItems.filter(i => !i.completed);
    const done = catItems.filter(i => i.completed);

    if (active.length === 0 && done.length === 0) {
        listEl.innerHTML = '<div class="empty-message">まだ何もありません。<br>下の入力欄から追加してください。</div>';
        return;
    }

    active.forEach(item => listEl.appendChild(makeCard(item, isTask, cat)));

    if (done.length > 0) {
        const divider = document.createElement('div');
        divider.className = 'completed-divider';
        divider.textContent = `✅ 完了済み（${done.length}件）`;
        listEl.appendChild(divider);
        done.forEach(item => listEl.appendChild(makeCard(item, isTask, cat)));
    }
}

function renderTrash(listEl) {
    if (trashItems.length === 0) {
        listEl.innerHTML = '<div class="empty-message">ゴミ箱は空です。</div>';
        return;
    }
    const clearBtn = document.createElement('button');
    clearBtn.className = 'clear-trash-btn';
    clearBtn.textContent = '🗑️ ゴミ箱を空にする';
    clearBtn.onclick = clearTrash;
    listEl.appendChild(clearBtn);

    trashItems.forEach(item => {
        const div = document.createElement('div');
        div.className = 'item-card trash-card';

        const body = document.createElement('div');
        body.className = 'item-body';

        const textEl = document.createElement('div');
        textEl.className = 'item-text';
        textEl.textContent = item.text;

        const dateEl = document.createElement('div');
        dateEl.className = 'item-date';
        const catLabel = CATEGORIES.find(c => c.id === item.category);
        dateEl.textContent = `${catLabel ? catLabel.short : item.category}　削除日: ${item.deletedDate || ''}`;

        body.appendChild(textEl);
        body.appendChild(dateEl);
        div.appendChild(body);

        const restoreBtn = document.createElement('button');
        restoreBtn.className = 'restore-btn';
        restoreBtn.textContent = '↩ 戻す';
        restoreBtn.onclick = () => restoreFromTrash(item.id);
        div.appendChild(restoreBtn);

        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = '✕';
        delBtn.title = '完全に削除';
        delBtn.onclick = () => deleteFromTrash(item.id);
        div.appendChild(delBtn);

        listEl.appendChild(div);
    });
}

function makeCard(item, isTask, cat) {
    const div = document.createElement('div');
    div.className = 'item-card' + (item.completed ? ' completed' : '');

    if (isTask) {
        const left = document.createElement('div');
        left.className = 'item-left';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = item.completed;
        cb.className = 'item-checkbox';
        if (cat) cb.style.setProperty('--cat-color', cat.color);
        cb.onchange = () => toggleComplete(item.id);
        left.appendChild(cb);
        div.appendChild(left);
    }

    const body = document.createElement('div');
    body.className = 'item-body';

    if (editingId === item.id) {
        const ta = document.createElement('textarea');
        ta.className = 'item-edit-textarea';
        ta.value = item.text;
        ta.rows = Math.max(2, (item.text.match(/\n/g) || []).length + 1);
        setTimeout(() => {
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
            ta.focus();
            ta.setSelectionRange(ta.value.length, ta.value.length);
        }, 0);
        ta.addEventListener('input', () => {
            ta.style.height = 'auto';
            ta.style.height = ta.scrollHeight + 'px';
        });
        ta.addEventListener('keydown', e => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') saveEdit(item.id, ta.value);
            if (e.key === 'Escape') { editingId = null; renderItems(); }
        });
        ta.addEventListener('blur', () => {
            setTimeout(() => { if (editingId === item.id) saveEdit(item.id, ta.value); }, 200);
        });
        body.appendChild(ta);

        const saveBtn = document.createElement('button');
        saveBtn.className = 'edit-save-btn';
        saveBtn.textContent = '保存';
        saveBtn.onmousedown = e => e.preventDefault();
        saveBtn.onclick = () => saveEdit(item.id, ta.value);
        body.appendChild(saveBtn);
    } else {
        const textEl = document.createElement('div');
        textEl.className = 'item-text editable-text';
        textEl.textContent = item.text;
        textEl.title = 'タップして編集';
        textEl.onclick = () => { editingId = item.id; renderItems(); };

        const dateEl = document.createElement('div');
        dateEl.className = 'item-date';
        dateEl.textContent = item.date || '';

        body.appendChild(textEl);
        body.appendChild(dateEl);
    }

    div.appendChild(body);

    const del = document.createElement('button');
    del.className = 'delete-btn';
    del.textContent = '🗑️';
    del.title = 'ゴミ箱へ';
    del.onclick = e => { e.stopPropagation(); deleteItem(item.id); };
    div.appendChild(del);

    return div;
}

function showFirebaseHelp() {
    document.getElementById('firebase-modal').style.display = 'flex';
}
function closeModal() {
    document.getElementById('firebase-modal').style.display = 'none';
}
function closeModalOutside(e) {
    if (e.target === document.getElementById('firebase-modal')) closeModal();
}
