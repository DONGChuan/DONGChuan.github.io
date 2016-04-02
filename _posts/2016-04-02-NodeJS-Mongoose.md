---
layout: post
title: NodeJS Mongoose
category: NodeJS
tags: [nodejs]
---

This is quick note after learning Mongoose.

## Default value in schema

We could define default values on schema.

1. **Default values** directly.
2. **Default function** - set the default schema option to a function and use the return value as the default.

{% highlight javascript %}
var mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/mongodemo");

var UserSchema = new mongoose.Schema({
    nickname: {
        type: String,
        default: 'dchuan' // Default value
    },
    regTime: {
        type: Date,
        default: Date.now // Default function
    }
});

var User = mongoose.model('User', UserSchema);

var user = new User(); // Without setting anything. So with default values

console.log('user: ', user);

// output
// user:  { nickname: 'dchuan',
//    regTime: Sat Apr 02 2016 17:14:57 GMT+0200 (Romance Daylight Time),
//    _id: 56ffe1f11c6628a4037ea514 }
{% endhighlight %}

## Getters and Setters

Getters and setters could change attributes defined by the keys and values in the document.

* Setter: **transform data before it is stored mongodb**.
* Getter: **transform the representation of the data when retreive from mongodb**.

{% highlight javascript %}
var mongoose = require('mongoose');

mongoose.connect("mongodb://localhost/mongodemo");

var UserSchema = new mongoose.Schema({
    nickname: {
        type: String,
        trim: true  // Delete spaces at the begining and in the end
    },
    blogurl: {
        type: String,
        // Setter. So all the url without http/https will be added prefix http before storing in mongoDB
        set: function(url) {

            if(!url) return url;

            if(0 !== url.indexOf('http://') && 0 !== url.indexOf('https://'))
                url = 'http://' + url;

            return url;
        }
    }
});

var User = mongoose.model('User', UserSchema);

var user = new User({
    blogurl: "dongchuan.github.io"
});

console.log('user: ', user);
// output
// user:  { _id: 570038ade8cb4c9023875290,
//    blogurl: 'http://dongchuan.github.io',
//    nickname: 'dchuan' }
{% endhighlight %}

Another example about getter:

{% highlight javascript %}
var UserSchema = new mongoose.Schema({
  blogurl: {
    type: String,
    // Getter. After retreiving data, prefix http:// will be added if not exist
    get: function(url){

      if(!url) return url;

      if(0 !== url.indexOf('http://') && 0 !== url.indexOf("https://"))
        url = 'http://' + url;

      return url;
    }
  }
});

var User = mongoose.model('User', UserSchema);

var user = new User({
  blogurl: 'dongchuan.github.io'
});

user.save(function(err){
  if(err) {
    return console.log('save error:' , err);
  }

  // 'get' will be invoked here to add "http://"
  console.log('blog url: ', user.blogurl);
});
{% endhighlight %}

## Validation

Like in html, available validations are:

**for type: Number**

* required: true/false
* max: Number
* min: Number

**for type: String**

* required: true/false
* enum: [A, B, C]
* match: regexp
* maxlength: Number
* minlength: Number

We could also **customize a validation**:

* `validate: function(){}` - customized validation. Must return true/false

{% highlight javascript %}
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mongodemo');

var OrderSchema = new mongoose.Schema({
    count: {
        type: Number,
        required: true, // count must be set
        max: 1000,
        min: 10
  },
  status: {
        type: String,
        enum: ['created', 'sucess', 'failed'] // status must be choosen from enum
  },
  desc: {
        type: String,
        match: /book/g, // must contain 'book'
        // Define customized validator
        validate: function(desc) {
            return desc.length >= 10;
        }
  }
});

var Order = mongoose.model('Order', OrderSchema);

var order = new Order();
order.count = 10;
order.status = 'created';
order.desc = 'this is a great book';

order.save(function(err){

    if(err) {
        return console.log('save failed:', err);
    }

    console.log('save success');
});
{% endhighlight %}

## Methods

Each Schema can define instance and static methods for its model.

* Define instance method - SchemaName.**methods**.functionName = function functionName () {};
* Define static method - SchemaName.**statics**.functionName = function functionName () {};

{% highlight nodejs %}
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mongodemo');

var BookSchema = new mongoose.Schema({
    name: String,
    record: Number
});

// Static method
BookSchema.statics.findByRecord = function(record, callback){
    this.findOne({record: record}, function(err, doc){
        callback(err, doc);
    });
};

// Instance method
BookSchema.methods.print = function(){
    console.log('Book Information:');
    console.log('\tTitle: ', this.name);
    console.log('\tRecord: ', this.record);
};

var Book = mongoose.model('Book', BookSchema);

var book = new Book({
    name: 'NodeJS guide',
    record: 9787100
});

book.save(function(err){
    if(err) {
        return console.log('save book failed', err);
    }

    // Invoke static method
    Book.findByRecord(9787100, function(err, doc){
        console.log('findByRecord, err, doc:', err, doc);
    });

    // Invoke instance method
    book.print();
});
{% endhighlight %}

## Ref
[Mongoosejs DOCs](http://mongoosejs.com/docs/guide.html) - Mongoosejs offical docs















