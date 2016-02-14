---
layout: post
title: Hibernate Session
category: Hibernate
tags: [hibernate]
---

Session interface is a **single threaded** object between Java application and the persistence layer. Session opens a single database connection when it is created, and holds onto it until the session is closed. It is mainly to **offer CRUD operations on the persistent object** which is loaded by Hibernate from the database.

More details, in hibernate, Session interface wraps a JDBC connection, holds a mandatory (first-level) cache of persistent objects, allows Hibernate to automatically persist objects that are modified, and allows Hibernate to implement functionality such as lazy-loading.

## State of persistent object

Persistent objects should be in one of the following three states at a given point in time:

* **transient**: A new instance of a persistent class which is not associated with a Session and has no representation in the database and no identifier value. (ex. Person p = new Person). You can make a transient instance persistent by associating it with a Session. 

* **persistent**: A persistent instance has a representation in the database, an identifier value and is associated with a Session.

* **detached**: Once we close the Hibernate Session, the persistent instance will become a detached instance. But the reference of the object is still valid. You could continue to modify the object. These changes will not lost and will be inserted into database when associated with a Session which changes it back to persistent state.

## Open a session

{% highlight java %}
// Loads hibernate.cfg.xml by default
Configuration config = new Configuration().configure();
SessionFactory sessionFactory = config.buildSessionFactory();

// Opens a session
Session session = sessionFactory.openSession();
Transaction tx = session.beginTransaction();

....

tx.commit();

// Close a session
session.close();
{% endhighlight %} 

## save()

`save()` results in an SQL INSERT. It persists the given transient instance, first assigning a generated identifier. In brief, it adds/saves a new entity into database.

{% highlight java %}
Session session = sessionFactory.openSession();
Transaction tx = session.beginTransaction();

User user = new User(); 

user.setName("DONGChuan"); 
user.setAge(26);

session.save(user);

tx.commit();
session.close();
{% endhighlight %} 

But be careful here, `save()` does not guarantee the same, it returns an identifier, and if an INSERT has to be executed to get the identifier, **this INSERT happens immediately**, no matter if you are inside or outside of a transaction. This is not good in a long-running conversation with an extended Session/persistence context.

## persist()

`persist()` also makes a transient instance persistent. However, it doesn't guarantee that the identifier value will be assigned to the persistent instance immediately, the assignment might happen at flush time. It also guarantees that it will not execute an `INSERT` statement if it is called outside of transaction boundaries. This is useful in long-running conversations with an extended Session/persistence context.

## load() and get()

`load()` and `get()` result in an SQL `SELECT BY ID`. It returns the persistent instance of the given entity class with the given identifier.(`load()` returna a "proxy")

{% highlight java %}
// Opens session and begins transaction

User user = (User) session.load(User.class, 1); // 1 is the identifier in the database
// User user = (User) session.get(User.class, 1); 

// Commits and closes session
{% endhighlight %} 

### Different between load() and get()

* `load()` returns a **“proxy” without hitting the database** (lazy loading). In Hibernate, proxy is an object with the given identifier value, its properties are not initialized yet, it just look like a temporary fake object. If no row found , it will **throws an exception** - ObjectNotFoundException.

* `get()` always **hits the database and returns the real object** instead of a proxy. If no row found , **it return null**.

### Which one to use

If I'm not sure whether the object exists or not, I use `get()` to avoid an exception. If I'm sure, I prefer `load()`.

## update() and saveOrUpdate()

Which function will result in SQL `UPDATE`? We could find `update()` or `saveOrUpdate()`. But we need to know firstly, there is no need to call these functions to do update. When we `get()/load()` a persistent object, and then call setters to modify something. After transaction `commit()` or session `flush()`. Database will be updated.

{% highlight java %}
// Opens session and begins transaction

User user = (User) session.load(User.class, 1);
user.setAge(30);

session.flush();
// or tx.commit(); it does the same thing

