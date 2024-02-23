import React, { createContext, useEffect, useState } from 'react';
import { auth } from './comp/firebase';
import './App.css';
import 'semantic-ui-css/semantic.min.css';
import Home from './comp/Home';
import Transactions from './comp/Transactions';
import History from './comp/History';
import { GoogleAuthProvider, onAuthStateChanged, onIdTokenChanged, signInWithPopup, signOut } from 'firebase/auth';
import { Button, Icon, Menu, Modal, Sidebar, Table, TableHeader, TableRow } from 'semantic-ui-react';

export const MyContext = createContext(null);

export default function App() {
  let urlParams = new URLSearchParams(window.location.search);
  let paramsObject = {};
  for (let pair of urlParams.entries()) {
    paramsObject[pair[0]] = pair[1];
  }

  if (Object.keys(paramsObject).length === 0) {
    paramsObject = { page: 'Home' };
  }

  const [params, setParams] = useState(paramsObject);
  const [user, setUser] = useState(null);
  const [logoutConfirmationOpen, setLogoutConfirmationOpen] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const provider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribeAuthState = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    const unsubscribeIdToken = onIdTokenChanged(auth, (user) => {
      setUser(user);
    });
    return () => {
      unsubscribeAuthState();
      unsubscribeIdToken();
    };
  }, []);

  function doLogin() {
    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        setUser(user);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  function doLogout() {
    signOut(auth)
      .then(() => {
        setUser(null);
        setLogoutConfirmationOpen(false);
        setSidebarVisible(false);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  return (
    <div style={{ marginTop: '20px', marginLeft: '20px' }}>
      <MyContext.Provider value={{ user, setUser, params, setParams }}>
        <Sidebar.Pushable as='div'>
          <Sidebar
            as={Menu}
            animation='overlay'
            onHide={() => setSidebarVisible(false)}
            vertical
            visible={sidebarVisible}
            width='thin'
            style={{ backgroundColor: '#f5f5f5' }}
          >
            {user && (
              <Menu.Item onClick={() => setUserModalOpen(true)}>
                <Icon name='user' />
                {user.displayName}
              </Menu.Item>
            )}
            <Menu.Item onClick={() => { setParams({ page: 'Home' }); setSidebarVisible(false); }}>
              <Icon name='home' />
              Home
            </Menu.Item>
            <Menu.Item onClick={() => { setParams({ page: 'Transactions' }); setSidebarVisible(false); }}>
              <Icon name='dollar' />
              Transactions
            </Menu.Item>
            <Menu.Item onClick={() => { setParams({ page: 'History' }); setSidebarVisible(false); }}>
              <Icon name='history' />
              History
            </Menu.Item>
            {user && (
              <Menu.Item onClick={() => { setLogoutConfirmationOpen(true); setSidebarVisible(false); }}>
                <Icon name='sign-out' />
                Logout
              </Menu.Item>
            )}
          </Sidebar>

          <Sidebar.Pusher>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <Button icon onClick={() => setSidebarVisible(true)}>
                <Icon name='bars' />
              </Button>
              {user && (
                <Button className='logout' color='red' onClick={() => setLogoutConfirmationOpen(true)}><Icon name='sign-out' />
                  Logout
                </Button>
              )}
            </div>
            {user ? (
              <>
                <>
                  <Table celled className='ui celled unstackable table' textAlign='center' style={{ margin: '0 auto', }}>
                    <TableHeader>
                      <TableRow>
                        <Button color='green' onClick={() => setParams({ page: 'Home' })}><Icon name='home' />Home</Button>
                        <Button color='yellow' onClick={() => setParams({ page: 'Transactions' })}><Icon name='dollar' />Transactions</Button>
                        <Button color='yellow' onClick={() => setParams({ page: 'History' })}><Icon name='history' />History</Button>
                      </TableRow>
                    </TableHeader>
                  </Table>
                  {params.page === 'Home' && <Home />}
                  {params.page === 'Transactions' && <Transactions />}
                  {params.page === 'History' && <History />}
                  <hr></hr>
                  <hr></hr>
                </>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Button color='green' onClick={doLogin}>
                  <Icon name='google' />
                  Login with Google
                </Button>
              </div>
            )}
          </Sidebar.Pusher>
        </Sidebar.Pushable>
        <Modal
          open={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          size='tiny'
          centered
        >
          <Modal.Header>FINANCIFY</Modal.Header>
          <Modal.Content>
            <p style={{ color: 'greenyellow', backgroundColor: 'gray', padding: '5px', borderRadius: '4px', textAlign: 'center' }}>Hello, {user?.displayName}</p>
            <p style={{ color: 'yellow', backgroundColor: 'gray', padding: '5px', borderRadius: '4px' }}>
              "Effortlessly track your spending and income – stay organized with every transaction, every time."</p>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={() => setUserModalOpen(false)}>Close</Button>
          </Modal.Actions>
        </Modal>
        <Modal
          open={logoutConfirmationOpen}
          onClose={() => setLogoutConfirmationOpen(false)}
          size='tiny'
          centered
        >
          <Modal.Header>Logout Confirmation</Modal.Header>
          <Modal.Content>
            <p>Are you sure you want to logout?</p>
          </Modal.Content>
          <Modal.Actions>
            <Button color='red' onClick={doLogout}>Yes</Button>
            <Button onClick={() => setLogoutConfirmationOpen(false)}>No</Button>
          </Modal.Actions>
        </Modal>
      </MyContext.Provider>
    </div>
  );
}
