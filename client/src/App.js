import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [books, setBooks] = useState([]);

  const fetchBooks = async () => {
    const res = await axios.get("http://localhost:3001/books");
    setBooks(res.data);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const borrowBook = async (id) => {
    try {
      await axios.post(`http://localhost:3001/borrow/${id}`);
      fetchBooks();
    } catch (err) {
      alert(err.response.data.message);
    }
  };

  const returnBook = async (id) => {
  try {
    await axios.post(`http://localhost:3001/return/${id}`);
    fetchBooks();
  } catch (err) {
    alert(err.response?.data?.message || "Something went wrong");
  }
};

  return (
    <div style={{ padding: "20px" }}>
      <h1> Library System</h1>

      {books.map((book) => (
        <div key={book.id} style={{ marginBottom: "15px" }}>
          <h3>{book.title}</h3>
          <p>Available: {book.available_copies}</p>

          <button onClick={() => borrowBook(book.id)}>Borrow</button>
          <button onClick={() => returnBook(book.id)} style={{ marginLeft: "10px" }}>
            Return
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;
