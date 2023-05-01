const express = require("express");
const bodyParser = require("body-parser");
const database = require("./database");

const booky = express();

booky.use(bodyParser.urlencoded({extended: true}))
booky.use(bodyParser.json());

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


//POST
// to post a new book
booky.post("/book/new",(req,res)=>{
    const newBook = req.body;
    database.books.push(newBook);
        return res.json({updatedBooks: database.books});
})

//to add a new author
booky.post("/author/new",(req,res)=>{
    const newAuthor = req.body;
    database.author.push(newAuthor);
    return res.json({updatedAuthors: database.author})
})

//to add a new publication
booky.post("/publication/new",(req,res)=>{
    const newPublication = req.body;
    database.publication.push(newPublication);
    return res.json({updatedAuthors: database.publication})
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
