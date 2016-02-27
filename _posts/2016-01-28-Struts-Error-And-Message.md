---
layout: post
title: Struts errors and messages from action
category: Struts
tags: [struts]
---

I had a problem today when developing a login system to learn struts. How to transfer easily the error and messages from action, and show them on jsp pages.

It seems Struts 2’s **ActionError** and **ActionMessage** class is the a very good choice.

So in my login action, I just call directly `addActionMessage()` and `addActionError()` to add the messages I want:

{% highlight java %}
	@Override
    public String execute() throws Exception {

        UserService userService = new UserService();
        user = userService.getUserByName(username);

        // To check weather the password is correct
        if(user != null && password.equals(user.getPassword())) {
        	addActionMessage("Login successfully");
            return SUCCESS; // With my configuration, it will go to info.jsp
        }else{
            addActionError("Password or username is wrong or not existing");
            return ERROR; // With my configuration, it will stay on the same page login.jsp.
        }
    }
{% endhighlight %}

In info.jsp:

{% highlight JSP %}
<s:if test="hasActionMessages()">
    <s:actionmessage/>
</s:if>
{% endhighlight %}

Obviously, `hasActionMessages()` here will return true when we called `addActionMessages()` in our action. If it's true, all contents in `s:if` will be shown. `s:actionmessage` will be replaced by the messages we just set in action.

In login.jsp:

{% highlight JSP %}
<s:if test="hasActionErrors()">
    <s:actionerror/>
</s:if>
{% endhighlight %}

So it's the same. `hasActionErrors()` will return true when we called `addActionError()` in our action. If it's true, all contents in `s:if` will be shown. `s:actionerror` will be replaced by the messages we just set in action.

## Ref
- [Struts 2 ActionError & ActionMessage Example](http://www.mkyong.com/struts2/struts-2-actionerror-actionmessage-example/)