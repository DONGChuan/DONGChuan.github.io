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

## Steps to use JDBC

### Add libs

To use jdbc, we must add related libs firstly in the buildpath/classpath. For example, with mysql, we must download **mysql-connector-java-*.jar**. According to different IDEs, we will also have different ways to add them. In IDEA, it needs to put jars in a lib folder on your root and right click, choose **add as Library**.

### Import packages

{% highlight java %}
import java.sql.*; // JDBC packages.  
import java.math.*; // To support BigDecimal and BigInteger only
{% endhighlight %}

Import the following two packages if we need to use extended functionality provided by the Oracle driver. Check more details [here](https://docs.oracle.com/cd/F49540_01/DOC/java.815/a64685/oraext.htm#1000888)

{% highlight java %}
import oracle.jdbc.driver.*;
import oracle.sql.*;
{% endhighlight %}

### Register JDBC driver

Prior to JDBC 4.0, we must manually load drivers with the method `Class.forName`

{% highlight java %}
Class.forName("com.mysql.jdbc.Driver"); // For mysql
Class.forName("oracle.jdbc.driver.OracleDriver"); // For oracle
{% endhighlight %}

For the other drivers, we could check [JDBC Driver List](http://www.sql-workbench.net/manual/jdbc-setup.html) for details.

According to [Oracle Java Tutorials](http://docs.oracle.com/javase/tutorial/jdbc/basics/connecting.html), any JDBC >= 4.0 drivers that are found in your classpath are automatically loaded.

### Open a connection

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

### Creat a statement 

There are three kinds of statements:

1. **Statement** is for general-purpose. Useful when you are using static SQL statements at runtime. Do not accept parameters.

2. **PreparedStatement** interface extends the Statement interface. It is used to execute a statement many times. It accepts input parameters at runtime.

3. **CallableStatement**  is used to access the database stored procedures. It accepts runtime input parameters.

#### Statement

{% highlight java %}
Statement stmt = conn.createStatement();
// ResultSet result = stmt.executeQuery("SELECT * FROM Employees");
{% endhighlight %}

Because `Statement` does not accept parameters, so we could only use it to execute some static queries.

#### PreparedStatement

{% highlight java %}
String SQL = "Update Employees SET age = ? WHERE name = ?";
PreparedStatement pstmt = conn.prepareStatement(SQL);

preparedStatement.setInt(1, 29);
preparedStatement.setString(2, "Jack");
{% endhighlight %}

**?** symbol is known as the **parameter marker**. We must supply values for every parameter before executing SQL statement.

The `setXXX()` methods bind values to the parameters, where XXX represents the Java data type of the value you wish to bind to the input parameter. Each parameter marker is referred by its ordinal position. The first marker represents position 1, then 2, and so forth. (Not from 0!)

So with the help of parameter marker, we could prepare a SQL statement which will be used many times by `PreparedStatement`. We only need to set the values before executing it.

#### CallableStatement

//Todo

### Execute a statement

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

### Extract datas

We use `ResultSet.getXXX()` to etract datas from result set by **column name**.

{% highlight java %}
while(rs.next()){
    String name  = rs.getString("name");
    int age = rs.getInt("age");

    //ToDo
}
{% endhighlight %}

### Close

We must clean up environment

{% highlight java %}
rs.close(); // Close firstly resultSet
stmt.close(); // Then we should close statement
conn.close(); // In the end, close connection
{% endhighlight %}

## Transaction

JDBC is in auto-commit mode by default which means every SQL statement is committed to the database upon its completion. For [Transaction](https://en.wikipedia.org/wiki/Transaction_processing) of JDBC, we need to set **false** of `setAutoCommit()` for a connection. So in this way, only when we invoke manually `commit()` of a connection, all the operations will be validated. If any exception happens, we need to `rollback()` which will cancel all the operations:

{% highlight java %}
try { 
    …
    conn.setAutoCommit(false);

    stmt = conn.createStatement(); 
    stmt.execute("....");
    stmt.execute("....");
    stmt.execute("....");

    conn.commit(); // Everthing is right! Validate it!
 } 
 catch(SQLException e) { 
    try { 
         conn.rollback(); // Roll back all the operations
    } catch (SQLException e1) {
         e1.printStackTrace();
    }
    e.printStackTrace(); 
 }
{% endhighlight %}

#### Using Savepoints

With a savepoint, we could rollback to use the rollback method to undo only the changes made after the savepoint. The `Connection` and `Statement`/`PreparedStatement` object has three methods about it:

1. `Connection` - `setSavepoint(String savepointName)`: defines a new savepoint. It returns a `Savepoint` object.
2. `Connection` - `rollback(Savepoint savepoint)`: rolls back to the specified savepoint.
3. `Statement`/`PreparedStatement` - `releaseSavepoint(Savepoint savepoint)`: releases a savepoint. Do not forget it!

{% highlight java %}
conn.setAutoCommit(false);
Statement stmt = conn.createStatement();
stmt.executeUpdate("....");
stmt.executeUpdate("....");

Savepoint savepoint = conn.setSavepoint(); // Set save point

stmt.executeUpdate("....");

// Rollback to the savepoint for some reasons
conn.rollback(savepoint);
. . .
conn.commit();

// Do not forget to release it!
stmt.releaseSavepoint(savepoint);
{% endhighlight %}

## Batch Processing

Batch Processing allows us to **group related SQL statements into a batch and submit them with one call to the database**. `Statement`, `PreparedStatement`, and `CallableStatement` have following methods to support it:

1. `addBatch()` is used to add individual statements to the batch.
2. `executeBatch()` is used to start the execution of all the statements grouped together. It returns an array of integers, and each element of the array represents the update count for the respective update statement.
3. `clearBatch()` removes all the statements you added with the addBatch() method. However, you cannot selectively choose which statement :(

{% highlight java %}
conn.setAutoCommit(false);

Statement stmt = conn.createStatement();
stmt.addBatch("..."); // Add in batch
stmt.addBatch("..."); // Add in batch
stmt.addBatch("..."); // Add in batch
...
stmt.executeBatch(); // Execute together
conn.commit();
{% endhighlight %}

Another example with `PreparedStatement`:

{% highlight java %}
PreparedStatement stmt = conn.prepareStatement(
    "INSERT INTO Employees VALUES(?, ?)");
Employees[] employees = ...;

for(int i = 0; i < employees.length; i++) {
     stmt.setInt(1, employees[i].getAge());
     stmt.setString(2, employees[i].getName());
     stmt.addBatch(); // Add in batch
}

stmt.executeBatch(); // Execute together
{% endhighlight %}

## Ref

- [Oracle JDBC driver](https://docs.oracle.com/cd/F49540_01/DOC/java.815/a64685/basic1.htm)
- [JDBC快速入门教程](http://www.yiibai.com/jdbc/jdbc_quick_guide.html)