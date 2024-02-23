import React, { useState, useEffect, useContext } from 'react';
import 'semantic-ui-css/semantic.min.css';
import { ref, push, onValue } from 'firebase/database';
import { db } from './firebase';
import { Button, Form, Input, Header, Table, Modal, Segment, Icon, Label, Message, ButtonContent } from 'semantic-ui-react';
import { MyContext } from '../App';

const TransactionsPage = () => {
  const { user } = useContext(MyContext);
  const [type, setType] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const transactionsRef = ref(db, 'transactions/' + user.uid);
    onValue(transactionsRef, (snapshot) => {
      const data = snapshot.val();

      if (data) {
        const transactionsArray = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));

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

      setLoading(false);
    });
  }, []);

  const handleTypeChange = (e, { value }) => setType(value);
  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value.length <= 10) {
      setAmount(value);
    }
  };
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    if (value.length <= 20) {
      setCategory(value);
    }
  };

  const handleSubmit = () => {
    if (!type || !amount || !category) {
      setModalOpen(true);
      return;
    }

    const newTransactionRef = push(ref(db, 'transactions/' + user.uid), {
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
    <div style={{ margin: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Segment padded='very' raised>
        <Header as='h2' style={{ textAlign: 'center', color: 'teal' }}>ADD TRANSACTIONS</Header>
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
            style={{ maxWidth: '300px' }}
          />
          <Form.Field
            control={Input}
            label='Category'
            placeholder='Category'
            value={category}
            onChange={handleCategoryChange}
            style={{ maxWidth: '300px' }}
          />
          <Button color='teal' type='submit' primary>Add Transaction</Button>
        </Form>
      </Segment>
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
        <hr></hr>
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
      <Segment style={{ textAlign: 'center', padding: '20px' }}>
        <Button animated='fade' color='black'>
          <ButtonContent color='blue' visible>Recent Transactions<Icon name='long arrow alternate down' /></ButtonContent>
          <ButtonContent hidden>Last Five Transactions</ButtonContent>
        </Button>
      </Segment>
      {loading ? (
        <Message>
          <Message.Header>Loading...</Message.Header>
        </Message>
      ) : transactions.length === 0 ? (
        <Message>
          <Message.Header>Welcome <Icon name='user' /></Message.Header>
          <p>There are no transactions yet. Start adding transactions to see them here.</p>
        </Message>
      ) : (
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
      )}
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
