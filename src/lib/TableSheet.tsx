import React from 'react';
import ReactDataSheet from "react-datasheet";

interface Cell {
  key: string;
  value: string;
  expr: string;
  readOnly: boolean
}

const RowRenderer = (props: any) => {
  const {className, row, selected, onSelectChanged} = props
  return (<tr className={className}>
      <td className='action-cell cell'>
        <input
          type='checkbox'
          checked={selected}
          onChange={e => onSelectChanged(row, e.target.checked)}
        />
      </td>
      {props.children}
    </tr>)
}

const CellRenderer = (props: any) => {
  const {
    cell, row, col, columns, attributesRenderer, selected, editing, updated, style, ...rest
  } = props

  // hey, how about some custom attributes on our cell?
  const attributes = cell.attributes || {}
  // ignore default style handed to us by the component and roll our own
  attributes.style = {width: columns[col].width}
  if (col === 0) {
    attributes.title = cell.label
  }

  return (<td {...rest} {...attributes}>
      {props.children}
    </td>)
}

const SheetRenderer = (props: any) => {
  const {className, columns, selections, onSelectAllChanged} = props
  return (<table className={className}>
      <thead className='data-header'>
      <tr>
        <th className='action-cell cell'>
          <input
            type='checkbox'
            checked={selections.every((s: any) => s)}
            onChange={e => onSelectAllChanged(e.target.checked)}
          />
        </th>
        {columns.map((column: any) => <th
          className='cell' style={{width: column.width}} key={column.label}
        >{column.label}</th>)}
      </tr>
      </thead>
      <tbody className='data-body'>
      {props.children}
      </tbody>
    </table>)
}

export interface Column {
  label: string;
  dataKey: string;
  width: string;
  readonly?: boolean
}
export type TableSheetRow = {[key: string]: number|boolean|string};
export type TableSheetRows = TableSheetRow[];
export type TableSheetGrid = Cell[][]

export interface TableSheetProps {
  columns: Column[];
  rows: TableSheetRows;
  cellChanged?: (data: { row: TableSheetRow, rowIndex: number, column: Column, value: number|boolean|string }) => any;
}

export interface TableSheetState {
  rows: TableSheetRows;
  grid: TableSheetGrid;
  selections: boolean[];
}

class TableSheet extends React.PureComponent<TableSheetProps, TableSheetState> {

  constructor(props: any) {
    super(props)
    this.onCellsChanged = this.onCellsChanged.bind(this);

    this.handleSelectAllChanged = this.handleSelectAllChanged.bind(this)
    this.handleSelectChanged = this.handleSelectChanged.bind(this)

    this.sheetRenderer = this.sheetRenderer.bind(this)
    this.rowRenderer = this.rowRenderer.bind(this)
    this.cellRenderer = this.cellRenderer.bind(this)

    this.state = {
      rows: this.props.rows,
      grid: this.generateGrid(this.props.rows, this.props.columns),
      selections: this.props.rows.map(() => false)
    };
  }

  updateGrid(rows: TableSheetRows) {
    const grid = this.generateGrid(rows, this.props.columns);
    this.setState({
      rows,
      grid
    } as any)
  }

  createCell(row: TableSheetRow, column: Column, columnIndex: number, rowIndex: number): Cell {
    const key = `${columnIndex}_${rowIndex}`;
    const dataKey = column.dataKey;
    const value = (row[dataKey] ?? '').toString();
    return {
      key,
      value,
      expr: value,
      readOnly: typeof column.readonly === 'boolean' ? column.readonly : false,
    };
  }


  generateGrid(rows: TableSheetRows, columns: Column[]): Cell[][] {
    const columnsLength = columns.length;
    const rowsLength = rows.length;
    const grid = [] as any[];
    for (let rowIndex = 0; rowIndex < rowsLength; rowIndex++) {
      const row = [];
      for (let col = 0; col < columnsLength; col++) {
        row.push(this.createCell(rows[rowIndex], columns[col], col, rowIndex));
      }
      grid.push(row);
    }
    return grid;
  }

  onCellsChanged(changes: any[]) {
    const rows = this.state.rows;
    for (const change of changes) {
      const dataRow = rows[change.row];
      const column = this.props.columns[change.col] as Column;
      dataRow[column.dataKey] = change.value;
      this.props.cellChanged?.({
        row: dataRow,
        column: column,
        value: change.value,
        rowIndex: change.row
      })
    }
    this.updateGrid(rows);
  }

  sheetRenderer(props: any) {
    const {selections} = this.state
    const {columns} = this.props;
    return <SheetRenderer
      columns={columns}
      selections={selections}
      onSelectAllChanged={this.handleSelectAllChanged}
      {...props} />
  }

  handleSelectChanged(index: any, selected: any) {
    const selections = [...this.state.selections]
    selections[index] = selected
    this.setState({selections} as any)
  }

  handleSelectAllChanged(selected: any) {
    const selections = this.state.selections.map((s: any) => selected)
    this.setState({selections} as any)
  }

  rowRenderer(props: any) {
    const {selections} = this.state
    return <RowRenderer
      selected={selections[props.row]} onSelectChanged={this.handleSelectChanged}
      className='data-row' {...props} />
  }

  cellRenderer(props: any) {
    return <CellRenderer columns={this.props.columns} {...props} />
  }

  isCellNavigable() {
    return (cell: Cell, row: number, col: number) => {
      const column = this.props.columns[col] as Column;
      return typeof column.readonly === 'boolean' ? !column.readonly : true;
    }
  }

  render() {

    return (<div className='sheet-container'>
      <ReactDataSheet
        data={this.state.grid}
        valueRenderer={(cell: any) => cell.value}
        dataRenderer={(cell: any) => cell.expr}
        sheetRenderer={this.sheetRenderer}
        onCellsChanged={this.onCellsChanged}
        rowRenderer={this.rowRenderer}
        cellRenderer={this.cellRenderer}
        isCellNavigable={this.isCellNavigable()}
      />
    </div>)
  }
}

export default TableSheet;
