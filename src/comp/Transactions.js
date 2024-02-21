import React, { useState, useEffect } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { ref, push, onValue } from 'firebase/database';
import { db } from './firebase';
import { Button, Form, Input, Header, Table, Modal, Segment, Icon, Label } from 'semantic-ui-react';

const TransactionsPage = () => {
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const transactionsRef = ref(db, 'transactions');
    onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const transactionsArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));

        // Calculate total income and expense
        const incomeAmounts = transactionsArray.filter(transaction => transaction.type === 'income').map(transaction => transaction.amount);
        const expenseAmounts = transactionsArray.filter(transaction => transaction.type === 'expense').map(transaction => transaction.amount);
        const totalIncomeAmount = incomeAmounts.reduce((acc, curr) => acc + curr, 0);
        const totalExpenseAmount = expenseAmounts.reduce((acc, curr) => acc + curr, 0);
        setTotalIncome(totalIncomeAmount);
        setTotalExpense(totalExpenseAmount);

        const lastFiveTransactions = transactionsArray.slice(-5);
        setTransactions(lastFiveTransactions);
      } else {
        setTransactions([]);
        setTotalIncome(0);
        setTotalExpense(0);
      }
    });
  }, []);

  const handleTypeChange = (e, { value }) => setType(value);
  const handleAmountChange = (e) => setAmount(e.target.value);
  const handleCategoryChange = (e) => setCategory(e.target.value);

  const handleSubmit = () => {
    if (!type || !amount || !category) {
      setModalOpen(true);
      return;
    }

    const newTransactionRef = push(ref(db, 'transactions'), {
      type,
      amount: parseFloat(amount),
      category
    });
    console.log('Transaction added:', newTransactionRef.key);

    setType('');
    setAmount('');
    setCategory('');
  };

  return (
    <div style={{ margin: '20px' }}>
      <Header as='h2'>Add Transaction</Header>
      <Form onSubmit={handleSubmit}>
        <Form.Group widths='equal'>
          <Form.Radio
            label='Income'
            value='income'
            checked={type === 'income'}
            onChange={handleTypeChange}
          />
          <Form.Radio
            label='Expense'
            value='expense'
            checked={type === 'expense'}
            onChange={handleTypeChange}
          />
        </Form.Group>
        <Form.Field
          control={Input}
          label='Amount'
          type='number'
          placeholder='Amount'
          value={amount}
          onChange={handleAmountChange}
        />
        <Form.Field
          control={Input}
          label='Category'
          placeholder='Category'
          value={category}
          onChange={handleCategoryChange}
        />
        <Button color='green' type='submit' primary>Add Transaction</Button>
      </Form>
      <Segment>
        <Button as='div' labelPosition='right'>
          <Button basic color='teal'>
            <Icon name='fork' />
            Income:
          </Button>
          <Label as='a' basic color='teal' pointing='left'>
            ${totalIncome}
          </Label>
        </Button>
        <Button as='div' labelPosition='right'>
          <Button basic color='red'>
            <Icon name='cart' />
            Expense:
          </Button>
          <Label as='a' basic color='red' pointing='left'>
            ${totalExpense}
          </Label>
        </Button>
      </Segment>
      <Header as='h2' style={{ marginTop: '40px' }}>(Last Five Transactions)</Header>
      <Table className='ui celled unstackable table' celled textAlign='center' style={{ margin: '0 auto', border: '1px solid black' }}>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Type</Table.HeaderCell>
            <Table.HeaderCell>Amount</Table.HeaderCell>
            <Table.HeaderCell>Category</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {transactions.map(transaction => (
            <Table.Row key={transaction.id}>
              <Table.Cell>{transaction.type}</Table.Cell>
              <Table.Cell>{transaction.amount}</Table.Cell>
              <Table.Cell>{transaction.category}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <hr></hr>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size='tiny'
        centered>

        <Modal.Header>Missing Details</Modal.Header>
        <Modal.Content>
          <p>Please fill in all fields before adding a Transaction.</p>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={() => setModalOpen(false)}>OK</Button>
        </Modal.Actions>
      </Modal>
    </div>
  );
};

export default TransactionsPage;
