import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router-dom'
import axios from 'axios';

import Layout from './layouts/Layout/Layout'
import LayoutLogin from './layouts/LayoutLogin/LayoutLogin'

import Login from './pages/Login/Login'
import Register from './pages/Register/Register'

import Home from './pages/Home/Home'

import SaveLocation1 from './pages/SaveLocation/SaveLocation1'
import EditLocation1 from './pages/EditLocation/EditLocation1'
import SaveLocation2 from './pages/SaveLocation/SaveLocation2'
import EditLocation2 from './pages/EditLocation/EditLocation2'
import SaveLocationP from './pages/SaveLocation/SaveLocationP'
import EditLocationP from './pages/EditLocation/EditLocationP'

import RequestOrder from './pages/RequestOrder/RequestOrder'
import OfferChoice from './pages/OfferChoice/OfferChoice'
import RequestList from './pages/RequestList/RequestList'

import ProcessPayment from './pages/ProcessPayment/ProcessPayment'
import ProcessWorking from './pages/ProcessWorking/ProcessWorking'
import ProcessDone from './pages/ProcessDone/ProcessDone'
import ProcessReceipt from './pages/ProcessReceipt/ProcessReceipt'

import List from './pages/List/List'

import Notification from './pages/Notification/Notification'

import Profile from './pages/Profile/Profile'
import Payment from './pages/Profile/Payment/Payment'
import EditProfile from './pages/Profile/EditProfile/EditProfile'
import Setting from './pages/Profile/Setting/Setting'

import useLocationData from './data/LocationData';
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

  // useEffect to update tokenUserID and other dependent data when tokenUser changes
  useEffect(() => {
    if (tokenUser) {
      setSelectPosition1([])
      setSelectPosition2([])
      setSelectedOffer([])
      setCurrentShowOrder([])
    }
  }, [tokenUser]);

  const { ordersList, fetchOrders, addOrders, updateOrders, deleteOrders } = useOrderData(tokenUser);
  const { locations, addLocation, updateLocation, deleteLocation } = useLocationData(tokenUser);
  const { requestList, fetchRequests, updateRequests, deleteRequests } = useRequestData(tokenUser);

  const [selectPosition1, setSelectPosition1] = useState([]);
  const [selectPosition2, setSelectPosition2] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState([]);
  const [currentShowOrder, setCurrentShowOrder] = useState([]);

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
              </Route>

            ) :
            (

              <Route element={<Layout />}>

                <Route path={'/'} element={<Home
                  selectPosition1={selectPosition1}
                  selectPosition2={selectPosition2}
                />}
                />
                <Route path={'/home'} element={<Home
                  selectPosition1={selectPosition1}
                  selectPosition2={selectPosition2}
                />}
                />

                <Route path={'/home/save-location1'} element={<SaveLocation1
                  locations={locations}
                  addLocation={addLocation}
                  deleteLocation={deleteLocation}
                  setSelectPosition1={setSelectPosition1}
                  setSelectPosition2={setSelectPosition2}
                />}
                />
                <Route path={'/home/save-location1/edit-location1'} element={<EditLocation1
                  locations={locations}
                  addLocation={addLocation}
                  updateLocation={updateLocation}
                />}
                />
                <Route path={'/home/save-location2'} element={<SaveLocation2
                  locations={locations}
                  addLocation={addLocation}
                  deleteLocation={deleteLocation}
                  setSelectPosition1={setSelectPosition1}
                  setSelectPosition2={setSelectPosition2}
                />}
                />
                <Route path={'/home/save-location2/edit-location2'} element={<EditLocation2
                  locations={locations}
                  addLocation={addLocation}
                  updateLocation={updateLocation}
                />}
                />

                <Route path={'/home/request-order'} element={<RequestOrder
                  selectPosition1={selectPosition1}
                  selectPosition2={selectPosition2}
                  setSelectPosition2={setSelectPosition2}
                  setSelectPosition1={setSelectPosition1}
                  token={tokenUser}
                  fetchRequests={fetchRequests}
                />} />

                <Route path={'/list/request-list'} element={<RequestList
                  requestList={requestList}
                  updateRequests={updateRequests}
                  deleteRequests={deleteRequests}
                  fetchRequests={fetchRequests}
                />} />

                <Route path={'/home/offer-choice'} element={<OfferChoice
                  token={tokenUser}
                  selectedOffer={selectedOffer}
                  setSelectedOffer={setSelectedOffer}
                />} />

                <Route path={'/list'} element={<List
                  ordersList={ordersList}
                  fetchOrders={fetchOrders}
                  token={tokenUser}
                />} />

                <Route path={'/list/process-payment'} element={<ProcessPayment
                  fetchOrders={fetchOrders}
                  token={tokenUser}
                />} />

                <Route path={'/list/process-working'} element={<ProcessWorking
                  fetchOrders={fetchOrders}
                  token={tokenUser}
                />} />

                <Route path={'/list/process-done'} element={<ProcessDone
                  fetchOrders={fetchOrders}
                  token={tokenUser}
                />} />

                <Route path={'/list/process-receipt'} element={<ProcessReceipt
                  fetchOrders={fetchOrders}
                  token={tokenUser}
                />} />

                <Route path={'/profile'} element={<Profile
                  token={tokenUser}
                />} />
                <Route path={'/profile/edit-profile'} element={<EditProfile
                  token={tokenUser}

                />} />
                <Route path={'/profile/payment'} element={<Payment
                  token={tokenUser}
                />} />

                <Route path={'/profile/save-location'} element={<SaveLocationP
                  locations={locations}
                  addLocation={addLocation}
                  deleteLocation={deleteLocation}
                />}
                />
                <Route path={'/profile/save-location/edit-location'} element={<EditLocationP
                  locations={locations}
                  addLocation={addLocation}
                  updateLocation={updateLocation}
                />}
                />
                <Route path={'/profile/setting'} element={<Setting
                  setToken={setTokenUser} />} />

                <Route path={'/notification'} element={<Notification />} />
              </Route>

            )}
        </Routes>
      </HashRouter>
    </div>
  )
}

export default App;
