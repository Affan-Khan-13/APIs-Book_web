const express = require("express");
const bodyParser = require("body-parser");
const dotenv = require("dotenv")
const mongoose = require("mongoose");

const database = require("./database/database");

const BookModel = require("./database/book");
const AuthorModel = require("./database/author");
const PublicationModel = require("./database/publication");

const booky = express();

booky.use(bodyParser.urlencoded({extended: true}))
booky.use(bodyParser.json());

dotenv.config()
mongoose.connect(process.env.MONGO_URL,
    { useNewUrlParser: true,
        useUnifiedTopology: true,
        }
).then(()=>console.log("connection has been established"));


//to get all books
booky.get("/",async(req,res)=>{
    const getAllBooks = await BookModel.find()

    return res.json(getAllBooks)
});

//to get a specific book
booky.get("/is/:isbn",async(req,res)=>{
    const getSpecificBook = await BookModel.findOne({ISBN: req.params.isbn})

    if(!getSpecificBook){
        return res.json({error : `No book found for the isbn of ${req.params.isbn}`})
    }
    return res.json({books : getSpecificBook})

});

//to get books based on category
booky.get("/c/:category",async(req,res)=>{
    const getSpecificBook = await BookModel.findOne({category: req.params.category})
    if(!getSpecificBook){
        return res.json({error : `No book found for the category of ${req.params.category}`})
    }
    return res.json({books : getSpecificBook})

});

//to get books based on language
booky.get("/l/:language",async(req,res)=>{
    const getSpecificBook = await BookModel.findOne({language: req.params.language})
    if(!getSpecificBook){
        return res.json({error : `No book found for the language of ${req.params.language}`})
    }
    return res.json({books : getSpecificBook})

});

//to get all authors
booky.get("/authors",async(req,res)=>{
    const authors = database.author;
    const getAllAuthors = await AuthorModel.find()
    res.json(getAllAuthors)
})

//to get a specific author
booky.get("/authors/:name",async(req,res)=>{
    //const authors = database.author.filter((author)=>author.name === req.params.name);
    const getSepecificAuthor = await AuthorModel.findOne({name: req.params.name})
    if(!getSepecificAuthor){
        res.json({error : `author ${req.params.name} not found `})
    }
    else{res.json(getSepecificAuthor)}
})

//to get authors based on book
booky.get("/authors/book/:isbn",(req,res)=>{
    const getSpecificAuthor = database.author.filter((author)=>author.books.includes(req.params.isbn));
    if(getSpecificAuthor.length === 0){
        res.json({error: `${req.params.isbn} is not a valid book`})
    }
    res.json({author: getSpecificAuthor});
})

//to get all publications
booky.get("/publications",async (req,res)=>{
    const getAllPublications = await PublicationModel.find()
    res.json(getAllPublications)
})

//to get a specific publication
booky.get("/publications/:name",async(req,res)=>{
    const getSpecificPublication =await PublicationModel.findOne({name: req.params.name}) 
    if(!getSpecificPublication){
        res.json({error: `${req.params.name} is not a registered publication`})
    }
    else{res.json(getSpecificPublication);}
    
})

// to get a publication based on book
booky.get("/publications/book/:isbn",(req,res)=>{
    const getSpecificPublication = database.publication.filter((publication)=>publication.books.includes(req.params.isbn));
    if(getSpecificPublication.length === 0){
        res.json({error: `${req.params.isbn} is not a registered book under any publication`})
    }
    res.json({author: getSpecificPublication});
})


//POST
// to post a new book
booky.post("/book/new",async (req,res)=>{
    const {newBook} = req.body;
    const addNewBook = await BookModel.create(newBook);
    return res.json({books: addNewBook, message:"book added successfully"})
 
})

//to add a new author
booky.post("/author/new",async(req,res)=>{
    const {newAuthor} = req.body;
    const addNewAuthor = await AuthorModel.create(newAuthor)
    return res.json({author: addNewAuthor})
})

//to add a new publication
booky.post("/publication/new",async(req,res)=>{
    const {newPublication} = req.body;
    const addnewPublication = await PublicationModel.create(newPublication);
    return res.json({publication : addnewPublication})
})


//PUT
//to update details of book and with related publication details 
booky.put("/publication/update/book/:isbn", (req,res) =>{
    database.publication.forEach((pub)=>{
        if(pub.id === req.body.pubId){
            return pub.books.push(req.params.isbn)
        }
    });
    database.books.forEach((book)=>{
        if(book.ISBN === req.params.isbn){
            book.publications = req.body.pubId;
            return;
        }
    });
    return res.json(
        {
            books : database.books,
            publications : database.publication,
            message: "succesfully updated publication"
        }
    )
})

//DELETE
//to delete a book 
booky.delete("/book/delete/:isbn",(req,res)=>{
    const updatedBookDatabase = database.books.filter((book)=> book.ISBN ===req.params.isbn)
    database.books = updatedBookDatabase;

    return res.json({books: database.books})
});


//delete author from book 
booky.delete("/book/delete/author/:isbn",(req,res)=>{

    database.books.forEach((book)=>{
        if(book.ISBN === req.params.isbn){
            book.author.pop();
        }
     });

     return res.json({book : database.books})
})

//delete author from book and book from author
booky.delete("/book/delete/author/:isbn/:authorId",(req,res)=>{
    //to delete given author from book
    database.books.forEach((book)=>{
        if(book.ISBN === req.params.isbn){
            const newAuthorList = book.author.filter((eachAuthor)=> eachAuthor !== parseInt(req.params.authorId))    
            book.author = newAuthorList;
        }
        return
         
    })
    //to delete book from author
    database.author.forEach((eachAuthor)=>{
        if(eachAuthor.id === parseInt(req.params.authorId)){
            const newBookList = eachAuthor.books.filter((book)=>book !== req.params.isbn );
            eachAuthor.books = newBookList;
        }
        return
    })


    return res.json({book : database.books,author: database.author});
})



booky.listen(3000,()=>{
    console.log("server running")
 })
