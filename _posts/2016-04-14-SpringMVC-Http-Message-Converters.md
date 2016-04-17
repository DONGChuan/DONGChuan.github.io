---
layout: post
title: SpringMVC Http Message Converters
category: SpringMVC
tags: [spring, springmvc]
---

Quick note about spring mvc http message converter. Especially thanks to this [post](http://www.baeldung.com/spring-httpmessageconverter-rest) by Eugen Paraschiv.

## Http Message Converters

An example:

1. Client sends a GET request to /foos with two headers `Accept: application/json` and `Content-type: application/xml`. To tell server that the request body is in xml and we want the server to return json.

2. Spring controller is hit. With `@RequestBody` annotation and `Content-type` of client, the request body will be converted from xml to specified java entity as argument of method by xml converter.

3. When spring controller returns a response. With `@ResponseBody` annotation and `Accept` of client, the return value/object will be converted from specified java entity to json by json converter.

### Converters Type

By default, the following HttpMessageConverters instances are pre-enabled:

* StringHttpMessageConverter – converts Strings
* MappingJackson2HttpMessageConverter – converts to/from JSON
* Jaxb2RootElementHttpMessageConverter – converts to/from XML
* For the other converters - [Message Converters](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/remoting.html#rest-message-conversion)

## Set Up

We must declare explicitly support for annotation-driven MVC controllers

{% highlight java %}
<mvc:annotation-driven/>
{% endhighlight %}

We could also use [`@EnableWebMvc`](http://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/web/servlet/config/annotation/EnableWebMvc.html) annotation to do the same thing.

## @RequestBody

`@RequestBody` indicates that the **body of the HTTP Request is deserialized to that particular Java entity as method argument**. 

{% highlight java %}
@RequestMapping(path = "/user)
public void test(@RequestBody User user) {
    ...
}
{% endhighlight %}

**`Content-Type` header specified by the Client will be used to determine the appropriate converter for it**. So `Content-Type: application/xml` here to choose a xml converter which will convert xml content in request body to User object in method argument.

## @ResponseBody

`@ResponseBody` indicates that the return value of the method is serialized directly to **the body of the HTTP Response**. 

{% highlight java %}
@RequestMapping(value = "/getJson")
public @ResponseBody User test(){

	User user = new User();
	user.setPassword("1234");
	user.setUserName("DONG");

	return user;
}
{% endhighlight %}

**`Accept` header specified by the Client will be used to choose the appropriate Http Converter to marshall the entity**. So `Accept: application/json` here to choose a json converter which will convert user object to json fromat  in the http response body.

{% highlight json %}
{
    "password": 1234,
    "username": "DONG",
}
{% endhighlight %}

## Refs

* [HttpMessageConverter in Spring](http://www.baeldung.com/spring-httpmessageconverter-rest)
* [极客学院-常用注解类](http://jiuye.jikexueyuan.com/play?id=2239&class_id=36)
* [Annotation Type RequestMapping](https://docs.spring.io/spring/docs/current/javadoc-api/org/springframework/web/bind/annotation/RequestMapping.html)