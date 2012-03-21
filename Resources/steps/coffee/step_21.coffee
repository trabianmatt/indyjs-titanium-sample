Ti.include '../lib/underscore.js'
Ti.include 'styles_1.js'

class View

  viewName: 'View'

  attributes: {}

  constructor: (options = {}) ->

    @options = _.extend {}, (@options or {}), options

    @view = @make @viewName, @attributes

    if @events

      for name, method of @events()

        @view.addEventListener name, =>
          method()
          return

  make: (viewName, attributes...) ->
    attributes = _.extend {}, attributes...
    Ti.UI["create#{viewName}"] attributes

  render: =>

    @

class ContentBlock extends View

  attributes: styles.contentBlock.view

  render: =>

    @view.add @make 'Label', styles.contentBlock.label,
      text: @options.text

    @

class Window extends View

  viewName: 'Window'

  attributes: styles.window

  open: =>
    @view.open()

  layout: (callback) =>

    layout = @make 'View', styles.layout

    callback layout

    @view.add layout

class Button extends View

  viewName: 'ButtonBar'

  attributes: styles.button

  events: =>
    click: @options.click

  render: =>

    @view.labels = [@options.text]

    @

class WelcomeWindow extends Window

  render: =>

    @layout (view) =>

      view.add @make 'Label', styles.labels.h1,
        text: 'Welcome to your mobile app'

      contentBlock = new ContentBlock
        text: '''
          The Kitchen Sink project was included in this bootstrapped app as an example
          of user interface elements and coding style for titanium-backbone. To remove
          the kitchen sink, simply remove the titanium-backbone-ks module from package.json
          and remove the reference to 'KitchenSinkIntroView' from src/index.coffee
        '''

      view.add contentBlock.render().view

      button = new Button
        text: 'Launch Kitchen Sink'
        click: ->
          alert 'clicked'

      view.add button.render().view

    @

welcomeWindow = new WelcomeWindow

welcomeWindow.render().open()
