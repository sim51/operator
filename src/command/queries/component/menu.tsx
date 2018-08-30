import * as React from 'react';

export default class Menu extends React.Component<any, any> {

  style: any = {
    prefix: {
      fg: 'yellow'
    },
    bg: 'cyan',
    item: {
      bg: 'black'
    }
  };

  actions: any;

  constructor(props) {
    super(props);
  }

  render = () => {
    return (
      <listbar
        style={this.style}
        keys={true}
        mouse={true}
        autoCommandKeys={true}
        commands={this.props.actions}
      />
    );
  }
}
