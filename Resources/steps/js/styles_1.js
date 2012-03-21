(function() {

  this.styles = {
    window: {
      backgroundColor: '#eee'
    },
    layout: {
      top: 11,
      left: 11,
      right: 11,
      layout: 'vertical',
      height: 'auto'
    },
    labels: {
      h1: {
        height: 'auto',
        color: '#333',
        bottom: 11,
        font: {
          fontSize: 20,
          fontWeight: 'bold'
        }
      }
    },
    contentBlock: {
      view: {
        height: 'auto',
        borderColor: '#aaa',
        borderRadius: 11,
        backgroundColor: '#fff',
        bottom: 11
      },
      label: {
        height: 'auto',
        color: '#333',
        top: 11,
        bottom: 11,
        right: 11,
        left: 11,
        font: {
          fontSize: 14
        }
      }
    },
    button: {
      height: 44,
      backgroundColor: '#3A7CE5',
      style: Ti.UI.iPhone.SystemButtonStyle.BAR
    }
  };

}).call(this);
