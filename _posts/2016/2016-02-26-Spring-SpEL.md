---
layout: post
title: Spring SpEL
category: Spring
tags: [spring]
---

Quick note after learning Spring SpEL. [Code Demo](https://github.com/DONGChuan/SpEL-Demo)

Spring Expression Language (SpEL), like OGNL, is a powerful expression language that supports querying and manipulating an object graph at runtime.

To use SpEL, we need **org.springframework.spring-expression** jar.

## Hello World

{% highlight java %}
ExpressionParser parser = new SpelExpressionParser();
Expression expression = parser.parseExpression("('Hello' + 'World').concat(#end)");

// Create a context
EvaluationContext context = new StandardEvaluationContext();
context.setVariable("end", "!"); // Set variable end with value !
System.out.println(expression.getValue(context)); // HelloWorld!

// Create another context
EvaluationContext anotherContext = new StandardEvaluationContext();
context.setVariable("end", "yoyo"); // // Set variable end with value yoyo
System.out.println(expression.getValue(anotherContext)); // HelloWorldyoyo
{% endhighlight %}

The interface `EvaluationContext` is used as a context for the expression. The out-of-the-box implementation, StandardEvaluationContext, uses reflection to manipulate the object.

## Literal expression

The types of literal expressions supported are strings, dates, numeric values (int, real, and hex), boolean and null. **Strings are delimited by single quotes**. To put a single quote itself in a string use two single quote characters.

We firstly define a class to test:

{% highlight java %}
public class SpELLiteral {

	private int count;
	private String message;
	private float frequency;
	private float capacity;
	private String name1;
	private String name2;
	private boolean enabled;

	// Setters and getters
}
{% endhighlight %}

In conf-spel.xml, we use `#{expression}` to indicate a SpEL. :

{% highlight xml %}
<bean id="spELLiteral" class="com.dong.demo.SpELLiteral">
	<property name="count" value="#{5}"/>
	<property name="message" value="The value is #{5}"/>
	<property name="frequency" value="#{89.7}"/>
	<property name="capacity" value="#{1e4}"/>
	<property name="name1" value="#{'Chuck'}"/>
	<property name="name2" value='#{"Chuck"}'/>
	<property name="enabled" value="#{false}"/>
</bean>
{% endhighlight %}

To test:

{% highlight java %}
ApplicationContext ctx = new ClassPathXmlApplicationContext("conf-spel.xml");

SpELLiteral spelLiteral = ctx.getBean("spELLiteral", SpELLiteral.class);

System.out.println(spelLiteral.getCount());     // 5
System.out.println(spelLiteral.getMessage());   // The value is 5
System.out.println(spelLiteral.getFrequency()); // 89.7
System.out.println(spelLiteral.getCapacity());  // 10000.0
System.out.println(spelLiteral.getName1());     // Chuck
System.out.println(spelLiteral.getName2());     // Chuck
System.out.println(spelLiteral.isEnabled());    // false
{% endhighlight %}

## Variable

Like above hello world example. We could use variable by `setVariable()` function of `EvaluationContext` which means context for expression. **Variables can be referenced in the expression using the syntax `#variableName`**.

{% highlight java %}
ExpressionParser parser = new SpelExpressionParser();
Expression expression = parser.parseExpression("Name = #newName");
EvaluationContext context = new StandardEvaluationContext();
context.setVariable("newName", "dongchuan"); // Set variable newName with value dongchuan
System.out.println(expression.getValue(context)); // Name = dongchuan
{% endhighlight %}

## Xml-based Expression

**SpEL could reference the value of another bean by `#{beanID}` or `#{@beanID}`##. And as it's an expression, we could add some other operations in it:

{% highlight xml %}
<!-- Creat a string with value ' World!'-->
<bean id="world" class="java.lang.String" >
	<constructor-arg value="#{' World!'}" />
</bean>

<bean id="hello1" class="java.lang.String" >
	<constructor-arg value="#{'Hello'}#{world}" />
</bean>
<bean id="hello2" class="java.lang.String" >
	<constructor-arg value="#{'Hello' + world}" />
	<!-- But the following nested expression not supported -->
	<!-- constructor-arg value="#{'Hello'#{world}}" /-->
</bean>
<bean id="hello3" class="java.lang.String" >
	<constructor-arg value="#{'Hello' + @world}" />
</bean>
{% endhighlight %}

## Annotation-based Expression

The `@Value` annotation can be placed on fields, methods and method/constructor parameters to specify a default value. So we could use SpEL to reference other beans to set default value.

{% highlight java %}
public class AnnoExpression {

	@Value("#{'Hello ' + world}")
	private String value;

	// We could also put @Value on setXxx() method. They have the same result
	// Setters and Getters

}
{% endhighlight %}

Configuration file conf-spel.xml:

{% highlight xml %}
<!-- To support annotation -->
<context:annotation-config/>

<!-- Creat a string with value ' World!'-->
<bean id="world" class="java.lang.String" >
	<constructor-arg value="#{' World!'}" />
</bean>

<!-- Value set by annotation -->
<bean id="helloBean1" class="com.dong.demo.AnnoExpression"/>
<!-- Override annotation value -->
<bean id="helloBean2" class="com.dong.demo.AnnoExpression">
	<property name="value" value="helloBean2"/>
</bean>
{% endhighlight %}

To test:

{% highlight java %}
ApplicationContext ctx = new ClassPathXmlApplicationContext("conf-spel.xml");

AnnoExpression helloBean1 = ctx.getBean("helloBean1", AnnoExpression.class);
AnnoExpression helloBean2 = ctx.getBean("helloBean2", AnnoExpression.class);

System.out.println("helloBean1 : " + helloBean1.getValue()); // helloBean1 : Hello World!
System.out.println("helloBean2 : " + helloBean2.getValue()); // helloBean2 : helloBean2
{% endhighlight %}

## Function or constant in expressions

To invoke static function/constant in expression, we must know its class firstly by `T(packagePath)`. Then call its function `T(packagePath).Staticfunction()`. In fact, **the `T` operator is used to tell SpEL to deal with String inside `T{}` as class type**.

> T() references to types within java.lang do not need to be fully qualified, but all other type references must be.

**To invoke class function, it's the same as java language.** If we already have an instance in SpEL, for example `#{'HelloWorld'}`, here as a `String` instance ,we could call all the string class function directly like this `#{'HelloWorld'.function()}`

{% highlight xml %}
<bean id="spELClass" class="com.dong.demo.SpELClass">
	<!-- Invoke class function -->
    <property name="classFunction" value="#{'HelloWorld'.substring(2, 5)}"/>
	<!-- Invoke constant -->
    <property name="pi" value="#{T(java.lang.Math).PI}"/>
    <!-- Invoke static function -->
    <property name="randomNumber" value="#{T(java.lang.Math).random()}"/>
</bean>
{% endhighlight %}

## Constructor in expressions

We could use `new` key word directly in SpEL, if class is not in `java.lang`, we need to specify the full package name:

{% highlight xml %}
<bean id="spELClass" class="com.dong.demo.SpELConstructor">
    <property name="testA" value="#{new String('HelloWorld').substring(2, 5)}"/>
    <property name="testB" value="#{new com.dong.demo.test('HelloWorld').doSomething()}"/>
</bean>
{% endhighlight %}

## Mathematical operators

* Addition operator can be used on both numbers and strings.
* Subtraction, multiplication and division can be used only on numbers.
* Other mathematical operators supported are modulus (%) and exponential power (^).

{% highlight xml %}
<bean id="counter" class="com.dong.demo.SpELCounter">
	<property name="total" value="#{100}"/>
	<property name="count" value="#{10}"/>
</bean>

<bean id="spELMath" class="com.dong.demo.SpELMath">
	<property name="addition" value="#{counter.total + 42}"/>
	<property name="multiplication" value="#{2 * T(java.lang.Math).PI * counter.total}"/>
	<property name="division" value="#{counter.total / counter.count}"/>
	<property name="complementation" value="#{counter.total % counter.count}"/>
	<property name="involution" value="#{T(java.lang.Math).PI * counter.total ^ 2}"/>
</bean>
{% endhighlight %}

## Relational operators

There are two formats **symbolic** and **textual**. Textual format is suggested because it could avoid problems where the symbols used have special meaning for the document type in which the expression is embedded (eg. in XML).

* lt (<) 
* gt (>)
* le (<=)
* ge (>=) 
* eq (==)
* ne (!=)

## Logic operators

* or
* and
* not (!)

{% highlight java %}
String expression = "isMember('Tom') and !isMember('Jean')";
{% endhighlight %}

## Elvis Operator

The Elvis operator is a shortening of the ternary operator syntax. It could avoid repeating a variable twice.

{% highlight java %}
name != null ? name : "someValue"
{% endhighlight %}

Same as:

{% highlight java %}
name ? : "someValue"
{% endhighlight %}

## Safe Navigation operator

Sometimes, we need to verify that an object is not null before accessing methods or properties of the object. The safe navigation operator will simply **return null instead of throwing an exception**.

{% highlight java %}
parser.parseExpression("#person?.name").getValue(); // Return null
parser.parseExpression("#person.name").getValue(); // Throw NullPointerException
{% endhighlight %}

## Collection Selection

`collection.?[condition_expression]` will **filter collection and return a new collection containing a subset of the original elements match conditions**.

The following example selects from list `cities` all the cities which has more than 100000 populations:

{% highlight xml %}
<!-- Create a list of beans -->
<util:list id="cities">
    <bean class="com.dong.demo.SpELCity" p:name="Chicago" p:state="IL" p:population="2853114"/>
    <bean class="com.dong.demo.SpELCity" p:name="Atlanta" p:state="GA" p:population="537958"/>
    <bean class="com.dong.demo.SpELCity" p:name="Dallas" p:state="TX" p:population="1279910"/>
    <bean class="com.dong.demo.SpELCity" p:name="Houston" p:state="TX" p:population="2242193"/>
    <bean class="com.dong.demo.SpELCity" p:name="Odessa" p:state="TX" p:population="90943"/>
    <bean class="com.dong.demo.SpELCity" p:name="El Paso" p:state="TX" p:population="613190"/>
    <bean class="com.dong.demo.SpELCity" p:name="Jal" p:state="NM" p:population="1996"/>
    <bean class="com.dong.demo.SpELCity" p:name="Las Cruces" p:state="NM" p:population="91865">
</util:list>

<bean id="spELCityList" class="com.dong.demo.SpELCityList">
	<property name="bigCities" value="#{cities.?[population gt 100000]}"/>
</bean>
{% endhighlight %}

## Collection Projection

`collection.!condition_expression]` will **create a new collection containing a subset which is the value of condition_expression**.

The following example creates a new collection. Each of its item is a string combination of `name` and `state` from list `cities`:

{% highlight xml %}
<!-- Same list as above example -->

<bean id="spELCityList" class="com.dong.demo.SpELCityList">
	<property name="cityNames2" value="#{cities.![name + ', ' + state]}"/>
</bean>
{% endhighlight %}

## Expression templating

Expression templates allow a mixing of literal text with one or more evaluation blocks. Each evaluation block is delimited with `#{ }`.

{% highlight java %}
// Persion is a class has two properties name and height
Person p1 = new Persion("DONG", 180);
Person p1 = new Persion("Chuan", 190);

Expression expr = parser.parseExpression('my name is #{name}, my height is #{height}', new TemplateParserContext());

System.out.println(expr.getValue(p1));
System.out.println(expr.getValue(p2));
{% endhighlight %}

## Ref

* [SpEL reference](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/expressions.html)
* [Spring 表达式语言](http://www.jikexueyuan.com/course/1670.html)