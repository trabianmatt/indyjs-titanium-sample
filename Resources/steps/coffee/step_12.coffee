# Now: Extract the styles.

styles =
  window:
    backgroundColor: '#eee'
  layout:
    top: 11
    left: 11
    right: 11
    layout: 'vertical'
    height: 'auto'
  labels:
    h1:
      height: 'auto'
      color: '#333'
      bottom: 11
      font:
        fontSize: 20
        fontWeight: 'bold'
  contentBlock:
    view:
      height: 'auto'
      borderColor: '#aaa'
      borderRadius: 11
      backgroundColor: '#fff'
      bottom: 11
    label:
      height: 'auto'
      color: '#333'
      top: 11
      bottom: 11
      right: 11
      left: 11
      font:
        fontSize: 14
  button:
    height: 44
    backgroundColor: '#3A7CE5'
    style: Ti.UI.iPhone.SystemButtonStyle.BAR

window = Ti.UI.createWindow styles.window

layout = Ti.UI.createView styles.layout

label = Ti.UI.createLabel _.extend {}, styles.labels.h1,
  text: 'Welcome to your mobile app'

layout.add label

contentBlock = Ti.UI.createView styles.contentBlock.view

welcomeText = Ti.UI.createLabel _.extend {}, styles.contentBlock.label,
  text: '''
    The Kitchen Sink project was included in this bootstrapped app as an example
    of user interface elements and coding style for titanium-backbone. To remove
    the kitchen sink, simply remove the titanium-backbone-ks module from package.json
    and remove the reference to 'KitchenSinkIntroView' from src/index.coffee
  '''

contentBlock.add welcomeText

layout.add contentBlock

button = Ti.UI.createButtonBar _.extend {}, styles.button,
  labels: ['Launch Kitchen Sink']

button.addEventListener 'click', ->
  alert 'clicked'
  return

layout.add button

window.add layout

window.open()

# Next: Oops. Let's fix that.
