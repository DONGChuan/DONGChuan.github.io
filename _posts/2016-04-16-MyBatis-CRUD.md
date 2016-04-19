---
layout: post
title: MyBatis config and CRUD
category: MyBatis
tags: [mybatis]
---

Quick note about MyBatis configuration and CRUD.

## Mybatis configuration

* `<environments>` contains the environment configuration for **transaction management** and **connection pooling**. 

* `<dataSource>` configures the source of JDBC Connection objects using the standard JDBC DataSource interface.

* `<mappers>` contains **a list of mappers** – the XML files and/or annotated Java interface classes that contain **SQL statements and mapping definitions**.

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE configuration
    PUBLIC "-//mybatis.org//DTD Config 3.0//EN"
    "http://mybatis.org/dtd/mybatis-3-config.dtd">

<configuration>

  	<environments default="development">
    	<environment id="development">
      		<transactionManager type="JDBC"></transactionManager>
      		<dataSource type="POOLED">
        		<property name="driver" value="com.mysql.jdbc.Driver"/>
        		<property name="url" value="jdbc:mysql://localhost:3306/dbname"/>
        		<property name="username" value="root"/>
        		<property name="password" value="123"/>
      		</dataSource>
    	</environment>
  	</environments>

  	<mappers>
  		<mapper class="com.dong.map.AnnotationMapper"/>
	    <mapper resource="com/dong/map/xmlMapper.xml"/>
  	</mappers>

</configuration>
{% endhighlight %}

## SqlSessionFactory

One SqlSessionFactory instance per database. 

{% highlight java %}
String resource = "path/to/mybatis-config.xml";
InputStream inputStream = Resources.getResourceAsStream(resource);
SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);

SqlSession session = sqlSessionFactory.openSession();

try {
  	...
  	session.commit();
} catch(Exception e) {
	e.printStackTrace();
	session.rollback(); 
} finally {
	session.close();
}
{% endhighlight %}

> If `<transactionManager>` is set as JDBC. We could call directly `commit()` and `rollback()` to control transaction.

## CRUD

### typeAliases

Before CRUD, better to know `<typeAliases>`. It sets a shorter name for a Java type to **reduce redundant typing of fully qualified classnames**.

{% highlight xml %}
<typeAliases>
	<typeAlias alias="User" type="com.dong.demo.User"/>
</typeAliases>
{% endhighlight %}

So in all the following example, we use directly short name instead of full qualified classname.

### select

We could do single row query or multiple row query:

* session.selectOne(statementID, selectParameter) to return one result
* session.selectList(statementID, selectParameter) to return a list of results

Some properties:

* parameterType - Type of parameter that will be passed into statement.
* resultType - return type of statement. In case of collections, it's the type that the collection contains. 
* resultMap - A named reference to an external resultMap. To solve complex mapping cases. **Can not use with resultType together**.
* For other properties, check [here](http://www.mybatis.org/mybatis-3/zh/sqlmap-xml.html#select).

#### Examples

{% highlight xml %}
<!-- #{id} type is int, and return type is User -->
<select id="findById" parameterType="int" resultType="User">
	select * from user where id=#{id}
</select>

<!-- return type User is the type that the collection contains -->
<select id="selectList" resultType="User">
	select * from user
</select>

<!-- HashMap -->
<!-- #{userName} and #(password) use key values in hashmap to set values -->
<select id="login" parameterType="hashmap" resultType="User">
	select * from user where userName=#{userName} and password=#{password}
</select>

<!-- Object as parameter type -->
<!-- #{userName} and #(password) use the same name as properties of User object -->
<select id="login" parameterType="User" resultType="User">
	select * from user where userName=#{userName} and password=#{password}
</select>

<!-- resultMap -->
<!-- A simple resultMap to tell which property in User object matches which column -->
<!-- in databse. It could solve column name mismatches -->
<resultMap id="userMap" type="User"> 
	<id property="id" column="id"/>
	<result property="userName" column="userName"/> 
	<result property="password" column="password"/> 
</resultMap>
<select id="selectUsers" resultMap="userMap"> 
	select id, userName, password from User
</select>
{% endhighlight %}

After including above xml file in mybatis configuration file. We could defined SQL statement from java code:

{% highlight java %}
// Select one
User user = session.selectOne("findById", 1); // 1 will be the value of #{id} in statement

// Select list
List<User> list = session.selectList("selectList");

// By hashmap
HashMap<String, String> hm = new HashMap();
hm.put("userName", "dong");
hm.put("password","12345");
User user = session.selectOne("login", hm);

// By object
User user = new User();
user.setUserName("dong");
user.setPassword("12345");
User result = session.selectOne("login2", user);

// By resultMap
List<User> listUsers = session.selectList("selectUsers");
{% endhighlight %}

### update

XML sql statement definition:

{% highlight xml %}
<update id="updateUser" parameterType="User">
	UPDATE user SET
	userName=#{userName},
	password=#{password}
	WHERE id = #{id}
</update>
{% endhighlight %}

Java code to call it: 

{% highlight java %}
User user = new User(); 
user.setUserName("dong");
user.setPassword("123456");
user.setId(2);

session.update("updateUser", user);
{% endhighlight %}

### insert

XML sql statement definition:

{% highlight xml %}
<insert id="insertUser" parameterType="User" statementType="PREPARED"
	keyProperty="id" useGeneratedKeys="true">
	insert into user
	(userName,password) values
	(#{userName},#{password})
</insert>
{% endhighlight %}

Java code to call it: 

{% highlight java %}
User user = new User(); 
user.setUserName("dong");
user.setPassword("123456");

session.insert("insertUser", user);
{% endhighlight %}

`keyProperty="id"` and `useGeneratedKeys="true"` are used to tell mybatis to use JDBC getGeneratedKeys to get ID generated inner DB and set it to property id.

### delete

XML sql statement definition:

{% highlight xml %}
<delete id="deleteAuthor" parameterType="int">
  	delete from User where id = #{id}
</delete>
{% endhighlight %}

Java code to call it:

{% highlight java %}
session.delete("deleteAuthor", 1);
{% endhighlight %}
	
### By annotation

To use annotation instead of xml definition. We need to define an **interface** to declare all CRUD operations:

{% highlight java %}
public interface AnnotationMapper {

	@Delete("delete from User where id=#{id}")
	public void deleteUser(Integer id);

}
{% endhighlight %}

Same as including mapper xml files, we need to include above class in configuration file:

{% highlight xml %}
<mappers>
  	<mapper class="com.dong.map.AnnotationMapper"/>
	...
</mappers>
{% endhighlight %}

Java code to call it:

{% highlight java %}
AnnotationMapper test = session.getMapper(AnnotationMapper.class);
test.deleteUser(1);
{% endhighlight %}

## Refs

* [Mybatis doc refs](http://www.mybatis.org/mybatis-3/index.html)
* [极客学院-MyBatis 基本操作](http://jiuye.jikexueyuan.com/play?id=880&class_id=36)