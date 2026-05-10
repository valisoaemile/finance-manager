let data = {
    transactions: JSON.parse(localStorage.getItem("db_trans")) || [],

      categories: JSON.parse(localStorage.getItem("db_cats")) || [
        "Loyer",
        "Courses",
        "Salaire",
        "Loisirs"
    ],

    goals: JSON.parse(localStorage.getItem("db_goals")) || [],

    futures: JSON.parse(localStorage.getItem("db_futures")) || []
};

let chart = null;



document.addEventListener("DOMContentLoaded", () => {

    initNav();

    refreshUI("dashboard");

   

    document.getElementById("trans-form")
        .addEventListener("submit", (e) => {

        e.preventDefault();

        const type =
            document.getElementById("t-type").value;

        const transaction = {

            id: Date.now(),

            label:
                document.getElementById("t-label").value,

            amount:
                type === "depense"
                ? -Math.abs(
                    Number(
                        document.getElementById("t-amount").value
                    )
                )
                : Math.abs(
                    Number(
                        document.getElementById("t-amount").value
                    )
                ),

            category:
                document.getElementById("t-category-select").value,

            date:
                new Date().toLocaleDateString("fr-FR")
        };

        data.transactions.push(transaction);

        saveData();

        refreshUI("budget");

        e.target.reset();
    });
    document.getElementById("cat-form")
        .addEventListener("submit", (e) => {

        e.preventDefault();

        const cat =
            document.getElementById("new-cat-name").value;

        if (!data.categories.includes(cat)) {

            data.categories.push(cat);

            saveData();

            refreshUI("parametres");
        }

        e.target.reset();
    });
    document.getElementById("goal-form")
        .addEventListener("submit", (e) => {

        e.preventDefault();

        const goal = {

            id: Date.now(),

            name:
                document.getElementById("g-name").value,

            target:
                Number(
                    document.getElementById("g-target").value
                ),

            current: 0
        };

        data.goals.push(goal);

        saveData();

        refreshUI("objectifs");

        e.target.reset();
    });
     document.getElementById("future-form")
        .addEventListener("submit", (e) => {

        e.preventDefault();

        const future = {

            id: Date.now(),

            label:
                document.getElementById("f-label").value,

            amount:
                Number(
                    document.getElementById("f-amount").value
                ),

            date:
                document.getElementById("f-date").value
        };

        data.futures.push(future);

        saveData();

        refreshUI("avenir");

        e.target.reset();
    });

});



function saveData() {

    localStorage.setItem(
        "db_trans",
        JSON.stringify(data.transactions)
    );

    localStorage.setItem(
        "db_cats",
        JSON.stringify(data.categories)
    );

    localStorage.setItem(
        "db_goals",
        JSON.stringify(data.goals)
    );

    localStorage.setItem(
        "db_futures",
        JSON.stringify(data.futures)
    );
}
function initNav() {

    document.querySelectorAll(".nav-links li")
        .forEach(li => {

        li.addEventListener("click", () => {

            document.querySelectorAll(".nav-links li")
                .forEach(el =>
                    el.classList.remove("active")
                );

            li.classList.add("active");

            document.querySelectorAll(".page-view")
                .forEach(v =>
                    v.classList.remove("active")
                );

            document.getElementById(li.dataset.page)
                .classList.add("active");

            refreshUI(li.dataset.page);
        });

    });
}
function refreshUI(page) {

    const income = data.transactions
        .filter(t => t.amount > 0)
        .reduce((a, b) => a + b.amount, 0);

    const expense = data.transactions
        .filter(t => t.amount < 0)
        .reduce((a, b) => a + Math.abs(b.amount), 0);

    document.getElementById("total-balance")
        .innerText =
        (income - expense).toLocaleString() + " Ar";

    document.getElementById("total-income")
        .innerText =
        income.toLocaleString() + " Ar";

    document.getElementById("total-expense")
        .innerText =
        expense.toLocaleString() + " Ar";

    

    document.getElementById("t-category-select")
        .innerHTML =
        data.categories.map(cat => `
            <option value="${cat}">
                ${cat}
            </option>
        `).join("");

    document.getElementById("filter-category")
        .innerHTML =
        `<option value="all">
            Toutes les catégories
        </option>` +

        data.categories.map(cat => `
            <option value="${cat}">
                ${cat}
            </option>
        `).join("");

    renderTable();

    renderCatList();

    renderGoals();

    renderFutureCharges();

    renderFuturePreview();

    renderHistory();

    renderChart();
}

function renderTable() {

    document.getElementById("budget-body")
        .innerHTML =

        data.transactions
        .slice()
        .reverse()
        .map(t => `

        <tr>

            <td>${t.date}</td>

            <td style="font-weight:600;">
                ${t.label}
            </td>

            <td>
                <span style="
                    background:#f1f5f9;
                    padding:4px 8px;
                    border-radius:8px;
                    font-size:12px;
                ">
                    ${t.category}
                </span>
            </td>

            <td style="
                font-weight:700;
                color:
                ${t.amount > 0
                    ? 'var(--income)'
                    : 'var(--expense)'};
            ">
                ${t.amount.toLocaleString()} Ar
            </td>

            <td>
                <button
                    onclick="deleteTransaction(${t.id})"
                    style="
                        border:none;
                        background:none;
                        color:red;
                        cursor:pointer;
                    "
                >
                    ✕
                </button>
            </td>

        </tr>

    `).join("");
}



