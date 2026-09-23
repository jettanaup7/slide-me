import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'

import Layout from './layouts/Layout/Layout'
import LayoutLogin from './layouts/LayoutLogin/LayoutLogin'

import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Verification from './pages/Verification/Verification'

import Home from './pages/Home/Home'
import EditDistance from './pages/EditDistance/EditDistance'
import EditSlideCar from './pages/EditSlideCar/EditSlideCar'

import RequestList from './pages/RequestList/RequestList'

import OfferChoice from './pages/OfferChoice/OfferChoice'
import ProcessPayment from './pages/ProcessPayment/ProcessPayment'
import ProcessWorking from './pages/ProcessWorking/ProcessWorking'
import ProcessReceipt from './pages/ProcessReceipt/ProcessReceipt'

import List from './pages/List/List'

import Notification from './pages/Notification/Notification'

import Profile from './pages/Profile/Profile'
import Payment from './pages/Profile/Payment/Payment'
import EditProfile from './pages/Profile/EditProfile/EditProfile'
import Setting from './pages/Profile/Setting/Setting'

import useOrderData from './data/OrderData';
import useRequestData from './data/RequestData';

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

import './App.css'

// BrowserRouter, HashRouter, MemoryRouter
// localhost:5174/<path>    <- BrowserRouter ***nginx
// localhost:5174/#/<path>  <- HashRouter *** compatable
// localhost:5174/<path>    <- MemoryRouter

// App -> Layout -> Navbar
// tab 

function App() {
  // Token for authentication
  const [tokenUser, setTokenUser] = useState(null);

  const handleLogin = (token) => {
    setTokenUser(token);
  };

  useEffect(() => {
    if (tokenUser) {
      setCurrentShowOrder([]);
      setIsAcceptingJobs(false);
    }
  }, [tokenUser]);

  const { ordersList, fetchOrders, addOrders, updateOrders, deleteOrders } = useOrderData(tokenUser);
  const { requestList, fetchRequests, updateRequests, deleteRequests } = useRequestData(tokenUser);

  const [currentShowOrder, setCurrentShowOrder] = useState([]);
  const [isAcceptingJobs, setIsAcceptingJobs] = useState(false);

  return (
    <div className='App-container'>
      <HashRouter>
        <Routes>
          {!tokenUser ?
            (
              <Route element={<LayoutLogin />} >
                <Route path={'/'} element={<Login onLogin={handleLogin} />} />
                <Route path={'/home'} element={<Login onLogin={handleLogin} />} />
                <Route path={'/login'} element={<Login onLogin={handleLogin} />} />
                <Route path={'/signup'} element={<Register onLogin={handleLogin} />} />
                <Route path={'/verify'} element={<Verification onLogin={handleLogin} />} />
              </Route>

            ) :
            (
              <Route element={<Layout />}>

                <Route path={'/'} element={<Home
                  isAcceptingJobs={isAcceptingJobs}
                  setIsAcceptingJobs={setIsAcceptingJobs}
                  token={tokenUser}
                />} />
                <Route path={'/home'} element={<Home
                  isAcceptingJobs={isAcceptingJobs}
                  setIsAcceptingJobs={setIsAcceptingJobs}
                  token={tokenUser}
                />} />
                <Route path={'/home/edit-distance'} element={<EditDistance
                  token={tokenUser}
                />} />
                <Route path={'/home/edit-slide-car'} element={<EditSlideCar
                  token={tokenUser}
                />} />

                <Route path={'/home/offer-choice'} element={<OfferChoice
                  token={tokenUser}
                  requestList={requestList}
                  fetchRequests={fetchRequests}
                />} />

                <Route path={'/list/request-list'} element={<RequestList
                  requestList={requestList}
                  updateRequests={updateRequests}
                  deleteRequests={deleteRequests}
                  fetchRequests={fetchRequests}
                />} />

                <Route path={'/list/process-payment'} element={<ProcessPayment
                  token={tokenUser}
                  fetchOrders={fetchOrders}
                />} />

                <Route path={'/list/process-working'} element={<ProcessWorking
                  token={tokenUser}
                  fetchOrders={fetchOrders}
                />} />

                <Route path={'/list/process-receipt'} element={<ProcessReceipt
                  fetchOrders={fetchOrders}
                  token={tokenUser}
                />} />

                <Route path={'/list'} element={<List
                  ordersList={ordersList}
                  fetchOrders={fetchOrders}
                  token={tokenUser}
                />} />

                <Route path={'/notification'} element={<Notification />} />

                <Route path={'/profile'} element={<Profile
                  token={tokenUser}
                />} />
                <Route path={'/profile/edit-profile'} element={<EditProfile
                  token={tokenUser}
                />} />
                <Route path={'/profile/payment'} element={<Payment
                  token={tokenUser}
                />} />
                <Route path={'/profile/setting'} element={<Setting
                  setToken={setTokenUser}
                />} />
              </Route>

            )}
        </Routes>
      </HashRouter>
    </div>
  )
}

export default App;
