import * as React from 'react';

import Menu from './component/menu';
import Queries from './component/queries';
import Setup from './component/setup'
import { render } from "react-blessed";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      box: any;
      element: any;
      textbox: any;
      list: any;
      listtable: any;
      listbar: any;
      checkbox: any;
      radioset: any;
      radiobutton: any;
    }
  }
}

declare module 'react' {
  interface HTMLAttributes<T> {
    left?: any;
    top?: any;
    width?: any;
    height?: any;
    border?: any;
    keys?: any;
    mouse?: any;
    focused?: any;
  }

  interface CSSProperties {
    border?: any;
    bar?: any;
  }
}

class App extends React.Component<any, any> {

  actions: any = {
    'Help': {
      keys: ['h'],
      callback: () => { this.setState({ display: 'Help' }); }
    },
    'Setup': {
      keys: ['s'],
      callback: () => { this.setState({ display: 'Setup' }); }
    },
    'Queries': {
      keys: ['l'],
      callback: () => { this.setState({ display: 'Queries' }); }
    },
    'Quit': {
      keys: ['q'],
      callback: () => { }
    }
  }


  constructor(props) {
    super(props);
    this.state = {
      display: 'Queries',
      headers: ['queryId', 'username', 'elapsedTimeMillis', 'status', 'query', 'parameters'],
      sortField: 'elapsedTimeMillis',
      sortOrder: 'desc'
    };
  }

  setup = () => {
    return (data) => {
      this.setState({
        headers: data.headers,
        sortField: data.sortField,
        sortOrder: data.sortOrder
      });
    }
  }

  renderHelp = () => {
    if (this.state.display === 'Help') {
      return ("No help yet :)")
    }
    return null;
  }

  renderQueries = () => {
    if (this.state.display === 'Queries') {
      return (<Queries headers={this.state.headers} sortField={this.state.sortField} sortOrder={this.state.sortOrder} />)
    }
    return null;
  }

  renderSetup = () => {
    if (this.state.display === 'Setup') {
      return (<Setup onSave={this.setup()} headers={this.state.headers} sortField={this.state.sortField} sortOrder={this.state.sortOrder} />)
    }
    return null;
  }

  render = () => {
    return (
      <box
        width='100%'
        height='100%'
        top='0'
        left='0'
        right='0'
      >
        <box top='0' left='0' width='100%'>
          {this.renderHelp()}
          {this.renderSetup()}
          {this.renderQueries()}
        </box>
        <box top='99%' left='0' right='0'>
          <Menu actions={this.actions} />
        </box>
      </box>
    );
  }
}

export default class Component {
  static exec = (screen: any): any => {
    return render(<App />, screen);
  };
}
