import React from 'react';
import './App.css';
import TableSheet, {Column, TableSheetRows} from "./lib/TableSheet";

class App extends React.Component<any, any> {

  render() {
    const columns = [
      {label: 'Issue Key', dataKey: 'issueKey', width: '20%', readonly: true},
      {label: 'Time Spent', dataKey: 'timeSpent', width: '20%', readonly: true},
      {label: 'Invoiceable', dataKey: 'invoiceable', width: '20%'},
      {label: 'Adjusted', dataKey: 'adjusted', width: '20%', readonly: true},
    ] as Column[];
    const rows = [
      {issueKey: '<a href="#">SUPER-1900</a>', timeSpent: 12.0, invoiceable: 10, adjusted: -2},
      {issueKey: 'SUPER-1901', timeSpent: 12.0, invoiceable: 10, adjusted: -2},
      {issueKey: 'SUPER-1902', timeSpent: 12.0, invoiceable: 10, adjusted: -2},
      {issueKey: 'SUPER-1903', timeSpent: 12.0, invoiceable: 10, adjusted: -2},
    ] as TableSheetRows

    return (
      <TableSheet columns={columns} rows={rows} cellChanged={data => console.log(data)}></TableSheet>
    )
  }
}

export default App;
