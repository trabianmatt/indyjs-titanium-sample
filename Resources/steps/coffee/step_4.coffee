# Now: How about some padding?

window = Ti.UI.createWindow
  backgroundColor: '#eee'
  layout: 'vertical'

label = Ti.UI.createLabel
  text: 'Welcome to your mobile app'
  height: 'auto'
  color: '#333'
  top: 11
  left: 11
  font:
    fontSize: 20
    fontWeight: 'bold'

window.add label

window.open()

# Next: Let's add the content block.
