import express from "express"
import bodyParser from "body-parser"
import axios from "axios"
import pg from "pg"


const app = express();
const port = 3000
const API_URL = "https://openlibrary.org/search.json?title="

const db = new pg.Client({
  user : "postgres",
  host : "localhost",
  database : "books",
  password : "1234",
  port : 5432
})

db.connect()

function formatDate(date) {
  const year = date.getFullYear(); // Get the full year (e.g., 2024)
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Get the month (0-based, so add 1), pad with '0' if needed
  const day = date.getDate(); // Get the day of the month

  return `${year}-${month}-${day}`; // Format in YYYY-MM-D
}

const today = new Date();


app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended : true}))


app.get("/" , async(req , res) => {

  try {
    const response = await db.query(
      "SELECT * FROM book"
    )
  
    const content = response.rows

    console.log(content);
    
    
    // const content = {
    //   title : result.title,
    //   author : result.author,
    //   date : result.read_date,
    //   rating : result.rating,
    //   short_note : result.short_note,
    //   image : result.cover_image
    // }
    

    res.render("index.ejs" ,{contents : content} )
  } catch (error) {
    res.render("index.ejs" ,{error : error.message} )
  }

})

app.post("/new", async (req, res) => {
    if (req.body.add === "new") {
      res.render("new.ejs");
    } else {
      res.redirect("/");
    }
  });

let book_detail = {}

app.post("/get", async (req, res) => {
  const title = req.body.title_1;
  try {
    const response = await axios.get(`${API_URL}${title}`);
    
    const data = response.data;
  
    const book = data.docs[0];
  
    if (book) {
      const title = book.title;
      const authorName = book.author_name ? book.author_name.join(", ") : "Unknown Author";
      const isbn = book.isbn ? book.isbn[0] : "No ISBN available";
      const coverId = book.cover_i;
      const coverImage = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : "No cover image available";
  
      console.log(`Title: ${title}`);
      console.log(`Author: ${authorName}`);
      console.log(`ISBN: ${isbn}`);
      console.log(`Cover Image URL: ${coverImage}`);

      book_detail = {
        title : title,
        author : authorName,
        isbn : isbn,
        cover : coverImage
      }
      
      
      
      
      return res.render("new.ejs", { title:title, authorName:authorName, coverImage:coverImage});
    } else {
      console.log("No books found.");
      return res.render("new.ejs", { error: "No books found." });
    }
    
  } catch (error) {
    console.log(error.message);
    return res.render("new.ejs", { error: error.message });
  }
});


app.post("/create" , async(req , res) => {
  const note = req.body.note
  const rating = req.body.rating
  const summary = req.body.summary
  const date = formatDate(today)


    
  await db.query("INSERT INTO book(title , author , cover_image , note , date , rating , summary) VALUES ($1 , $2 , $3 , $4 , $5 ,$6 , $7)" , [book_detail.title , book_detail.author , book_detail.cover , note , date , rating , summary])

  res.redirect("/")
})
  

app.post('/delete/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    await db.query('DELETE FROM book WHERE id = $1', [bookId]);
    res.redirect('/');  
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).send('Error deleting the book');
  }
});

app.get('/edit/:id', async (req, res) => {
  const bookId = req.params.id;

  try {
    const result = await db.query('SELECT * FROM book WHERE id = $1', [bookId]);
    const book = result.rows[0];

    res.render('edit.ejs', { book : book });
  } catch (error) {
    console.error('Error retrieving book:', error);
    res.status(500).send('Error loading edit page');
  }
});

app.post('/edit/:id', async (req, res) => {
  const bookId = req.params.id;
  const {note, rating  , summary} = req.body;

  try {
    await db.query(
      'UPDATE book SET note = $1, rating = $2 , summary = $3 WHERE id = $4',
      [ note, rating, summary, bookId]
    );

    res.redirect('/'); 
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).send('Error updating the book');
  }
});


app.get("/note/:id" , async(req , res) => {
  const bookId = req.params.id;

  try {
    const result = await db.query('SELECT * FROM book WHERE id = $1', [bookId]);
    const book = result.rows[0];

    res.render('notes.ejs', { book : book });
  } catch (error) {
    console.error('Error retrieving book:', error);
    res.status(500).send('Error loading edit page');
  }
})


app.listen(port , () => {
    console.log(`server running on port ${port}`);
    
})