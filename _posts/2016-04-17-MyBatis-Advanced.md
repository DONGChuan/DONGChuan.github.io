---
layout: post
title: MyBatis association collection and discriminator
category: MyBatis
tags: [mybatis]
---

Quick note about MyBatis association, collection and discriminator.

## association

`<association>` deals with a "has-one" type relationship. For example, in our example, an Author has an User account with username and password:

{% highlight java %}
public class User {

	private int id;
	private String userName;
	private String password;

	// Getters and Setters
}

public class Author {

	private Integer id;
	private String realName;
	private String IDCard;
	private User user; // In DB, author table has a foreign key userID refering id in user table
	
	// Getters and Setters
}
{% endhighlight %}

And in xml map file, we need to define result Map of `Author`:

{% highlight xml %}
<resultMap id="AuthorMap" type="Author">
	<!-- author.id is tableName.id which is used to be distinguished from user.id -->
	<id property="id" column="author.id"/>
	<result property="realName" column="realName" />
	<result property="IDCard" column="IDCard" />
	<association property="user" column="userID" javaType="User">
		<id property="id" column="user.id"/>
		<result property="userName" column="userName" />
		<result property="password" column="password" />
	</association>
</resultMap>
<select id="selectAuthorJoin" resultMap="AuthorMap">
	select * from author inner join user on user.id = author.userID
</select>
{% endhighlight %}

We could also extract User information as another individual resultMap which could be re-used:

{% highlight xml %}
<resultMap id="AuthorMap" type="Author">
	...
	<association property="user" column="userID" javaType="User" resultMap="userMap"/>
</resultMap>
<resultMap id="userMap" type="User">
	<id property="id" column="id"/>
	<result property="userName" column="userName" />
	<result property="password" column="password" />
</resultMap>
{% endhighlight %}

To query by java:

{% highlight java %}
List<User> userList = session.selectList("selectAuthorJoin");
{% endhighlight %}

### Constructor

If we do not care about user id or some other property. We could use `<constructor>` to limit what we want based on constructors of object.

{% highlight java %}
public User() {}

public User(String userName, String password) {
	this.userName = userName;
	this.password = password;
}
{% endhighlight %}

{% highlight xml %}
<resultMap id="AuthorMapByConstructor" type="Author">
	<id property="id" column="author.id" />
	<result property="realName" column="realName" />
	<result property="IDCard" column="IDCard" />
	<association property="user" column="userID" javaType="User">
		<constructor>
			<arg column="userName" javaType="String" />
			<arg column="password" javaType="String" />
		</constructor>
	</association>
</resultMap>
<select id="selectAuthorJoin" resultMap="AuthorMapByConstructor">
	select * from author inner join user on user.id = author.userID
</select>
{% endhighlight %}

### Subquery

**Subquery/Inner query/Nested query is a query within another SQL query and embedded within the WHERE clause**.

{% highlight sql %}
select * from author where userID in (select id from user)
{% endhighlight %}

So there are in fact two statements here. Let's define each select statement and resultMap:

{% highlight xml %}
<resultMap id="AuthorSubMap" type="Author">
	<id property="id" column="author.id" />
	<result property="realName" column="realName" />
	<result property="IDCard" column="IDCard" />
	<association property="user" column="userID" javaType="User" select="findById"/>
</resultMap>
<select id="findById" parameterType="int" resultType="User">
	select * from user where id=#{id}
</select>
<select id="selectAuthorSub" resultMap="AuthorSubMap">
	select * from author 
</select>
{% endhighlight %}

In the above settings, `<association>` will pass `userID` as parameter to `findById`.

#### N+1 problem

But think about we have 10 authors, so here findById will be called 10 times! So we need to call 10 + 1 statements. It's called "N+1" problem of subquery. Many people think it's not as good as join query.

#### Solution

The solution is lazy load. **Statement will be not queried until the point at which it is needed**.

Let's firstly find differences between subquery and join query.

* Join query: Query one time. But it gets all the properties of two table, so it consumes resources.
* Subquery: Query N+1 times. It depends on what we want in the final result. With lazy loading, we may not need to make N times queries if not necessary.

To set lazy loading in configuration file, **this setting must be in front of others**:

{% highlight xml %}
<settings>
	<setting name="lazyLoadingEnabled" value="true"/>
	<setting name="aggressiveLazyLoading" value="false"/>
</settings>
{% endhighlight %}

To test:

{% highlight java %}
List<Author> authorList = session.selectList("selectAuthorSub");
for(Author author:authorList) {

	System.out.println(auther.getRealName());
	System.out.println("Lazyloading");
	// findById query will not be called until getUser() is invoked. It's lazy loading here.
	// If we never call getUser(), so findById will also never be called
	System.out.println(auther.getUser().getUserName());
	
}
{% endhighlight %}

So here with lazy loading, if we never need to call `getUser()`, it only queries one time which is efficient!

## collection

`<collection>` element works almost identically to `<association>`. But it is used to map a set of nested results like List.

In the following example, each User could have a list of visitors:

{% highlight java %}
public class User {

	private int id;
	private String userName;
	private String password;
	private List<Visitor> visitorList;

	// Getters and Setters
}

public class Visitor {

    private Integer visitID;
    private Date visitDate;
    private String visitIP;
    private User user; 

    // Getters and Setters
}
{% endhighlight %}

Then in xml map file, we use `<collection>` to indicate that list of visits.

{% highlight xml %}
<resultMap id="visitMap" type="User">
	<id property="id" column="id" />
	<result property="userName" column="userName" />
	<!-- `ofType` indicates the containing type of ArrayList -->
	<collection property="visitorList" javaType="ArrayList" column="visitID" ofType="Visitor">
		<result property="visitID" column="visitID" />
		<result property="visitIP" column="visitIP" />
		<result property="visitDate" column="visitDate" />
	</collection>
</resultMap>

<select id="selectVisit" resultMap="visitMap">
	select * from user inner join visitor on user.id = visit.userID
</select>
{% endhighlight %}

To test:

{% highlight java %}
List<User> userList = session.selectList("selectVisit"); 

for(User user:userList) {

	System.out.println(user.getUserName());

	for(Visitor visitor:user.getVisitorList()) {

		System.out.println(visitor.getVisitDate() + visitor.getVisitIP());

	}	
}
{% endhighlight %}

## discriminator

A single database query might return result sets of many different data types. So here `<discriminator>` is used to **determine which data types or so-called resultMap to use according to a column value**. It is like `switch` in other programming languages.

The following resultMap will return different data types according to value of `vehicle_type`.

{% highlight xml %}
<resultMap id="vehicleResult" type="Vehicle">
  <id property="id" column="id" />
  ...
  <discriminator javaType="int" column="vehicle_type">
    <case value="1" resultType="carResult">
      <result property="doorCount" column="door_count" />
    </case>
    <case value="2" resultType="truckResult">
      <result property="boxSize" column="box_size" />
      <result property="extendedCab" column="extended_cab" />
    </case>
    <case value="3" resultType="suvResult">
      <result property="allWheelDrive" column="all_wheel_drive" />
    </case>
  </discriminator>
</resultMap>
{% endhighlight %}

## Refs

* [Mybatis doc refs](http://www.mybatis.org/mybatis-3/index.html)
* [极客学院-MyBatis 高级查询](http://jiuye.jikexueyuan.com/play?id=924&class_id=36)