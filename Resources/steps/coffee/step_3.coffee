# Now: Let's move that heading to the top.

window = Ti.UI.createWindow
  backgroundColor: '#eee'
  layout: 'vertical'

label = Ti.UI.createLabel
  text: 'Welcome to your mobile app'
  height: 'auto'
  color: '#333'
  font:
    fontSize: 20
    fontWeight: 'bold'

window.add label

window.open()

# Next: How about some padding?