// Closes session
{% endhighlight %} 

### update() 

So why we need `update()`? In fact, it's mainly used to updated a detached object which was ever a persistent object and now session is closed. When `update()` a detached object, **it will become persistent again**.

{% highlight java %}
firstSession = sessionFactory.openSession();    
tx = firstSession.beginTransaction();

User user = (User) session.get(User.class, 2);

tx.commit();
firstSession.close();

....

// Now user is in detached state. And we update it!
user.setAge(new Integer(27));

// We open a second session
secondSession = sessionFactory.openSession();    
tx = secondSession.beginTransaction();

// Update!
secondSession.update(user);

// Commit!
tx.commit();
secondSession.close();
{% endhighlight %} 

### saveOrUpdate()

It means either `save()` or `update()` the given instance on the basis of identifier exists or not. When we are not sure whether the instance was ever persistent (so whether an identifier exists or not). USE IT! If the instance has an identifier, `update()` will be run to update it in databas. If no identifier, `save()` will be run to add an identifier and insert it into database.

## merge()

`merge()` is also used to update a detached object. It copies the state of the given object onto the persistent object with the same identifier. 

The difference with `update()` is that `update()` tries to reattach the instance, meaning that there is no other persistent object with the same identifier attached to the Session right now otherwise NonUniqueObjectException is thrown. `merge()`, however, just copies all values to a persistent instance in the Session (which will be loaded if it is not currently loaded). The input object is not changed. So merge is more general than `update()`, but may use more resources.

{% highlight java %}
Session session = sessionFactory.openSession();
Transaction tx = session.beginTransaction();

User user1 = (User) session.get(User.class, 2);

tx.commit();
session.close();

....
user1.setAge(30);

session = sessionFactory.openSession();    
tx= session.beginTransaction(); 

User user2 = (User) session.get(User.class, 2); // Same id as user1

session.update(user1); // It throws NonUniqueObjectException because in the session, another persistent object with the same id already exists. user1 == user2 false

tx.commit();
session.close();
{% endhighlight %} 

So if in this situation, we should use `merge()`, it needs to merge user1 with user2:

{% highlight java %}
User user2 = (User) session.get(User.class, 2);
User user3 = (User) session.merge(user1);

// user3 == user2 true
{% endhighlight %} 

So here merge returns the **same reference** of user2.

## delete()

`delete()` results in SQL `DELETE`

{% highlight java %}
Session session = sessionFactory.openSession();
Transaction tx = session.beginTransaction();

User user = (User) session.get(User.class, 1);
session.delete(user);

tx.commit();
session.close();
{% endhighlight %} 

## find()

No `ind()` in current version! We must use query or criteria to achieve it.

## flush()

`session.flush()` forces Hibernate to **synchronize the in-memory state of the Session with the database**. 

By default, Hibernate will flush changes automatically for you:

* Before some query executions
* When a transaction is committed

We could also set flush mode, by default is AUTO:

{% highlight java %}
// The Session is flushed before every query.
session.setFlushMode(FlushMode.ALWAYS);
// The Session is sometimes flushed before query execution in order to ensure that queries never return stale state.
session.setFlushMode(FlushMode.AUTO);
// The Session is flushed when Transaction.commit() is called. 
session.setFlushMode(FlushMode.COMMIT);
// The Session is only ever flushed when Session.flush() is explicitly called by the application.
session.setFlushMode(FlushMode.MANUAL);
{% endhighlight %} 

Be careful, **setFlushMode() must be invoked before session.beginTransaction()**.

## Ref

- [Tutorialspoint - Point](http://www.tutorialspoint.com/hibernate/hibernate_sessions.htm)
- [Hibernate API](https://docs.jboss.org/hibernate/orm/3.2/api/org/hibernate/Session.html)
- [Stackoverflow save() vs persist()](http://stackoverflow.com/questions/5862680/whats-the-advantage-of-persist-vs-save-in-hibernate)