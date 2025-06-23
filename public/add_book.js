document.getElementById("bookForm").addEventListener("submit", async function (e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);

    const res = await fetch("/books", {
        method: "POST",
        body: formData
    });

    const message = document.getElementById("message");

    if (res.ok) {
        form.reset();
        message.textContent = "✅ تم إضافة الكتاب بنجاح";
        message.className = "text-success text-center mt-3";
    } else {
        const result = await res.json();
        message.textContent = result.error || "❌ فشل في الإضافة";
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
