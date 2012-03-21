# Now: Add a heading.

window = Ti.UI.createWindow
  backgroundColor: '#eee'

label = Ti.UI.createLabel
  text: 'Welcome to your mobile app'
  height: 'auto'
  color: '#333'
  font:
    fontSize: 20
    fontWeight: 'bold'

window.add label

window.open()

# Next: Let's move that heading to the top.
