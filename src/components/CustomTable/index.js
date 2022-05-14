/* eslint-disable react/prop-types */
/* eslint-disable react/forbid-prop-types */
/* eslint-disable react/require-default-props */
import React from 'react';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import {
  arrayOf, object, string, number, shape,
} from 'prop-types';
import Pagination from '@material-ui/lab/Pagination';
import { makeStyles } from '@material-ui/core/styles';

import { styles } from './styles';

const useStyles = makeStyles({
  ...styles
});

export default function CustomTable({
  columns,
  dataSource,
  size,
  styleHeader,
  styleBody,
  classnameHeaderCell,
  classnameBodyCell,
  pagination,
  onChange
}) {
  const handleChangePagination = (e, page) => {
    if (onChange) onChange(e, page);
  };
  const classes = useStyles();

  return (
    <>
      <TableContainer component={Paper}>
        <Table size={size} aria-label="a dense table">
          <TableHead>
            <TableRow key="customHeader">
              {(columns || []).map((item, index) => {
                const { align, field } = item;
                return (
                  <TableCell style={styleHeader} className={classnameHeaderCell || classes.headerTable} key={`${field || index}_header`} align={align || 'center'}>
                    {item.label}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {(dataSource || []).map((row, rowIndex) => (
              <TableRow key={`${row.id || rowIndex}_customBody`}>
                {columns.map((cell) => {
                  const { render, align, classNameCell } = cell;
                  if (render) {
                    return (
                      <TableCell
                        style={styleBody}
                        className={(classNameCell && classNameCell(row[cell.field], rowIndex, row))
                          || classnameBodyCell || classes.bodyTable}
                        key={`${row.id}_${cell.field || rowIndex}_body_render`}
                        align={align || 'center'}
                      >
                        {render(row[cell.field], rowIndex, row)}
                      </TableCell>
                    );
                  }
                  return (
                    <TableCell
                      style={styleBody}
                      className={(classNameCell && classNameCell(row[cell.field], rowIndex, row))
                        || classnameBodyCell || classes.bodyTable}
                      key={`${row.id}_${cell.field || rowIndex}_body`}
                      align={align || 'center'}
                    >
                      {row[cell.field]}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}

          </TableBody>
        </Table>
      </TableContainer>
      {pagination && (
        <div style={{ float: 'right', marginTop: 20 }}>
          <Pagination
            count={pagination.count || 1}
            variant="outlined"
            shape="rounded"
            onChange={handleChangePagination}
            page={pagination.current || 1}
          />
        </div>
      )}
    </>
  );
}

CustomTable.propTypes = {
  columns: arrayOf(object),
  dataSource: arrayOf(object),
  size: string,
  styleHeader: object,
  styleBody: object,
  pagination: shape({
    current: number,
    total: number,
    count: number
  }),
};

CustomTable.defaultProps = {
  columns: [],
  dataSource: [],
};
