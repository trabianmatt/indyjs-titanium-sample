Ti.include '../lib/underscore.js'
Ti.include 'styles_1.js'

class View

  viewName: 'View'

  attributes: {}

  constructor: (options = {}) ->

    @options = _.extend {}, (@options or {}), options

    @view = @make @viewName, @attributes

  make: (viewName, attributes...) ->
    attributes = _.extend {}, attributes...
    Ti.UI["create#{viewName}"] attributes

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

class WelcomeWindow extends Window

  render: =>

    @layout (view) =>

      label = @make 'Label', styles.labels.h1,
        text: 'Welcome to your mobile app'

      view.add label

      contentBlock = new ContentBlock
        text: '''
          The Kitchen Sink project was included in this bootstrapped app as an example
          of user interface elements and coding style for titanium-backbone. To remove
          the kitchen sink, simply remove the titanium-backbone-ks module from package.json
          and remove the reference to 'KitchenSinkIntroView' from src/index.coffee
        '''

      view.add contentBlock.render().view

      button = @make 'ButtonBar', styles.button,
        labels: ['Launch Kitchen Sink']

      button.addEventListener 'click', ->
        alert 'clicked'
        return

      view.add button

    @

welcomeWindow = new WelcomeWindow

welcomeWindow.render().open()