function deleteTransaction(id) {

    data.transactions =
        data.transactions.filter(
            t => t.id !== id
        );

    saveData();

    refreshUI("budget");
}



function renderCatList() {

    document.getElementById("cat-list")
        .innerHTML =

        data.categories.map(cat => `

        <li style="
            display:flex;
            justify-content:space-between;
            align-items:center;
        ">

            ${cat}

            <button
                onclick="deleteCategory('${cat}')"
                style="
                    border:none;
                    background:none;
                    color:red;
                    cursor:pointer;
                "
            >
                Supprimer
            </button>

        </li>

    `).join("");
}

function deleteCategory(cat) {

    data.categories =
        data.categories.filter(c => c !== cat);

    saveData();

    refreshUI("parametres");
}



function renderGoals() {

    const dashboardContainer =
        document.getElementById(
            "goals-container-dashboard"
        );

    const fullContainer =
        document.getElementById(
            "goals-list-full"
        );

    const html = data.goals.map(goal => {

        const percent =
            (
                (goal.current / goal.target) * 100
            ).toFixed(0);

        return `

        <div class="goal-card">

            <h4>${goal.name}</h4>

            <p>
                ${goal.current.toLocaleString()} Ar /
                ${goal.target.toLocaleString()} Ar
            </p>

            <div class="prog-container">

                <div class="prog-bg">

                    <div
                        class="prog-fill"
                        style="width:${percent}%"
                    ></div>

                </div>

            </div>

            <p class="goal-percent">
                ${percent}%
            </p>

            <button
                class="goal-delete-btn"
                onclick="deleteGoal(${goal.id})"
            >
                Supprimer
            </button>

        </div>

        `;
    }).join("");

    dashboardContainer.innerHTML = html;

    fullContainer.innerHTML = html;
}



function deleteGoal(id){

    data.goals =
        data.goals.filter(
            g => g.id !== id
        );

    saveData();

    refreshUI("objectifs");
}



function renderFutureCharges() {

    document.getElementById("future-list")
        .innerHTML =

        data.futures.map(f => `

        <div class="timeline-item">

            <h4>${f.label}</h4>

            <p>
                ${f.amount.toLocaleString()} Ar
            </p>

            <small>${f.date}</small>

        </div>

    `).join("");
}



function renderFuturePreview() {

    const container =
        document.getElementById(
            "dashboard-future-preview"
        );

    if(!container) return;

    const preview =
        data.futures.slice(0, 3);

    container.innerHTML =
        preview.map(f => `

        <div class="future-preview-card">

            <div class="future-preview-top">

                <strong>${f.label}</strong>

                <span>
                    ${f.amount.toLocaleString()} Ar
                </span>

            </div>

            <div class="future-preview-date">
                ${f.date}
            </div>

        </div>

    `).join("");
}



function renderHistory(list = data.transactions) {

    document.getElementById("history-table-body")
        .innerHTML =

        list.slice()
        .reverse()
        .map(t => `

        <tr>

            <td style="padding:15px 20px;">
                ${t.date}
            </td>

            <td>${t.label}</td>

            <td>${t.category}</td>

            <td style="
                text-align:right;
                padding-right:20px;
                color:
                ${t.amount > 0
                    ? 'var(--income)'
                    : 'var(--expense)'};

                font-weight:700;
            ">
                ${t.amount.toLocaleString()} Ar
            </td>

        </tr>

    `).join("");
}



function applyHistoryFilters() {

    const month =
        document.getElementById("filter-month").value;

    const category =
        document.getElementById("filter-category").value;

    const search =
        document.getElementById("filter-search")
            .value
            .toLowerCase();

    let filtered = [...data.transactions];

   

    if(month){

        filtered = filtered.filter(t => {

            const parts = t.date.split("/");

            const transactionMonth =
                `${parts[2]}-${parts[1]}`;

            return transactionMonth === month;
        });
    }

  

    if(category !== "all"){

        filtered =
            filtered.filter(
                t => t.category === category
            );
    }

    /* SEARCH */

    if(search){

        filtered =
            filtered.filter(t =>
                t.label
                .toLowerCase()
                .includes(search)
            );
    }

    renderHistory(filtered);
}



function exportToCSV() {

    let csv =
        "Date,Libellé,Catégorie,Montant\n";

    data.transactions.forEach(t => {

        csv +=
            `${t.date},${t.label},${t.category},${t.amount}\n`;
    });

    const blob =
        new Blob(
            [csv],
            { type: "text/csv" }
        );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download = "transactions.csv";

    a.click();
}



function renderChart() {

    const ctx =
        document.getElementById("expenseChart")
            .getContext("2d");

    const chartData =
        data.categories.map(cat => {

        return data.transactions

            .filter(t =>
                t.amount < 0 &&
                t.category === cat
            )

            .reduce(
                (sum, t) =>
                sum + Math.abs(t.amount),
                0
            );
    });

    if(chart){

        chart.destroy();
    }

    chart = new Chart(ctx, {

        type: "doughnut",

        data: {

            labels: data.categories,

            datasets: [{

                data: chartData,

                backgroundColor: [
                    "#6366f1",
                    "#10b981",
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#06b6d4"
                ],

                borderWidth: 0
            }]
        },

        options: {

            responsive: true,

            plugins: {

                legend: {
                    position: "bottom"
                }
            }
        }
    });
}