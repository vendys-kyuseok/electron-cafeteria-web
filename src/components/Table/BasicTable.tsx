import styled from '@emotion/styled';
import { Box, Table, TableHead, TableBody, TableRow, TableCell, SxProps } from '@mui/material';

const TableWrapper = styled(Box)`
  width: 100%;
  height: 100%;
  overflow-y: auto;

  table {
    /* height: 100%; */
    border-collapse: separate;
    border-spacing: 0;
  }
  table thead tr th {
    ${({ theme }) => theme.typography.font12B}
    color: #4c5966;
    background: #f3f5f6;
  }
  table thead tr th:first-of-type {
    border-top-left-radius: 8px;
    border-bottom-left-radius: 8px;
  }
  table thead tr th:last-of-type {
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
  }

  table tbody tr td {
    height: 26px;
    padding: 4px 16px;
    ${({ theme }) => theme.typography.font12R}
  }

  .MuiTableCell-head {
    height: 28px;
    padding: 4px 16px;
  }

  .table-emptyText {
    text-align: center;
  }
`;

export type TColumn<TData extends object, TField extends keyof TData = keyof TData> = {
  field?: TField;
  fieldStyle?: SxProps;
  headerName?: React.ReactNode;
  align?: 'right' | 'left' | 'center';
  cellRenderer?: (value: TData[TField] | null, row: TData, rowIndex: number) => React.ReactNode;
};

export interface BasicTableProps<TData extends object> {
  columns: Array<TColumn<TData>>;
  data: TData[];
  emptyText?: React.ReactNode;
  onRowClick?: (values: TData) => void;
}

const renderDefaultCell = (value: unknown): React.ReactNode => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
  return String(value);
};

const BasicTable = <TData extends object>({ columns, data, emptyText = '데이터가 없습니다.', onRowClick }: BasicTableProps<TData>) => {
  return (
    <TableWrapper>
      <Table stickyHeader>
        <TableHead>
          <TableRow>
            {columns.map((column, cellIndex) => (
              <TableCell key={`table-header-${cellIndex}`} sx={{ textAlign: column?.align }}>
                {column.headerName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data?.length
            ? data.map((row, rowIndex) => (
                <TableRow key={`table-row-${rowIndex}`} onClick={() => onRowClick?.(row)}>
                  {columns.map((column, cellIndex) => {
                    const cellValue = column.field ? row[column.field] : null;
                    const renderedCell = column.cellRenderer ? column.cellRenderer(cellValue, row, rowIndex) : renderDefaultCell(cellValue);
                    const sx = { '&.MuiTableCell-root': column.fieldStyle, textAlign: column?.align } as SxProps;

                    return (
                      <TableCell key={`table-cell-${cellIndex}-${rowIndex}`} sx={sx}>
                        {renderedCell}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            : null}
          {!data?.length ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="table-emptyText">
                {emptyText}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </TableWrapper>
  );
};

export { BasicTable };
export default BasicTable;
