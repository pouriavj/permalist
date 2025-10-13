import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "your-username-here",
  host: "localhost",
  database: "your-database-here",
  password: "your-password-here",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [] ;
let errorMessage;

async function dataFetch() {
  const result = await db.query(
    "SELECT * FROM items ORDER BY id ASC"
  ); 
 console.log(result.rows);
 if (result.rows.length !== 0) {
  items = result.rows;
 }
  else {
  items = [];
 }
  
}

app.get("/", async (req, res) => {
   await dataFetch();
   if(errorMessage){
    res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
    error: errorMessage,
  });
  errorMessage = false;
   }else{
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
}
});

app.post("/add", async (req, res) => {
  // const item = req.body.newItem;
  // items.push({ title: item });  
  try{
     await db.query(
    "INSERT INTO items (title) VALUES ($1)",
    [req.body.newItem]
  ); 
} catch(err) {
  console.log("Error: " + err.message);
  errorMessage = "Invalid Data, try again"
}
  res.redirect("/");
});

app.post("/edit", async(req, res) => {
   try{
     await db.query(
    "UPDATE items SET title = $1 WHERE id = $2",
    [req.body.updatedItemTitle, req.body.updatedItemId]
  ); 
} catch(err) {
  console.log("Error: " + err.message);
  errorMessage = "Invalid Data, try again"
}
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  try{
     await db.query(
    "DELETE FROM items WHERE id = $1",
    [req.body.deleteItemId]
  ); 
} catch(err) {
  console.log("Error: " + err.message);
  errorMessage = "Invalid Data, try again"
}
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
