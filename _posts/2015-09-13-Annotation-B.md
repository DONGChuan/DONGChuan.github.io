---
layout: post
title: Annotation Part B - Meta-Annotations
---

## Meta-Annotations

**Meta-Annotations are annotations which will be applied to other annotations**. It's just like meta-data. When you define your own annotation, you must use them. There are several meta-annotation types defined in `java.lang.annotation`.

1. `@Target`
2. `@Retention`
3. `@Documented`
4. `@Inherited`

## @Target

｀@Target｀ marks another annotation to ＊＊restrict what kind of Java elements the annotation can be applied to＊＊. A target annotation specifies one of the following element types as its value:

＊ ElementType.ANNOTATION_TYPE can be applied to an annotation type.
＊ ElementType.CONSTRUCTOR can be applied to a constructor.
＊ ElementType.FIELD can be applied to a field or property.
＊ ElementType.LOCAL_VARIABLE can be applied to a local variable.
＊ ElementType.METHOD can be applied to a method-level annotation.
＊ ElementType.PACKAGE can be applied to a package declaration.
＊ ElementType.PARAMETER can be applied to the parameters of a method.
＊ ElementType.TYPE can be applied to any element of a class.

{% highlight java linenos %}
@Target(ElementType.TYPE)
public @interface Table {
    //......
}

@Target(ElementType.FIELD)
public @interface NoDBColumn {
	//......
}
{% endhighlight %}

So annotation @Table can be used for class/interface/enum. @NoDBColumn can be used for field or property of a class.

## @Retention

｀@Retention｀ specifies how the marked annotation is stored or could be considered as its lifecycle:

* RetentionPolicy.SOURCE – The annotation is retained only in the source level and is ignored by the compiler.
* RetentionPolicy.CLASS – The annotation is retained by the compiler at compile time, but is ignored by the JVM.
* RetentionPolicy.RUNTIME – The annotation is retained by the JVM so it can be used by the runtime environment.

{% highlight java linenos %}
@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
public @interface Column {
    public String name() default "fieldName";
    public String setFuncName() default "setField";
    public String getFuncName() default "getField"; 
    public boolean defaultDBValue() default false;
}
{% endhighlight %}

So here, Column annotation is retained by the JVM at runtime, we could get its properties by java reflection to do some more operations!

## @Documented

`@Documented` indicates that **whenever the specified annotation is used those elements should be documented using the Javadoc tool**. 

## @Inherited

｀@Inherited｀ indicates that the annotation type can be inherited from the super class. (This is not true by default.). **If an annotation with @Inherited is applied to a class, so all its subclasses will also have this annotation**. For exemple: `@Deprecated`
