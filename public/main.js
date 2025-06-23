let isAdmin = false;
let allBooks = [];

async function checkAdmin() {
    const res = await fetch("/admin/check");
    if (res.ok) {
        const data = await res.json();
        isAdmin = data.isAdmin;
        if (isAdmin) {
            document.querySelectorAll(".admin-only").forEach(el => el.classList.remove("d-none"));
            document.querySelectorAll("#loginBtn").forEach(el => el.classList.add("d-none"));
        }
    }
}

async function loadBooks() {
    const res = await fetch("/books");
    allBooks = await res.json();
    displayBooks(allBooks);
    fillCategoryFilter(allBooks);
}

function displayBooks(books) {
    const booksContainer = document.getElementById("books");
    booksContainer.innerHTML = "";

    books.forEach(book => {
        const deleteButton = isAdmin
            ? `<button class="btn btn-outline-danger ms-2 admin-delete" data-id="${book.id}">🗑️ حذف</button>`
            : "";

        const card = document.createElement("div");
        card.className = "col-md-6 col-lg-4 mb-4";
        card.innerHTML = `
  <div class="card h-100 border-0 shadow-lg rounded-4 overflow-hidden d-flex flex-row-reverse" dir="rtl">
    <img src="${book.coverImage}" class="img-fluid" style="width: 40%; object-fit: cover;" alt="غلاف الكتاب" />
    <div class="card-body d-flex flex-column justify-content-between p-3 w-100">
      <div>
        <h5 class="card-title fw-bold text-primary">${book.title}</h5>
        <p class="mb-1 text-secondary"><strong>المؤلف:</strong> ${book.author}</p>
        <p class="text-muted"><strong>النوع:</strong> ${book.category}</p>
      </div>
      <div class="d-flex flex-wrap gap-2 mt-3">
        <a href="${book.bookFile}" class="btn btn-sm btn-success" download>📥 تحميل</a>
        <a href="${book.bookFile}" class="btn btn-sm btn-outline-primary" target="_blank">📖 قراءة</a>
        ${deleteButton}
      </div>
    </div>
  </div>
`;

        booksContainer.appendChild(card);
    });
}

function fillCategoryFilter(books) {
    const categoryFilter = document.getElementById("categoryFilter");
    if (!categoryFilter) return;

    const categories = new Set(books.map(book => book.category));
    categoryFilter.innerHTML = `<option value="">كل التصنيفات</option>`;
    categories.forEach(cat => {
        const option = document.createElement("option");
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
}

function filterBooks() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const category = document.getElementById("categoryFilter")?.value || "";
    const filtered = allBooks.filter(book =>
        (book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query)) &&
        (category === "" || book.category === category)
    );
    displayBooks(filtered);
}

async function deleteBook(id) {
    if (confirm("هل أنت متأكد أنك تريد حذف هذا الكتاب؟")) {
        const res = await fetch(`/books/${id}`, { method: "DELETE" });
        if (res.ok) {
            await loadBooks();
            filterBooks(); // لضمان التحديث بعد الفلترة
        } else {
            alert("فشل الحذف");
        }
    }
}

window.addEventListener("DOMContentLoaded", async () => {
    await checkAdmin();
    await loadBooks();

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("input", filterBooks);
    }

    const categoryFilter = document.getElementById("categoryFilter");
    if (categoryFilter) {
        categoryFilter.addEventListener("change", filterBooks);
    }

    const booksContainer = document.getElementById("books");
    if (booksContainer) {
        booksContainer.addEventListener("click", e => {
            if (e.target.classList.contains("admin-delete")) {
                const id = e.target.dataset.id;
                deleteBook(id);
            }
        });
    }
});
