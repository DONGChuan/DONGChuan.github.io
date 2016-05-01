---
layout: post
title: MySQL Index
category: MySQL
tags: [mysql]
---

Quick note about MySQL Index.

## Why Index

Indexes are used to **find rows with specific column values quickly**. Without an index, MySQL must begin with the first row 
and then read through the entire table to find the relevant rows. The larger the table, the more this costs. If the table 
has an index for the columns in question, MySQL can quickly determine the position to seek to in the middle of the data file 
without having to look at all the data. This is much faster than reading every row sequentially.

Most MySQL indexes are stored in [B-trees](http://dev.mysql.com/doc/refman/5.7/en/glossary.html#glos_b_tree). But indexes on spatial data types use R-trees;

## Index Type

1. `INDEX`. Duplicate values or composites are allowed.
4. `Composite Index`. `INDEX` with multiple-column.
2. `UNIQUE INDEX`. Duplicate values or composites are not allowed.
3. `PRIMARY KEY`. Special unique index. Only one in each table.

### Composite Index

Composite Index is multiple-column index. For example:

{% highlight sql %}
ALTER TABLE tb_name ADD INDEX name_city_age (name(10), city, age); 
{% endhighlight %}

This composite index, in fact, is equivalent to the following three indexes:

{% highlight sql %}
INDEX (name, city, age) 
INDEX (name, city)
INDEX (name) 
{% endhighlight %}

But **NO** indexes like:

{% highlight sql %}
INDEX (name, age) 
INDEX (city, age) 
{% endhighlight %}

Because of **leftmost prefix**. It could simply be considered as composite from left. So the following 
select will benefit from this composite index:

{% highlight sql %}
SELECT * FROM tb_name WHREE name="admin" AND city="Paris" 
SELECT * FROM tb_name WHREE name="admin" 
{% endhighlight %}

The following will not use it：

{% highlight sql %}
SELECT * FROM tb_name WHREE age=20 AND city="Paris" 
SELECT * FROM tb_name WHREE city="Paris" 
{% endhighlight %}

### Unique Index

A unique index enforces the constraint that we cannot have two equal values in that column. 
When unique with composite index, no two equal composites are allowed.

For example:

{% highlight sql %}
CREATE TABLE table1 (foo INT, bar INT);

CREATE UNIQUE INDEX ux_table1_foo ON table1(foo);  -- Create unique index on foo.

INSERT INTO table1 (foo, bar) VALUES (1, 2); -- OK
INSERT INTO table1 (foo, bar) VALUES (2, 2); -- OK
INSERT INTO table1 (foo, bar) VALUES (3, 1); -- OK
INSERT INTO table1 (foo, bar) VALUES (1, 4); -- Fails! Duplicate entry '1' for key 'ux_table1_foo'
{% endhighlight %}

The last insert fails because it violates the unique index on column foo when it tries to insert the value 1 
into this column for a second time.

> In MySQL, `UNIQUE` constraint allows multiple NULLs.

### PRIMARY KEY

`PRIMARY KEY` is a special situation of `UNIQUE`

But some points different:

* `PRIMARY KEY` implies NOT NULL, but unique index can be nullable.
* There can be only one `PRIMARY KEY`, but there can be multiple unique indexes.
* If there is no clustered index defined then `PRIMARY KEY` will be the clustered index.

## Create Index

Three ways to create index

1. CREATE TABLE
2. ALTER TABLE
3. CREATE INDEX (**Not allowed to create `PRIMARY KEY`**)

{% highlight sql %}
CREATE TABLE tb_name(  
  ...
  INDEX indexName (column_list),
  UNIQUE INDEX index_name (column_list),
  PRIMARY KEY(ID) 
); 

ALTER TABLE table_name ADD INDEX index_name (column_list);
ALTER TABLE table_name ADD UNIQUE INDEX index_name (column_list);
ALTER TABLE table_name ADD PRIMARY KEY (column_list);

CREATE INDEX index_name ON table_name (column_list);
CREATE UNIQUE INDEX index_name ON table_name (column_list);
{% endhighlight %}

## Delete Index

{% highlight sql %}
DROP INDEX index_name ON talbe_name
ALTER TABLE table_name DROP INDEX index_name

# To delete primary key, as it iss unique in each table, no need to indicate index name
ALTER TABLE table_name DROP PRIMARY KEY
{% endhighlight %}

Delete a column from a table, index will also be influenced. For composite index, if one column inside the index is 
removed, the composite index will also remove it from its compostes. What's more, if all columns from this index are
removed, the composite index will be removed entirely.

## Show index

{% highlight sql %}
mysql> show index from tb_name;
mysql> show keys from tb_name;
{% endhighlight %}

## Disadvantage

Adding index increases query speed. But:

* It decreases also speed to update, insert or delete. 
* Mysql comsumes more resources to maintain indexes
* Indxes files occupy more spaces on disk

So we need to know how to choose columns to set index and also optimize queries.

## How to choose columns for index

###### Consider about columns as conditions in queries frequently called.

###### Consider about columns in `WHERE` and `JOIN`.

{% highlight sql %}
SELECT t.Name 
FROM table1 t 
LEFT JOIN table2 m
ON t.name = m.username 
WHERE m.age=20 AND m.city='Paris' 
{% endhighlight %}

 So we could consider about setting index for age, city in `WHERE` or username in `JOIN`. **Only one index can be used per SELECT/statement in the query**

Index works with these operators <,<=,=,>,>=,between,in and like (Only for expression not beginning with% or _). 

###### Not suggest columns which will be updated, inserted or deleted too frequently.

###### Better to choose columns with big cardinality, so different values. It is easy to distinguish birthday with differentdates. It means nothing set index on gendar to distinguish gendar with only 'M' or 'F'. Because always half will be left.

We could compte **Index Selectivity** to help us to choose.

{% highlight sql %}
Index Selectivity =  Cardinality / Rows of table
{% endhighlight %}

The higher the index selectivity value the more suggested to choose.

###### In composite index, consider about leftmost, column with big index selectivity should be on left.

###### Consider table with many records, for example, 2000 records.

###### Consider **short index** to reduce size of index. Sometimes we don't need to index on the entire field, we could set a prefix length. For exampe, a column is CHAR(200), if in the first 10 characters, most records are unique.We could use short index:

{% highlight sql %}
ALTER TABLE tb_name ADD INDEX index_name (long_string(10)); 
{% endhighlight %}

So mysql only indexes according to first 10 characters which involves less disk I/O, comsumes less index spaces, so may increase query speed.

## Do not!

* Index does not work with <>,not in, !=.

* Do not calculate on columns, it will make index invalid.

{% highlight sql %}
select * from users where YEAR(adddate) < 2007;

Better change to like this:

select * from users where adddate < '2007-01-01';
{% endhighlight %}

* Avoid to use `NULL` as default value for indexed column.

## Refs

* [Stackoverflow - Composite index](http://stackoverflow.com/questions/1823685/when-should-i-use-a-composite-index)
* [Stackoverflow - Primary key or Unique index?](http://stackoverflow.com/questions/487314/primary-key-or-unique-index)
* [MYSQL-索引](https://segmentfault.com/a/1190000003072424)
* [How MySQL Uses Indexes](http://dev.mysql.com/doc/refman/5.7/en/mysql-indexes.html)