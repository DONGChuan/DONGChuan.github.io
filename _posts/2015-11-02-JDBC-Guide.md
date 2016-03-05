---
layout: post
title: JDBC Guide
category: jdbc
tags: [java, jdbc]
---

JDBC stands for **Java Database Connectivity**. It is a standard Java API for database-independent connectivity between the Java programming language and a wide range of databases.

It includes APIs for the tasks mentioned below:

* Making a connection to a database.
* Creating SQL statements.
* Executing SQL statements.
* Viewing & Modifying the resulting records.

## Add libs

To use jdbc, we must add related libs firstly in the buildpath/classpath. For example, with mysql, we must download **mysql-connector-java-*.jar**. According to different IDEs, we will also have different ways to add them. In IDEA, it needs to put jars in a lib folder on your root and right click, choose **add as Library**.

## Import packages

{% highlight java %}
import java.sql.*; // JDBC packages.  
import java.math.*; // To support BigDecimal and BigInteger only
{% endhighlight %}

Import the following two packages if we need to use extended functionality provided by the Oracle driver. Check more details [here](https://docs.oracle.com/cd/F49540_01/DOC/java.815/a64685/oraext.htm#1000888)

{% highlight java %}
import oracle.jdbc.driver.*;
import oracle.sql.*;
{% endhighlight %}

## Register JDBC driver

Prior to JDBC 4.0, we must manually load drivers with the method `Class.forName`

{% highlight java %}
Class.forName("com.mysql.jdbc.Driver"); // For mysql
Class.forName("oracle.jdbc.driver.OracleDriver"); // For oracle
{% endhighlight %}

For the other drivers, we could check [JDBC Driver List](http://www.sql-workbench.net/manual/jdbc-setup.html) for details.

According to [Oracle Java Tutorials](http://docs.oracle.com/javase/tutorial/jdbc/basics/connecting.html), any JDBC >= 4.0 drivers that are found in your classpath are automatically loaded.

## Open a connection

To open a connection, we must invoke `DriverManager.getConnection()` with following parameters:

1. URL (jdbc:sqlType://hostname:port/dataBaseName?Param=Value&Param=Value)
2. Username
3. Password

{% highlight java %}
Connection conn = DriverManager.getConnection("jdbc:mysql://host:port/databaseName", "username", "password");
{% endhighlight %}

#### MySQL URL example

{% highlight java %}
jdbc:mysql://localhost:3306/testDB?useUnicode=true&characterEncoding=utf-8
{% endhighlight %}

**useUnicode=true&characterEncoding=utf-8** here is very useful to avoid some character problems like Chinese even if you already set utf-8 when created tables.

#### Good Practice

* Keep all the DB configurations in a properties file

For example, now we have **DBConfig.properties**:

{% highlight java %}
driver=com.mysql.jdbc.Driver
url=jdbc:mysql://localhost:3306/testDB?useUnicode=true&characterEncoding=utf-8
user=root
password=abcdefg
{% endhighlight %}

Then load this file and get connection by a DBHelper class:

{% highlight java %}
public class DBHelper {
	
	private static String driver;
	private static String url;
	private static String user;
	private static String password;
	
	private static Connection connection;
	
	static {
		Properties properties = new Properties();
		try {
			InputStream input = DBHelper.class.getClassLoader()
					.getResourceAsStream("DBConfig.properties");
			properties.load(input);
		} catch (IOException e) {
			e.printStackTrace();
		}
		
		driver = properties.getProperty("driver");
		url = properties.getProperty("url");
		user = properties.getProperty("user");
		password = properties.getProperty("password");
	}
	
	public static Connection getInstance() {
		
		try {
			Class.forName(driver);
			connection = DriverManager.getConnection(url, user, password);
			return connection;
		} catch (Exception e) {
			e.printStackTrace();
			return null;
		}	

	}
}
{% endhighlight %}

## Creat a statement 

There are three kinds of statements:

1. **Statement** is for general-purpose. Useful when you are using static SQL statements at runtime. Do not accept parameters.

2. **PreparedStatement** interface extends the Statement interface. It is used to execute a statement many times. It accepts input parameters at runtime.

3. **CallableStatement**  is used to access the database stored procedures. It accepts runtime input parameters.

### Statement

{% highlight java %}
Statement stmt = conn.createStatement();
// ResultSet result = stmt.executeQuery("SELECT * FROM Employees");
{% endhighlight %}

Because `Statement` does not accept parameters, so we could only use it to execute some static queries.

### PreparedStatement

{% highlight java %}
String SQL = "Update Employees SET age = ? WHERE name = ?";
PreparedStatement pstmt = conn.prepareStatement(SQL);

preparedStatement.setInt(1, 29);
preparedStatement.setString(2, "Jack");
{% endhighlight %}

**?** symbol is known as the **parameter marker**. We must supply values for every parameter before executing SQL statement.

The setXXX() methods bind values to the parameters, where XXX represents the Java data type of the value you wish to bind to the input parameter. Each parameter marker is referred by its ordinal position. The first marker represents position 1, then 2, and so forth. (Not from 0!)

So with the help of parameter marker, we could prepare a SQL statement which will be used many times by `PreparedStatement`. We only need to set the values before execute it.

### CallableStatement

//Todo

## Execute a statement

* **boolean execute(String SQL)** returns true if a ResultSet object can be retrieved; otherwise, false. Use this method to execute SQL DDL statements which you only need to know whether excuted sucessfully or not.

* **int executeUpdate(String SQL)** returns the number of rows affected. Use this method when we expect to get number of rows affected - for example, an INSERT, UPDATE, or DELETE statement.

* **ResultSet executeQuery(String SQL)** returns a ResultSet object. Use this method when you expect to get a result set, as you would with a SELECT statement.

> For prepared statement, do not need to string sql as input.

{% highlight java %}
// Statement
Statement stmt = conn.createStatement();
String sql = "SELECT id, first, last, age FROM Employees";
ResultSet rs = stmt.executeQuery(sql);

// PreparedStatement
String SQL = "Update Employees SET age = ? WHERE name = ?";
PreparedStatement pstmt = conn.prepareStatement(SQL);

preparedStatement.setInt(1, 29);
preparedStatement.setString(2, "Jack");
int i = preparedStatement.executeUpdate();
{% endhighlight %}

## Extract data

We use `ResultSet.getXXX()`` to etract data from result set by **column name**.

{% highlight java %}
while(rs.next()){
    String name  = rs.getString("name");
    int age = rs.getInt("age");

    //ToDo
}
{% endhighlight %}

## Close

We must clean up environment

{% highlight java %}
rs.close(); // Close firstly resultSet
stmt.close(); // Then we should close statement
conn.close(); // In the end, close connection
{% endhighlight %}

## Ref

- [Oracle JDBC driver](https://docs.oracle.com/cd/F49540_01/DOC/java.815/a64685/basic1.htm)
- [JDBC快速入门教程](http://www.yiibai.com/jdbc/jdbc_quick_guide.html)