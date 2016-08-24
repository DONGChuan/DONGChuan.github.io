---
layout: post
title: NodeJS Mongoose
category: NodeJS
tags: [nodejs]
---

Quick note about Mongoose. [Code demo](https://github.com/DONGChuan/MongooseDemo)

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

{% highlight javascript %}
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

## Middleware

Middleware (also called **pre and post hooks**) are **functions which are passed control during execution of asynchronous functions**. Mongoose has 2 types of middleware: 

**document middleware**:

* [init](http://mongoosejs.com/docs/api.html#document_Document-init)
* [validate](http://mongoosejs.com/docs/api.html#document_Document-validate)
* [save](http://mongoosejs.com/docs/api.html#model_Model-save)
* [remove](http://mongoosejs.com/docs/api.html#model_Model-remove)

**query middleware**:

* [count](http://mongoosejs.com/docs/api.html#query_Query-count)
* [find](http://mongoosejs.com/docs/api.html#query_Query-find)
* [findOne](http://mongoosejs.com/docs/api.html#query_Query-findOne)
* [findOneAndRemove](http://mongoosejs.com/docs/api.html#query_Query-findOne)
* [findOneAndUpdate](http://mongoosejs.com/docs/api.html#query_Query-findOneAndUpdate)
* [update](http://mongoosejs.com/docs/api.html#query_Query-update)

Both of them support pre and post hooks.

>There is no query hook for remove(), only for documents. If we set a 'remove' hook, it will be fired when you call myDoc.remove(), not when we call MyModel.remove().

#### Pre and Post

Two types of pre hooks:

* Serial - **Serial middleware are executed one after another, when each middleware calls next**.
* Parallel - **Parallel middleware are executed in parallel**.

**Post middleware are executed after the hooked method and all of its pre middleware have completed**. Two types of post hooks:

* Common post hook does not directly receive flow control, e.g. no next or done callbacks are passed to it. it is used in a way to register traditional event listeners for these methods. 
* **Asynchronous Post Hooks** - they are executed in a pre-defined order. If post hook function takes at least 2 parameters (function(doc, next)), mongoose will assume the second parameter is a next() function that we will call to trigger the next middleware in the sequence.

> When we put common post hook with asynchronous post hook together. Common post hook will be triggered firstly!

{% highlight javascript %}
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/mongodemo');

var ResellerSchema = new mongoose.Schema({
    address: String
});

ResellerSchema.pre('save', function(next){
    console.log('pre serial save middleware');
    next();
});

// `true` means it is a parallel middleware. We **must** specify `true`
// as the second parameter if we want to use parallel middleware.
ResellerSchema.pre('save', true, function(next, done){
    console.log('pre parallel save middleware');
    // The hooked method 'save', will not be executed until done is called by each middleware (in our case, only one).
    // Then mongoose knows to go next()!
    done();
    next();
});

ResellerSchema.post('save', function(doc, next){
    console.log('post save middleware A ' + doc);
    next();
});

// Will not execute until the first middleware calls `next()`
ResellerSchema.post('save', function(doc, next){
    console.log('post save middleware B ' + doc);
    next();
});

// this one is not asynchronous, but it will be triggered firstly before the above two posts!
ResellerSchema.post('save', function(doc){
    console.log('post save middleware no Asynchronous ' + doc);
});

var Reseller = mongoose.model('Reseller', ResellerSchema);

var reseller = new Reseller({
    address: '101st, People Read'
});

reseller.save();

// Output
// pre serial save middleware
// pre parallel save middleware
// post save middleware no Asynchronous { _id: 5700dcd659caab4c1018795e,
//   address: '101st, People Read',
//   __v: 0 }
// post save middleware A { _id: 5700dcd659caab4c1018795e,
//   address: '101st, People Read',
//   __v: 0 }
// post save middleware B { _id: 5700dcd659caab4c1018795e,
//   address: '101st, People Read',
//   __v: 0 }
{% endhighlight %}

### Error handling

If any middleware calls next or done with a parameter of type Error, the flow is interrupted, and the error is passed to the callback.

{% highlight javascript %}
ResellerSchema.pre('save', function(next) {
  // We **must** do `new Error()`. `next('something went wrong')` will **not** work
  var err = new Error('something went wrong');
  next(err);
});

reseller.save(function(err) {
  console.log(err.message) // something went wrong
});
{% endhighlight %}

## Virtual attributes

Virtual attributes are **attributes that are convenient to have around but that do not get persisted to mongodb**. For example, we persist firstName and lastName, but we also prefer to have fullName. Then virtual attribute could be a good choice!

> We must set toJSON/toObject to be able to output it!

{% highlight javascript %}
var mongoose = require('mongoose');

var PersonSchema = new mongoose.Schema({
    firstName: String,
    lastName: String
});

// Set virtual attributes
PersonSchema.virtual('fullName').get(function(){
    return this.firstName + ' ' + this.lastName;
});

// If without it, when "console.log('JSON:', JSON.stringify(person));", we could not see fullname
PersonSchema.set('toJSON', {getters: true, virtual: true});

var Person = mongoose.model('Person', PersonSchema);

var person = new Person({
    firstName: 'Chuan',
    lastName: 'DONG'
});

console.log('user full name: ', person.fullName);

console.log('JSON:', JSON.stringify(person));
{% endhighlight %}

## Ref

* [Mongoosejs DOCs](http://mongoosejs.com/docs/guide.html) - Mongoosejs offical docs
* [极客学院](http://www.jikexueyuan.com/course/1905.html) - Nodejs 使用进阶 














