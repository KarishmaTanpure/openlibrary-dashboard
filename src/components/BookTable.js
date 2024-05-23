
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, TableSortLabel, Button, Box, TextField } from '@mui/material';
import { CSVLink } from 'react-csv';
import './BookTable.css'; 

const columns = [
  { id: 'title', label: 'Title' },
  { id: 'author_name', label: 'Author Name' },
  { id: 'first_publish_year', label: 'First Publish Year' },
  { id: 'ratings_average', label: 'Average Rating' },
  { id: 'subject', label: 'Subject' },
  { id: 'author_birth_date', label: 'Author Birth Date' },
  { id: 'author_top_work', label: 'Author Top Work' },
];

const BookTable = () => {
  const [books, setBooks] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('title');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('https://openlibrary.org/subjects/love.json', {
          params: {
            limit: rowsPerPage,
            offset: page * rowsPerPage,
          },
        });
        let filteredBooks = response.data.works;

        if (searchTerm) {
          filteredBooks = filteredBooks.filter(book =>
            book.authors.some(author => author.name.toLowerCase().includes(searchTerm.toLowerCase()))
          );
        }

        setBooks(filteredBooks);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };

    fetchBooks();
  }, [page, rowsPerPage, order, orderBy, searchTerm]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const sortedBooks = () => {
    return books.slice().sort((a, b) => {
      if (orderBy === 'author_name') {
        const nameA = a.authors[0]?.name.toUpperCase();
        const nameB = b.authors[0]?.name.toUpperCase();
        if (nameA < nameB) {
          return order === 'asc' ? -1 : 1;
        }
        if (nameA > nameB) {
          return order === 'asc' ? 1 : -1;
        }
      } else if (orderBy === 'title') {
        return (a.title < b.title ? -1 : 1) * (order === 'asc' ? 1 : -1);
      } else {
        return (a[orderBy] < b[orderBy] ? -1 : 1) * (order === 'asc' ? 1 : -1);
      }
      return 0;
    });
  };

  const csvData = books.map(book => ({
    title: book.title,
    author_name: book.authors[0]?.name,
    first_publish_year: book.first_publish_year,
    ratings_average: book.ratings_average,
    subject: book.subject,
    author_birth_date: book.authors[0]?.birth_date,
    author_top_work: book.authors[0]?.top_work,
  }));

  return (
    <Paper className="book-table-container">
      <Box display="flex" justifyContent="space-between" alignItems="center" padding="10px">
        <TextField
          className="book-search-input"
          label="Search by Author"
          variant="outlined"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Box>
      <TableContainer>
        <Table className="book-table" stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow className="book-table-header">
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  className="book-table-cell"
                  sortDirection={orderBy === column.id ? order : false}
                >
                  <TableSortLabel
                    active={orderBy === column.id}
                    direction={orderBy === column.id ? order : 'asc'}
                    onClick={() => handleRequestSort(column.id)}
                  >
                    {column.label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedBooks().map((book) => (
              <TableRow className="book-table-row" hover role="checkbox" tabIndex={-1} key={book.key}>
                <TableCell className="book-table-cell">{book.title}</TableCell>
                <TableCell className="book-table-cell">{book.authors[0]?.name}</TableCell>
                <TableCell className="book-table-cell">{book.first_publish_year}</TableCell>
                <TableCell className="book-table-cell">{book.ratings_average}</TableCell>
                <TableCell className="book-table-cell">{book.subject}</TableCell>
                <TableCell className="book-table-cell">{book.authors[0]?.birth_date}</TableCell>
                <TableCell className="book-table-cell">{book.authors[0]?.top_work}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="space-between" alignItems="center" padding="10px">
        <Button variant="contained" color="primary" className="book-download-btn">
          <CSVLink data={csvData} filename={"books.csv"} className="book-csv-link">
            Download CSV
          </CSVLink>
        </Button>
        <TablePagination
          className="book-pagination"
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={books.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </Paper>
  );
};

export default BookTable;
