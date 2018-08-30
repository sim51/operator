import * as React from 'react';

export default class Setup extends React.Component<any, any> {

  style: any = {
    table: {
      style: {
        header: { fg: 'black', bg: 'green' },
        cell: { fg: 'green', selected: { bg: 'cyan', fg: 'black' } }
      }
    }
  };

  allHeaders: string[] = [
    'queryId',
    'username',
    'metaData',
    'query',
    'parameters',
    'planner',
    'runtime',
    'indexes',
    'startTime',
    'protocol',
    'clientAddress',
    'requestUri',
    'status',
    'resourceInformation',
    'activeLockCount',
    'elapsedTimeMillis',
    'cpuTimeMillis',
    'waitTimeMillis',
    'idleTimeMillis',
    'allocatedBytes',
    'pageHits',
    'pageFaults'
  ];

  constructor(props) {
    super(props);
    this.state = {
      data: [
        { id: 0, title: 'Active Metrics', data: this.props.headers, selected: 1, focus: true, action: this.actionActiveMetrics },
        { id: 1, title: 'Available Metrics', data: this.allHeaders, selected: 1, focus: false, action: this.actionAvailableMetrics },
        { id: 2, title: 'Sort Field', data: this.props.headers, selected: 1, focus: false, action: this.actionSortField },
        { id: 3, title: 'Sort Order', data: ['asc', 'desc'], selected: 1, focus: false, action: this.actionSortOrder }
      ]
    }
  }

  actionActiveMetrics = (data) => {
    data[0].data.splice(data[0].selected - 1, 1);
    this.setState({ data: data });
    return data;
  }

  actionAvailableMetrics = (data) => {
    let selectedItem = data[1].data[data[1].selected - 1];
    if (data[0].data.indexOf(selectedItem) < 0) {
      data[0].data.push(selectedItem);
    }
    return data;
  }

  actionSortField = (data) => {
    return data;
  }

  actionSortOrder = (data) => {
    return data;
  }
  componentDidMount = () => {
    this.state.data.forEach((item) => {

      this.refs[item.id]['on']('keypress', (ch, key) => {
        if (key.name === 'tab' || key.name === 'enter' || key.name === 'up' || key.name === 'down') {
          let data = this.state.data;

          // Tab navigation
          if (key.name === 'tab') {
            let nextId = (item.id < 3) ? item.id + 1 : 0;
            if (key.shift) {
              nextId = (item.id > 0) ? item.id - 1 : 3;
            }

            data = data.map((row) => {
              row.focus = false;
              if (row.id === nextId) {
                row.focus = true;
              }
              return row;
            });
          }

          // Go up & down in the list
          if (key.name === 'up' || key.name === 'down') {
            let newSelected = item.selected - 1;
            if (key.name === 'down') {
              newSelected = item.selected + 1;
            }
            if (newSelected >= 0 && newSelected <= item.data.length) {
              data[item.id].selected = newSelected;
            }
          }

          // Item action
          if (key.name === 'enter') {
            data = item.action(data);
          }

          this.props.onSave({
            headers: data[0].data,
            sortField: data[2].data[data[2].selected - 1],
            sortOrder: data[3].data[data[3].selected - 1]
          })

          this.setState({ data: data });
        }
      });
    });
  }

  toListTableData = (title: string, array: string[]): string[][] => {
    return [title].concat(array).map((item) => { return [item] });
  }

  render = () => {
    return (
      <box
        width='100%'
        height='100%'
        top='0'
        left='0'
        right='0'>

        {this.state.data.map((item, index) => {
          return (
            <listtable
              width='25%'
              left={item.id * 25 + '%'}
              top="0"
              mouse={true}
              keys={true}
              vi={true}
              ref={item.id}
              key={index}
              class={this.style.table}
              rows={this.toListTableData(item.title, item.data)}
              selected={item.selected}
              focused={item.focus} />
          )
        })}

      </box>
    );
  }
}
