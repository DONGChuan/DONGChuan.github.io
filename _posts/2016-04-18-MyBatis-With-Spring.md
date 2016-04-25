---
layout: post
title: MyBatis with Spring
category: MyBatis
tags: [mybatis, spring]
---

Quick note about MyBatis with Spring. It's a summary from official site [mybatis-spring](http://www.mybatis.org/spring/). Code demo: [A simple SpingMVC + Mybatis Helloworld](https://github.com/DONGChuan/SpringMVC-Mybatis-Helloworld)

## Requirement

Additional jar [org.mybatis.mybatis-spring](http://mvnrepository.com/artifact/org.mybatis/mybatis-spring) is needed

## Data Source

Here, any kind of DataSource is allowed. For example, `org.springframework.jdbc.jar`:

{% highlight xml %}
<!-- In Resources folder, create jdbc.properties with following content -->
<!-- jdbc.driver=com.mysql.jdbc.Driver -->
<!-- jdbc.url=jdbc:mysql://localhost:3306/db_name -->
<!-- jdbc.username=root -->
<!-- jdbc.password=password -->
<bean class="org.springframework.beans.factory.config.PropertyPlaceholderConfigurer">
    <property name="location" value="classpath:jdbc.properties"/>
</bean>

<bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
    <property name="driverClassName" value="${jdbc.driver}"/>
    <property name="url" value="${jdbc.url}"/>
    <property name="username" value="${jdbc.username}"/>
    <property name="password" value="${jdbc.password}"/>
</bean>
{% endhighlight %}

> I got `CannotGetJdbcConnectionException` when coded my [SpingMVC + Mybatis Helloworld example](https://github.com/DONGChuan/SpringMVC-Mybatis-Helloworld). The solution is to add `?useUnicode=true&characterEncoding=utf-8&serverTimezone=GMT`. So set explicitly unicode and timezone.

## Setup SqlSessionFactory

In previous note [MyBatis Basic](http://dongchuan.github.io/articles/2016/04/MyBatis-CRUD.html), we get `SqlSessionFactory` by `SqlSessionFactoryBuilder`:

{% highlight java %}
String resource = "path/to/mybatis-config.xml";
InputStream inputStream = Resources.getResourceAsStream(resource);
SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
{% endhighlight %}

But in MyBatis-Spring xml, bean `SqlSessionFactory` is created by `SqlSessionFactoryBean`:

{% highlight xml %}
<bean id="sqlSessionFactory" class="org.mybatis.spring.SqlSessionFactoryBean">
    <property name="dataSource" ref="dataSource" /> <!-- Obliged -->
    <!-- Indicate location of mapper files where exists mysql statements -->
    <property name="mapperLocations" value="classpath*:/mybatis/*Mapper.xml"/>
    <!-- Indicate mybatis config files where exists typeAliases, settings, etc -->
    <property name="configLocation" value="classpath:/mybatis/mybatis-config.xml"/>
</bean>

<!-- In java code, it does the following step to create SqlSessionFactory
SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
SqlSessionFactory sessionFactory = factoryBean.getObject();
-->
{% endhighlight %}

## Define mappers

Two ways to define:

* Annotation based
* XML based

When using xml based:

1. **Tell `SqlSessionFactoryBean` where to find it by `mapperLocations`**.
2. **Mapper namespace must be full package path to mapper interface**.
3. **id must be the same as function name in mapper interface, also the resultType, paramType, etc**.

The following example mixed both of xml and annotation. 

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<!-- namespace must indicate mapper interface full package path -->
<mapper namespace="com.dong.web.mapper.UserMapper">

    <select id="getRowCount" resultType="int">
        select count(*) from tb_user
    </select>

</mapper> 
{% endhighlight %}

{% highlight java %}
public interface UserMapper {

    int getRowCount();

    @Select("select * from tb_user")
    List<User> getAllUsers();

}
{% endhighlight %}

## SqlSession

In previous note [MyBatis Basic](http://dongchuan.github.io/articles/2016/04/MyBatis-CRUD.html), we get `SqlSession` from `SqlSessionFactory` and do transaction manually like following.

{% highlight java %}
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

But in mybatis-spring, beans will be injected with a thread safe `SqlSession` that automatically commits, rollbacks and closes the session based on Spring's transaction configuration.

We have two ways to get sesion in DAOs:

* SqlSessionTemplate 
* SqlSessionDaoSupport

> But I prefer to use `MapperScannerConfigurer` or `MapperFactoryBean` directly to avoid coding DAOs manually. `MapperScannerConfigurer` could even automatically scan mapper interfaces. It's the beat choice!

### Transaction

So first, in mybatis-spring, just need to enable Spring transaction processing:

{% highlight xml %}
<bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
    <property name="dataSource" ref="dataSource" />
</bean>
<tx:annotation-driven transaction-manager="transactionManager"/>
{% endhighlight %}

Then add `@Transactional` annotation on service layer.

### SqlSessionTemplate

`SqlSessionTemplate` implements `SqlSession`. It is thread safe and can be shared by multiple DAOs or mappers. It is used to:
 
* Ensure that `SqlSession` used is the one associated with the current Spring transaction when call SQL method. 
* Manage session life-cycle, including closing, committing or rolling back the session as necessary. 
* Translate MyBatis exceptions into Spring DataAccessExceptions.

So the idea here is to create a bean of `SqlSessionTemplate` and inject it in DAO layer:

{% highlight xml %}
<!-- Create a SqlSession bean -->
<bean id="sqlSession" class="org.mybatis.spring.SqlSessionTemplate">
    <constructor-arg index="0" ref="sqlSessionFactory" />
</bean>

<!-- Inject it in DAO layer -->
<bean id="userDAO" class="com.dong.web.dao.UserDaoImpl">
    <property name="sqlSession" ref="sqlSession" />
</bean>
{% endhighlight %}

DAO class with injected sqlSession:

{% highlight java %}
public class UserDaoImpl implements UserDao {

    private SqlSession sqlSession;

    public void setSqlSession(SqlSession sqlSession) {
        this.sqlSession = sqlSession;
    }

    public List<User> getAllUsers() {
        return sqlSession.select("com.dong.web.mapper.UserMapper.getAllUsers");
    }
}
{% endhighlight %}

#### Batch Processing

To enable batch feature:

{% highlight xml %}
<bean id="sqlSession" class="com.dong.web.dao.UserServiceImpl">
    <constructor-arg index="0" ref="sqlSessionFactory" />
    <constructor-arg index="1" value="BATCH" />
</bean>
{% endhighlight %}

Now all SQL statements will be batched: 

{% highlight java %}
public void insertUsers(User[] users) {
    for (User user : users) {
        sqlSession.insert("org.dong.web.mapper.UserMapper.insertUser", user);
    }
}
{% endhighlight %}

### SqlSessionDaoSupport

It is an abstract support class that provides `SqlSession`. **We could call `getSqlSession()` by extending `SqlSessionDaoSupport` to get `SqlSession`**:

{% highlight java %}
public class UserDaoImpl extends SqlSessionDaoSupport implements UserDao {

    public User getUser(String userId) {
        return (User) getSqlSession().selectOne("com.dong.web.mapper.UserMapper.getUser", userId);
    }
    
}
{% endhighlight %}

## MapperFactoryBean

It is used to avoid coding manually DAOs by `SqlSessionDaoSupport` or `SqlSessionTemplate`, so no DAOs here in java code! It handles creating an SqlSession as well as closing it. If there is a Spring transaction in progress, the session will also be committed or rolled back when the transaction completes. 

{% highlight xml %}
<!-- Create a MapperFactoryBean for UserMapper interface -->
<bean id="userMapper" class="org.mybatis.spring.mapper.MapperFactoryBean">
    <property name="mapperInterface" value="com.dong.web.mapper.UserMapper" />
</bean>

<!-- Inject mapper in service layer -->
<bean id="userService" class="com.dong.web.service.UserServiceImpl">
    <property name="userMapper" ref="userMapper" />
</bean>
{% endhighlight %}

{% highlight java %}
public class UserServiceImpl implements UserService {

  private UserMapper userMapper;

  public void setUserMapper(UserMapper userMapper) {
    this.userMapper = userMapper;
  }

  public List<User> getAllUsers() {
    return this.userMapper.getAllUsers();
  }
}
{% endhighlight %}

## MapperScannerConfigurer

With `MapperFactoryBean`, we need to declare a bean for each mapper interface. So better to use `MapperScannerConfigurer` to automatically scan to find mapper interfaces and register each of them as a `MapperFactoryBean`. 

{% highlight xml %}
<!-- Scan all the interfaces under mapper/ -->
<bean class="org.mybatis.spring.mapper.MapperScannerConfigurer">
   <property name="basePackage" value="com.dong.web.mapper" />
</bean>
{% endhighlight %}

> IDE will mention `Could not autowired`, it's because each `MapperFactoryBean` is created by `MapperScannerConfigurer`, IDE could not find yet an existing implementation, D'ont worry. (To check, at least, when I tried my helloworld, it works fine even with this error check)

## Refs

* [Mybatis doc refs](http://www.mybatis.org/mybatis-3/index.html)
* [Mybatis-Spring](http://www.mybatis.org/spring/mappers.html)