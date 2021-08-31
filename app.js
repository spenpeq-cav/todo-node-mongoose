//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// Adding in mongoose connection
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true})

const itemsSchema = {
  name: String
}
const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
  name: "Welcome to your todolist!"
})
const item2 = new Item({
  name: "Hit the + button to add a new item."
})
const item3 = new Item({
  name: "<--- Hit this to delete an item."
})

const defaultItems = [item1, item2, item3]

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)

app.get("/", function(req, res) {
  Item.find({}, function(err, foundItems){
    if(foundItems.length === 0){
      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err)
        } else {
          console.log("Successful insert many")
        }
      })
      res.redirect("/");
    } else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
});

app.get("/:listName", function(req, res){
  const listName = req.params.listName
  
  List.findOne({name: listName}, function(err, foundList){
    if(!err){
      if(!foundList){
        // Create new list
        const list = new List({
          name: listName,
          items: defaultItems
        })
        
        list.save()
        res.redirect("/" + listName)
      } else {
        // Show existing list
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
      }
    }
  })
})


app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list

  const item = new Item({
    name: itemName
  })

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item)
      foundList.save()
      res.redirect("/" + listName)
    })
  }
});

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(err){
      console.log(err)
    } else {
      console.log("Successfully deleted.")
    }
  })
  res.redirect("/")
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
