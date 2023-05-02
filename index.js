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
booky.get("/authors/book/:isbn",async(req,res)=>{
    //const getSpecificAuthor = database.author.filter((author)=>author.books.includes(req.params.isbn));
    const getSpecificAuthor = await AuthorModel.findOne({
        books: req.params.isbn
    })
    if(!getSpecificAuthor){
        res.json({error: `${req.params.isbn} is not a valid book`})
    }
    else{
    res.json({author: getSpecificAuthor});
    }
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
booky.get("/publications/book/:isbn",async(req,res)=>{
    const getSpecificPublication = await PublicationModel.findOne({
        books: req.params.isbn
    })
    if(!getSpecificPublication){
        res.json({error: `${req.params.isbn} is not a registered book under any publication`})
    }
    else{
    res.json({publication: getSpecificPublication});
    }
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
//to update title of the book using id  
booky.put("/update/book/:isbn", async(req,res) =>{
    const updatedBook = await BookModel.findOneAndUpdate(
        {
            ISBN: req.params.isbn
        },
        {
            title: req.body.bookTitle
        },
        {
            new: true
        }
    )
    /* database.publication.forEach((pub)=>{
        if(pub.id === req.body.pubId){
            return pub.books.push(req.params.isbn)
        }
    });
    database.books.forEach((book)=>{
        if(book.ISBN === req.params.isbn){
            book.publications = req.body.pubId;
            return;
        }
    });*/

    return res.json(
        {
            books : updatedBook,
            message: "succesfully updated book"
        }
    )
})

//to update author of the book in book and author database
booky.put("/book/author/update/:isbn",async(req,res)=>{
    //update book databse
    const updatedBook = await BookModel.findOneAndUpdate(
        {
            ISBN: req.params.isbn
        },
        {
            $addToSet:{
                author: req.body.newAuthor
            }
        },
        {
            new: true
        }
    );

    //update author datbase
    const updatedAuthor = await AuthorModel.findOneAndUpdate(
        {
            id: req.body.newAuthor
        },
        {
            $addToSet:{
                books: req.params.isbn
            }
        },
        {
            new : true
        }
    )
    res.json({books: updatedBook, authors: updatedAuthor, message: "updated succesfully"})


})

//DELETE
//to delete a book 
booky.delete("/book/delete/:isbn",async(req,res)=>{
    const updatedBookDatabase = await BookModel.findOneAndDelete(
        {
            ISBN: req.params.isbn
        }
    )
    return res.json({books: updatedBookDatabase})
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
booky.delete("/book/delete/author/:isbn/:authorId",async(req,res)=>{
    //to delete given author from book
    const deleteAuthor = await BookModel.findOneAndUpdate(
        {
            ISBN: req.params.isbn
        },
        {
            $pull:{
                author: req.params.authorId
            }
        },
        {
            new: true
        }
    )
         
    
    //to delete book from author
    const deleteBook = await AuthorModel.findOneAndUpdate(
        {
            id: req.params.authorId
        },
        {
            $pull:{
                books: req.params.isbn
            }
        },
        {
            new: true
        }
    )
    
    return res.json({book : deleteAuthor,author: deleteBook});
    })






booky.listen(3000,()=>{
    console.log("server running")
 })
