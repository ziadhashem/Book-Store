const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const session = require('express-session');

const app = express();

const booksFile = path.join(__dirname, 'data', 'books.json');
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const adminUser = { username: 'admin', password: '123456' };

app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/admin/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/admin/login', (req, res) => {
    const { username, password } = req.body;
    if (username === adminUser.username && password === adminUser.password) {
        req.session.isAdmin = true;
        isAdmin = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ error: "بيانات غير صحيحة" });
    }
});

app.post('/admin/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'خطأ في تسجيل الخروج' });
        }
        res.clearCookie('connect.sid'); // هذه مهمة لمسح الكوكي
        res.json({ success: true });
    });
});

app.get("/admin/check", (req, res) => {
    res.json({ isAdmin: !!req.session.isAdmin });
});


function requireAdmin(req, res, next) {
    if (req.session.isAdmin) next();
    else res.status(403).json({ error: "غير مصرح" });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now().toString(16) + path.extname(file.originalname))
});
const upload = multer({ storage });

app.get('/books', (req, res) => {
    const books = JSON.parse(fs.readFileSync(booksFile));
    res.json(books);
});

app.post('/books', requireAdmin, upload.fields([{ name: 'coverImage' }, { name: 'bookFile' }]), (req, res) => {
    const books = JSON.parse(fs.readFileSync(booksFile));
    const newBook = {
        id: Date.now(),
        title: req.body.title,
        author: req.body.author,
        category: req.body.category,
        coverImage: req.files.coverImage ? '/uploads/' + req.files.coverImage[0].filename : '',
        bookFile: req.files.bookFile ? '/uploads/' + req.files.bookFile[0].filename : ''
    };
    books.push(newBook);
    fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));
    res.status(201).json(newBook);
});

app.delete('/books/:id', requireAdmin, (req, res) => {
    let books = JSON.parse(fs.readFileSync(booksFile));
    books = books.filter(book => book.id != req.params.id);
    fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));
    res.json({ success: true });
});

// ✅ معالجة تعديل الكتاب
app.put('/books', requireAdmin, upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'bookFile', maxCount: 1 }
]), (req, res) => {
    try {
        const { id, title, author, category, existingCoverImage, existingBookFile } = req.body;

        const coverFile = req.files['coverImage']?.[0];
        const bookFile = req.files['bookFile']?.[0];

        const coverPath = coverFile ? `/uploads/${coverFile.filename}` : existingCoverImage;
        const bookPath = bookFile ? `/uploads/${bookFile.filename}` : existingBookFile;

        // تحميل كل الكتب
        const books = JSON.parse(fs.readFileSync(booksFile, 'utf8'));

        // البحث عن الكتاب المطلوب تعديله
        const index = books.findIndex(book => String(book.id) === String(id));

        if (index === -1) {
            return res.status(404).json({ error: "لم يتم العثور على الكتاب" });
        }

        // قبل تحديث الكتاب
        if (coverFile && existingCoverImage && fs.existsSync(path.join(__dirname, 'public', existingCoverImage))) {
            fs.unlinkSync(path.join(__dirname, 'public', existingCoverImage));
        }
        if (bookFile && existingBookFile && fs.existsSync(path.join(__dirname, 'public', existingBookFile))) {
            fs.unlinkSync(path.join(__dirname, 'public', existingBookFile));
        }
        // التحديث
        books[index] = {
            ...books[index],
            title,
            author,
            category,
            coverImage: coverPath,
            bookFile: bookPath
        };

        // حفظ التعديلات
        fs.writeFileSync(booksFile, JSON.stringify(books, null, 2));

        res.json({ success: true, message: "✅ تم تعديل الكتاب بنجاح", book: books[index] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "❌ حدث خطأ أثناء التعديل" });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`📚 الخادم يعمل على http://localhost:${PORT}`));