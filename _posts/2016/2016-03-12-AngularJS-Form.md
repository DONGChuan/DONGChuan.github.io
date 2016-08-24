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
* `ng-invalid-<errorkey>/ng-valid-<errorkey>`: This is used for a specific failed/sucessed validation.
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

#### Reuse

Because many messages are the same in a big and complex form, we could reuse them by defining all messages in a sepereted file:

{% highlight html %}
<div ng-message="required">This field is required</div>
<div ng-message="minlength">This field is too short</div>
<div ng-message="maxlength">This field is too long</div>
<div ng-message="required">This field is required</div>
<div ng-message="email">This needs to be a valid email</div>
{% endhighlight %}

And include it by `ng-messages-include`:

{% highlight html %}
<div ng-messages="form.test.$error" ng-if="form.test.$dirty">
     <div ng-messages-include="fileName.html"></div>    
</div>
{% endhighlight %}

#### Override

If generic messages are not enough to match all input fields, we could override messages defined in the remote template by redefining them within the directive container.

{% highlight html %}
<div ng-messages="form.test.$error" ng-if="form.test.$dirty">
    <div ng-message="required">Override the required message</div>
    <!-- Must put override ones above template -->

    <div ng-messages-include="fileName.html"></div>    
</div>
{% endhighlight %}

### Custom validation

There two ways to create a custom validation:

1. By [AngularJS-UI](https://htmlpreview.github.io/?https://github.com/angular-ui/ui-validate/master/demo/index.html)
2. By our own directive

#### By AngularJS-UI

Check [AngularJS-UI](https://htmlpreview.github.io/?https://github.com/angular-ui/ui-validate/master/demo/index.html)

#### By our onw directive

Define a directive:

{% highlight javascript %}
// A validation works like a blacklist, user input can not be in this list
app.directive('blacklist', function(){ 
    return {
        require: 'ngModel',
        link: function(scope, elem, attr, ngModel) {

            var blacklist = attr.blacklist.split(',');

            //For DOM -> model validation
            ngModel.$parsers.unshift(function(value) {
                var valid = blacklist.indexOf(value) === -1;
                ngModel.$setValidity('blacklist', valid);
                return valid ? value : undefined;
            });

            //For model -> DOM validation
            ngModel.$formatters.unshift(function(value) {
                ngModel.$setValidity('blacklist', blacklist.indexOf(value) === -1);
                return value;
            });
        }
    };
});
{% endhighlight %}

Add it in input element:

{% highlight html %}
<form name="form">
   <input type="text" name="type" ng-model="data.fruitName" blacklist="coconuts,bananas,pears" required/>
   <span ng-show="myForm.fruitName.$error.blacklist"> The phrase "{{data.fruitName}}" is blacklisted</span>
   <span ng-show="myForm.fruitName.$error.required">required</span>
</form>
{% endhighlight %}

## Submit

Form in Angular has a different role to play as compared to traditional html form that posts data to the server. We could not find `action` attribute. So how to submit data?!

The standard form behavior of posting data to the server using full-page post-back does not make sense with a SPA framework such as AngularJS. In Angular, **all server requests are made through AJAX** invocations originating from controllers, directives, or services. While the traditional one will refresh the whole page.

So two ways to do it:

1. By `ng-submit`

{% highlight html %}
<form name="form" ng-submit="submit()">
   <button type="submit" ng-disabled="form.$invalid">Submit</button>
</form>
{% endhighlight %}

2. By binding function to the button directly

{% highlight html %}
<form name="form">
    <button ng-click="submit()" ng-disabled="form.$invalid">Submit</button>
</form>
{% endhighlight %}

Then, we need to know that from controller also has some APIs and properties as model controller:

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
- [AngularJS Form](https://docs.angularjs.org/guide/forms)
- [AngularJS by Example](https://www.packtpub.com/web-development/angularjs-example)
- [AngularJS ngMessage](https://docs.angularjs.org/api/ngMessages)
- [Stackover Custom validation](http://stackoverflow.com/questions/12581439/how-to-add-custom-validation-to-an-angularjs-form)
















