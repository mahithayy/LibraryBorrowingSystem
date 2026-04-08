const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_9Mtf1qQibsSv@ep-divine-star-a1qwzngg-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  ssl: {
    rejectUnauthorized: false,
  },
});

//  Get all books
app.get("/books", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM books ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

//  Borrow book
app.post("/borrow/:id", async (req, res) => {
  const { id } = req.params;

  const book = await pool.query("SELECT * FROM books WHERE id = $1", [id]);

  if (book.rows.length === 0) {
    return res.status(404).json({ message: "Book not found" });
  }
  if (book.rows[0].available_copies <= 0) {
    return res.status(400).json({ message: "No copies available" });
  }

  await pool.query(
    `UPDATE books
     SET available_copies = available_copies - 1,
         borrowed_count = borrowed_count + 1
     WHERE id = $1`,
    [id]
  );

  res.json({ message: "Book borrowed" });
});

//  Return book
app.post("/return/:id", async (req, res) => {
  const { id } = req.params;

  const book = await pool.query("SELECT * FROM books WHERE id = $1", [id]);

  if (book.rows.length === 0) {
    return res.status(404).json({ message: "Book not found" });
  }

  if (book.rows[0].borrowed_count <= 0) {
    return res.status(400).json({ message: "You haven't borrowed this book" });
  }

  await pool.query(
    `UPDATE books
     SET available_copies = available_copies + 1,
         borrowed_count = borrowed_count - 1
     WHERE id = $1`,
    [id]
  );

  res.json({ message: "Book returned" });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));