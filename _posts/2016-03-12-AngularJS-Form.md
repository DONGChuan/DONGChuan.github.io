---
layout: post
title: AngularJS Form
category: AngularJS
tags: [angularjs]
---

AngularJS provides a small and well-defined set of constructs that make standard form-based operations easier. For a form, we should consider three points:

1. Allowing user input
2. Validating those inputs against business rules
3. Submitting the data to the backend server

`form` in AngularJS is extend from html `form`. Now it's a directive. When Angular encounters the `form` tag, it executes the `form` directive. This directive creates an instance of a special Angular class `FormController` that is made available to us on the current scope. It's this controller which provides an API to check and manipulate the state of the form. The same as `ng-model` which creates an instance of `NgModelController`.

## Validation

It already has **built-in support for validating**. Validations are automatically setup by AngularJS according to:

* Input type - text, numbers, e-mails, URLs, radios, checkboxes, and a few others. (such as `<intput type='email'/>`).
* Validation attributes - `required`, `min`, `max`, and custom attributes such as `ng-pattern`, `ng-minlength`, and `ng-maxlength`.

{% highlight html %}
<!-- novalidate is used to disable browser's native form validation -->
<form name="form" novalidate>
    <label for="form-name">Name:</label>
    <input name="formName" id="form-name" class="form-control" type="text" ng-model="user.name" required/>
    <label ng-show="form.formName.$error.required && form.formName.$dirty" class="text-danger">Name is required</label>
</form>
{% endhighlight %}

So AngularJS will check `required` attribute. When input is empty, the error label will be shown.

More details, `from` directive creates an instace of `FormController` and published into the scope using the name attribute. Then the inside `ng-model` create `NgModelController` and published as a property of the form instance using the name attribute. `$error` and $dirty is of `NgModelController`.

### $error

It contains a list of all errors for the specific ng-model directive. From above example, `required` is validation attribute. So to check the validation, we need to follow this format:

{% highlight html %}
formName.inputName.$error.validation
{% endhighlight %}

For example:

{% highlight html %}
formName.inputName.$error.required // For required
formName.inputName.$error.number   // For type="number"
formName.inputName.$error.pattern  // For ng-pattern
{% endhighlight %}

**When validation is failing, `$error.validation` will be true**. We could use it to decide whether to show error messages.

### States by ng-model

Besides `$error`, every element that uses ng-model — including input, textarea, and select — has states defined on the associated model controller:

* $pristine: True if user does not interact with the input. Any updates to the input field and $pristine is set to false. **Once false, it never flips, unless we call the `$setPristine()` function on the model controller**.
* $dirty: Reverse of $pristine. This is true when the input data has been updated. **This gets reset to false if `$setPristine()` is called.**
* $touched: True if the control ever had focus.
* $untouched: True if the control has never lost focus.
* $valid: True if there are validations defined on the input element and none of them are failing.
* $invalid: True if any of the validations defined on the element are failing.

So from above example:

{% highlight html %}
<label ng-show="form.formName.$error.required && form.formName.$dirty" class="text-danger">Name is required</label>
{% endhighlight %}

If there is no `form.formName.$dirty`, the validation message is shown as soon as we load the form. When user never interacts with the input, `$pristine` is true and `$pristine` is false. So here, the error message will never be shown until user begins to interact with the input.

### CSS to an input element

Based on the model state, Angular also adds some CSS classes automatically to an input element.

* `ng-valid/ng-invalid`: This is used if the model is valid or not
* `ng-pristine/ng-dirty`: This is used if the model is pristine or ng-dirty.
* `ng-untouched/ng-touched`:  This is used when the input is never visited or not.
* `ng-invalid-\<errorkey>\/ng-valid-\<errorkey\>`: This is used for a specific failed/sucessed validation.
* `ng-empty/ng-not-empty`:  This is used if the model is empty or not

For example, when we check the page by Inspect of browser (not your own code), we could find a list of class already added in input:

{% highlight html %}
<input type="text" name="test" class="ng-pristine ng-untouched ng-invalid ng-invalid-required" ...>
{% endhighlight %}

When we type something, it could change to:

{% highlight html %}
<input type="text" name="test" class="ng-dirty ng-touched ng-valid ng-valid-required" ...>
{% endhighlight %}

So we could customize input element by these classes according to different state. For example:

{% highlight css %}
input.ng-invalid {
	border:1px solid blue;
}
{% endhighlight %}

### Points to be careful

**If data in the model is invalid, it does not show up in the view and the view element is empty.**

For example, we set age value as "2" in controller in init method. But on the view, we set a "min='5'" validation. So the input is empty when we load page.

### Error messages by ng-messages

`ng-messages` and `ng-message` that allow us to show/hide error messages with a less verbose syntax. It's better to use them to show validation errors instead of `ng-show/ng-hide`.

> To use them, we need to add angular-messages.js and add ngMessages module.

Think about a lot of validation in one input:

{% highlight html %}
<form name="form" novalidate>
    <label for="test">Demo:</label>
    <input type="number" name="test" id="test" ng-model="user.demo" min="1" ng-pattern="/^-?\d+$/" required>
    <label ng-show="form.test.$dirty && form.test.$error.required" class="text-danger">Required</label>
    <label ng-show="form.test.$dirty && form.test.$error.number" class="text-danger">Must be number</label>
    <label ng-show="form.test.$dirty && form.test.$error.min" class="text-danger">Min 1</label>
    <label ng-show="form.test.$dirty && form.test.$error.pattern" class="text-danger">Must in right format</label>
