---
layout: post
title: Build Path and Class Path
category: java
tags: [java]
---

## Build Path and Class Path

* 'BUILDPATH' is for **building** your application. It is used to find the dependencies needed to build your project at **compile time**.
* 'CLASSPATH' is for **executing** the application. It is used to load compiled classes and resources at **runtime**.
* Each element of in this path corresponds to a root, classes needed will be found in the corresponding subdirectories.

### Build Path

'BUILDPATH' is **NOT** standard Java terminology. 'BUILDPATH' path is a list of paths visible to the compiler when building the project. It could include the following:

1. JRE system libraries.
2. Third-part JARs. (mysql-connector-java.jar for jdbc with mysql)
3. Classes and libraries exported by projects referenced by this project.
4. Code in the source folders of current project.

It is the term for the richer way that a typical **IDE** specifies the relationship between the "modules" or "projects" that make up an application. The IDE also uses the 'BUILDPATH' to figure out how to package up your code and its dependencies as (for example) a WAR file.

(If you are using Maven for your project, the IDE 'BUILDPATH' mechanism is secondary to the dependencies declared in the POM files. For example, using Eclipse with the m2eclipse, the 'BUILDPATH' is synthesized from the POM files.)

### Class Path

'CLASSPATH' is one way to tell JVM where to find compiled classes. It is typically a sequence of JAR file names and directory names. 'CLASSPATH' used by the compiler and the runtime system doesn't have to be the same, but they typically should be.

## Ref

* [Stackoverflow](http://stackoverflow.com/questions/3529459/what-is-the-difference-between-class-path-and-build-path)
* [Eclipse Helper](http://help.eclipse.org/juno/index.jsp?topic=%2Forg.eclipse.jdt.doc.user%2Freference%2Fref-properties-build-path.htm)
* [Tutorials Point](http://www.tutorialspoint.com/eclipse/eclipse_java_build_path.htm)
