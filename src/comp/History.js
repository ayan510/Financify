import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import 'semantic-ui-css/semantic.min.css';
import { db } from './firebase';
import { Button, Table, Input, Segment, Icon, Label, Modal, Form, Dropdown } from 'semantic-ui-react';

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [filterCriteria, setFilterCriteria] = useState(null);
  const [filterValue, setFilterValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [editTransactionId, setEditTransactionId] = useState('');
  const [editTransactionType, setEditTransactionType] = useState('');
  const [editTransactionAmount, setEditTransactionAmount] = useState('');
  const [editTransactionCategory, setEditTransactionCategory] = useState('');
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);

  const options = [
    { key: 'income', text: 'Income', value: 'income' },
    { key: 'expense', text: 'Expense', value: 'expense' }
  ];

  const handleTypeChange = (e, { value }) => setEditTransactionType(value);

  useEffect(() => {
    const transactionsRef = ref(db, 'transactions');
    onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const transactionsArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setTransactions(transactionsArray);
        setFilteredTransactions(transactionsArray);
        const uniqueCategories = [...new Set(transactionsArray.map(transaction => transaction.category))];
        setSuggestions(uniqueCategories);

        const incomeAmounts = transactionsArray.filter(transaction => transaction.type === 'income').map(transaction => transaction.amount);
        const expenseAmounts = transactionsArray.filter(transaction => transaction.type === 'expense').map(transaction => transaction.amount);
        const totalIncomeAmount = incomeAmounts.reduce((acc, curr) => acc + curr, 0);
        const totalExpenseAmount = expenseAmounts.reduce((acc, curr) => acc + curr, 0);
        setTotalIncome(totalIncomeAmount);
        setTotalExpense(totalExpenseAmount);
      } else {
        setTransactions([]);
        setFilteredTransactions([]);
        setSuggestions([]);
        setTotalIncome(0);
        setTotalExpense(0);
      }
    });
  }, []);

  const handleToggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const handleFilterByAmount = () => {
    setShowFilters(true);
    setFilterCriteria('Amount');
  };

  const handleFilterByCategory = () => {
    setShowFilters(true);
    setFilterCriteria('Category');
  };

  const handleClearFilters = () => {
    setFilteredTransactions(transactions);
    setFilterCriteria(null);
    setFilterValue('');
    setShowFilters(!showFilters);
  };

  const handleInputChange = (e) => {
    setFilterValue(e.target.value);
  };

  const filterTransactions = () => {
    if (filterCriteria === 'Amount') {
      const filteredByAmount = transactions.filter(transaction => transaction.amount === parseFloat(filterValue));
      setFilteredTransactions(filteredByAmount);
    } else if (filterCriteria === 'Category') {
      const filteredByCategory = transactions.filter(transaction => transaction.category === filterValue);
      setFilteredTransactions(filteredByCategory);
    }
  };

  useEffect(() => {
    if (filterValue !== '') {
      filterTransactions();
    }
  }, [filterValue]);
  const updateTransaction = (transactionId, updatedTransaction) => {
    const transactionRef = ref(db, `transactions/${transactionId}`);
    update(transactionRef, updatedTransaction)
      .then(() => {
        console.log('Transaction updated successfully.');
      })
      .catch((error) => {
        console.error('Error updating transaction:', error);
      });
  };

  const handleEditTransaction = (transactionId, type, amount, category) => {
    setEditTransactionId(transactionId);
    setEditTransactionType(type);
    setEditTransactionAmount(amount);
    setEditTransactionCategory(category);
  };

  const handleEditSubmit = () => {
    const updatedTransaction = {
      id: editTransactionId,
      type: editTransactionType,
      amount: parseFloat(editTransactionAmount),
      category: editTransactionCategory
    };

    updateTransaction(editTransactionId, updatedTransaction);
    setEditTransactionId('');
    setEditTransactionType('');
    setEditTransactionAmount('');
    setEditTransactionCategory('');
  };

  const handleDeleteTransaction = (transactionId) => {
  };

  return (
    <div style={{ backgroundColor: 'whitesmoke' }}>

      <Segment>
        <Button as='div' labelPosition='right'>
          <Button color='teal'>
            <Icon name='fork' />
            Income:
          </Button>
          <Label as='a' basic color='teal' pointing='left'>
            ${totalIncome}
          </Label>
        </Button>
        <Button as='div' labelPosition='right'>
          <Button color='red'>
            <Icon name='cart' />
            Expense:
          </Button>
          <Label as='a' basic color='red' pointing='left'>
            ${totalExpense}
          </Label>
        </Button>
      </Segment>

      <Button color='teal' onClick={handleToggleFilters} primary><Icon color='white' name='zoom' />
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </Button>
      <div style={{ marginTop: '20px' }}>
        {showFilters && (
          <div>
            {filterCriteria === 'Amount' && (
              <Input
                placeholder="Enter amount"
                value={filterValue}
                onChange={handleInputChange}
              />
            )}
            <Button color='blue' onClick={handleFilterByAmount}>Filter by Amount</Button>
            {filterCriteria === 'Category' && (
              <Input
                placeholder="Enter category"
                value={filterValue}
                onChange={handleInputChange}
                list="categories"
              />
            )}
            <datalist id="categories">
              {suggestions.map((category, index) => (
                <option key={index} value={category} />
              ))}
            </datalist>
            <Button color='blue' onClick={handleFilterByCategory}>Filter by Category</Button>
            <Button color='red' onClick={handleClearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
      <div style={{ marginTop: '20px' }}>
        <Table celled className='ui celled unstackable table' textAlign='center' style={{ margin: '0 auto', border: '1px solid black' }}>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Amount</Table.HeaderCell>
              <Table.HeaderCell>Category</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {filteredTransactions.map(transaction => (
              <Table.Row key={transaction.id}>
                <Table.Cell>{transaction.type}</Table.Cell>
                <Table.Cell>{transaction.amount}</Table.Cell>
                <Table.Cell>{transaction.category}</Table.Cell>
                <Table.Cell>
                  <Button circular icon='edit' color='green' onClick={() => handleEditTransaction(transaction.id, transaction.type, transaction.amount, transaction.category)} />
                  <Button circular icon='trash' color='red' onClick={() => setDeleteConfirmationOpen(true)} />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
        <hr></hr>
      </div>
      {filterCriteria && (
        <p>Filtered by: {filterCriteria}</p>
      )}
      <Modal
        open={editTransactionId !== ''}
        onClose={() => setEditTransactionId('')}
        size='tiny'
        centered
      >
        <Modal.Header>Edit Transaction</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Type</label>
              <Dropdown
                selection
                options={options}
                value={editTransactionType}
                onChange={handleTypeChange}
              />
            </Form.Field>
            <Form.Field>
              <label>Amount</label>
              <Input value={editTransactionAmount} onChange={(e) => setEditTransactionAmount(e.target.value)} />
            </Form.Field>
            <Form.Field>
              <label>Category</label>
              <Input value={editTransactionCategory} onChange={(e) => setEditTransactionCategory(e.target.value)} />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color='green' onClick={handleEditSubmit}>Save</Button>
          <Button color='red' onClick={() => setEditTransactionId('')}>Cancel</Button>
        </Modal.Actions>
      </Modal>
      <Modal
        open={deleteConfirmationOpen}
        onClose={() => setDeleteConfirmationOpen(false)}
        size='tiny'
        centered
      >
        <Modal.Header>Delete Transaction</Modal.Header>
        <Modal.Content>
          <p>Are you sure you want to delete this transaction?</p>
        </Modal.Content>
        <Modal.Actions>
          <Button color='red' onClick={() => handleDeleteTransaction(editTransactionId)}>Yes</Button>
          <Button onClick={() => setDeleteConfirmationOpen(false)}>No</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default History;
