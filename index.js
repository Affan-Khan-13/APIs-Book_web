const express = require("express");
const database = require("./database");

const booky = express();

//to get all books
booky.get("/",(req,res)=>{
    return res.json({books : database.books})
});

//to get a specific book
booky.get("/is/:isbn",(req,res)=>{
    const getSpecificBook = database.books.filter((book)=>book.ISBN === req.params.isbn);
    if(getSpecificBook.length <= 0){
        return res.json({error : `No book found for the isbn of ${req.params.isbn}`})
    }
    return res.json({books : getSpecificBook})

});

//to get books based on category
booky.get("/c/:category",(req,res)=>{
    const getSpecificBook = database.books.filter((book)=>book.category.includes(req.params.category));
    if(getSpecificBook.length === 0){
        return res.json({error : `No book found for the category of ${req.params.category}`})
    }
    return res.json({books : getSpecificBook})

});

//to get books based on language
booky.get("/l/:language",(req,res)=>{
    const getSpecificBook = database.books.filter((book)=>book.language.includes(req.params.language));
    if(getSpecificBook.length === 0){
        return res.json({error : `No book found for the language of ${req.params.language}`})
    }
    return res.json({books : getSpecificBook})

});

//to get all authors
booky.get("/authors",(req,res)=>{
    const authors = database.author;
    res.json({author:authors})
})

//to get a specific author
booky.get("/authors/:author",(req,res)=>{
    const authors = database.author.filter((author)=>author.name === req.params.author);
    if(authors.length === 0){
        res.json({error : `author ${req.params.author} not found `})
    }
    res.json({author:authors})
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
booky.get("/publications",(req,res)=>{
    res.json({publications : database.publication})
})

//to get a specific publication
booky.get("/publications/:name",(req,res)=>{
    const getSpecificPublication = database.publication.filter((publication)=>publication.name === (req.params.name));
    if(getSpecificPublication.length === 0){
        res.json({error: `${req.params.name} is not a registered publication`})
    }
    res.json({author: getSpecificPublication});
})

// to get a publication based on book
booky.get("/publications/book/:isbn",(req,res)=>{
    const getSpecificPublication = database.publication.filter((publication)=>publication.books.includes(req.params.isbn));
    if(getSpecificPublication.length === 0){
        res.json({error: `${req.params.isbn} is not a registered book under any publication`})
    }
    res.json({author: getSpecificPublication});
})


booky.listen(3000,()=>{
    console.log("server running")
 })
