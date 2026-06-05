import { DB } from '../store.js';

// Helper to format currency
const formatAmt = (amt) => Number(amt).toLocaleString('en-PK', { style: 'currency', currency: 'PKR' });

export const renderSentPayments = () => {
    const container = document.createElement('div');
    container.className = 'sent-payments-container';
    container.innerHTML = `
        <style>
        .sent-payments-container { display:flex; gap:20px; padding:20px; min-height:80vh; }
        .sp-sidebar { width:260px; flex-shrink:0; background:#f9fafb; border-radius:12px; overflow:hidden; box-shadow:0 2px 12px rgba(0,0,0,0.08); display:flex; flex-direction:column; }
        .sp-sidebar h3 { margin:0; padding:14px 18px; background:linear-gradient(135deg,#0ea5e9,#0284c7); font-size:1rem; color:#fff; letter-spacing:0.5px; }
        .sp-account-list { list-style:none; margin:0; padding:8px; flex:1; overflow-y:auto; }
        .sp-account-item { padding:10px 14px; cursor:pointer; border-radius:8px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; background:#fff; border:1px solid #e5e7eb; transition:all 0.2s; }
        .sp-account-item:hover, .sp-account-item.active { background:#e0f2fe; border-color:#0284c7; }
        .sp-account-item .acc-name { font-weight:600; color:#1e293b; font-size:0.9rem; }
        .sp-account-item .acc-bal { font-size:0.78rem; color:#0284c7; font-weight:700; }
        .sp-add-btn { margin:10px; padding:10px; background:linear-gradient(135deg,#10b981,#059669); color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:600; transition:opacity 0.2s; }
        .sp-add-btn:hover { opacity:0.88; }
        .sp-main { flex:1; background:#fff; border-radius:12px; box-shadow:0 2px 12px rgba(0,0,0,0.08); padding:24px; display:flex; flex-direction:column; gap:20px; }
        .sp-header { display:flex; justify-content:space-between; align-items:center; }
        .sp-header h2 { margin:0; font-size:1.2rem; color:#0f172a; }
        .sp-total-card { background:linear-gradient(135deg,#0ea5e9,#0369a1); border-radius:10px; padding:16px 22px; color:#fff; display:flex; justify-content:space-between; align-items:center; }
        .sp-total-card .label { font-size:0.85rem; opacity:0.85; }
        .sp-total-card .amount { font-size:1.6rem; font-weight:800; }
        .sp-form { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:12px; background:#f8fafc; border-radius:10px; padding:16px; }
        .sp-form input, .sp-form select { padding:9px 13px; border:1px solid #cbd5e1; border-radius:7px; font-size:0.9rem; background:#fff; }
        .sp-form input:focus, .sp-form select:focus { outline:none; border-color:#0284c7; box-shadow:0 0 0 3px rgba(2,132,199,0.15); }
        .sp-submit-btn { grid-column:1/-1; padding:11px; background:linear-gradient(135deg,#0ea5e9,#0284c7); color:#fff; border:none; border-radius:8px; cursor:pointer; font-weight:700; font-size:0.95rem; transition:opacity 0.2s; }
        .sp-submit-btn:hover { opacity:0.88; }
        .sp-ledger-table { width:100%; border-collapse:collapse; font-size:0.9rem; }
        .sp-ledger-table th { background:#f1f5f9; padding:10px 14px; text-align:left; font-weight:700; color:#475569; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.5px; }
        .sp-ledger-table td { padding:10px 14px; border-bottom:1px solid #f1f5f9; color:#334155; }
        .sp-ledger-table tr:hover td { background:#f8fafc; }
        .sp-del-btn { color:#ef4444; cursor:pointer; font-size:0.82rem; font-weight:600; border:1px solid #fecaca; padding:3px 10px; border-radius:5px; background:#fff5f5; transition:all 0.2s; }
        .sp-del-btn:hover { background:#ef4444; color:#fff; }
        .sp-del-acc-btn { background:#fff5f5; color:#ef4444; border:1px solid #fecaca; padding:7px 14px; border-radius:7px; cursor:pointer; font-weight:600; font-size:0.85rem; transition:all 0.2s; }
        .sp-del-acc-btn:hover { background:#ef4444; color:#fff; }
        .sp-empty { text-align:center; color:#94a3b8; padding:30px; font-size:0.95rem; }
        @media(max-width:600px){ .sent-payments-container{flex-direction:column;} .sp-sidebar{width:100%;} }
        </style>

        <div class="sp-sidebar">
            <h3>🧾 Recipients (Log)</h3>
            <ul class="sp-account-list" id="spAccountList"></ul>
            <button class="sp-add-btn" id="spAddAccountBtn">+ Naya Recipient Add Karein</button>
        </div>

        <div class="sp-main">
            <div class="sp-header">
                <h2 id="spAccountHeader">← Koi recipient select karein</h2>
                <button class="sp-del-acc-btn" id="spDeleteAccountBtn" style="display:none;">🗑 Recipient Delete</button>
            </div>

            <div class="sp-total-card" id="spTotalCard" style="display:none;">
                <div>
                    <div class="label">Kul Bheji Gai Raqam</div>
                    <div class="amount" id="spTotalAmount">PKR 0</div>
                </div>
                <div style="font-size:2.5rem; opacity:0.4;">↑</div>
            </div>

            <form class="sp-form" id="spEntryForm" style="display:none;">
                <input type="date" id="spDate" required />
                <input type="text" id="spPurpose" placeholder="Maqsad / Description (Q Bheji)" required />
                <select id="spMethod" required>
                    <option value="">-- Tariqa chunein --</option>
                    <option>Bank Transfer</option>
                    <option>EasyPaisa</option>
                    <option>JazzCash</option>
                    <option>Cash</option>
                </select>
                <input type="number" id="spAmount" placeholder="Raqam (PKR)" step="1" min="0" required />
                <button type="submit" class="sp-submit-btn">✅ Payment Add Karein</button>
            </form>

            <div id="spLedgerWrapper" style="display:none; overflow-x:auto;">
                <table class="sp-ledger-table">
                    <thead>
                        <tr>
                            <th>Tarikh (Date)</th>
                            <th>Maqsad (Purpose)</th>
                            <th>Tariqa (Method)</th>
                            <th>Raqam (Amount)</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody id="spLedgerBody"></tbody>
                </table>
                <div id="spEmptyMsg" class="sp-empty" style="display:none;">Abhi koi record nahi hai.</div>
            </div>
        </div>
    `;

    const root = document.getElementById('root');
    if (!root) { console.error('Root not found'); return; }
    root.innerHTML = '';
    root.appendChild(container);

    const accountListEl  = document.getElementById('spAccountList');
    const addAccountBtn  = document.getElementById('spAddAccountBtn');
    const accountHeader  = document.getElementById('spAccountHeader');
    const deleteAccBtn   = document.getElementById('spDeleteAccountBtn');
    const entryForm      = document.getElementById('spEntryForm');
    const ledgerWrapper  = document.getElementById('spLedgerWrapper');
    const ledgerBody     = document.getElementById('spLedgerBody');
    const emptyMsg       = document.getElementById('spEmptyMsg');
    const totalCard      = document.getElementById('spTotalCard');
    const totalAmountEl  = document.getElementById('spTotalAmount');

    let selectedAccountId = null;

    const refreshAccounts = () => {
        const accounts = DB.getSentPaymentsAccounts();
        accountListEl.innerHTML = '';
        if (accounts.length === 0) {
            accountListEl.innerHTML = '<li style="padding:14px;color:#94a3b8;font-size:0.85rem;text-align:center;">Koi recipient nahi.</li>';
        }
        accounts.forEach(acc => {
            const li = document.createElement('li');
            li.className = 'sp-account-item' + (acc.id == selectedAccountId ? ' active' : '');
            li.dataset.id = acc.id;
            li.innerHTML = `<span class="acc-name">${acc.name}</span><span class="acc-bal">${formatAmt(acc.balance || 0)}</span>`;
            li.addEventListener('click', () => selectAccount(acc.id));
            accountListEl.appendChild(li);
        });
        // Update total card if someone selected
        if (selectedAccountId) {
            const acc = DB.getSentPaymentsAccountById(selectedAccountId);
            if (acc) totalAmountEl.textContent = formatAmt(acc.balance || 0);
        }
    };

    const selectAccount = (id) => {
        selectedAccountId = id;
        const acc = DB.getSentPaymentsAccountById(id);
        if (!acc) return;
        accountHeader.textContent = `${acc.name} ${acc.phone ? '(' + acc.phone + ')' : ''}`;
        totalAmountEl.textContent = formatAmt(acc.balance || 0);
        deleteAccBtn.style.display = 'inline-block';
        entryForm.style.display    = 'grid';
        ledgerWrapper.style.display = 'block';
        totalCard.style.display    = 'flex';
        refreshAccounts();
        refreshLedger();
    };

    const refreshLedger = () => {
        if (!selectedAccountId) return;
        const entries = DB.getSentPaymentsLedger(selectedAccountId);
        ledgerBody.innerHTML = '';
        if (entries.length === 0) {
            emptyMsg.style.display = 'block';
        } else {
            emptyMsg.style.display = 'none';
            entries.slice().reverse().forEach(ent => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${ent.date}</td>
                    <td>${ent.purpose}</td>
                    <td>${ent.method}</td>
                    <td><strong>${formatAmt(ent.amount)}</strong></td>
                    <td><span class="sp-del-btn" data-id="${ent.id}">Delete</span></td>
                `;
                tr.querySelector('.sp-del-btn').addEventListener('click', () => {
                    if (confirm('Ye entry delete karni hai?')) {
                        DB.deleteSentPaymentsEntry(ent.id);
                        refreshLedger();
                        refreshAccounts();
                    }
                });
                ledgerBody.appendChild(tr);
            });
        }
    };

    addAccountBtn.addEventListener('click', () => {
        const name = prompt('Recipient ka naam darj karein:');
        if (!name || !name.trim()) return;
        const phone = prompt('Phone number (optional, Enter dabao skip karne ke liye):');
        DB.addSentPaymentsAccount({ name: name.trim(), phone: phone || '' });
        refreshAccounts();
    });

    deleteAccBtn.addEventListener('click', () => {
        if (!selectedAccountId) return;
        if (confirm('Is recipient aur uske saare records delete karne hain?')) {
            DB.deleteSentPaymentsAccount(selectedAccountId);
            selectedAccountId = null;
            accountHeader.textContent = '← Koi recipient select karein';
            deleteAccBtn.style.display = 'none';
            entryForm.style.display   = 'none';
            ledgerWrapper.style.display = 'none';
            totalCard.style.display   = 'none';
            refreshAccounts();
        }
    });

    entryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!selectedAccountId) return;
        const entry = {
            accountId : selectedAccountId,
            date      : document.getElementById('spDate').value,
            purpose   : document.getElementById('spPurpose').value.trim(),
            method    : document.getElementById('spMethod').value,
            amount    : parseFloat(document.getElementById('spAmount').value) || 0
        };
        DB.addSentPaymentsEntry(entry);
        entryForm.reset();
        refreshLedger();
        refreshAccounts();
    });

    refreshAccounts();
};
