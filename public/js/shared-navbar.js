async function loadNavbar() {
    try {
        const response = await fetch("/navbar.html");

        if (!response.ok) throw new Error("فشل تحميل شريط التنقل");

        const html = await response.text();
        const navbarContainer = document.getElementById("shared-navbar");

        if (!navbarContainer) throw new Error("عنصر #shared-navbar غير موجود");

        navbarContainer.innerHTML = html;

        // الآن نحاول العثور على زر تسجيل الخروج بعد إدراج HTML
        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", async () => {
                try {
                    const logoutRes = await fetch("/admin/logout", { method: "POST" });
                    if (logoutRes.ok) {
                        window.location.href = "/";
                    } else {
                        alert("حدث خطأ أثناء تسجيل الخروج");
                    }
                } catch (logoutErr) {
                    console.error("خطأ أثناء تسجيل الخروج:", logoutErr);
                    alert("فشل الاتصال بالخادم");
                }
            });
        } else {
            console.warn("زر تسجيل الخروج غير موجود في شريط التنقل");
        }

    } catch (err) {
        console.error("خطأ أثناء تحميل شريط التنقل:", err);
        alert("حدث خطأ أثناء تحميل الواجهة العلوية");
    }
}

// تنفيذ التحميل
loadNavbar();
