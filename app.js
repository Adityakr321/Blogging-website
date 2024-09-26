//jshint esversion:6
require('dotenv').config({ path: __dirname + '/.env' });
const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");
const ejs = require("ejs");
const mongoose = require("mongoose");

console.log("MONGODB_URI:", process.env.MONGODB_URI);

// MongoDB Atlas connection with options for stability
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Successfully connected to MongoDB Atlas!");
}).catch((err) => {
  console.error("MongoDB connection error:", err);
});

const blogSchema = new mongoose.SchemaTypeOptions({
  newtitle: String,
  newbody : String
});

const Blog = mongoose.model("Blog", blogSchema);

const homeStartingContent = "Welcome to Daily Journal, your go-to source for insightful articles, stories, and updates on topics that matter to you. Whether you're looking for lifestyle tips, personal development insights, or engaging stories from around the world, we’ve got something for everyone.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/",function(req,res){
  Blog.find()
  .then((foundblogs)=>{
    res.render("home",{startingContent : homeStartingContent, newContent: foundblogs});
  })
  .catch((err)=>{
    console.log(err);
  })
})

app.get("/about",function(req,res){
    res.render("about");
})

app.get("/contact",function(req,res){
  res.render("contact");
})

app.get("/compose",function(req,res){
  res.render("compose");
})


app.get("/posts/:postName",function(req,res){

  const requestedTitle = _.lowerCase(req.params.postName);
  Blog.findOne({ newtitle: { $regex: new RegExp("^" + requestedTitle + "$", "i") } })
  .then((foundblog)=>{
    console.log("match found!");
    res.render("post",{blog : foundblog })
});
});

app.post("/compose",function(req,res){
     const title = req.body.postTitle;
     const body = req.body.postBody;
   
    const blog = new Blog({
      newtitle : title,
      newbody : body
    })
    blog.save();
    res.redirect("/");    
})

app.post("/delete",function(req,res){
   const titleid =  req.body.posttitle;
   console.log(titleid);
   Blog.findByIdAndDelete(titleid)
   .then(()=>{
    console.log("Item removed");
    res.redirect("/");
   })
   .catch((err)=>{
    console.log(err);
   })
})


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server started on port " + port);
});