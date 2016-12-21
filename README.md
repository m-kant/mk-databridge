mk-databridge
===============

Databridge is a serialization jQuery plugin to read data from forms, and to set data to forms.
Supports nested objects,
boolean and array checkboxes,
on fly data formatting and conversion.
Works with any elements with attributes 'name' or 'data-name', including non-input elements.

[Demo](http://mkant.ru/mink-js/mk-databridge)

Including in browser
------------

Include script into your page:
```HTML
<script src="path/to/plugin/mk-databridge.min.js" ></script>
```

Basic usage
-----------

To set data call databridge with data object:
```JavaScript
$('.form-container').databridge(dataObject);
```

To get data call databridge with no arguments:
```JavaScript
var dataObject = $('.form-container').databridge();
```

[Details and Demo](http://mkant.ru/mink-js/mk-databridge)
--------------------------------------------------------