printTitle = (name) ->
  console.log "\nmodule: #{name}"
  console.log '----------------------'

printTitle 'hello'

hello = require './hello'

hello.print()

####

printTitle 'hello_2'

hello_2 = require('./hello_2')

hello_2.print()

console.log "We know who you are: #{hello_2.name}"

####

printTitle 'hello_3'

hello_3 = require('./hello_3')

console.log "Your identity is safe with us (until we print it to screen, that is): #{hello_3.name}"

hello_3.print()

####

printTitle 'sample_class'

SampleClass = require './sample_class'

sampleClass = new SampleClass

sampleClass.saySomething()

####

printTitle 'multiple'

multipleClasses = require './multiple'

oneClass = new multipleClasses.OneClass

oneClass.sayHello()

anotherClass = new multipleClasses.AnotherClass

anotherClass.sayHello()

####

printTitle 'multiple with destructuring assignment'

{ OneClass, AnotherClass } = require './multiple'

oneClass2 = new OneClass

oneClass2.sayHello()

anotherClass2 = new AnotherClass

anotherClass2.sayHello()

console.log ''
