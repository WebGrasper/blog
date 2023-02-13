import './App.css';
import Navbar from './components/navbar/navbar';

function App() {
  return (
    <div className="App">
      <Navbar />
      {/* Creating basic layout of landing page */}
      <div className='container'>
      <div className="menu-navbar">menu</div>
      <div className="menu">menu</div>
      <div className="main">main</div>
      <div className="footer">footer</div>
      </div>
    </div>
  );
}

export default App;
