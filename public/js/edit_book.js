document.getElementById("bookForm").addEventListener("submit", async function (e) {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData();

    // الحصول على البيانات النصية
    const id = document.getElementById("bookId").value;
    const title = document.getElementById("title").value;
    const author = document.getElementById("author").value;
    const category = document.getElementById("category").value;

    formData.append("id", id);
    formData.append("title", title);
    formData.append("author", author);
    formData.append("category", category);

    // التحقق من الملفات
    const coverImage = document.getElementById("coverImage").files[0];
    const bookFile = document.getElementById("bookFile").files[0];

    if (coverImage) {
        formData.append("coverImage", coverImage);
    } else {
        const existingCoverImage = document.getElementById("existingCoverImage").value;
        formData.append("existingCoverImage", existingCoverImage);
    }

    if (bookFile) {
        formData.append("bookFile", bookFile);
    } else {
        const existingBookFile = document.getElementById("existingBookFile").value;
        formData.append("existingBookFile", existingBookFile);
    }

    const message = document.getElementById("message");

    try {
        const res = await fetch("/books", {
            method: "PUT", // ✅ التصحيح هنا
            body: formData
        });

        if (res.ok) {
            form.reset();
            message.textContent = "✅ تم تعديل الكتاب بنجاح";
            message.className = "text-success text-center mt-3";

            // إزالة المعاينات بعد التعديل
            document.getElementById("coverPreview").innerHTML = "";
            document.getElementById("bookName").textContent = "";
        } else {
            const result = await res.json();
            message.textContent = result.error || "❌ فشل في التعديل";
            message.className = "text-danger text-center mt-3";
        }
    } catch (error) {
        message.textContent = "❌ حدث خطأ في الاتصال بالخادم";
        message.className = "text-danger text-center mt-3";
    }
});

//-----------drag  drop -------------
function setupDropzone(dropzoneId, inputId, previewId, fileCallback) {
    const dropzone = document.getElementById(dropzoneId);
    const input = document.getElementById(inputId);
    const preview = document.getElementById(previewId);

    dropzone.addEventListener("click", () => input.click());

    dropzone.addEventListener("dragover", e => {
        e.preventDefault();
        dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", e => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        const file = e.dataTransfer.files[0];
        input.files = e.dataTransfer.files;
        fileCallback(file);
    });

    input.addEventListener("change", () => {
        const file = input.files[0];
        fileCallback(file);
    });
}

// غلاف الصورة (معاينة صورة)
setupDropzone("coverDrop", "coverImage", "coverPreview", file => {
    const preview = document.getElementById("coverPreview");
    preview.innerHTML = "";
    if (file && file.type.startsWith("image/")) {
        const img = document.createElement("img");
        img.src = URL.createObjectURL(file);
        img.width = 60;  // number, not string
        img.height = 60; // number, not string
        preview.appendChild(img);

        // Revoke the object URL after image loads to free memory
        img.onload = () => {
            URL.revokeObjectURL(img.src);
        };
    }
});


// ملف PDF (إظهار الاسم فقط)
setupDropzone("bookDrop", "bookFile", "bookName", file => {
    const nameDiv = document.getElementById("bookName");
    if (file && file.name.endsWith(".pdf")) {
        nameDiv.textContent = `📄 ${file.name}`;
    } else {
        nameDiv.textContent = "❌ الرجاء اختيار ملف PDF صالح";
    }
});
