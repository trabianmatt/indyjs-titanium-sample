# Now: Let's add the content block.

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

contentBlock = Ti.UI.createView
  height: 100
  borderColor: '#aaa'
  borderRadius: 11
  backgroundColor: '#fff'

window.add contentBlock

window.open()

# Next: Give that block some room.
