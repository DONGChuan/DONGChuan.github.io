---
layout: post
title: SpringMVC Annotation in Controller
category: SpringMVC
tags: [spring, springmvc]
---

This is a quick note about frequently used annotations in SpringMVC controller

## @RequestMapping

Annotation for **mapping web requests onto specific handler classes and/or handler methods**. It means `DispatcherServlet` intercepts the request, then the switch request to thecorresponding method determined by @RequestMapping.

1. `@RequestMapping` on class means all handling methods on this controller are relative to the this path.
2. `@RequestMapping` on method means mapping URLs to this method

### Properties

* `value` indicates url to map. If no other properties, we could use its simplified form `@RequestMapping("/path")`.

* `method` indicates HTTP methods. It will support all methods if not specified 

{% highlight java %}
method = RquestMethod.GET
method = {RquestMethod.GET，RquestMethod.POST }
{% endhighlight %}

* `consumes` indicates Content-Type to handle.

{% highlight java %}
consumes = "application/json"
consumes = {"application/json"，"text/html" }
{% endhighlight %}

* `produces` indicates the producible media types of the mapped request, a request will be mapped only when Accept matches it.

{% highlight java %}
produces = "application/json"
produces = {"application/json", "charset=UTF-8" }
{% endhighlight %}

* `headers` indicates only the requests having these headers can be mapped.

{% highlight java %}
headers = "content-type=text/*"
{% endhighlight %}

* `params` indicates only the requests having these parameters can be mapped. We could also add `!=` pr `==` to indicate conditions.

{% highlight java %}
// myParam exists and its value is myValue
params="myParam = myValue" 

// myParamA exists and its value is myValueA. // myParamB exists and its value is not myValueB
params = {"myParamA = myValueA"，"myParamB ！= myValueB" }

// myParamA exists
params = "myParamA" 

// myParamA exists and myParamB does not exits
params = {"myParamA"，"!myParamB" } 
{% endhighlight %}

### Example

{% highlight java %}
@Controller
@RequestMapping("/users") 
public class TestController {
	
	// Handler all /users GET request
    @RequestMapping(method = RequestMethod.GET) 
    public void functionA() {
    	// ToDo
    }

    // Handler all /users/new POST request
    @RequestMapping(value="/new", method = RequestMethod.POST)
    public RequestMapping functionC() {
    	// ToDo
    }

}
{% endhighlight %}

### Ant-style path patterns to indicate map url.

* `/user/*/login`  matches /user/aaa/login
* `/user/**/login` matches /user/login or /user/aaa/login or /user/aaa/bbb/login
* `/user/login??`  matches /user/loginAA or /user/loginBB
* `/user/{userId}` matches /user/123 or /user/342  (using `@PathVariable` to indicate userID)

## @PathVariable

**It can be used on a method argument to bind it to the value of a URI template variable**. The argument can be of any simple type such as int, long, Date, etc. Spring automatically converts to the appropriate type or throws a `TypeMismatchException` if it fails to do.

>If we do not specify the url placeholder name like `@PathVariable('name')`, we must keep parameter name the same as url placeholder.

{% highlight java %}
@Controller
@RequestMapping("/users") 
public class TestController {

    // Handler all /users/{id} GET request
    @RequestMapping(value="/{id}", method = RequestMethod.GET)
    public void functionA(@PathVariable int id) {
 		// ToDo
    }

    // Or if you want to another parameter name
    //@RequestMapping(value="/{id}", method = RequestMethod.GET)
    //public void functionB(@PathVariable("id") int another name) {
 	//	// ToDo
    //}
}
{% endhighlight %}

A more complex example:

{% highlight java %}
@Controller
@RequestMapping("/users/{userId}")
public class TestController {

  	@RequestMapping("/book/{bookId}")
  	public void test(@PathVariable String userId, @PathVariable String bookId) {
		// ToDo
  	}

}
{% endhighlight %}

## @RequestParam 

It is used to **bind request parameters to a method parameter in the controller**. Not mix with `@PathVariable` which is used to obtain some placeholder from the uri only.

As usual, we do it like this `request.getParameter("name")`, now with annotation:

{% highlight java %}
@RequestMapping(value="/user/{userId}/books", method = RequestMethod.GET)
public void test(
	@PathVariable("userId") int user,
    @RequestParam(value = "date", required = false) Date dateOrNull) {
  	
  	//ToDo
}
{% endhighlight %}

It has three properties:

1. `value` is the key to get value from request
2. `required` is to indicate whether request must have this parameter. By default is true.
3. `defaultValue` is to set default value when parameter in request does not exist.

>Same as `@PathVariable('name')`. If we do not specify `value`. We must need to keep method parameter name the same as key.


## @CookieValue

It's same as `@RequestParam` but bind cookie values to a method parameter. It also has three properties `value`, `required` and `defaultValue` which are also the same 

{% highlight java %}
@RequestMapping(value="/user", method = RequestMethod.GET)
public void test(@CookieValue("foo") String valueFromCookie) {
  	//ToDo
}
{% endhighlight %}

## Ref

[极客学院-常用注解类](http://jiuye.jikexueyuan.com/play?id=2239&class_id=36)
[](http://stackoverflow.com/questions/13715811/requestparam-vs-pathvariable)