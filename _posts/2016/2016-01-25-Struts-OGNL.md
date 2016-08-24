---
layout: post
title: Struts OGNL
category: Struts
tags: [struts]
---

OGNL stands for [Object Graph Navigation Language](http://commons.apache.org/proper/commons-ognl/).

It's an expression language for getting/setting properties of Java objects and other extra functions. It works as a binding between GUI elements or UI components to model objects.

This post is a summary after studying [Apache Struts 2 Documentation - ONGL](https://struts.apache.org/docs/generic-tag-reference.html).

## Import tag lib

Before using ONGL, we need to import it in JSP page:

{% highlight java %}
<%@ taglib prefix="s" uri="/struts-tags" %>
{% endhighlight %}

## Control Tags

* if/elseif/else
* iterator
* append
* merge
* generator
* subset
* sort

### if/elseif/else

`if` and `elseif` must have `test` attribute in which should be a boolean expression.

{% highlight JSP %}
// Set a parameter called 'age' with value 30
<s:set name="age" value="30"/>
<s:if test="#age>60">    
	old  
</s:if>    
<s:elseif test="#age>35">    
    adult   
</s:elseif>    
<s:else>    
    young  
</s:else>
{% endhighlight %}

### iterator

Tag to **iterate a collection** (List, set, array or map). It has three attributes:

| Name | Required | Default | Description | 
|---|---|---|---|
| begin  | X | 0 | Index to start iteration |
| end    | X | size of collection | Index to end iteration |
| **status** | X |   | Instance of IteratorStatus which will be pushed into stack upon each iteration |
| step   | X | 1 | Iteration index will be increased by this value on each iteration |
| **value** | X |   | Collection to iterate |
| var    | X |   | Name used to reference the value pushed into the Value Stack |

Instance of IteratorStatus also has following functions:

if `status="test"`,

* `#test.count` returns number of element already iterated. (equals to `int getCount()`)
* `#test.index` returns index of current element. (equals to `int getIndex()`)
* `#test.even` returns wether current element is even. (equals to `boolean isEven()`)
* `#test.odd` returns wether current element is odd. (equals to `boolean isOdd()`)
* `#test.first` returns wether current element is the first one. (equals to `boolean isFirst()`)
* `#test.last` returns  wether current element is the last one. (equals to `boolean isLast()`)

If now we have a list called employeeList which is `List<Employee>`. Employee has two attributes `name` and `age` with **getter/setter**:

{% highlight JSP %}
<table>
	<s:iterator value="employeeList" status="list">
		<tr>
			<td><s:property value="#list.index" /></td>
			<td><s:property value="name" /></td>
			<td><s:property value="age" /></td>
		</tr>   
	</s:iterator>  
</table>
{% endhighlight %}

If it's **List\<String\>**, use `s:property` without `value` to present a string element in the list:

{% highlight JSP %}
<table>
	<s:iterator value="numberList" status="list2">
		<tr>
			<td><s:property value="#list2.index" /></td>
			<td><s:property/></td>
		</tr>   
	</s:iterator>  
</table>
{% endhighlight %}

If it's **Map**:

{% highlight JSP %}
<table>
	<s:iterator value="keyValueMap" status="map">
		<tr>
			<td><s:property value="#map.index" /></td>
			<td><s:property value="key" /></td>
			<td><s:property value="value" /></td>   
		</tr>   
	</s:iterator>  
</table>
{% endhighlight %}

### append

It **appends several collections to form a new collection**.

The new collection has the following order (different from tag `merge):

1. First Entry of the First Iterator
2. Second Entry of the First Iterator
3. Third Entry of the First Iterator
4. First Entry of the Second Iterator
5. Second Entry of the Second Iterator
6. Third Entry of the Second Iterator

The following example shows three lists of type `List<String>` to be appended together. These three lists are passed by some Action.

{% highlight JSP %}
<s:append var="newList">
     <s:param value="list1" />
     <s:param value="list2" />
     <s:param value="list3" />
</s:append>
<s:iterator value="#newList">
     <s:property />
</s:iterator>
{% endhighlight %}

### merge

The same as `append` but in different order:

1. First Entry of the First Iterator
2. First Entry of the Second Iterator
3. Second Entry of the First Iterator
4. Second Entry of the Second Iterator
5. Third Entry of the First Iterator
6. Third Entry of the Second Iterator

### generator

**Generate an iterator based on give string**. If `var` not set, it will only exist in Value Stack which means you can not use it outside the tag. (Not in page context)

| Name | Required | Default | Description | 
|---|---|---|---|
| **separator** | O |  | The separator to be used in separating the val into entries of the iterator |
| **val** | O |  | The source to be parsed into an iterator |
| var | X |   | The name to store the resultant iterator into page context |
| count | X |  | Max number of entries to be in the iterator |
| converter | X |   | Convert the String entry parsed from val into an object |

A string separated by ",":

{% highlight JSP %}
<s:generator val="%{'aaa,bbb,ccc,ddd,eee'}" count="3" separator=",">
	<s:iterator>
    	<s:property />
	</s:iterator>
</s:generator>
{% endhighlight %}

Generate an iterator with comparator attribute:

{% highlight JSP %}
<s:generator val="%{'aaa,bbb,ccc,ddd,eee'}" separator="," converter="myConverter">
	<s:iterator>
     return<s:property /><br/>
	</s:iterator>
</s:generator>
{% endhighlight %} 

{% highlight java %}
public class GeneratorTagAction extends ActionSupport {
    ...
    // getMyConverter function name -> converter="myConverter"
    public Converter getMyConverter() {
        return new Converter() {
            public Object convert(String value) throws Exception {
                return "converter-"+value;
            }
        };
    }
    ...
}
{% endhighlight %}

This will generate an iterator with each entries decided by the converter supplied. With
this converter, it simply add "converter-" to each entries.

### subset

**Outputs a subset of an iterator.**

| Name | Required | Default | Description | 
|---|---|---|---|
| count | X |  | Indicate the number of entries to be in the resulting subset iterator |
| decider | X |  | Extension to plug-in a decider to determine if that particular entry is to be included in the resulting subset iterator |
| var | X |   | The name to store the resultant iterator into page context |
| source | X |  | Source to do subset |
| start | X | 0 | Indicate the startig index |

Simply subset:

{% highlight JSP %}
<!-- myList is a List<String> given by action -->
<s:subset source="myList">
    <s:iterator>
		<s:property />
    </s:iterator>
</s:subset>
{% endhighlight %}

With decider:

{% highlight java %}
public class MySubsetTagAction extends ActionSupport {
	
	...
    public Decider getMyDecider() {
    	return new Decider() {
        	public boolean decide(Object element) throws Exception {
            	int i = ((Integer)element).intValue();
            	return (((i % 2) == 0)?true:false);
         	}
    	};
    }
}
{% endhighlight %}

{% highlight JSP %}
<!-- myList is a List<String> given by action -->
<s:subset source="myList" decider="myDecider">
    <s:iterator>
 		<s:property />
    </s:iterator>
</s:subset>
{% endhighlight %}

### Sort

It **sorts a List using a Comparator**

| Name | Required | Default | Description | 
|---|---|---|---|
| comparator | O |  | The comparator to use (java.util.Comparator) |
| var | X |   | The name to store the resultant iterator into page context |
| source | X |  | Source to sort |

#### Example

Sort by string length:

{% highlight JSP %}
<s:set name="test" value="{'aefi','abc','world!','kkkkk'}" />
<s:bean id="sort" name="action.SortComparator"></s:bean>
<s:sort source="test" comparator="sort">
    <s:iterator>
        <s:property />
    </s:iterator>
</s:sort>
{% endhighlight %}

{% highlight java %}
public class SortComparator implements Comparator<Object> {
    public int compare(Object arg0, Object arg1) {
    	// Compare by length
        return arg0.toString().length() - arg1.toString().length();
    }
}
{% endhighlight %}

## Data Tags

### action

It could call actions directly from a JSP page by specifying the action name and an optional namespace. 

>Any result processor defined for this action in struts.xml will be ignored, unless the executeResult parameter is specified.

| Name | Required | Default | Description | 
|---|---|---|---|
| **executeResult** | x | false | Whether the result of this action (probably a view) should be executed/rendered |
| var | X |   | Name used to reference the value pushed into the Value Stack |
| name | O |  | Name of the action to be executed (without the extension suffix eg. .action) |
| namespace | X | Namespace from where tag is used | Namespace of the action |
| ignoreContextParams | X | false | Whether the request parameters are to be passed to the action |
| rethrowException | X | false | Whether an exception should be rethrown, if the target action throws an exception |
 
#### Example

{% highlight java %}
public class ActionTagAction extends ActionSupport {
 
	public String execute() throws Exception {
     	return SUCCESS;
 	}
 
 	public String test() throws Exception {
    	ServletActionContext.getRequest().setAttribute("variable", "A variable");
     	return SUCCESS;
 	}
}
{% endhighlight %}

{% highlight xml %}
<action name="actionA" class="com.dong.test">
    <result name="success">test.jsp</result>
</action>
<action name="actionB" class="com.dong.test" method="test">
    <result name="success">test.jsp</result>
</action>
{% endhighlight %}

When we acess the test page with a request parameter - `localhost:8000/index?author=Dong`:

{% highlight JSP %}
<!-- success.jsp will be included in this page -->
<!-- And show "test - Dong"-->
<s:action name="actionA" executeResult="true" />

<!-- test.jsp will be included in this page-->
<!-- No request parameter is allowed, so could only show "test -"-->
<s:action name="actionB" executeResult="true" ignoreContextParams="true" />

<!-- test.jsp will NOT be included in this page-->
<!-- But put a String in request scope under an id "variable" which will be retrieved using property tag -->
<s:action name="actionB" executeResult="false" />
<s:property value="#attr.variable" /><!-- #attr is to access to PageContext if available , we use value="variable" directly -->
{% endhighlight %}

## Ref
- [Tag reference](https://struts.apache.org/docs/generic-tag-reference.html)