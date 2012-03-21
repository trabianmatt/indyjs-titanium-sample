Ti.include '../lib/underscore.js'
Ti.include 'styles_1.js'

make = (name, attributes...) ->

  attributes = _.extend {}, attributes...

  Ti.UI["create#{name}"] attributes

window = make 'Window', styles.window

layout = make 'View', styles.layout

label = make 'Label', styles.labels.h1,
  text: 'Welcome to your mobile app'

layout.add label

contentBlock = make 'View', styles.contentBlock.view

welcomeText = make 'Label', styles.contentBlock.label,
  text: '''
    The Kitchen Sink project was included in this bootstrapped app as an example
    of user interface elements and coding style for titanium-backbone. To remove
    the kitchen sink, simply remove the titanium-backbone-ks module from package.json
    and remove the reference to 'KitchenSinkIntroView' from src/index.coffee
  '''

contentBlock.add welcomeText

layout.add contentBlock

button = make 'ButtonBar', styles.button,
  labels: ['Launch Kitchen Sink']

button.addEventListener 'click', ->
  alert 'clicked'
  return

layout.add button

window.add layout

window.open()
