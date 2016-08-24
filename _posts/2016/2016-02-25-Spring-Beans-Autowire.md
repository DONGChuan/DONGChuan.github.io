---
layout: post
title: Spring Beans Autowire
category: Spring
tags: [spring]
---

This is quick note after learning Spring autowire.

## Autowire

Instead of using `<constructor-arg>` and `<property>` elements in XML configuration file to declare relationships between beans. We could using **autowire** which **helps cut down on the amount of XML configuration** for a big Spring based application. But for many large applications, it is also discouraged to use autowiring because **it removes the transparency and the structure from collaborating classes**.

There are mainly four types:

* byName
* byType
* construtor
* autodetect

### byName

**Autowiring by property name**. Spring container looks at the properties of the beans on which autowire attribute is set to byName in the XML configuration file. It then tries to match and wire its properties with the beans defined by the same names in the configuration file.

{% highlight java %}
public class Test {  

    private TestBean testBean; 
    // Autowire by name 'testBean', so the bean id should be testBean. 
    // But in fact, it searches by setter name setTestBean() removing 'set' 
    // prefix and lowercase the first character, so 'testBean'
      
    // Getter and setter
}
{% endhighlight %}

Then in XML configuration, spring container finds a bean with id `testBean`.

{% highlight xml %}
<bean id="testBean" class="com.dong.TestBean"/>  
<bean id="test" class="com.dong.test" autowire="byName"/>
{% endhighlight %}

We could in the mean time **using `<propery ref='xxx' ...` to override the value from autowiring by name**.

### byType

**Autowiring by property datatype**. Spring container looks at the properties of the beans on which autowire attribute is set to byType in the XML configuration file. It then tries to match and wire a property if its type matches with exactly one of the beans name in configuration file. **If more than one such beans exists, a fatal exception is thrown.**

{% highlight java %}
public class Test {  

    private TestBean testBean; 
    // Autowire by type, so spring container searches type 'TestBean'. 
    // But in fact, it searches in setTestBean(TestBean testBean) to 
    // find 'TestBean' datatype.
      
    // Getter and setter
}
{% endhighlight %}

Then in XML configuration, spring container finds a bean with type `TestBean`.

{% highlight xml %}
<bean id="testBean" class="com.dong.TestBean"/>  
<bean id="test" class="com.dong.test" autowire="byType"/>  
{% endhighlight %}

We could in the mean time **using `<propery ref='xxx' ...` to override the value from autowiring by type**.

### construtor

**Similar as byType, but type applies to constructor arguments**. If there is not exactly one bean of the constructor argument type in the container, a fatal error is raised.

{% highlight java %}
public class Test {  

    private TestBean testBean; 

    public Test(TestBean testBean) {
        // do stuff
    } 
    // Autowire by constructor, so spring container searches type 'TestBean' in constructor

    // Getter and setter
}
{% endhighlight %}

Then in XML configuration, spring container finds a bean with id `testBean`.

{% highlight xml %}
<bean id="testBean" class="com.dong.TestBean"/>  
<bean id="test" class="com.dong.test" autowire="constructor"/>
{% endhighlight %}

Unlike byType and byName using `<propery ref='xxx' ...` to override, `<constructor-args ..>` can not mix with autowire

### autodetect

Spring automatically detects which type to use. **It firstly tries to autowire by constructor, if it does not work, Spring tries to autowire by byType.**

## autowire mixed with ref

**If `autowire` mixed with `ref`, `ref` will override `autowire`**

## default-autowire

We could use `default-autowire` on `<beans></beans>` instead of repeating autowire type setting on each bean:

{% highlight xml %}
<beans default-autowire="byType" .....> 
{% endhighlight %}

For the beans including in `<beans></beans>` , we could ovrride it by setting autowire type explicitly:

{% highlight xml %}
<beans default-autowire="byType" .....> 

	<bean id="testBean" class="com.dong.TestBean"/>  
	<bean id="test" class="com.dong.test" autowire="constructor"/>

	// Other beans

</beans>
{% endhighlight %}

## autowire-candidate

We could use `autowire-candidate` to **exclude a bean from autowiring**. By default, all the beans have `autowire-candidate` with true value implicitly. So we need to set it to false to exclude this bean.

{% highlight xml %}
<beans default-autowire="byType" .....> 

	<bean id="testBean" class="com.dong.TestBean"/>
	<!-- Set autowire-candidate to false, so it will never be considered for autowiring-->
	<bean id="testBadBean" class="com.dong.TestBean" autowire-candidate="false"/>

	<bean id="test" class="com.dong.test" autowire="constructor"/>

	// Other beans

</beans>
{% endhighlight %}

## Ref

[Tutorialspoint - Autowiring](http://www.tutorialspoint.com/spring/spring_beans_autowiring.htm)
[Spring Reference](http://docs.spring.io/spring/docs/current/spring-framework-reference/html/beans.html#beans-factory-autowire)
[Javacodegeeks - spring-autowire-example](https://examples.javacodegeeks.com/enterprise-java/spring/beans-spring/spring-autowire-example/)



