</form>
{% endhighlight %}

We could change it to:

{% highlight html %}
<form name="form" novalidate>
    <label for="test">Demo:</label>
    <input type="number" name="test" id="test" ng-model="user.demo" min="1" ng-pattern="/^-?\d+$/" required>
	<div ng-messages="form.test.$error" ng-if="form.test.$dirty">
        <label ng-message="required" class="text-danger">Required</label>
        <label ng-message="number" class="text-danger">Must be number</label>
        <label ng-message="min" class="text-danger">Min 1</label>
        <label ng-message="pattern" class="text-danger">Must in right format</label>
    </div>
</form>
{% endhighlight %}

### ng-messages-multiple

With above example, each time, only one message will be shown. (Always the upper one has higher priority). When user typed "-1", both `$error.min` and `$error.pattern` will be true. But only error message for `min` will be shown. To avoid this problem:

{% highlight html %}
<div ng-messages="..." ng-messages-multiple>
{% endhighlight %}

### Message reuse and override

ToDo

### Custom validation

we need to explicitly set the $dirty flag at both the form and element level

ToDo

## Submit

Form in Angular has a different role to play as compared to traditional html form that posts data to the server. We could not find `action` attribute. So how to submit data?!

The standard form behavior of posting data to the server using full-page post-back does not make sense with a SPA framework such as AngularJS. In Angular, **all server requests are made through AJAX** invocations originating from controllers, directives, or services. While the traditional one will refresh the whole page.

Firstly, we need to know that from controller also has some APIs and properties as model controller:

* `$setValidity(validationKey, status, childController)`: This is similar to the `$setValidity` API of `NgModelController` but is used to set the validation state of the model controller inside form controller.
* `$setDirty()`: This is used to mark the form dirty.
* `$setPristine()`: This is used to make the form pristine. This is often used to mark the form pristine after persisting the data to server. The $setPristine call propagates to all model controllers registered with the form, so **all child inputs are also set back to the pristine state**.
* `$setUntouched()`: This is used to mark the form untouched. This is mostly called in sync with `$setPristine`, after data is submitted.

Other than the state manipulation API, there are some handy properties:

* $pristine
* $dirty
* $valid
* $invalid
* $error

They are similar to model controller properties except for the $error property. It's in fact a bit more complex. **It aggregates all failures across all contained inputs**. The `$error`'s property corresponds to the failing error condition and the value is an array of controllers that are invalid. For example, If there are three `required` errors, `$error.required` should be an array with three controllers with this kind of error.

Any way, we **use the $invalid property of the form controller to verify if there are validation errors before we perform a submit**.

{% highlight html %}
<button ng-class="{'btn-default':formName.$valid,'btn-warning':formName.$invalid}" ng-click="submit()" ng-disabled="formName.$invalid">Submit</button>
{% endhighlight %}

So submit button will only be available when no validation errors of its elements. We also use `$valid/$invalid` to set css :D.

### Points to be careful

In general, instead of disabling a submit button, we prefer to inform user all validation errors when user clicks submit button.
If we remove `ng-disabled`, when user loads the page and clicks submit button directly without touching others. Nothing is submitted as the form is invalid, but validation errors on its child elements like input do not show up at all. Look at one label:

{% highlight html %}
<label ng-show="form.formName.$error.required && form.formName.$dirty" class="text-danger">Name is required</label>
{% endhighlight %}

`form.formName.$dirty` disables validation messages until user has touched the element. It's why here.

So in `submit()`, we could set a flag to fix this problem.

{% highlight javascript %}
$scope.submit = function () {

    $scope.submitted = true; // Will force validations
    if ($scope.form.$invalid) return; // Nothing will be submitted if invalid!

    $scope.form.$setPristine();
    $scope.submitted = false;

    // Other operations
}
{% endhighlight %}

So now update label:

{% highlight html %}
<label ng-show="form.formName.$error.required && (submitted || form.formName.$dirty)" class="text-danger">Name is required</label>
{% endhighlight %}

When user clicks submit button, we force validation to be true!. But still a problem here, we need to repeat this fix on all labels and a little complex to read. So why not create a function because all validations need to check `submitted`

{% highlight javascript %}
$scope.hasError = function (modelController, error) {
  return (modelController.$dirty || $scope.submitted) && error;
}
{% endhighlight %}

So now update label again:

{% highlight html %}
<label ng-show="hasError(formName.inputName, formName.inputName.$error.required)" class="text-danger">Name is required</label>
{% endhighlight %}

For the moment, we only need to pass model controller and its validation without caring the conditions!

## Reset

The standard way to reset a form is to call the reset method on the form object such as `document.forms["formName"].reset()` or to use `type="reset"` for a button.

But we could also define a function by ourselves to add on the reset button

{% highlight javascript %}
$scope.reset = function () {
	$scope.formName.$setPristine();
	// Restore other parameters
	// Other things to do
};
{% endhighlight %}

## Ref



















