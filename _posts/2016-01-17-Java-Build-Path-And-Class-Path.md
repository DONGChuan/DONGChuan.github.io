---
layout: post
title: Build Path and Class Path
category: java
tags: [java]
---

## Build Path and Class Path

### Main Point

* 'BUILDPATH' is for **building** your application. It is used to find the dependencies needed to build your project at **compile time**.
* 'CLASSPATH' is for **executing** the application. It is used to load compiled classes and resources at **runtime**.

### Build Path

'BUILDPATH' is **NOT** standard Java terminology. The build class path is a list of paths visible to the compiler when building the project.

jre运行时库
第三方功能扩展库 jar
其他工程
其他的源代码或者功能文件

It is the term for the richer way that a typical IDE specifies the relationship between the "modules" or "projects" that make up an application. The IDE uses this to figure out the classpath and sourcepath for compiling the Java code, and the classpath for running it. The IDE also uses the build path to figure out how to package up your code and its dependencies as (for example) a WAR file.

For example, an Eclipse build path for a project includes the other projects that it depends on, and lists any additional library JARs that the project contains / relies on. It also lists the packages in the current project that downstream projects can depend on.

(If you are using Maven for your project, the IDE buildpath mechanism is secondary to the dependencies declared in the POM files. For example, using Eclipse with the m2eclipse, the buildpath is synthesized from the POM files.)

### Class Path

'CLASSPATH' is one way way to tell JVM where to find compiled classes. It is typically a sequence of JAR file names and directory names. The classpath used by the compiler and the runtime system don't have to be the same, but they typically "should be*, especially for a small project.

The CLASSPATH variable is one way to tell applications, including the JDK tools, where to look for user classes. (Classes that are part of the JRE, JDK platform, and extensions should be defined through other means, such as the bootstrap class path or the extensions directory.)

Chaque élément du CLASSPATH correspond à une racine, et les classes sont recherchées dans les sous-répertoires correspondant au nom de leurs packages.

## Ref

* [Stackoverflow](http://stackoverflow.com/questions/3529459/what-is-the-difference-between-class-path-and-build-path)
* [Eclipse Helper](http://help.eclipse.org/juno/index.jsp?topic=%2Forg.eclipse.jdt.doc.user%2Freference%2Fref-properties-build-path.htm)
* [Tutorials Point](http://www.tutorialspoint.com/eclipse/eclipse_java_build_path.htm)
